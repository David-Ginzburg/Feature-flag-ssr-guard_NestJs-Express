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

## Последние Изменения (2024)

### Миграция на Feature-Sliced Design (FSD)

- **Полная реорганизация клиента**: Переход с традиционной структуры на FSD архитектуру
- **Слоистая структура**: app → widgets → features → entities → shared
- **Разделение ответственности**: Четкое разделение компонентов по бизнес-логике
- **Переиспользование кода**: Улучшенная модульность и переиспользование компонентов

### Новая Структура Клиента

- **Shared слой**: Общие UI компоненты (Button, Spinner), утилиты и API
- **Entities слой**: Модели данных (User, FeatureFlags) и API для работы с ними
- **Features слой**: Бизнес-функции (аутентификация, админка)
- **Widgets слой**: Композиционные UI блоки (дашборд, админ панель)
- **Pages слой**: Страницы и общие компоненты (Header)

### Безопасность и Конфигурация

- **Улучшена безопасность cookies**: Добавлена условная настройка `secure` и `sameSite` флагов в зависимости от окружения
- **Миграция на ES Modules**: Переход с CommonJS на ES Modules для сервера с использованием `tsx` вместо `ts-node-dev`
- **TypeScript конфигурация**: Обновлена конфигурация для поддержки ES Modules с `verbatimModuleSyntax`

### Пользовательский Интерфейс

- **Система загрузки**: Добавлен компонент `Spinner` для отображения состояния загрузки
- **Улучшенная навигация**: Замена `window.location.href` на Next.js Router API для лучшего UX
- **Интеграция logout**: Удалена отдельная страница logout, функциональность интегрирована в Header

### Кэширование и Производительность

- **Оптимизация API вызовов**: Реализовано пользовательское кэширование для `/api/flags` с 60-секундной ревалидацией
- **REST API улучшения**: Переход с query parameters на Authorization header для передачи токенов
- **Логирование**: Добавлено детальное логирование для мониторинга вызовов API

### Интернационализация

- **Перевод интерфейса**: Все пользовательские сообщения переведены с русского на английский
- **Очистка кода**: Удалены все комментарии из кодовой базы для улучшения читаемости

## Архитектурные Принципы

### 1. Многоуровневая Архитектура (Layered Architecture)

- **Разделение ответственности**: Каждый слой имеет четко определенную роль
- **Независимость**: Слои слабо связаны между собой
- **Тестируемость**: Каждый слой может быть протестирован изолированно

### 2. Feature-Sliced Design (FSD)

- **Слоистая структура**: app → widgets → features → entities → shared
- **Серверные компоненты по умолчанию**: Минимизация клиентского кода
- **Переиспользование**: Компоненты организованы по бизнес-логике

## Архитектура Бэкенда

### Слои и Поток Данных

```
HTTP Request → Routes → Controllers → Services → Data Access Layer (Prisma)
```

#### 1. Routes Layer (`/server/src/routes/`)

- **Ответственность**: HTTP маршрутизация
- **Файлы**: `auth.routes.ts`
- **Правила**: Только определение эндпоинтов, без бизнес-логики

#### 2. Controllers Layer (`/server/src/controllers/`)

- **Ответственность**: Обработка HTTP запросов/ответов
- **Файлы**: `auth.controller.ts`
- **Правила**: Тонкий слой между HTTP и бизнес-логикой

#### 3. Services Layer (`/server/src/services/`)

- **Ответственность**: Вся бизнес-логика приложения
- **Файлы**: `auth.service.ts`
- **Правила**: Независим от HTTP, переиспользуемый

#### 4. Data Access Layer (`/server/src/lib/`)

- **Ответственность**: Взаимодействие с базой данных
- **Файлы**: `prisma.ts`
- **Правила**: Единственная точка доступа к БД

### API Эндпоинты

| Эндпоинт        | Метод | Описание                     | Аутентификация     | Кэширование |
| --------------- | ----- | ---------------------------- | ------------------ | ----------- |
| `/api/register` | POST  | Регистрация пользователя     | Нет                | Нет         |
| `/api/login`    | POST  | Аутентификация               | Нет                | Нет         |
| `/api/logout`   | POST  | Выход из системы             | Нет                | Нет         |
| `/api/me`       | GET   | Данные текущего пользователя | Да (Cookie/Header) | Нет         |
| `/api/flags`    | GET   | Фича-флаги пользователя      | Да (Cookie/Header) | 60 сек      |

### Аутентификация

#### Поддерживаемые методы

- **Cookie-based**: `auth_token` в httpOnly cookie
- **Header-based**: `Authorization: Bearer <token>` header
- **Приоритет**: Header имеет приоритет над cookie

#### Настройки Cookie

```typescript
// Development
{
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
  path: "/"
}

// Production
{
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
  path: "/"
}
```

### Система Фича-Флагов

```typescript
interface FeatureFlags {
	canViewAnalytics: boolean; // ADMIN, EDITOR
	canEditContent: boolean; // ADMIN, EDITOR
	showAdminDashboard: boolean; // ADMIN only
	canAccessSettings: boolean; // ADMIN, EDITOR
}
```

## Архитектура Фронтенда

### Feature-Sliced Design (FSD) Структура

```
client/src/
├── app/                    # Next.js App Router (страницы)
│   ├── layout.tsx         # Корневой layout с Header
│   ├── page.tsx           # Главная страница
│   ├── ui/                # UI компоненты главной страницы
│   │   └── FeatureFlagsList.tsx
│   ├── login/page.tsx     # Страница входа
│   ├── register/page.tsx  # Страница регистрации
│   ├── dashboard/         # Страница дашборда
│   │   ├── page.tsx       # Страница дашборда
│   │   └── ui/            # UI компоненты дашборда
│   │       ├── DashboardContent.tsx
│   │       ├── DashboardWrapper.tsx
│   │       ├── AnalyticsWidget.tsx
│   │       └── index.ts
│   └── settings/page.tsx  # Страница настроек
├── features/             # Features слой
│   ├── auth/            # Аутентификация
│   │   └── ui/
│   │       ├── LoginForm.tsx
│   │       ├── RegisterForm.tsx
│   │       └── LogoutButton.tsx
│   └── admin/           # Админка
│       └── ui/
│           └── AdminPanel.tsx
├── entities/            # Entities слой
│   ├── user/           # Пользователь
│   │   ├── model/
│   │   │   └── types.ts
│   │   └── api/
│   │       └── userApi.ts
│   └── feature-flag/   # Фича-флаги
│       ├── model/
│       │   └── types.ts
│       └── api/
│           └── flagsApi.ts
└── shared/             # Shared слой
    ├── ui/            # Общие UI компоненты
    │   ├── button/
    │   └── spinner/
    ├── lib/           # Утилиты
    │   ├── auth.ts
    │   ├── flags.ts
    │   └── utils.ts
    └── api/           # Общие API
        └── auth.ts
```

### Слои FSD

#### 1. App Layer (`/client/src/app/`)

- **Ответственность**: Next.js App Router страницы и маршрутизация
- **Файлы**: `page.tsx`, `layout.tsx`, `login/page.tsx`, etc.
- **Тип**: Серверные компоненты
- **Правила**: Прямая композиция из features и entities
- **Особенности**:
  - Header интегрирован в `layout.tsx`
  - Специфичные для страницы компоненты лежат в `ui/` папке страницы
  - Каждый компонент в отдельном файле
  - Нет widgets слоя - все компоненты специфичны для страниц

#### 2. Features Layer (`/client/src/features/`)

- **Ответственность**: Бизнес-функции и сценарии
- **Файлы**:
  - `auth/` - Аутентификация (LoginForm, RegisterForm, LogoutButton)
  - `admin/` - Админка (AdminPanel)
- **Тип**: Клиентские компоненты (`'use client'`)
- **Правила**: Использует entities, не зависит от widgets

#### 4. Entities Layer (`/client/src/entities/`)

- **Ответственность**: Бизнес-сущности и их API
- **Файлы**:
  - `user/` - Пользователь (модель, API)
  - `feature-flag/` - Фича-флаги (модель, API)
- **Тип**: Серверные функции и типы
- **Правила**: Независим от других слоев, переиспользуемый

#### 5. Shared Layer (`/client/src/shared/`)

- **Ответственность**: Переиспользуемый код
- **Файлы**:
  - `ui/` - Общие UI компоненты (Button, Spinner)
  - `lib/` - Утилиты (auth, flags, utils)
  - `api/` - Общие API функции
- **Правила**: Независим от бизнес-логики, переиспользуемый

### Серверный Рендеринг Фича-Флагов

```typescript
// shared/lib/flags.ts
export async function getFeatureFlags() {
	const cookieStore = await cookies();
	const authToken = cookieStore.get("auth_token");

	if (!authToken) {
		return defaultFlags;
	}

	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/flags`, {
		headers: {
			Cookie: cookieStore.toString(),
			Authorization: `Bearer ${authToken.value}`,
		},
		next: { revalidate: 60 }, // 60-секундное кэширование
	});

	return await response.json();
}
```

### FSD Правила Импортов

```typescript
// ✅ Правильные импорты (снизу вверх)
// app → widgets → features → entities → shared

// В app слое (страницы)
import { AnalyticsWidget } from "@/widgets/dashboard";
import { getFeatureFlags } from "@/entities/feature-flag";
import { LogoutButton } from "@/features/auth";

// В widgets слое
import { AdminPanel } from "@/features/admin";
import { getFeatureFlags } from "@/entities/feature-flag";

// В features слое
import { loginUser } from "@/entities/user";
import { Button } from "@/shared/ui";

// ❌ Неправильные импорты (сверху вниз)
// shared → entities → features → widgets → app

// В shared слое НЕ должно быть импортов из других слоев
// В entities слое НЕ должно быть импортов из features/widgets/app
```

### Система Кэширования

#### Next.js Server-Side Caching

- **Директива**: `next: { revalidate: 60 }` для 60-секундного кэширования
- **Пользовательское кэширование**: Каждый пользователь имеет отдельный кэш на основе Authorization header
- **Автоматическая инвалидация**: Кэш обновляется каждые 60 секунд

#### Server-Side Headers

```typescript
// server/src/controllers/auth.controller.ts
res.setHeader("Cache-Control", "private, max-age=60");
res.setHeader("ETag", `"${req.user?.id || "anonymous"}-${Math.floor(Date.now() / 60000)}"`);
```

#### Логирование и Мониторинг

- **Счетчик вызовов**: Отслеживание количества обращений к `/api/flags`
- **Детальное логирование**: Информация о пользователе, токене и возвращаемых флагах
- **Отладка кэширования**: Логи для понимания работы кэш-системы

### Условный Рендеринг

```typescript
// app/page.tsx
import { Suspense } from "react";
import { getFeatureFlags } from "@/entities/feature-flag";
import { AnalyticsWidget, FeatureFlagsList } from "@/widgets/dashboard";

async function FeatureFlagsContent() {
	const flags = await getFeatureFlags();

	return (
		<>
			{flags.canViewAnalytics && <AnalyticsWidget />}
			<FeatureFlagsList flags={flags} />
		</>
	);
}

export default function HomePage() {
	return (
		<div className="container mx-auto p-8">
			<h1 className="text-3xl font-bold mb-8">Welcome to Feature Flags Demo</h1>
			<Suspense fallback={<div>Loading feature flags...</div>}>
				<FeatureFlagsContent />
			</Suspense>
		</div>
	);
}
```

### Композиция Компонентов

```typescript
// widgets/dashboard/ui/DashboardContent.tsx
import { getFeatureFlags } from "@/entities/feature-flag";
import { AdminPanel } from "@/features/admin";
import { AnalyticsWidget, FeatureFlagsList } from "./";

async function DashboardContent() {
	const flags = await getFeatureFlags();

	return (
		<>
			{flags.canViewAnalytics && <AnalyticsWidget />}
			{flags.showAdminDashboard ? (
				<AdminPanel />
			) : (
				<div className="bg-gray-100 p-6 rounded-lg">
					<h2 className="text-xl font-semibold mb-4">Regular Dashboard</h2>
					<p>Welcome to your dashboard! You have standard user access.</p>
				</div>
			)}
			<FeatureFlagsList flags={flags} />
		</>
	);
}
```

## База Данных

### Схема (Prisma)

```prisma
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

### Роли и Права Доступа

| Роль   | canViewAnalytics | canEditContent | showAdminDashboard | canAccessSettings |
| ------ | ---------------- | -------------- | ------------------ | ----------------- |
| VIEWER | ❌               | ❌             | ❌                 | ❌                |
| EDITOR | ✅               | ✅             | ❌                 | ✅                |
| ADMIN  | ✅               | ✅             | ✅                 | ✅                |

## Инфраструктура

### Контейнеризация

#### Docker Compose

```yaml
services:
  postgres: # База данных
  server: # Express.js API
  client: # Next.js фронтенд
```

#### Multi-stage Dockerfiles

- **Бэкенд**: Node.js → Build → Runtime
- **Фронтенд**: Node.js → Build → Standalone Runtime

### CI/CD

#### GitHub Actions

- **Валидация**: Сборка Docker образов
- **Тестирование**: Проверка совместимости
- **Безопасность**: Сканирование зависимостей

### Развертывание

#### Production

- **Бэкенд**: Render (Docker)
- **Фронтенд**: Vercel (Next.js)
- **База данных**: Neon (PostgreSQL)

#### Development

- **Локально**: Docker Compose
- **База данных**: PostgreSQL в контейнере

## Безопасность

### Аутентификация

- **JWT токены** в httpOnly cookies
- **Хэширование паролей** с bcrypt
- **CORS** настроен для продакшена

### Настройки Cookie

#### Development (локальная разработка)

```typescript
{
  httpOnly: true,
  secure: false,        // HTTP разрешен для localhost
  sameSite: "lax",     // Более мягкие ограничения
  path: "/"
}
```

#### Production (продакшен)

```typescript
{
  httpOnly: true,
  secure: true,         // Только HTTPS
  sameSite: "strict",  // Строгие ограничения CSRF
  path: "/"
}
```

### Авторизация

- **Роли пользователей** определяют доступ
- **Фича-флаги** контролируют UI
- **Серверная валидация** всех запросов

### Защита от атак

- **CSRF**: SameSite cookies
- **XSS**: HttpOnly cookies
- **Man-in-the-middle**: Secure flag в production
- **Session hijacking**: JWT с ограниченным временем жизни

## Производительность

### Кэширование

#### Next.js Server-Side Caching

- **Фича-флаги**: `next: { revalidate: 60 }` для 60-секундного кэширования
- **Пользовательское кэширование**: Отдельный кэш для каждого пользователя на основе Authorization header
- **Автоматическая инвалидация**: Кэш обновляется каждые 60 секунд

#### HTTP Caching Headers

- **Cache-Control**: `private, max-age=60` для серверных ответов
- **ETag**: Пользователь-специфичные теги для оптимизации кэширования
- **304 Not Modified**: Поддержка условных запросов

#### Database

- **Prisma**: Connection pooling для оптимизации подключений к БД
- **Docker**: Multi-stage builds для минимизации размера образов

### Масштабируемость

- **Микросервисная архитектура**: Бэкенд и фронтенд разделены
- **Горизонтальное масштабирование**: Docker контейнеры
- **CDN**: Vercel для статических ресурсов

## Мониторинг и Логирование

### Логирование

#### Сервер (Express.js)

- **API вызовы**: Детальное логирование всех обращений к `/api/flags`
- **Счетчик запросов**: Отслеживание количества вызовов для каждого пользователя
- **Информация о пользователе**: Роль, email, ID для отладки
- **Токены**: Логирование первых символов токена для безопасности

#### Клиент (Next.js)

- **Кэширование**: Логи для понимания работы кэш-системы
- **Ошибки**: Обработка и логирование ошибок API
- **Состояние загрузки**: Отслеживание состояний UI

### Отладка

#### Development

- **Hot reload**: Автоматическая перезагрузка при изменениях
- **Детальные логи**: Подробная информация для разработки
- **Кэш отладка**: Логи для понимания работы кэширования

#### Production

- **Структурированные логи**: JSON формат для анализа
- **Мониторинг производительности**: Отслеживание времени ответа API
- **Ошибки**: Централизованное логирование ошибок

## Преимущества FSD Архитектуры

### 1. Четкое Разделение Ответственности

- **Слоистая структура**: Каждый слой имеет свою роль и не может зависеть от вышестоящих
- **Изоляция бизнес-логики**: Features содержат только бизнес-сценарии
- **Переиспользование**: Entities и Shared можно использовать везде

### 2. Масштабируемость

- **Модульность**: Легко добавлять новые features и widgets
- **Независимость**: Изменения в одном слое не влияют на другие
- **Команды**: Разные команды могут работать с разными слоями

### 3. Тестируемость

- **Изоляция**: Каждый слой можно тестировать независимо
- **Моки**: Легко создавать моки для зависимостей
- **Unit тесты**: Четкие границы для unit тестов

### 4. Поддерживаемость

- **Поиск кода**: Легко найти нужный компонент по его назначению
- **Рефакторинг**: Безопасные изменения в рамках слоя
- **Документация**: Структура сама документирует архитектуру

### 5. Next.js Совместимость

- **App Router**: Полная совместимость с Next.js 13+ App Router
- **Server Components**: Серверные компоненты по умолчанию
- **Client Components**: Минимальное использование клиентского кода

## Заключение

Архитектура обеспечивает:

- ✅ **Чистоту кода** через FSD разделение ответственности
- ✅ **Масштабируемость** через модульную структуру
- ✅ **Безопасность** через ролевую модель
- ✅ **Производительность** через серверный рендеринг
- ✅ **Поддерживаемость** через четкую FSD структуру
- ✅ **Тестируемость** через изолированные слои
