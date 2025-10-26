# Full-Stack Application Architecture with Feature Flags

## Architecture Overview

This application implements a full-stack solution with server-side feature flag rendering, following clean architecture principles and separation of concerns.

## Code Language Standards

**All code must be written in English:**
- Variable names, function names, class names
- Comments and documentation
- Error messages and logs
- API responses
- File and folder names
- Git commit messages

**Exceptions:**
- User-facing UI text can be in the target language (Russian in this case)
- Database content can be in any language
- Configuration files can use language-appropriate values

This ensures international collaboration and code maintainability.

## Recent Changes (2024)

### Migration to Feature-Sliced Design (FSD)

- **Complete client reorganization**: Transition from traditional structure to FSD architecture
- **Layered structure**: app → widgets → features → entities → shared
- **Separation of concerns**: Clear separation of components by business logic
- **Code reusability**: Improved modularity and component reusability

### New Client Structure

- **Shared layer**: Common UI components (Button, Spinner), utilities and API
- **Entities layer**: Data models (User, FeatureFlags) and API for working with them
- **Features layer**: Business functions (authentication, admin)
- **Widgets layer**: Compositional UI blocks (dashboard, admin panel)
- **Pages layer**: Pages and common components (Header)

### Security and Configuration

- **Improved cookie security**: Added conditional `secure` and `sameSite` flag configuration based on environment
- **Migration to ES Modules**: Transition from CommonJS to ES Modules for server using `tsx` instead of `ts-node-dev`
- **TypeScript configuration**: Updated configuration to support ES Modules with `verbatimModuleSyntax`

### User Interface

- **Loading system**: Added `Spinner` component for loading state display
- **Improved navigation**: Replaced `window.location.href` with Next.js Router API for better UX
- **Logout integration**: Removed separate logout page, functionality integrated into Header

### Caching and Performance

- **API call optimization**: Implemented custom caching for `/api/flags` with 60-second revalidation
- **REST API improvements**: Transition from query parameters to Authorization header for token passing
- **Logging**: Added detailed logging for API call monitoring

### Internationalization

- **Interface translation**: All user messages translated from Russian to English
- **Code cleanup**: Removed all comments from codebase for improved readability

## Architectural Principles

### 1. Layered Architecture

- **Separation of concerns**: Each layer has a clearly defined role
- **Independence**: Layers are loosely coupled
- **Testability**: Each layer can be tested in isolation

### 2. Feature-Sliced Design (FSD)

- **Layered structure**: app → widgets → features → entities → shared
- **Server components by default**: Minimize client-side code
- **Reusability**: Components organized by business logic

## Backend Architecture

### Layers and Data Flow

```
HTTP Request → Routes → Controllers → Services → Data Access Layer (Prisma)
```

#### 1. Routes Layer (`/server/src/routes/`)

- **Responsibility**: HTTP routing
- **Files**: `auth.routes.ts`
- **Rules**: Only endpoint definition, no business logic

#### 2. Controllers Layer (`/server/src/controllers/`)

- **Responsibility**: HTTP request/response handling
- **Files**: `auth.controller.ts`
- **Rules**: Thin layer between HTTP and business logic

#### 3. Services Layer (`/server/src/services/`)

- **Responsibility**: All application business logic
- **Files**: `auth.service.ts`
- **Rules**: Independent of HTTP, reusable

#### 4. Data Access Layer (`/server/src/lib/`)

- **Responsibility**: Database interaction
- **Files**: `prisma.ts`
- **Rules**: Single point of database access

### API Endpoints

| Endpoint        | Method | Description                     | Authentication     | Caching |
| --------------- | ------ | ------------------------------- | ------------------ | ------- |
| `/api/register` | POST   | User registration               | No                 | No      |
| `/api/login`    | POST   | Authentication                  | No                 | No      |
| `/api/logout`   | POST   | Logout                         | No                 | No      |
| `/api/me`       | GET    | Current user data               | Yes (Cookie/Header)| No      |
| `/api/flags`    | GET    | User feature flags              | Yes (Cookie/Header)| 60 sec  |

### Authentication

#### Supported Methods

- **Cookie-based**: `auth_token` in httpOnly cookie
- **Header-based**: `Authorization: Bearer <token>` header
- **Priority**: Header takes priority over cookie

#### Cookie Settings

```typescript
// Development
{
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/"
}

// Production
{
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/"
}
```

### Feature Flags System

#### Role-Based Access Control

| Role   | canViewAnalytics | canEditContent | showAdminDashboard | canAccessSettings |
| ------ | ---------------- | -------------- | ------------------ | ----------------- |
| VIEWER | ❌               | ❌             | ❌                 | ❌                |
| EDITOR | ✅               | ✅             | ❌                 | ✅                |
| ADMIN  | ✅               | ✅             | ✅                 | ✅                |

#### Implementation

- **Server-side rendering**: Flags fetched on server
- **Caching**: 60-second cache with ETag support
- **Security**: Role-based access control
- **Fallback**: Default flags for unauthenticated users

## Frontend Architecture

### Feature-Sliced Design (FSD) Structure

```
client/src/
├── app/                    # Next.js App Router (pages)
│   ├── layout.tsx         # Root layout with Header
│   ├── page.tsx           # Home page
│   ├── ui/                # UI components for home page
│   │   └── FeatureFlagsList.tsx
│   ├── login/page.tsx     # Login page
│   ├── register/page.tsx  # Registration page
│   ├── dashboard/         # Dashboard page
│   │   ├── page.tsx       # Dashboard page
│   │   └── ui/            # UI components for dashboard
│   │       ├── DashboardContent.tsx
│   │       ├── DashboardWrapper.tsx
│   │       ├── AnalyticsWidget.tsx
│   │       └── index.ts
│   └── settings/page.tsx  # Settings page
├── features/             # Features layer
│   ├── auth/            # Authentication
│   │   └── ui/
│   │       ├── LoginForm.tsx
│   │       ├── RegisterForm.tsx
│   │       └── LogoutButton.tsx
│   └── admin/           # Admin functionality
│       └── ui/
│           └── AdminPanel.tsx
├── entities/            # Entities layer
│   ├── user/           # User entity
│   │   ├── api/
│   │   │   └── userApi.ts
│   │   └── model/
│   │       └── types.ts
│   └── feature-flag/   # Feature flag entity
│       ├── api/
│       │   └── flagsApi.ts
│       └── model/
│           └── types.ts
└── shared/             # Shared layer
    ├── ui/             # UI components
    │   ├── button/
    │   │   └── Button.tsx
    │   └── spinner/
    │       └── Spinner.tsx
    ├── lib/            # Utilities
    │   ├── auth.ts
    │   ├── flags.ts
    │   └── utils.ts
    └── api/            # API functions
        └── auth.ts
```

### FSD Layers

#### 1. App Layer (`/client/src/app/`)

- **Responsibility**: Next.js App Router pages and routing
- **Files**: `page.tsx`, `layout.tsx`, `login/page.tsx`, etc.
- **Type**: Server components
- **Rules**: Direct composition from features and entities
- **Features**: 
  - Header integrated into `layout.tsx`
  - Page-specific components in `ui/` folder
  - Each component in separate file
  - No widgets layer - all components are page-specific

#### 2. Features Layer (`/client/src/features/`)

- **Responsibility**: Business functions and scenarios
- **Files**:
  - `auth/` - Authentication (LoginForm, RegisterForm, LogoutButton)
  - `admin/` - Admin functionality (AdminPanel)
- **Type**: Mixed (server and client components)
- **Rules**: Business logic implementation, can use entities and shared

#### 3. Entities Layer (`/client/src/entities/`)

- **Responsibility**: Business entities and data models
- **Files**:
  - `user/` - User entity (userApi, types)
  - `feature-flag/` - Feature flag entity (flagsApi, types)
- **Type**: Mixed (server and client components)
- **Rules**: Data models and API, can use shared

#### 4. Shared Layer (`/client/src/shared/`)

- **Responsibility**: Reusable utilities and components
- **Files**:
  - `ui/` - UI components (Button, Spinner)
  - `lib/` - Utilities (auth, flags, utils)
  - `api/` - API functions (auth)
- **Type**: Mixed (server and client components)
- **Rules**: No dependencies on other layers

### Component Types

#### Server Components (Default)

- **Usage**: Data fetching, static content
- **Examples**: `DashboardContent`, `FeatureFlagsList`
- **Benefits**: Better performance, SEO-friendly

#### Client Components

- **Usage**: Interactivity, browser APIs
- **Examples**: `LoginForm`, `LogoutButton`
- **Directive**: `'use client'`

### Import Rules

#### Allowed Imports

- **App layer**: Can import from features, entities, shared
- **Features layer**: Can import from entities, shared
- **Entities layer**: Can import from shared
- **Shared layer**: Cannot import from other layers

#### Forbidden Imports

- **Cross-layer imports**: Features cannot import from app
- **Circular dependencies**: Any circular imports are forbidden
- **Direct file imports**: Use index.ts files for clean imports

## Caching Strategy

### Server-Side Caching

- **Feature flags**: 60-second cache with ETag
- **User data**: No caching (always fresh)
- **Static assets**: Browser caching

### Client-Side Caching

- **Next.js cache**: Automatic page caching
- **API responses**: Custom caching for feature flags
- **Component state**: React state management

## Security

### Authentication

- **JWT tokens**: Secure token-based authentication
- **HttpOnly cookies**: XSS protection
- **CSRF protection**: SameSite cookie attribute
- **Secure headers**: Production security settings

### Authorization

- **Role-based access**: ADMIN, EDITOR, VIEWER roles
- **Feature flags**: Server-side access control
- **API protection**: Authentication required for sensitive endpoints

## Performance

### Optimization

- **Server components**: Reduced client-side JavaScript
- **Code splitting**: Automatic Next.js code splitting
- **Image optimization**: Next.js Image component
- **Caching**: Multiple caching layers

### Monitoring

- **API logging**: Detailed request/response logging
- **Error tracking**: Comprehensive error handling
- **Performance metrics**: Built-in Next.js analytics

## Development Guidelines

### Code Standards

- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **English only**: All code in English

### Testing

- **Unit tests**: Component and function testing
- **Integration tests**: API endpoint testing
- **E2E tests**: Full application testing

### Deployment

- **Docker**: Containerized deployment
- **Environment variables**: Secure configuration
- **Database migrations**: Prisma migration system
- **CI/CD**: Automated deployment pipeline

## Troubleshooting

### Common Issues

- **Authentication errors**: Check cookie settings and CORS
- **Feature flag issues**: Verify role permissions and caching
- **Build errors**: Check TypeScript and import paths
- **Performance issues**: Monitor caching and component rendering

### Debug Tools

- **Server logs**: Detailed API request logging
- **Browser dev tools**: Client-side debugging
- **Prisma Studio**: Database inspection
- **Next.js dev tools**: Performance profiling