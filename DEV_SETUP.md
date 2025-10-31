# Настройка локальной разработки с Docker

## Быстрый старт

1. **Запустить MySQL через Docker:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d mysql
   ```

2. **Выполнить миграции:**
   ```bash
   docker exec -i todo-mysql-dev mysql -h localhost -utudolistuser -pKrishna1284Radha tudolist < server/migrations/001_create_tables.sql
   ```

3. **Настроить .env для бекенда:**
   Создайте файл `server/.env.local`:
   ```
   PORT=3001
   NODE_ENV=development
   DATABASE_URL=mysql://tudolistuser:Krishna1284Radha@localhost:3307/tudolist
   JWT_SECRET=todo-app-secret-key-dev
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:8085
   ```

4. **Запустить бекенд:**
   ```bash
   cd server && npm run dev
   ```

5. **Запустить фронтенд:**
   ```bash
   npm run dev
   ```

## Остановка

```bash
docker-compose -f docker-compose.dev.yml down
```

## Проверка работы

- Бекенд: http://localhost:3001/health
- Фронтенд: http://localhost:8085 (или другой порт, если 8080 занят)
- MySQL: localhost:3307

