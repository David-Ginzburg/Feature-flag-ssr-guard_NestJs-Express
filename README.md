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
   cd ../server && npm install
   ```

3. Set up environment variables (see ENV_SETUP.md)

4. Run the development servers:

   ```bash
   # Terminal 1 - Server
   cd server && npm run dev

   # Terminal 2 - Client
   cd client && npm run dev
   ```

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
