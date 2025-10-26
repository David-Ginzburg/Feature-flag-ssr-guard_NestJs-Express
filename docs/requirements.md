# Technical Requirements: Full-Stack Application with Feature Flags

## 1. Project Overview

This document describes technical requirements for creating a full-stack application. The application will include an Express.js backend and a Next.js 16 frontend. Key functionality includes user authentication by roles and UI component access management using server-side feature flags.

### 1.1. Architecture

- **Backend (`/server`):** REST API on Express.js, responsible for authentication, user management, and providing feature flags.
- **Frontend (`/client`):** Server-side rendering (SSR) on Next.js. UI dynamically changes on the server based on feature flags.
- **Database:** Cloud PostgreSQL (Neon), managed through Prisma ORM.
- **Deployment:**
  - Backend deployed on **Render** from Docker image.
  - Frontend deployed on **Vercel**.
- **Local development:** Fully containerized with **Docker Compose**.

## 2. Backend Specifications (`/server`)

### 2.1. Technology Stack

- Node.js
- Express.js
- TypeScript
- Prisma (ORM for PostgreSQL)
- `jsonwebtoken` for JWT creation
- `bcryptjs` for password hashing
- `cookie-parser` for cookie handling

### 2.2. Database Schema (`schema.prisma`)

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

### 2.3. API Endpoint Definitions

#### `POST /api/register`

- **Description:** Register a new user.
- **Request Body:** `{ "email": "string", "password": "string", "role": "ADMIN" | "EDITOR" | "VIEWER" }`
- **Success Response:** `201 Created` with body `{ "id": "string", "email": "string", "role": "string" }`.
- **Actions:** Hashes password, creates record in `User` table.

#### `POST /api/login`

- **Description:** Authenticate user.
- **Request Body:** `{ "email": "string", "password": "string" }`
- **Success Response:** `200 OK` with body `{ "id": "string", "email": "string", "role": "string" }`. Sets `httpOnly` cookie named `auth_token` containing JWT.
- **Error Response:** `401 Unauthorized`.
- **Actions:** Finds user, compares password hash, generates JWT.

#### `GET /api/me`

- **Description:** Get current authenticated user data.
- **Authentication:** Requires valid `auth_token` in cookie.
- **Success Response:** `200 OK` with body `{ "id": "string", "email": "string", "role": "string" }`.
- **Error Response:** `401 Unauthorized`.

#### `GET /api/flags`

- **Description:** Get feature flags set for current user.
- **Authentication:** Requires valid `auth_token` in cookie.
- **Success Response:** `200 OK` with body corresponding to user role (e.g., `{ "canViewAnalytics": true, "canEditContent": true, ... }`).
- **Guest Response:** If token is missing or invalid, returns `200 OK` with default guest flag set (all `false`).

## 3. Frontend Specifications (`/client`)

### 3.1. Technology Stack

- Next.js 16 (App Router)
- React 18
- TypeScript
- Tailwind CSS

### 3.2. Key Logic

#### `lib/flags.ts`

- **Function `getFeatureFlags()`:**
  - Should use `'use cache: private'` directive.
  - Should be asynchronous.
  - Should read `cookies` from `next/headers` and pass them in `fetch` request to backend (`GET /api/flags`).
  - Backend URL should be taken from environment variable `process.env.NEXT_PUBLIC_API_URL`.

### 3.3. Page Structure

| Route        | Component Type | Description                                                                     |
| :----------- | :------------- | :------------------------------------------------------------------------------ |
| `/`          | Server         | Home page. Shows/hides `<AnalyticsWidget />` based on `canViewAnalytics` flag.  |
| `/dashboard` | Server         | Shows `<AdminPanel />` or regular dashboard based on `showAdminDashboard` flag. |
| `/settings`  | Server         | Shows settings form only when `canAccessSettings` flag is present.              |
| `/login`     | Client         | Page with login form.                                                           |
| `/register`  | Client         | Page with registration form.                                                    |

## 4. Infrastructure and Deployment

### 4.1. Local Development

- Entire stack runs with single command `docker-compose up`.
- Backend available on `localhost:4000`.
- Frontend available on `localhost:3000`.
- Neon DB connection string should be stored in root `.env` file, not committed to Git.

### 4.2. CI/CD (GitHub Actions)

- Workflow `.github/workflows/docker-build.yml` should run on push to `main`.
- Its task is to validate that Docker images build successfully. It **does not deploy** the application.
- It should use `secrets.DATABASE_URL` from GitHub Secrets for `prisma generate` step.

### 4.3. Production Deployment

- **Backend (Express):**
  - Deployed on **Render** using configuration file `render.yaml`.
  - Uses free tier (`plan: free`).
  - `DATABASE_URL` and `JWT_SECRET` should be configured as **Secrets** in Render dashboard.
- **Frontend (Next.js):**
  - Deployed on **Vercel**.
  - In Vercel project settings, **Root Directory** is set to `client`.
  - In Vercel project settings, environment variable `NEXT_PUBLIC_API_URL` should be set, pointing to public URL of Render-deployed backend.
