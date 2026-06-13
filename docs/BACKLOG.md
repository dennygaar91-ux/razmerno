# Backlog — «Размерно»

Дата актуализации: 2026-06-13

> Нормализовано после Infrastructure Audit 001. Статусы разделены на Planned / Needs Verification / Deferred. Пункты не удалялись без подтверждения, а были переклассифицированы.

## Needs Verification

Требуют проверки фактическим запуском приложения или GitHub Actions.

- Повторить полный `constructor3d-e2e` в среде с установленным Playwright Chromium.
- Провести новый визуальный/UX audit актуальной сборки.
- Price QA по 10–15 реальным мебельным сценариям.
- Проверить соответствие material id / UI label / texture / price source / коэффициент ×1.3.
- Проверить checkout вручную: контакты, доставка, сборка, смета, success, cooldown.
- Проверить работу нового GitHub Actions workflow `qa.yml`.

## High Priority

### Architecture

- Поддерживать актуальность `project-map.md`.
- Поддерживать актуальность `runtime-boundaries.md`.
- Поддерживать актуальность `constructor-state-and-layout.md`.
- Поддерживать актуальность `pricing-and-order-boundaries.md`.
- Поддерживать актуальность `css-ownership-map.md`.
- Создать ADR / decision log систему.

### Constructor

- Мигрировать test-backed legacy tests из `src/configurator/**` в активные 3D-first modules.
- После миграции удалить или архивировать `src/configurator/**`.
- Декомпозировать `Constructor3DPage.tsx`.
- Вынести 2D fallback в отдельный `BlueprintViewer`.
- Добавить contract tests для `constructorPayload.ts`.
- Разделить `useConstructorPageState.ts` на read/actions/snapshot layers.

### CSS

- Провести CSS usage map после visual baseline.
- Подготовить visual baseline перед cleanup.
- Подготовить quarantine-план для `constructor.css`.

## Medium Priority

### 3D / Constructor

- Разделить `threeSceneAdapter.ts` на несколько adapters.
- Улучшить фурнитуру в 3D до более предметной MVP-модели.
- Улучшить микротексты warning/error/reset/WebGL fallback.

### Production

- Разделить production model по доменным зонам.
- Документировать production/export contracts.

### Admin

- Разделить `AdminOrdersPage.tsx` на отдельные модули.

### QA

- Подготовить отдельную таблицу manual QA сценариев.
- Автоматизировать отчёт по крупным файлам.
- Автоматизировать dependency graph report.
- Автоматизировать route map report.

## Deferred

- Полный rename `compartment → zone` в коде.
- Полноценный инженерный 2D.
- Exploded view.
- Assembly animations.
- Mobile constructor.
- Cloud autosave/drafts.
- PDF/export documents.

## Технический долг (актуализировать при каждом аудите)

### Legacy / Quarantine

- `src/styles/constructor.css` — legacy CSS monolith.
- `src/configurator/**` — legacy constructor layer.

### Кандидаты на декомпозицию

- `Constructor3DPage.tsx`.
- `useConstructorPageState.ts`.
- `constructorPayload.ts`.
- `threeSceneAdapter.ts`.
- `AdminOrdersPage.tsx`.

### Infrastructure

- Нормализовать большой список QA scripts в `package.json`.
- Проверить и документировать GitHub Actions pipeline.
- Поддерживать архитектурную документацию в актуальном состоянии.
