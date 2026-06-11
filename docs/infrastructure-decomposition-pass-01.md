# Infrastructure Decomposition Pass 01

Дата: 2026-06-10

## Цель

Снизить риск дальнейшей работы с большим `Constructor3DPage.tsx` без изменения бизнес-логики, UX, визуального поведения, pricing, checkout, 3D/2D runtime или маршрутизации.

## Ограничения

В рамках pass не выполнялись:

- новый функционал;
- редизайн;
- изменения Three.js поведения;
- изменения pricing/order flow;
- изменения UX-сценария;
- перенос feature-модулей в `src/features/**`;
- CSS cleanup;
- удаление legacy.

## Что изменено

Из `src/static-pages/Constructor3DPage.tsx` вынесены только безопасные, изолированные блоки:

1. Page metadata и scene helpers:
   - `stepLabels`;
   - `viewLabels`;
   - `stepDescriptions`;
   - `stepStateLabels`;
   - `getStepVisualState`;
   - `getStepIssueCount`;
   - `formatMm`;
   - `getSceneInfo`;
   - `SceneInfoBar`.

   Новый файл: `src/static-pages/constructor/components/Constructor3DPageMeta.tsx`.

2. Reset confirmation dialog.

   Новый файл: `src/static-pages/constructor/components/ResetProjectDialog.tsx`.

3. Runtime scene panels:
   - `SceneRuntimeStatus`;
   - `ThreeSceneLoading`;
   - `TwoDFallbackScene`;
   - `getThreeFailureLabel`.

   Новый файл: `src/static-pages/constructor/components/SceneRuntimePanels.tsx`.

## Результат по размеру файла

До pass:

- `src/static-pages/Constructor3DPage.tsx` — 2771 строка.

После pass:

- `src/static-pages/Constructor3DPage.tsx` — 2384 строки;
- `Constructor3DPageMeta.tsx` — 139 строк;
- `ResetProjectDialog.tsx` — 105 строк;
- `SceneRuntimePanels.tsx` — 178 строк.

Итого из page-файла вынесено около 387 строк без изменения поведения.

## Почему это безопасно

Вынесены только:

- константы;
- чистые helper-функции;
- presentational/runtime компоненты;
- reset dialog с тем же текстом и обработчиками.

Не менялись:

- state shape;
- zustand store;
- pricing;
- checkout submit;
- validation logic;
- Three.js geometry/materials/camera;
- route mapping;
- CSS selectors/classes.

## Проверки

Успешно прошли:

```bash
npm install --no-audit --no-fund
npm run typecheck
npm run build
npm run qa:static
npm run validate:config
npm run test:constructor-store
npm run test:constructor-three
npm run test:pricing-final
```

## Оставшиеся крупные риски

1. `Constructor3DPage.tsx` всё ещё остаётся God Component — 2384 строки.
2. `constructorStore.ts` всё ещё монолитный — 1672 строки.
3. `projectRules.ts` всё ещё объединяет limits, validation, messages, production notes и auto-fix.
4. `constructor3d.css` и `constructor.css` всё ещё слишком большие.
5. Legacy `src/configurator/**` всё ещё находится в quarantine и не удалён.

## Рекомендованный следующий infrastructure pass

Следующий безопасный pass: вынести из `Constructor3DPage.tsx` блоки текущих шагов в thin container components без изменения логики:

- `SizesStepPanel`;
- `FillingStepPanel`;
- `MaterialsStepPanel`;
- `Checkout3DStep` уже существует внутри page и может быть вынесен отдельно.

Но делать это нужно отдельным этапом с полным regression-набором проверок.
