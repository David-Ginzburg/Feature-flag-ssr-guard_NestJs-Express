# Настройка переменных окружения для локального запуска

## Необходимые .env файлы:

### 1. Корневая папка - `.env`
```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/feature_flags_db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# API URL for client
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### 2. Папка server - `.env` (уже существует)
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/feature_flags_db"
JWT_SECRET="your-super-secret-jwt-key-here"
```

### 3. Папка client - `.env.local`
```bash
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

## Команды для создания файлов:

```bash
# Создать .env в корне
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/feature_flags_db"
JWT_SECRET="your-super-secret-jwt-key-here"
NEXT_PUBLIC_API_URL="http://localhost:4000"' > .env

# Создать .env.local в client
echo 'NEXT_PUBLIC_API_URL="http://localhost:4000"' > client/.env.local
```

## Запуск приложения:

```bash
# Запуск через docker-compose
docker-compose up

# Или запуск отдельных сервисов
cd server && npm run dev
cd client && npm run dev
```
