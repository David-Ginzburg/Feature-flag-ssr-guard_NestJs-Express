# Feature Flags Demo

A full-stack application demonstrating server-side feature flags with role-based access control.

## 🏗️ Architecture

This project follows **Feature-Sliced Design (FSD)** methodology with Next.js App Router.

### Layers:

- **App** - Pages and page-specific components
- **Features** - Business functions (auth, admin)
- **Entities** - Business entities (user, feature-flag)
- **Shared** - Reusable utilities

## 🌐 Code Language Standards

**All code must be written in English:**

- Variable names, function names, class names
- Comments and documentation
- Error messages and logs
- API responses
- File and folder names
- Git commit messages

**Exceptions:**

- User-facing UI text can be in the target language
- Database content can be in any language
- Configuration files can use language-appropriate values

This ensures international collaboration and code maintainability.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Docker (optional)

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   cd client && npm install
   ```

### Environment Variables

#### Server (.env)

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/feature_flags"

# Server
PORT=4000
NODE_ENV=production

# CORS Origins
FRONTEND_URL="https://feature-flag-ssr-guard-nest-js-expr.vercel.app"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"
```

#### Client (.env.local)

```bash
NEXT_PUBLIC_API_URL="https://feature-flags-server.onrender.com"
```

**Note:** The `FRONTEND_URL` environment variable is required in production for CORS configuration.

### Render.com Deployment

1. **Set environment variables in Render dashboard:**
   ```
   DATABASE_URL=your_postgresql_connection_string
   FRONTEND_URL=https://feature-flag-ssr-guard-nest-js-expr.vercel.app
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

2. **See `render-env-example.txt` for complete list of required variables**
cd ../server && npm install

```

```

3. Set up environment variables (see Environment Setup section below)

4. Run the development servers:

   ```bash
   # Terminal 1 - Server
   cd server && npm run dev

   # Terminal 2 - Client
   cd client && npm run dev
   ```

## 🔧 Environment Setup

### Required .env files:

#### 1. Root directory - `.env`

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/feature_flags_db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# API URL for client
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

#### 2. Server directory - `.env` (already exists)

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/feature_flags_db"
JWT_SECRET="your-super-secret-jwt-key-here"
```

#### 3. Client directory - `.env.local`

```bash
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### Commands to create files:

```bash
# Create .env in root
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/feature_flags_db"
JWT_SECRET="your-super-secret-jwt-key-here"
NEXT_PUBLIC_API_URL="http://localhost:4000"' > .env

# Create .env.local in client
echo 'NEXT_PUBLIC_API_URL="http://localhost:4000"' > client/.env.local
```

### Running the application:

```bash
# Run via docker-compose
docker-compose up

# Or run individual services
cd server && npm run dev
cd client && npm run dev
```

### Application access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **PostgreSQL**: localhost:5432

## 📚 Documentation

- [Architecture Overview](docs/architecture.md)
- [Architectural Rules](docs/arch-rules.md)
- [Requirements](docs/requirements.md)
- [Development Plan](docs/plan.md)

## 🎯 Features

- **Role-based Access Control**: ADMIN, EDITOR, VIEWER roles
- **Server-side Feature Flags**: Dynamic feature toggling
- **Authentication**: Login/Register with JWT
- **Responsive UI**: Modern design with Tailwind CSS
- **Type Safety**: Full TypeScript support

## 🛠️ Tech Stack

### Frontend

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Feature-Sliced Design

### Backend

- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

## 📝 License

MIT License
