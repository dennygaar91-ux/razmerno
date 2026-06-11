# Deploy smoke scripts

## Health only

```bash
SMOKE_BASE_URL=https://razmerno.ru npm run smoke:deploy
```

## With admin API

```bash
SMOKE_BASE_URL=https://razmerno.ru ADMIN_API_KEY=<server-admin-key> npm run smoke:deploy
```

## Что проверяется

- `/api/health` отвечает `200` или `503`.
- `/api/admin/orders` не открыт без ключа.
- `/api/admin/orders` не возвращает `401`, если передан корректный ключ.

## Ограничение

Smoke script не создаёт реальный заказ, чтобы не засорять production заявки.
