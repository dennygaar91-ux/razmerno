# Размерно — constructor architecture guard v44

## Что сделано

Проведён контрольный архитектурный этап после v39–v43 и добавлен guard-script, который фиксирует текущую декомпозицию конструктора.

## Новый файл

- `scripts/check-constructor-architecture.mjs`

## Новый npm script

```bash
npm run check:constructor-architecture
```

## Что проверяет guard

### ConstructorPage

`ConstructorPage.tsx` должен оставаться orchestration layer:

- `useConstructorPageState`
- `useConstructorQuote`
- `useConstructorSubmit`
- `useProductionPreview`
- `<ConstructorSidebar />`
- `<ConstructorScene />`

И не должен напрямую рендерить:

- `SizesStep`
- `FillStep`
- `MaterialsStep`
- `CheckoutStep`
- `FurnitureTypeSwitch`
- `ConstructorStepper`

### ConstructorSidebar

`ConstructorSidebar.tsx` должен быть sidebar composition layer:

- `<FurnitureTypeSwitch />`
- `<ConstructorStepper />`
- `<ConstructorStepPanel />`
- `<ConstructorDraftRow />`
- `<ConstructorFlowActions />`

И не должен напрямую рендерить step components.

### ConstructorScene

`ConstructorScene.tsx` должен быть scene composition layer:

- `<FillPreview />`
- `<ClientValidationCard />`
- `<ProductionDebugPreview />`
- model helpers через `ConstructorSceneModel`

И не должен снова содержать inline helpers:

- `function FillPreview`
- `function getModelMetrics`
- `function getProportionLabel`
- `function formatPreviewStatus`
- `type ModelMetrics`

## Текущие размеры ключевых файлов

| File | Lines | Bytes |
|---|---:|---:|
| `src/static-pages/ConstructorPage.tsx` | 189 | 6420 |
| `src/static-pages/constructor/components/ConstructorSidebar.tsx` | 183 | 5508 |
| `src/static-pages/constructor/components/ConstructorStepPanel.tsx` | 146 | 4016 |
| `src/static-pages/constructor/components/ConstructorDraftRow.tsx` | 24 | 784 |
| `src/static-pages/constructor/components/ConstructorFlowActions.tsx` | 49 | 1799 |
| `src/static-pages/constructor/components/ConstructorScene.tsx` | 128 | 5686 |
| `src/static-pages/constructor/components/ConstructorSceneModel.tsx` | 75 | 2641 |
| `src/static-pages/constructor/components/ConstructorSceneFillPreview.tsx` | 93 | 3127 |
| `src/static-pages/constructor/components/ConstructorSceneValidationCard.tsx` | 33 | 1461 |
| `src/static-pages/constructor/components/ConstructorSceneProductionDebug.tsx` | 53 | 2545 |
| `src/static-pages/constructor/hooks/useConstructorPageState.ts` | 157 | 4576 |

## Текущее состояние

После v43 `npm run report:react-components` показывает:

- flagged candidates: 0

Это значит, что крупные React-компоненты конструктора разложены до приемлемого размера по текущим soft thresholds.

## Что не трогалось

- CSS;
- backend/API;
- pricing engine;
- order flow;
- production preview adapter;
- Zustand-store;
- payload logic;
- production geometry.

## Следующий этап

Логичный следующий шаг — не продолжать дробить файлы ради дробления, а перейти к техническому UX-контролю конструктора:

1. добавить guard для draft/PII и order payload invariants;
2. добавить smoke test для step navigation;
3. затем отдельно вернуться к визуальным огрехам, которые пользователь уже заметил.
