# Post-deploy manual smoke checklist

## 1. Health

Open:

```text
https://razmerno.ru/api/health
```

Expected:

- `ok: true`
- `missing: []`

If `ok: false`, stop and fix Vercel env.

## 2. Landing

Open:

```text
https://razmerno.ru/
```

Check:

- page loads without white screen;
- CTA opens constructor;
- console has no fatal errors.

## 3. Constructor order smoke

Open:

```text
https://razmerno.ru/configurator
```

Create three test configurations:

### A. Без доставки и сборки

- wardrobe;
- valid dimensions;
- valid customer name;
- RU phone;
- email;
- no delivery;
- no assembly.

Expected:

- order created;
- manager email received;
- customer email received;
- order remains visible after success.

### B. Доставка внутри МКАД

- enable delivery;
- address contains `Москва`;
- expected delivery: `6 000 ₽`.

### C. Доставка за МКАД + сборка

- enable delivery;
- address includes `Московская область, за МКАД 20 км`;
- expected delivery: `7 000 ₽`;
- enable assembly;
- expected assembly: `10%` of cabinet price.

## 4. Admin

Open:

```text
https://razmerno.ru/admin
```

Check:

- frontend gate asks key;
- orders load from Supabase;
- customer PII is masked;
- order has delivery/assembly columns;
- status can be changed;
- status history appears.

## 5. Admin API direct smoke

```powershell
$env:SMOKE_BASE_URL="https://razmerno.ru"
$env:ADMIN_API_KEY="<ADMIN_API_KEY>"
npm run smoke:deploy
```

Expected:

- health status OK;
- admin endpoint works with key;
- admin endpoint is not public without key.

## 6. Email

Check manager mailbox:

- manager receives order;
- email includes:
  - order number;
  - product;
  - price;
  - delivery;
  - assembly;
  - customer contact.

Check customer mailbox:

- customer receives confirmation;
- if customer email fails, manager order still succeeds.

## 7. Analytics

If `VITE_YANDEX_METRIKA_ID` is set:

- open Yandex Metrika realtime;
- visit landing;
- open constructor;
- submit order smoke;
- verify visits/events appear.

## 8. Stop conditions

Stop release and rollback if:

- `/api/health` returns missing required env;
- order cannot be saved;
- manager email does not arrive;
- admin API is public without key;
- status update fails;
- console shows fatal runtime errors.
