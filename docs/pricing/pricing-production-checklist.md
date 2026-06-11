# Pricing production checklist

## 1. База данных Supabase

Применить SQL:

```sql
-- 1
db/pricing.sql

-- 2
db/seed/price-items.sql
```

Проверить таблицы:

- `public.price_import_batches`
- `public.price_items`

Проверить, что `retail_price` считается generated column:

```txt
retail_price = source_price * markup_multiplier
```

## 2. Env-переменные Vercel

Для pricing runtime нужны уже добавленные env:

```txt
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Для заявок:

```txt
ORDER_MANAGER_EMAIL=
RESEND_API_KEY=
MAIL_FROM=
ALLOWED_ORIGINS=https://razmerno.ru
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## 3. Проверки перед деплоем

```bash
npm install
npm run build:price-seed
npm run check:price-integrity
npm run qa:all
npm audit --audit-level=moderate
```

## 4. Runtime-проверка API

После деплоя проверить:

```txt
GET https://razmerno.ru/api/price-items?itemType=board&producer=Egger&thicknessMm=16&limit=5
```

Ожидаемый результат:

- `ok: true`
- `count > 0`
- `source: "supabase"` если env и таблица заполнены;
- `source: "seed"` только если Supabase env отсутствуют.

## 5. Что важно понимать

Текущий pricing-engine уже не использует старую формулу `объём × коэффициент`.
Он считает по каталогу:

- корпус;
- фасады;
- задняя стенка;
- кромка;
- услуги;
- наполнение;
- фурнитура;
- производство;
- доставка отдельно на checkout.

## 6. Ограничения текущей версии

- Точный раскрой листов пока не оптимизируется по картам раскроя.
- Доставка Москва/МО определяется текстовым правилом по адресу.
- Фурнитура пока считается укрупнённо, без полного каталога Hettich/Firmax.
- Drawer-системы требуют отдельного ТЗ.
