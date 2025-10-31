# Быстрый старт для разработки

## 1. Запуск MySQL в Docker

```bash
docker-compose -f docker-compose.dev.yml up -d mysql
```

## 2. Выполнение миграций

```bash
docker exec -i todo-mysql-dev mysql -h localhost -utudolistuser -pKrishna1284Radha tudolist < server/migrations/001_create_tables.sql
```

## 3. Настройка переменных окружения

**Бекенд** (`server/.env.local`):
```
DATABASE_URL=mysql://tudolistuser:Krishna1284Radha@localhost:3307/tudolist
PORT=3001
JWT_SECRET=todo-app-secret-key-dev
FRONTEND_URL=http://localhost:8085
```

**Фронтенд** (`.env`):
```
VITE_API_URL=http://localhost:3001/api
```

## 4. Запуск

```bash
# Бекенд
cd server && npm install && npm run dev

# Фронтенд (в другом терминале)
npm install && npm run dev
```

## Проверка

- Откройте http://localhost:8085 (или другой порт, который покажет Vite)
- Зарегистрируйтесь или войдите
- Создайте задачу с расширенными полями
