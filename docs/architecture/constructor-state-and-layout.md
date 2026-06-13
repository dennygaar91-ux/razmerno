# Constructor State and Layout Boundaries — «Размерно»

Дата: 2026-06-13
Тип: architecture boundary document.

## 1. Назначение

Документ фиксирует границы состояния конструктора: где находится source of truth, как связаны секции/зоны/наполнение/фасады, какие файлы являются критическими и какие изменения запрещены без отдельного этапа.

Этот документ не меняет код. Он задаёт правила для будущей разработки.

## 2. Термины

| Термин в UI | Термин в коде | Смысл |
|---|---|---|
| Секция | `section` | Вертикальная часть мебели по ширине. |
| Зона | `compartment` / `zone` | Вертикальный отсек внутри секции по высоте. |
| Наполнение | `filling` / `fillingLayout` | Полки, ящики, штанга в конкретной зоне. |
| Фасады секции | `facadeLayout` | Режим фасада на уровне секции. |
| Фасады зоны | `zoneFacadeLayout` | Точная настройка фасада на уровне зоны. |
| Точная настройка | `exactModeEnabled` | Режим расширенного управления. |
| Canonical state | `ConstructorCanonicalState` | Нормализованная read-model проекции состояния. |

Важно: в UI используется термин «Зона», но в коде исторически остаётся `compartment`. Массовый rename `compartment → zone` запрещён до отдельного этапа.

## 3. Source of truth

Основной source of truth активного конструктора:

```text
src/static-pages/constructor/store/constructorStore.ts
```

Store собирается из slices:

- `constructorFurnitureDimensionsSlice.ts`
- `constructorSectionSlice.ts`
- `constructorCompartmentSlice.ts`
- `constructorFillingSlice.ts`
- `constructorFacadeSlice.ts`
- `constructorMaterialsSlice.ts`
- `constructorSceneSlice.ts`
- `constructorCheckoutSlice.ts`
- `constructorProductionSnapshotSlice.ts`
- `constructorRandomPresetSlice.ts`
- `constructorAutoFixSlice.ts`
- `constructorUtilitySlice.ts`

Типовая поверхность store описана в:

```text
src/static-pages/constructor/store/constructorStoreTypes.ts
```

Selectors:

```text
src/static-pages/constructor/store/constructorSelectors.ts
```

Initial state:

```text
src/static-pages/constructor/store/constructorStoreInitialState.ts
```

## 4. Active constructor flow

```text
Constructor3DPage.tsx
  → useConstructorPageState
  → useConstructorStore selectors/actions
  → canonical state
  → quote/submit/production preview hooks
  → UI drawer + 3D scene + 2D fallback
```

Active page:

```text
src/static-pages/Constructor3DPage.tsx
```

Legacy page:

```text
src/static-pages/ConstructorPage.tsx
```

Boundary rule: shared hooks/store/adapters must stay compatible with both active and legacy constructor pages until legacy route is formally quarantined or removed.

## 5. Layout model chain

### UI state → canonical read model

```text
constructorStore state
  → constructorSelectors
  → buildCanonicalConstructorState
  → ConstructorCanonicalState
```

Key file:

```text
src/static-pages/constructor/store/constructorCanonicalState.ts
```

Canonical state is a read-model for selected sections/zones/materials/validation. It should be used for future architectural reasoning, not bypassed by ad-hoc duplicated selectors.

### UI state → order payload

```text
ConstructorSnapshot
  → buildConstructorLayout
  → buildOrderPayloadFromConstructor
  → OrderPayload
```

Key file:

```text
src/static-pages/constructor/adapters/constructorPayload.ts
```

This is a critical bridge. It affects order payload, pricing input, production export and future manufacturing flow.

### UI state → 3D model

```text
Constructor state
  → ThreeFurnitureInput
  → buildThreeFurnitureModel
  → ThreePanel[] / interactionTargets
  → ThreeFurnitureViewer
```

Key files:

```text
src/static-pages/constructor/three/threeSceneAdapter.ts
src/static-pages/constructor/three/ThreeFurnitureViewer.tsx
src/static-pages/constructor/three/ThreeFurnitureModel.tsx
```

This layer is visually fragile. Do not refactor without visual baseline and 3D fallback checks.

## 6. Section ownership

Section state includes:

- number of sections;
- section ids;
- width of each section;
- selected section;
- facade mode per section.

Key types/fields:

- `sections`
- `sectionLayout`
- `selectedSectionId`
- `facadeLayout`

Key rules:

- minimum section width: `CONSTRUCTOR_SECTION_RULES.minWidthMm`;
- max section count: `CONSTRUCTOR_SECTION_RULES.maxCount`;
- wide section warning is validation-level, not pricing-level.

Protected behavior:

- changing section count must preserve valid widths;
- equalize sections must not break total width;
- selected section must remain valid after mutations.

## 7. Zone / compartment ownership

Zone state includes:

- zones per section;
- height per zone;
- selected zone/compartment;
- zone-level filling;
- zone-level facade override in exact mode.

Key types/fields:

- `compartmentLayout`
- `selectedCompartmentId`
- `selectedZoneId`
- `fillingLayout`
- `zoneFacadeLayout`

Key rules:

- minimum zone height: `CONSTRUCTOR_COMPARTMENT_RULES.minHeightMm`;
- recommended rod height: `CONSTRUCTOR_COMPARTMENT_RULES.recommendedRodHeightMm`;
- shelf gap: `CONSTRUCTOR_FILLING_RULES.minShelfGapMm`;
- drawer front min height: `CONSTRUCTOR_FILLING_RULES.minDrawerFrontHeightMm`.

Protected behavior:

- adding a shelf divider should split the selected zone, not all zones;
- removing an element should affect only the chosen zone;
- exact zone facade overrides must not erase section-level facade defaults;
- selected zone must remain valid after normalization.

## 8. Filling ownership

Two historical models coexist:

1. Legacy/global filling:
   - `fill`
   - `shelvesCount`
   - `drawersCount`
   - `rodsCount`

2. Active zone-level filling:
   - `fillingLayout[sectionId][compartmentId]`

Boundary rule: active 3D-first UI should prefer zone-level filling. Legacy/global filling remains compatibility fallback and must not be removed until tests/routes are migrated.

## 9. Facade ownership

Facade model has two levels:

1. Section-level:

```text
facadeLayout[sectionId] = "open" | "hinged"
```

2. Zone-level exact mode override:

```text
zoneFacadeLayout[sectionId][zoneId] = "inherit" | "open"
```

Boundary rule: zone-level override must not become the default mode for all users. It belongs to exact mode / точная настройка.

## 10. Material ownership

Material state includes:

- `material`
- `facadeMaterial`
- `backPanelMaterial`
- `projectMaterials`

Material catalog lives in:

```text
src/shared/materials/materialCatalog.ts
```

Material pricing context lives in:

```text
src/pricing/materialPricing.ts
```

Boundary rule: visual material choice affects 3D preview and pricing context. Do not change material ids/aliases without checking UI label, texture path and price source.

## 11. Validation ownership

Validation state:

```text
ConstructorValidationState
```

Key fields:

- `status`
- `issues`
- `stepStatuses`

Validation functions live in:

```text
src/static-pages/constructor/rules/validationRules.ts
src/static-pages/constructor/rules/validationFillingIssues.ts
src/static-pages/constructor/rules/validationStatus.ts
```

Boundary rule: warning and error semantics must stay separated.

- `error` blocks checkout.
- `warning` may or may not block depending on `blocksCheckout`.
- Complex production warnings should not leak directly into client UX unless converted to simple user-facing messages.

## 12. Payload adapter boundary

Critical adapter:

```text
src/static-pages/constructor/adapters/constructorPayload.ts
```

It builds:

- layout model;
- filling summary;
- materials block;
- style block;
- price breakdown;
- customer/contact payload;
- delivery/assembly data;
- consent;
- honeypot.

Boundary rule: this file is not just UI glue. It is a contract boundary between constructor UI and backend/order/production layers.

Before changing it, add or run tests for:

- wardrobe with shelves;
- wardrobe with drawers;
- wardrobe with rod;
- multi-section layout;
- multi-zone layout;
- delivery enabled/disabled;
- assembly enabled/disabled;
- facade material different from body;
- handleless vs regular.

## 13. Legacy compatibility boundary

Legacy code remains in:

```text
src/configurator/**
src/static-pages/ConstructorPage.tsx
src/styles/constructor.css
```

Do not delete until:

1. active routes no longer depend on it;
2. tests are migrated;
3. visual and functional baseline is captured;
4. backlog item is explicitly accepted.

## 14. Safe future decomposition order

1. Document ownership — current step.
2. Add contract tests around `constructorPayload.ts`.
3. Add small tests for `buildCanonicalConstructorState` if gaps remain.
4. Split `useConstructorPageState` into read/actions/snapshot without behavior changes.
5. Split `Constructor3DPage.tsx` into page shell, scene controller, drawer controller.
6. Only after that consider deeper scene/adapter refactoring.

## 15. Prohibited changes without separate task

- Remove global filling fallback.
- Rename all `compartment` to `zone`.
- Change pricing fields in order payload.
- Change checkout blocking behavior.
- Change material ids.
- Change server/API order contract.
- Refactor Three.js scene adapter without visual checks.
- Delete legacy constructor/CSS.

## 16. Checklist before modifying constructor state

- Read this document.
- Read `runtime-boundaries.md`.
- Identify whether change affects active, legacy, or shared layer.
- Confirm protected zones are not touched.
- Run relevant tests/Actions after change.
- Record risks and backlog.
