# Database schema draft для конструктора Размерно

Документ фиксирует первичную структуру БД для перехода от in-memory backend к persistence-слою.

## 1. customers

Хранит клиента, который оформил заявку или зарегистрировался.

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Индексы:

```sql
CREATE INDEX customers_phone_idx ON customers (phone);
```

## 2. projects

Хранит исходный проект конструктора.

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  product_type TEXT NOT NULL,
  project_payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Статусы:

```txt
draft
saved
ordered
archived
```

## 3. estimates

Хранит backend-смету. Важно: не доверяем frontend-цене.

```sql
CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  total NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'RUB',
  breakdown JSONB NOT NULL,
  warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 4. orders

Хранит заказ, созданный из проекта.

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  estimate_id UUID REFERENCES estimates(id),
  status TEXT NOT NULL DEFAULT 'created',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_url TEXT,
  manager_review_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Статусы заказа:

```txt
created
manager_review
payment_pending
paid
in_production
ready_for_delivery
completed
cancelled
```

Статусы оплаты:

```txt
pending
payment_link_created
paid
failed
refunded
```

## 5. order_events

История действий по заказу.

```sql
CREATE TABLE order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 6. materials_catalog

Будущий справочник материалов.

```sql
CREATE TABLE materials_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  thickness_mm NUMERIC(6, 2),
  texture_url TEXT,
  price_per_unit NUMERIC(12, 2),
  unit TEXT NOT NULL DEFAULT 'sheet',
  is_active BOOLEAN NOT NULL DEFAULT true,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 7. hardware_catalog

Будущий справочник фурнитуры.

```sql
CREATE TABLE hardware_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  price_per_unit NUMERIC(12, 2),
  unit TEXT NOT NULL DEFAULT 'piece',
  is_active BOOLEAN NOT NULL DEFAULT true,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 8. Почему JSONB нужен на старте

Для MVP конструктора структура проекта будет быстро меняться. Поэтому:

- project_payload хранит исходную конфигурацию;
- breakdown хранит структуру сметы;
- warnings хранит массив предупреждений;
- payload в catalog-таблицах хранит производственные параметры.

Позже часто используемые поля можно вынести в отдельные колонки.

## 9. Следующий шаг

После выбора БД:

- добавить Prisma или Drizzle;
- создать migrations;
- заменить `projectStore.service.js` на persistence-service;
- добавить таблицы customers/projects/estimates/orders/order_events;
- сохранить совместимость API с текущим frontend.
