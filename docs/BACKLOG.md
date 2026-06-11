# Backlog — «Размерно»

Дата актуализации: 2026-06-10

## Critical

- Повторить полный `constructor3d-e2e` в среде с установленным Playwright Chromium.
- Провести новый визуальный/UX audit финальной сборки после Stage 13–19.
- Price QA по 10–15 реальным мебельным сценариям.
- Проверить соответствие material id / UI label / texture / price source / прайс ×1.3.
- Проверить checkout вручную: контакты, доставка, сборка, смета, success, cooldown.

## High

- Мигрировать test-backed legacy tests из `src/configurator/**` в активные 3D-first modules.
- После миграции удалить или архивировать `src/configurator/**`.
- Провести CSS usage map и удалить явно мёртвые classes после visual QA.
- Декомпозировать `Constructor3DPage.tsx`.
- Декомпозировать `constructorStore.ts` на slices.
- Разделить `projectRules.ts` на limits/validation/autofix/production/ui messages.
- Вынести 2D fallback в отдельный `BlueprintViewer`.

## Medium

- Разделить `threeSceneAdapter.ts` на несколько adapters.
- Разделить `constructor3d.css` на shell/scene/drawer/forms/checkout/design-system layers.
- Разделить `productionModel.ts` на panels/hardware/drilling/warnings/export.
- Разделить admin `AdminOrdersPage.tsx`.
- Улучшить фурнитуру в 3D до более предметной MVP-модели.
- Улучшить микротексты warning/error/reset/WebGL fallback.
- Подготовить отдельную таблицу manual QA сценариев.

## Low

- Полный rename `compartment → zone` в коде.
- Полноценный инженерный 2D.
- Exploded view.
- Assembly animations.
- Mobile constructor.
- Cloud autosave/drafts.
- PDF/export documents.

## Технический долг

- `src/styles/constructor.css` — 10805 строк, legacy CSS monolith.
- `src/styles/constructor3d.css` — 3983 строки, accumulated stage CSS.
- `src/static-pages/Constructor3DPage.tsx` — 2772 строки, God Component.
- `src/static-pages/constructor/store/constructorStore.ts` — 1673 строки, monolithic store.
- `src/static-pages/constructor/rules/projectRules.ts` — 1429 строк, mixed rules.
- Legacy quarantine: `src/configurator/**`.
- Huge `package.json` scripts list; требуется нормализация QA commands.
