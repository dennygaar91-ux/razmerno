# Production release checklist — Размерно MVP

## Before deploy

### Code

- [ ] `npm install`
- [ ] `npm run qa:stage2`
- [ ] `npm run qa:all`
- [ ] `npm run build`
- [ ] `npm audit --audit-level=moderate`

### Supabase

- [ ] Apply `supabase/migrations/20260526_add_order_assembly_fields.sql`
- [ ] Apply `supabase/migrations/20260526_add_order_status_events.sql`
- [ ] Verify `public.orders` has assembly columns
- [ ] Verify RLS / service-role access for API
- [ ] Verify no PII is logged in client logs

### Vercel env

- [ ] `ALLOWED_ORIGINS=https://razmerno.ru`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `RESEND_API_KEY`
- [ ] `ORDER_MANAGER_EMAIL`
- [ ] `MAIL_FROM`
- [ ] `VITE_USE_MOCK_API=false`
- [ ] `VITE_ORDER_API_URL=/api/orders`
- [ ] `ADMIN_API_KEY`
- [ ] `ADMIN_PASSWORD_HASH`
- [ ] `VITE_YANDEX_METRIKA_ID`

### Email

- [ ] Resend domain verified
- [ ] Manager email receives order
- [ ] Customer email receives order confirmation
- [ ] If customer email fails but manager email succeeds, order remains successful and failure is logged

### Functional smoke

- [ ] Create wardrobe order without delivery/assembly
- [ ] Create order with delivery inside MKAD
- [ ] Create order with delivery outside MKAD and distance
- [ ] Create order with assembly +10%
- [ ] Try invalid RU phone
- [ ] Try missing email
- [ ] Try checkout resend within 30 seconds
- [ ] Open `/admin`, verify access gate
- [ ] Verify Yandex Metrika loads only with env id

## Known MVP limitations

- Admin access gate is not production-grade auth.
- Outside MKAD distance is text-based, no geocoding.
- Assembly is included in order/pricing, but production workflow details are still manual.
- PDF estimate is not implemented; estimate is in email.
- Supabase migration must be applied manually.


## Stage 4 deploy verification

### API readiness

- [ ] `/api/health` returns `200` after env setup.
- [ ] `/api/health` returns no missing required env.
- [ ] `/api/admin/orders` is not open without `ADMIN_API_KEY`.
- [ ] `/api/admin/orders` works with `ADMIN_API_KEY`.
- [ ] API responses include no-store headers.

### Search safety

- [ ] `robots.txt` disallows `/admin`.
- [ ] `robots.txt` disallows `/api/admin`.
- [ ] `sitemap.xml` exists.

### Smoke scripts

- [ ] `npm run predeploy:guard`
- [ ] `npm run smoke:deploy`

### Rollback readiness

- [ ] latest production commit is known.
- [ ] Supabase migrations are additive and can stay.
- [ ] ADMIN_API_KEY can be rotated immediately.
