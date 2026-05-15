# Razmerno backend skeleton

Первичный backend-скелет для конструктора мебели.

## Запуск

```bash
cd server
npm install
npm run dev
```

По умолчанию сервер стартует на:

```txt
http://localhost:4000
```

Проверка:

```http
GET /api/health
```

## Переменные окружения

Создайте `server/.env` при необходимости:

```env
PORT=4000
CORS_ORIGIN=http://localhost:5173
```

Для подключения frontend к backend в корне frontend-проекта можно использовать:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_USE_MOCK_API=false
```

## Endpoint'ы

```http
POST /api/constructor/estimate
POST /api/constructor/orders
POST /api/constructor/projects
GET /api/constructor/projects/:projectId
```

## Текущая реализация

Сейчас backend использует in-memory storage:

- проекты хранятся в `Map`;
- заказы хранятся в `Map`;
- после перезапуска сервера данные очищаются.

Это временно. Следующий этап — подключение БД.

## Структура

```txt
server/src/
  index.js
  routes/
    constructor.routes.js
  controllers/
    constructor.controller.js
  services/
    estimate.service.js
    projectStore.service.js
  validators/
    constructor.validator.js
```

## Важный принцип

Frontend может показывать предварительную цену, но финальная цена должна пересчитываться на backend.
