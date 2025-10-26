### **Detailed Implementation Plan for Full-Stack Application with Feature Flags**

**Goal:** Create a full-stack application with server-side feature flag rendering, following architectural rules and requirements.

---

## **Phase 1: Project Initialization and Environment Setup**

### **Step 1.1: Create Basic Directory Structure**

```bash
mkdir -p server client .github/workflows
```

### **Step 1.2: Initialize Backend Project (`/server`)**

**1.2.1: Setup Node.js Project**

```bash
cd server
npm init -y
```

**1.2.2: Install Dependencies**

```bash
# Main dependencies
npm install express cors cookie-parser jsonwebtoken bcryptjs @prisma/client pg

# Dev dependencies
npm install -D typescript @types/express @types/cors @types/cookie-parser @types/jsonwebtoken @types/bcryptjs @types/node ts-node-dev prisma
```

**1.2.3: Setup TypeScript**

```bash
npx tsc --init
```

**1.2.4: Setup Prisma**

```bash
npx prisma init
```

**1.2.5: Update package.json**

```json
{
	"scripts": {
		"dev": "ts-node-dev --respawn --transpile-only src/index.ts",
		"build": "tsc",
		"start": "node dist/index.js",
		"db:generate": "prisma generate",
		"db:push": "prisma db push"
	}
}
```

### **Step 1.3: Initialize Frontend Project (`/client`)**

**1.3.1: Create Next.js 16 Application**

```bash
cd ../client
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

**1.3.2: Configure next.config.mjs**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
	cacheComponents: true,
	output: "standalone",
	experimental: {
		serverComponentsExternalPackages: [],
	},
};
```

### **Step 1.4: Create Root Configuration Files**

**1.4.1: .gitignore**

```gitignore
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.production.local
.env.development.local

# Build outputs
dist/
build/
.next/
out/

# Database
*.db
*.sqlite

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db
```

**1.4.2: .env (root)**

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/feature_flags_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# API URLs
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

**1.4.3: render.yaml**

```yaml
services:
  - type: web
    name: feature-flags-backend
    env: node
    plan: free
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false
```

---

## **Phase 2: Backend Implementation (Express.js)**

### **Step 2.1: Setup Database Schema**

**2.1.1: Update schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  EDITOR
  VIEWER
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      Role     @default(VIEWER)
  createdAt DateTime @default(now())
}
```

**2.1.2: Generate Prisma Client**

```bash
cd server
npx prisma generate
```

### **Step 2.2: Create Backend Architecture**

**2.2.1: Directory Structure**

```
server/src/
├── lib/
│   └── prisma.ts
├── controllers/
│   └── auth.controller.ts
├── services/
│   └── auth.service.ts
├── routes/
│   └── auth.routes.ts
├── middleware/
│   └── auth.middleware.ts
└── index.ts
```

**2.2.2: lib/prisma.ts (Prisma Client Singleton)**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**2.2.3: services/auth.service.ts (Business Logic)**

```typescript
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";

export class AuthService {
	static async register(email: string, password: string, role: Role) {
		const hashedPassword = await bcrypt.hash(password, 12);
		return await prisma.user.create({
			data: { email, password: hashedPassword, role },
			select: { id: true, email: true, role: true },
		});
	}

	static async login(email: string, password: string) {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user || !(await bcrypt.compare(password, user.password))) {
			throw new Error("Invalid credentials");
		}
		return { id: user.id, email: user.email, role: user.role };
	}

	static generateToken(userId: string): string {
		return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
	}

	static getFeatureFlags(role: Role) {
		const flags = {
			canViewAnalytics: role === "ADMIN" || role === "EDITOR",
			canEditContent: role === "ADMIN" || role === "EDITOR",
			showAdminDashboard: role === "ADMIN",
			canAccessSettings: role === "ADMIN" || role === "EDITOR",
		};
		return flags;
	}
}
```

**2.2.4: controllers/auth.controller.ts (HTTP Handling)**

```typescript
import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { Role } from "@prisma/client";

export class AuthController {
	static async register(req: Request, res: Response) {
		try {
			const { email, password, role } = req.body;
			const user = await AuthService.register(email, password, role as Role);
			res.status(201).json(user);
		} catch (error) {
			res.status(400).json({ error: "Registration failed" });
		}
	}

	static async login(req: Request, res: Response) {
		try {
			const { email, password } = req.body;
			const user = await AuthService.login(email, password);
			const token = AuthService.generateToken(user.id);

			res.cookie("auth_token", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			});

			res.json(user);
		} catch (error) {
			res.status(401).json({ error: "Invalid credentials" });
		}
	}

	static async me(req: Request, res: Response) {
		res.json(req.user);
	}

	static async getFlags(req: Request, res: Response) {
		const flags = req.user
			? AuthService.getFeatureFlags(req.user.role)
			: {
					canViewAnalytics: false,
					canEditContent: false,
					showAdminDashboard: false,
					canAccessSettings: false,
			  };
		res.json(flags);
	}
}
```

**2.2.5: middleware/auth.middleware.ts**

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.cookies.auth_token;
		if (!token) return next();

		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			select: { id: true, email: true, role: true },
		});

		if (user) req.user = user;
		next();
	} catch (error) {
		next();
	}
};
```

**2.2.6: routes/auth.routes.ts**

```typescript
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", authMiddleware, AuthController.me);
router.get("/flags", authMiddleware, AuthController.getFlags);

export default router;
```

**2.2.7: index.ts (Main Server File)**

```typescript
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
	cors({
		origin:
			process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "http://localhost:3000",
		credentials: true,
	})
);
app.use(cookieParser());
app.use(express.json());

app.use("/api", authRoutes);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
```

---

## **Phase 3: Frontend Implementation (Next.js)**

### **Step 3.1: Setup Feature Flags Function**

**3.1.1: lib/flags.ts**

```typescript
import { cookies } from "next/headers";

export async function getFeatureFlags() {
	"use cache: private";

	const cookieStore = cookies();
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/flags`, {
		headers: {
			Cookie: cookieStore.toString(),
		},
	});

	if (!response.ok) {
		return {
			canViewAnalytics: false,
			canEditContent: false,
			showAdminDashboard: false,
			canAccessSettings: false,
		};
	}

	return await response.json();
}
```

### **Step 3.2: Create Authentication Pages**

**3.2.1: app/login/page.tsx**

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ email, password }),
			});

			if (response.ok) {
				router.push("/");
				router.refresh();
			} else {
				setError("Invalid credentials");
			}
		} catch (err) {
			setError("Login failed");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center">
			<form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
				<h1 className="text-2xl font-bold mb-6">Login</h1>
				{error && <p className="text-red-500 mb-4">{error}</p>}
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full p-3 border rounded mb-4"
					required
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full p-3 border rounded mb-4"
					required
				/>
				<button type="submit" className="w-full bg-blue-500 text-white p-3 rounded">
					Login
				</button>
				<p className="text-center mt-4">
					<a href="/register" className="text-blue-500">
						Register instead
					</a>
				</p>
			</form>
		</div>
	);
}
```

**3.2.2: app/register/page.tsx**

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState("VIEWER");
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password, role }),
			});

			if (response.ok) {
				router.push("/login");
			} else {
				setError("Registration failed");
			}
		} catch (err) {
			setError("Registration failed");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center">
			<form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
				<h1 className="text-2xl font-bold mb-6">Register</h1>
				{error && <p className="text-red-500 mb-4">{error}</p>}
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full p-3 border rounded mb-4"
					required
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full p-3 border rounded mb-4"
					required
				/>
				<select
					value={role}
					onChange={(e) => setRole(e.target.value)}
					className="w-full p-3 border rounded mb-4"
				>
					<option value="VIEWER">Viewer</option>
					<option value="EDITOR">Editor</option>
					<option value="ADMIN">Admin</option>
				</select>
				<button type="submit" className="w-full bg-blue-500 text-white p-3 rounded">
					Register
				</button>
				<p className="text-center mt-4">
					<a href="/login" className="text-blue-500">
						Login instead
					</a>
				</p>
			</form>
		</div>
	);
}
```

### **Step 3.3: Create Pages with Conditional Rendering**

**3.3.1: app/page.tsx (Home Page)**

```typescript
import { getFeatureFlags } from "@/lib/flags";
import AnalyticsWidget from "@/components/AnalyticsWidget";

export default async function HomePage() {
	const flags = await getFeatureFlags();

	return (
		<div className="container mx-auto p-8">
			<h1 className="text-3xl font-bold mb-8">Welcome to Feature Flags Demo</h1>

			{flags.canViewAnalytics && <AnalyticsWidget />}

			<div className="mt-8">
				<h2 className="text-xl font-semibold mb-4">Available Features:</h2>
				<ul className="space-y-2">
					<li>Analytics: {flags.canViewAnalytics ? "✅" : "❌"}</li>
					<li>Content Editing: {flags.canEditContent ? "✅" : "❌"}</li>
					<li>Admin Dashboard: {flags.showAdminDashboard ? "✅" : "❌"}</li>
					<li>Settings Access: {flags.canAccessSettings ? "✅" : "❌"}</li>
				</ul>
			</div>
		</div>
	);
}
```

**3.3.2: app/dashboard/page.tsx**

```typescript
import { getFeatureFlags } from "@/lib/flags";
import AdminPanel from "@/components/AdminPanel";

export default async function DashboardPage() {
	const flags = await getFeatureFlags();

	return (
		<div className="container mx-auto p-8">
			<h1 className="text-3xl font-bold mb-8">Dashboard</h1>

			{flags.showAdminDashboard ? (
				<AdminPanel />
			) : (
				<div className="bg-gray-100 p-6 rounded-lg">
					<h2 className="text-xl font-semibold mb-4">Regular Dashboard</h2>
					<p>Welcome to your dashboard! You have standard user access.</p>
				</div>
			)}
		</div>
	);
}
```

**3.3.3: app/settings/page.tsx**

```typescript
import { getFeatureFlags } from "@/lib/flags";

export default async function SettingsPage() {
	const flags = await getFeatureFlags();

	if (!flags.canAccessSettings) {
		return (
			<div className="container mx-auto p-8">
				<h1 className="text-3xl font-bold mb-8">Access Denied</h1>
				<p className="text-red-500">You don't have permission to access settings.</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-8">
			<h1 className="text-3xl font-bold mb-8">Settings</h1>
			<div className="bg-white p-6 rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">User Settings</h2>
				<p>Settings form would go here...</p>
			</div>
		</div>
	);
}
```

### **Step 3.4: Create Components**

**3.4.1: components/AnalyticsWidget.tsx**

```typescript
export default function AnalyticsWidget() {
	return (
		<div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
			<h2 className="text-xl font-semibold mb-4">📊 Analytics Dashboard</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-white p-4 rounded">
					<h3 className="font-semibold">Page Views</h3>
					<p className="text-2xl font-bold text-blue-600">1,234</p>
				</div>
				<div className="bg-white p-4 rounded">
					<h3 className="font-semibold">Users</h3>
					<p className="text-2xl font-bold text-green-600">567</p>
				</div>
				<div className="bg-white p-4 rounded">
					<h3 className="font-semibold">Conversion</h3>
					<p className="text-2xl font-bold text-purple-600">12.5%</p>
				</div>
			</div>
		</div>
	);
}
```

**3.4.2: components/AdminPanel.tsx**

```typescript
export default function AdminPanel() {
	return (
		<div className="bg-red-50 p-6 rounded-lg border border-red-200">
			<h2 className="text-xl font-semibold mb-4">🔧 Admin Panel</h2>
			<div className="space-y-4">
				<div className="bg-white p-4 rounded">
					<h3 className="font-semibold">User Management</h3>
					<p className="text-sm text-gray-600">Manage users and permissions</p>
				</div>
				<div className="bg-white p-4 rounded">
					<h3 className="font-semibold">System Settings</h3>
					<p className="text-sm text-gray-600">Configure system-wide settings</p>
				</div>
				<div className="bg-white p-4 rounded">
					<h3 className="font-semibold">Feature Flags</h3>
					<p className="text-sm text-gray-600">Toggle features on/off</p>
				</div>
			</div>
		</div>
	);
}
```

**3.4.3: components/Header.tsx**

```typescript
import Link from "next/link";

export default function Header() {
	return (
		<header className="bg-white shadow-sm border-b">
			<div className="container mx-auto px-4 py-4 flex justify-between items-center">
				<Link href="/" className="text-xl font-bold">
					Feature Flags Demo
				</Link>
				<nav className="space-x-4">
					<Link href="/" className="hover:text-blue-600">
						Home
					</Link>
					<Link href="/dashboard" className="hover:text-blue-600">
						Dashboard
					</Link>
					<Link href="/settings" className="hover:text-blue-600">
						Settings
					</Link>
					<Link
						href="/login"
						className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
					>
						Login
					</Link>
				</nav>
			</div>
		</header>
	);
}
```

**3.4.4: app/layout.tsx**

```typescript
import type { Metadata } from "next";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
	title: "Feature Flags Demo",
	description: "Full-stack app with server-side feature flags",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<Header />
				<main>{children}</main>
			</body>
		</html>
	);
}
```

---

## **Phase 4: Containerization and CI/CD**

### **Step 4.1: Docker Configuration**

**4.1.1: server/Dockerfile**

```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runtime
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/prisma ./prisma
EXPOSE 4000
CMD ["npm", "start"]
```

**4.1.2: client/Dockerfile**

```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runtime
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

**4.1.3: docker-compose.yml**

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: feature_flags_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  server:
    build: ./server
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/feature_flags_db
      JWT_SECRET: your-super-secret-jwt-key-here
    depends_on:
      - postgres
    command: sh -c "npx prisma db push && npm run dev"

  client:
    build: ./client
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000
    depends_on:
      - server

volumes:
  postgres_data:
```

### **Step 4.2: GitHub Actions CI/CD**

**4.2.1: .github/workflows/docker-build.yml**

```yaml
name: Docker Build Validation

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build server image
        run: |
          cd server
          docker build -t feature-flags-server .

      - name: Build client image
        run: |
          cd client
          docker build -t feature-flags-client .

      - name: Test docker-compose build
        run: |
          docker-compose build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## **Ready for Implementation!**

Now we have a detailed plan with specific steps. Let's start implementation with Phase 1.