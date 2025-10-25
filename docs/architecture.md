# Архитектура Full-Stack Приложения с Фича-Флагами

## Обзор Архитектуры

Данное приложение реализует full-stack решение с серверным рендерингом фича-флагов, следуя принципам чистой архитектуры и разделения ответственности.

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

| Эндпоинт        | Метод | Описание                     | Аутентификация |
| --------------- | ----- | ---------------------------- | -------------- |
| `/api/register` | POST  | Регистрация пользователя     | Нет            |
| `/api/login`    | POST  | Аутентификация               | Нет            |
| `/api/me`       | GET   | Данные текущего пользователя | Да             |
| `/api/flags`    | GET   | Фича-флаги пользователя      | Да             |

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

### Слои FSD

#### 1. App Layer (`/client/src/app/`)

- **Ответственность**: Маршрутизация и композиция страниц
- **Файлы**: `page.tsx`, `layout.tsx`, `login/page.tsx`, etc.
- **Тип**: Серверные компоненты

#### 2. Widgets Layer (`/client/src/components/`)

- **Ответственность**: Композиционные UI блоки
- **Файлы**: `Header.tsx`, `AnalyticsWidget.tsx`, `AdminPanel.tsx`
- **Тип**: Серверные компоненты

#### 3. Features Layer (встроен в страницы)

- **Ответственность**: Бизнес-сценарии
- **Реализация**: Формы логина/регистрации в `app/login/`, `app/register/`
- **Тип**: Клиентские компоненты (`'use client'`)

#### 4. Shared Layer (`/client/src/lib/`)

- **Ответственность**: Переиспользуемый код
- **Файлы**: `flags.ts`` - функция получения фича-флагов
- **Правила**: Независим от бизнес-логики

### Серверный Рендеринг Фича-Флагов

```typescript
// lib/flags.ts
export async function getFeatureFlags() {
	"use cache: private"; // Next.js кэширование

	const cookieStore = cookies();
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/flags`, {
		headers: { Cookie: cookieStore.toString() },
	});

	return await response.json();
}
```

### Условный Рендеринг

```typescript
// app/page.tsx
export default async function HomePage() {
	const flags = await getFeatureFlags();

	return (
		<div>
			{flags.canViewAnalytics && <AnalyticsWidget />}
			{/* Другие компоненты на основе флагов */}
		</div>
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

### Авторизация

- **Роли пользователей** определяют доступ
- **Фича-флаги** контролируют UI
- **Серверная валидация** всех запросов

## Производительность

### Кэширование

- **Next.js**: `'use cache: private'` для фича-флагов
- **Prisma**: Connection pooling
- **Docker**: Multi-stage builds для оптимизации

### Масштабируемость

- **Микросервисная архитектура**: Бэкенд и фронтенд разделены
- **Горизонтальное масштабирование**: Docker контейнеры
- **CDN**: Vercel для статических ресурсов

## Мониторинг и Логирование

### Логирование

- **Сервер**: Console.log для разработки
- **Клиент**: Next.js встроенное логирование

### Отладка

- **Development**: Hot reload для обоих сервисов
- **Production**: Структурированные логи

## Заключение

Архитектура обеспечивает:

- ✅ **Чистоту кода** через разделение ответственности
- ✅ **Масштабируемость** через микросервисный подход
- ✅ **Безопасность** через ролевую модель
- ✅ **Производительность** через серверный рендеринг
- ✅ **Поддерживаемость** через четкую структуру
