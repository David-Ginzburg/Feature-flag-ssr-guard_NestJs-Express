# Архитектура Full-Stack Приложения с Фича-Флагами

## Обзор Архитектуры

Данное приложение реализует full-stack решение с серверным рендерингом фича-флагов, следуя принципам чистой архитектуры и разделения ответственности.

## Последние Изменения (2024)

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

### Слои FSD

#### 1. App Layer (`/client/src/app/`)

- **Ответственность**: Маршрутизация и композиция страниц
- **Файлы**: `page.tsx`, `layout.tsx`, `login/page.tsx`, etc.
- **Тип**: Серверные компоненты

#### 2. Widgets Layer (`/client/src/components/`)

- **Ответственность**: Композиционные UI блоки
- **Файлы**:
  - `Header.tsx` - Основная навигация с интеграцией logout
  - `AnalyticsWidget.tsx` - Виджет аналитики (только для ADMIN/EDITOR)
  - `AdminPanel.tsx` - Панель администратора (только для ADMIN)
  - `LogoutButton.tsx` - Кнопка выхода с состоянием загрузки
  - `Spinner.tsx` - Переиспользуемый компонент загрузки
- **Тип**: Смешанные (серверные и клиентские компоненты)

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

## Заключение

Архитектура обеспечивает:

- ✅ **Чистоту кода** через разделение ответственности
- ✅ **Масштабируемость** через микросервисный подход
- ✅ **Безопасность** через ролевую модель
- ✅ **Производительность** через серверный рендеринг
- ✅ **Поддерживаемость** через четкую структуру
