# Feature Architecture Plan

Дата: 2026-06-10

## Цель

Подготовить безопасный переход к feature-based архитектуре без радикальной миграции сейчас.

## Целевая структура

```text
src/
  app/
    App.tsx
    routes.ts
    providers.tsx
  features/
    constructor/
      shell/
      steps/
        sizes/
        filling/
        materials/
        checkout/
      state/
      validation/
      adapters/
      types/
    viewer/
      three/
      blueprint/
      shared/
    pricing/
      engine/
      catalog/
      breakdown/
      delivery/
    materials/
      catalog/
      visuals/
      textures/
    orders/
      checkout/
      submit/
      payload/
    admin/
      orders/
      production/
    production/
      geometry/
      manufacturing-rules/
      basis/
    ui/
      buttons/
      forms/
      status/
      surfaces/
  shared/
    lib/
    types/
    config/
```

## Карта переноса

| Текущий путь | Целевой feature path | Риск | Условие переноса |
|---|---|---:|---|
| `src/static-pages/Constructor3DPage.tsx` | `src/features/constructor/shell/ConstructorWorkspace.tsx` + step modules | Высокий | Только после создания wrapper и snapshot QA |
| `src/static-pages/constructor/store/**` | `src/features/constructor/state/**` | Высокий | Сначала slices без изменения public API |
| `src/static-pages/constructor/rules/**` | `src/features/constructor/validation/**` | Средний | Сначала покрыть rules tests |
| `src/static-pages/constructor/three/**` | `src/features/viewer/three/**` | Средний | Сохранять exports/adapters |
| `ConstructorRealisticSvgModel.tsx` | `src/features/viewer/blueprint/BlueprintViewer.tsx` | Средний | Сначала wrapper, потом внутренний split |
| `src/pricing/**` | `src/features/pricing/**` | Средний | Не менять формулы; перенос через barrel exports |
| `src/shared/materials/**` | `src/features/materials/**` или shared materials | Низкий | Сохранить public imports |
| `src/admin/**` | `src/features/admin/**` | Средний | После constructor stabilization |
| `src/configurator/**` | удалить / `src/legacy/configurator/**` | Высокий | Только после миграции tests |

## Риски

- Нарушение pricing/order flow при переносе imports.
- Двойные источники state при slices migration.
- Сломанные tests из-за legacy paths.
- CSS cascade regressions.
- Увеличение bundle при неправильных barrel exports.

## Зависимости

1. Browser E2E должен быть подтверждён.
2. Legacy tests должны быть мигрированы.
3. Constructor3DPage должен быть декомпозирован до переносимой структуры.
4. CSS usage map должен быть готов до style migration.

## Безопасная стратегия

1. Добавить feature folders без удаления старых путей.
2. Создать barrel exports.
3. Переносить по одному feature с adapter layer.
4. На каждом шаге запускать typecheck/build/core tests.
5. Удалять старые paths только после grep-проверки imports.
