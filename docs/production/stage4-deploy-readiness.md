# Stage 4 deploy readiness

## Ready when all checks pass

```bash
npm run predeploy:guard
npm run qa:stage4
npm run qa:all
npm run build
npm audit --audit-level=moderate
```

## After deploy

```bash
SMOKE_BASE_URL=https://razmerno.ru ADMIN_API_KEY=<server-key> npm run smoke:deploy
```

## Manual browser checks

- `/`
- `/configurator`
- `/admin`
- `/robots.txt`
- `/sitemap.xml`

## API checks

- `/api/health`
- `/api/admin/orders?limit=5`
- `/api/admin/status-events?limit=20`

## Stop deploy if

- health reports missing env;
- admin endpoint is open without key;
- order creation fails to send manager email;
- Supabase migration was not applied;
- Yandex Metrika counter is missing when analytics is required.
