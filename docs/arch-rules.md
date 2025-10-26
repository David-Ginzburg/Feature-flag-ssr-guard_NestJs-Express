# Architectural Rules and Patterns

## 1. Introduction

This document defines architectural rules and patterns that must be followed during project development. The goal is to ensure codebase cleanliness, scalability, and maintainability.

## 2. Code Language Standards

**All code must be written in English:**

- Variable names, function names, class names
- Comments and documentation
- Error messages and logs
- API responses and user-facing text
- File and folder names
- Git commit messages

**Exceptions:**

- User-facing UI text can be in the target language (Russian in this case)
- Database content can be in any language
- Configuration files can use language-appropriate values

This ensures international collaboration and code maintainability.

---

## 3. Backend Architecture (Express.js)

For the backend, **Layered Architecture** is applied. This approach ensures strict separation of concerns (Separation of Concerns), which simplifies testing, refactoring, and code understanding.

**Request Flow:** `Request -> Routes -> Controllers -> Services -> Data Access Layer (Prisma)`

### 3.1. Layer Description

#### 1. Routing Layer (Routes)

- **Location:** `/server/src/routes`
- **Responsibilities:**
  - Define HTTP endpoints (e.g., `/api/login`)
  - Bind endpoints to HTTP methods (`GET`, `POST`, etc.)
  - (Optional) Validate incoming data (request body, parameters)
  - Delegate control to the appropriate Controller method
- **Rules:** No business logic. Only routing.

#### 2. Controllers Layer

- **Location:** `/server/src/controllers`
- **Responsibilities:**
  - "Orchestrate" request processing
  - Extract data from `request` and `response` objects
  - Call one or more Service layer methods
  - Form and send HTTP responses (JSON, status codes)
- **Rules:** No business logic or direct database queries. Acts as thin "glue" between HTTP world and application logic.

#### 3. Services Layer

- **Location:** `/server/src/services`
- **Responsibilities:**
  - **Implement all application business logic**
  - Coordinate operations, work with data, perform calculations
  - Call Data Access Layer methods for database interaction
- **Rules:** Completely independent of HTTP. Doesn't know about `request` and `response`. Can be reused in other parts of the application (e.g., console scripts).

#### 4. Data Access Layer (DAL)

- **Implementation:** Prisma Client
- **Location:** `/server/src/lib/prisma.ts` (singleton instance)
- **Responsibilities:**
  - Single point of database interaction
  - Execute all CRUD operations (Create, Read, Update, Delete)

---

## 4. Frontend Architecture (Next.js & Feature-Sliced Design)

For the frontend, **Feature-Sliced Design (FSD)** methodology is applied, adapted for **Next.js App Router** and its server-client component model.

### 4.1. Key Adaptation Principles

- **Next.js `app` Directory = FSD `pages` Layer:** Routing and page structure are completely managed by the `app` directory. `page.tsx` and `layout.tsx` files are entry points and composition points for underlying layers.
- **Server Components by default:** All components should be Server Components by default. The `'use client'` directive is used only when the component requires interactivity or browser APIs (`useState`, `useEffect`, `onClick`, etc.).

### 4.2. Layer Structure (from top to bottom)

#### 1. `app`

- **Location:** `/client/src/app`
- **Responsibilities:** Routing, metadata definition, page composition from widgets and features. `page.tsx` files should not contain complex logic or markup; their main task is to assemble UI from ready-made blocks.

#### 2. `widgets`

- **Location:** `/client/src/widgets`
- **Responsibilities:** Compositional, self-contained UI blocks. Combine features and entities into a single meaningful block.
- **Examples:** `<Header />`, `<Sidebar />`, `<ProfileCard />`
- **Type:** Often Server Components that can accept interactive Client Components as children.

#### 3. `features`

- **Location:** `/client/src/features`
- **Responsibilities:** Implementation of business scenarios and user actions. This layer brings business value.
- **Examples:** `<LoginForm />`, `<RegisterForm />`, `<ChangeRoleButton />`
- **Type:** Often Client Components (`'use client'`) as they contain state and event handlers.

#### 4. `entities`

- **Location:** `/client/src/entities`
- **Responsibilities:** Representation of business entities. Application framework.
- **Examples:** `<UserAvatar user={...} />`, `<RoleBadge role={...} />`
- **Type:** Most often Server Components as they simply display passed data.

#### 5. `shared`

- **Location:** `/client/src/shared`
- **Responsibilities:** Reusable code unrelated to business logic.
- **Subdirectories:**
  - `ui/`: UI kit (e.g., `<Button />`, `<Input />`, `<Spinner />`). Often Client Components.
  - `lib/`: Helper functions and utilities (e.g., `formatDate`)
  - `api/`: Functions for API interaction (in our case, `lib/flags.ts` will be here)
  - `config/`: Configuration files
- **Rules:** This layer should not depend on any of the upper layers.
