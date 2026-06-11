# Размерно — production preview adapter v13

## Что сделано

Добавлен adapter для построения production preview/export данных из нового constructor store без зависимости от checkout-формы.

## Новые файлы

- `src/static-pages/constructor/adapters/productionPreviewAdapter.ts`
- `src/static-pages/constructor/adapters/productionPreviewAdapter.test.ts`

## Возможности

Adapter строит:

- production-safe `OrderRequest` без реальных персональных данных;
- `ProductionExportPackage` через существующий production pipeline;
- краткую summary для будущего UI/3D/production preview:
  - panels;
  - hardware;
  - drilling;
  - edgeBandingLengthMm;
  - basisSteps;
  - warnings;
  - errors;
  - validation status;
  - requiresTechnologistCheck.

## Исправлено

- UI-состояние `handleless` теперь мапится в production-compatible `facadeStyleId: "no-handle"`.
- Для обычных ручек используется `facadeStyleId: "regular"`.
- `hardwareId` мапится в существующие значения `base/comfort`.
- Это важно, потому что production layer ожидает `"no-handle"` для push-to-open.

## Проверки

Добавлен скрипт:

`npm run test:production-preview`

Тест проверяет:

- preview order не содержит реальные email/phone;
- production export summary строится;
- handleless правильно превращается в `push-to-open`.

## Что не трогалось

- backend/API;
- pricing engine;
- delivery;
- admin;
- CSS;
- production geometry internals.

## Следующий этап

Подключить production preview summary в UI конструктора или использовать adapter для будущей 3D/geometry сцены.
