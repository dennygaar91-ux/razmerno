# Admin + Supabase integration

## Что добавлено

### API

- `GET /api/admin/orders`
- `PATCH /api/admin/order-status`
- `GET /api/admin/status-events`

### Required server env

```env
ADMIN_API_KEY=<long random secret, min 24 chars>
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`ADMIN_PASSWORD_HASH` остаётся только для server-side admin login, но server API должен использовать `ADMIN_API_KEY`.

## Supabase migrations

Применить в таком порядке:

1. `supabase/migrations/20260526_add_order_assembly_fields.sql`
2. `supabase/migrations/20260526_add_order_status_events.sql`

## Smoke test после deploy

### 1. Admin orders list

```bash
curl -H "Authorization: Bearer $ADMIN_API_KEY" \
  "https://razmerno.ru/api/admin/orders?limit=10"
```

Ожидается:

```json
{ "ok": true, "orders": [] }
```

или список masked-заявок.

### 2. Update order status

```bash
curl -X PATCH \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"RZ-20260526-1234","status":"in_progress"}' \
  "https://razmerno.ru/api/admin/order-status"
```

### 3. Status events

```bash
curl -H "Authorization: Bearer $ADMIN_API_KEY" \
  "https://razmerno.ru/api/admin/status-events?limit=20"
```

## Security notes

- API returns masked customer data only.
- Full PII detail endpoint is intentionally not implemented.
- `ADMIN_API_KEY` must not be exposed to the browser.
- Current server-side admin login is temporary and not a replacement for backend auth.
