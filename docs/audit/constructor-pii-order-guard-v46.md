# Размерно — constructor PII/order guard v46

## Что сделано

Добавлен точечный guard-test для PII/order invariants конструктора.

## Новый файл

- `src/static-pages/constructor/constructorPiiOrderInvariants.test.ts`

## Новый npm script

```bash
npm run test:constructor-pii-order
```

## Что проверяет test

### 1. Draft/localStorage без PII

Проверяет, что `saveConstructorDraft` и `loadConstructorDraft` не сохраняют:

- имя клиента;
- телефон;
- email;
- адрес доставки;
- honeypot/company.

Проверяются:

- raw localStorage JSON;
- returned draft;
- loaded draft.

### 2. Order payload PII paths

Проверяет, что PII попадает только в ожидаемые явные поля:

- имя → `customer.name`
- телефон → `customer.phone`
- email → `customer.email`
- адрес доставки → `delivery.address`
- honeypot → `honeypot`

### 3. Product/configuration branches без PII

Проверяет, что customer/delivery PII не попадает в:

- `productType`
- `dimensions`
- `sections`
- `filling`
- `layout`
- `materials`
- `style`
- `priceBreakdown`
- `totalPrice`

## Что не трогалось

- backend/API;
- pricing engine;
- order flow;
- production preview adapter;
- Zustand-store implementation;
- CSS;
- visual components.

## QA

Пройдены проверки:

- `npm run test:constructor-pii-order`
- `npm run test:constructor-flow`
- `npm run check:constructor-architecture`
- `npm run report:react-components`
- `npm run check:static-pages-architecture`
- `npm run check:no-static-html-pages`
- `npm run report:css-inventory`
- `npm run test:constructor-store`
- `npm run test:constructor-draft`
- `npm run test:constructor-payload`
- `npm run test:production-preview`
- `npm run typecheck`
- `npm run build`
- `npm run check:no-server`
- `npm run check:normal-urls`
- `npm run check:root-docs`
- `npm run check:legacy-runtime-imports`
- `npm run test:pricing-engine`
- `npm run test:delivery`
- `npm run test:pricing-final`

## Следующий этап

Следующий безопасный шаг — добавить release checklist script, который объединяет текущие основные guards:

- constructor architecture;
- static pages architecture;
- no static html pages;
- constructor flow;
- constructor PII/order;
- key pricing/order tests.
