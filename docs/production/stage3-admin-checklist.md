# Stage 3 checklist — Admin/Supabase integration

## Перед применением на production

### Supabase

- [ ] Apply `supabase/migrations/20260526_add_order_assembly_fields.sql`
- [ ] Apply `supabase/migrations/20260526_add_order_status_events.sql`
- [ ] Verify `orders.status` allows values:
  - `new`
  - `in_progress`
  - `done`
- [ ] Verify `order_status_events` table exists
- [ ] Verify service role key can select/update/insert needed tables

### Vercel env

- [ ] `ADMIN_API_KEY` is set and at least 24 chars
- [ ] `SUPABASE_URL` is set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] `ADMIN_PASSWORD_HASH` is set for temporary server-side admin login
- [ ] `VITE_ADMIN_ORDERS_API_URL` optional, defaults to `/api/admin/orders`
- [ ] `VITE_ADMIN_ORDER_STATUS_API_URL` optional, defaults to `/api/admin/order-status`
- [ ] `VITE_ADMIN_STATUS_EVENTS_API_URL` optional, defaults to `/api/admin/status-events`

### Smoke

- [ ] Login to `/admin` with frontend key
- [ ] Orders load from Supabase
- [ ] PII is masked in list
- [ ] Status update works
- [ ] `order_status_events` receives event
- [ ] Demo fallback appears if API fails

## Known limitations

- Frontend gate is not production-grade auth.
- Full PII details endpoint intentionally not implemented.
- `changed_by` is static `admin` until real admin auth is implemented.
