# Размерно — constructor flow smoke v45

## Что сделано

Добавлен smoke test для базового сценария конструктора без касания backend/order/pricing implementation.

## Новый файл

- `src/static-pages/constructor/constructorFlowSmoke.test.ts`

## Новый npm script

```bash
npm run test:constructor-flow
```

## Что проверяет test

### 1. Порядок шагов

Проверяет, что wizard остаётся в порядке:

```text
sizes -> fill -> materials -> checkout
```

### 2. Базовый пользовательский сценарий

Симулируется сценарий:

1. пользователь начинает с `sizes`;
2. вводит ширину/высоту/глубину;
3. переходит в `fill`;
4. выбирает секции/отсеки/ящики/без ручек;
5. переходит в `materials`;
6. выбирает `graphite`;
7. переходит в `checkout`;
8. включает доставку;
9. заполняет контакты;
10. даёт consent.

### 3. Production-safe order payload

Smoke test строит order payload через:

```ts
buildOrderPayloadFromConstructor(snapshot, quote)
```

И проверяет:

- product type;
- dimensions;
- filling;
- totalPrice;
- source;
- layout validation через `validateOrderLayout`.

### 4. Draft без PII

Проверяет, что draft из checkout snapshot не содержит:

- имя;
- телефон;
- email;
- адрес доставки.

### 5. Reset

Проверяет, что reset возвращает:

- `sizes`;
- стартовые размеры;
- пустые контакты;
- пустой адрес доставки.

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

Добавить более точечный guard для PII/order invariants: запрет хранения PII в draft/localStorage и контроль, что order payload содержит PII только в customer block.
