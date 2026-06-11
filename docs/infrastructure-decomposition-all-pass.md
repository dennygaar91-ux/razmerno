# Infrastructure Decomposition All Pass

Дата: 2026-06-10

## Цель

Снизить риски работы с растущей кодовой базой без изменения бизнес-логики, UX, дизайна, Three.js поведения, pricing и checkout.

## Выполненная безопасная декомпозиция

### 1. Constructor3DPage.tsx

После предыдущих pass файл уже был уменьшен с 2771 до 1789 строк. В этом проходе из него дополнительно вынесен весь drawer layer.

Итог:

- Было до инфраструктурной декомпозиции: `2771` строка.
- Было перед этим проходом: `1789` строк.
- Стало после этого прохода: `705` строк.

Новые/обновлённые компоненты:

- `src/static-pages/constructor/components/ConstructorDrawerContent.tsx`
- `src/static-pages/constructor/components/FillingStepPanel.tsx`
- `src/static-pages/constructor/components/Checkout3DStep.tsx`
- `src/static-pages/constructor/components/ConstructorDrawerPrimitives.tsx`

### 2. DrawerContent

`DrawerContent` вынесен из page-level файла и теперь отвечает только за маршрутизацию между step panels внутри drawer:

- sizes → `SizesStepPanel`
- fill → `FillingStepPanel`
- materials → `MaterialsStepPanel`
- checkout → `Checkout3DStep`

### 3. FillingStepPanel

Шаг «Наполнение» вынесен в отдельный компонент. Поведение не менялось:

- выбор секции;
- выбор зоны;
- локальное меню добавления;
- удаление элементов;
- фасады секции;
- фасады зоны в точной настройке;
- ручки;
- random preset;
- validation assist.

### 4. Checkout3DStep

Checkout UI вынесен из drawer-файла в отдельный компонент. Поведение не менялось:

- контакты;
- доставка;
- сборка;
- смета;
- validation assist.

### 5. ConstructorDrawerPrimitives

Вынесены повторно используемые drawer primitives:

- `TextInput3D`
- `InlineIssue`
- `ValidationAssist`
- `StepIntro`

## Что намеренно не декомпозировано автоматически

### constructorStore.ts

Файл остаётся крупным (`1672` строки), но его нельзя дробить в один шаг без риска регрессии. Он содержит actions, derivation, validation, reset, production snapshot, checkout fields и compatibility aliases.

Рекомендуемый безопасный порядок:

1. вынести pure initial state factory;
2. вынести selection helpers;
3. вынести dimension/section actions;
4. вынести filling actions;
5. вынести facade/material actions;
6. вынести checkout/contact actions;
7. только потом разделять store на slices.

### projectRules.ts

Файл остаётся крупным (`1428` строк). Безопасная декомпозиция требует отдельного pass, потому что в нём смешаны:

- limits;
- normalization;
- validation;
- autofix;
- messages;
- production warnings.

Рекомендуемый split:

- `rules/limits.ts`
- `rules/normalization.ts`
- `rules/validation.ts`
- `rules/autofix.ts`
- `rules/messages.ts`
- `rules/productionWarnings.ts`

### constructor3d.css / constructor.css

CSS не чистился, потому что это может изменить внешний вид. Нужен отдельный visual-safe CSS pass после ручного UI audit.

## Проблемные файлы после прохода

| Файл | Строк | Риск | Рекомендация |
|---|---:|---|---|
| `src/styles/constructor.css` | 10804 | legacy CSS-монолит | quarantine + staged deletion after legacy removal |
| `src/styles/constructor3d.css` | 3982 | накопленные stage-слои | visual-safe CSS cleanup после UI audit |
| `src/static-pages/constructor/store/constructorStore.ts` | 1672 | монолитный zustand store | split на slices только отдельными safe passes |
| `src/static-pages/constructor/rules/projectRules.ts` | 1428 | слишком много правил в одном файле | split rules по доменам |
| `src/static-pages/constructor/three/threeSceneAdapter.ts` | 819 | scene adapter отвечает за много mapping logic | split на panels/hardware/materials/modes adapters |
| `src/static-pages/Constructor3DPage.tsx` | 705 | всё ещё orchestrator >500 строк | вынести workspace shell и scene panel в следующий pass |
| `src/static-pages/constructor/components/FillingStepPanel.tsx` | 631 | крупный feature component | split на ZonePicker/AddMenu/ElementsList/FacadeControls |
| `src/static-pages/constructor/components/ConstructorRealisticSvgModel.tsx` | 516 | SVG renderer монолит | split на BlueprintDimensions/BlueprintSections/BlueprintLabels |

## Проверки

Успешно прошли:

- `npm run typecheck`
- `npm run build`
- `npm run qa:static`
- `npm run validate:config`
- `npm run test:constructor-store`
- `npm run test:constructor-three`
- `npm run test:pricing-final`

## Итог

Декомпозиция выполнена безопасно в той части, где перенос не менял поведение. Полная декомпозиция всех крупных файлов за один проход признана небезопасной: store, rules, CSS и Three adapter требуют отдельных staged passes с regression checks.
