# Infrastructure All Remaining Pass

Дата: 2026-06-10

## Цель

Выполнить максимально широкий безопасный infrastructure/decomposition pass без изменения бизнес-логики, pricing, checkout submit, Three.js runtime behavior, CSS-внешнего вида, маршрутов, UX или дизайна.

## Выполнено

### 1. `projectRules.ts` превращён в compatibility barrel

Исходный монолит `src/static-pages/constructor/rules/projectRules.ts` был 1428 строк. Теперь он стал compatibility barrel на 10 строк и реэкспортирует специализированные rule-модули. Существующие импорты из `projectRules.ts` сохранены.

Созданы/задействованы модули:

- `projectRuleConstants.ts` — defaults, limits, rule constants, material defaults.
- `ruleMath.ts` — low-level numeric helpers.
- `fillingRules.ts` — filling normalization and totals.
- `facadeRules.ts` — section/zone facade layout helpers.
- `sectionRules.ts` — section layout normalization.
- `compartmentRules.ts` — base compartment layout normalization.
- `compartmentShelfRules.ts` — split/remove shelf divider logic.
- `materialRules.ts` — furniture/material resolving.
- `normalizeProjectRules.ts` — project normalization entry.
- `validationRules.ts` — main validation entry.
- `validationFillingIssues.ts` — filling-specific validation issues.
- `validationStatus.ts` — validation status/issue helpers.

### 2. `threeSceneAdapter.ts` decomposed

`src/static-pages/constructor/three/threeSceneAdapter.ts` уменьшен с 819 до 421 строки.

Созданы модули:

- `threeScenePrimitives.ts` — primitive unit conversion and panel helpers.
- `threeSceneLayout.ts` — sections and compartment scene layout helpers.
- `threeSceneHardware.ts` — doors, handles, hinges, drawers, rods, hardware panels.
- `threeSceneTargets.ts` — interaction target generation.

`threeSceneAdapter.ts` остался composition entry для `buildThreeFurnitureModel`.

### 3. Updated decomposition documentation

Обновлён `docs/decomposition-plan.md` и добавлен этот отчёт.

## Что намеренно не сделано

### CSS purge не выполнен

Файлы:

- `src/styles/constructor.css` (~10804 строк)
- `src/styles/constructor3d.css` (~3982 строк)
- `src/index.css` (~842 строки)

Причина: CSS-cleanup может изменить внешний вид. Для этого нужен отдельный visual QA / visual regression pass.

### `compartment -> zone` rename не выполнен

Причина: это затронет store, geometry, validation, pricing inputs, tests и adapters. Сейчас безопаснее сохранять compatibility layer.

### Production/geometry modules не дробились

Файлы вроде `src/constructor/productionModel.ts`, `src/constructor/geometry/buildHardware.ts`, `src/constructor/catalog.ts` требуют отдельного production regression pass.

## Проверки

Успешно прошли:

```bash
npm run typecheck
npm run build
npm run qa:static
npm run validate:config
npm run test:constructor-store
npm run test:constructor-three
npm run test:pricing-final
```

## Остаточные проблемные файлы

| Файл | Строк | Статус |
|---|---:|---|
| `src/styles/constructor.css` | ~10804 | legacy CSS-монолит, не трогать без visual QA |
| `src/styles/constructor3d.css` | ~3982 | накопленные stage-слои, требует CSS cleanup pass |
| `src/index.css` | ~842 | глобальные стили, требует инвентаризации |
| `src/constructor/productionModel.ts` | ~633 | production model, нужен отдельный regression pass |
| `src/static-pages/Constructor3DPage.tsx` | ~576 | допустимый page orchestrator, можно дробить дальше позже |
| `src/static-pages/constructor/components/ConstructorRealisticSvgModel.tsx` | ~516 | SVG renderer монолит, можно вынести primitives позже |
| `src/constructor/geometry/buildHardware.ts` | ~451 | production geometry, нужен отдельный production pass |
| `src/static-pages/constructor/components/SizesStepPanel.tsx` | ~444 | UI component, можно дробить позже |
| `src/static-pages/constructor/three/threeSceneAdapter.ts` | ~421 | уже значительно лучше, допустимый composition entry |
| `src/static-pages/constructor/rules/compartmentRules.ts` | ~202 | базовый compartment module |
| `src/static-pages/constructor/rules/validationRules.ts` | ~307 | допустимый validation entry, можно дробить дальше позже |

## Архитектурный эффект

- `projectRules.ts` больше не является rules-монолитом.
- `threeSceneAdapter.ts` больше не содержит все helper/hardware/target функции внутри одного файла.
- Store ранее уже превращён в slice composition root.
- Основные рисковые монолиты теперь ограничены CSS и production/geometry слоями, которые требуют отдельных визуальных/production regression passes.
