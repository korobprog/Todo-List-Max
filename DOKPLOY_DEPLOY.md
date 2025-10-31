# Инструкции по деплою на Dokploy

## Подготовка

1. Убедитесь, что у вас есть:
   - Аккаунт на Dokploy Server
   - Доступ к MySQL базе данных: `mysql://tudolistuser:Krishna1284Radha@testtodo-todolist-ssach9:3306/tudolist`

## Деплой бекенда

1. Создайте новое приложение в Dokploy
2. Подключите репозиторий
3. Укажите корневую директорию: `server`
4. Выберите Dockerfile как метод сборки
5. Настройте переменные окружения:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=mysql://tudolistuser:Krishna1284Radha@testtodo-todolist-ssach9:3306/tudolist
   JWT_SECRET=your-strong-secret-key-here
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-frontend-domain.com
   ```
6. Запустите миграции БД (выполните SQL из `server/migrations/001_create_tables.sql`)
7. Деплой

## Деплой фронтенда

1. Создайте новое приложение в Dokploy
2. Подключите репозиторий
3. Укажите корневую директорию: `.` (корень проекта)
4. Выберите Dockerfile как метод сборки
5. Настройте переменные окружения:
   ```
   VITE_API_URL=https://your-backend-domain.com/api
   ```
6. Деплой

## Локальная разработка

1. Скопируйте `.env.example` в `.env` и настройте переменные
2. Запустите миграции БД
3. Для запуска с Docker Compose:
   ```bash
   docker-compose up -d
   ```
4. Для локальной разработки:
   - Бекенд: `cd server && npm install && npm run dev`
   - Фронтенд: `npm install && npm run dev`

## Миграции базы данных

Выполните SQL миграции из файла `server/migrations/001_create_tables.sql` в вашей MySQL базе данных.

