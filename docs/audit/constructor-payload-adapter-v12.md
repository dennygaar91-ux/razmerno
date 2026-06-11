# Размерно — constructor payload adapter v12

## Что сделано

Подготовлен адаптер `constructorStore -> order/config payload`.

## Новые файлы

- `src/static-pages/constructor/adapters/constructorPayload.ts`
- `src/static-pages/constructor/adapters/constructorPayload.test.ts`

## Что добавлено

Адаптер умеет строить из состояния конструктора:

- `ConstructorSnapshot`
- filling summary:
  - shelves
  - drawers
  - hangingRod
- layout model:
  - sections
  - compartments
  - widthMm
  - heightMm
  - kind
  - shelves/drawers/rod flags
- draft без PII для localStorage
- order payload для `submitOrder`

## Что изменено

- `ConstructorPage.tsx` теперь формирует `constructorSnapshot`.
- `saveDraft` использует `buildConstructorDraft`.
- `useConstructorSubmit` принимает `snapshot`.
- Сборка payload вынесена в `buildOrderPayloadFromConstructor`.
- Payload теперь содержит `layout`, который проходит server-side layout validation и пригоден для production export.

## Проверки

Добавлен скрипт:

`npm run test:constructor-payload`

Он проверяет:

- корректную сводку filling;
- совпадение сумм ширин/высот layout с габаритами;
- прохождение `validateOrderLayout`;
- наличие layout в order payload;
- отсутствие PII в draft.

## Что не трогалось

- backend/API;
- pricing engine;
- delivery;
- admin;
- CSS;
- production geometry.

## Следующий этап

Подключить этот adapter к production preview/export на клиенте или подготовить отдельный `productionPreviewAdapter`, чтобы новый store мог строить preview данных для будущей 3D/geometry сцены.
