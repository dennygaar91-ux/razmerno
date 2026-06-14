# Parallelization Rules — Размерно

Документ определяет, какие задачи можно выполнять параллельно, а какие нельзя.

---

## 1. Разрешено выполнять параллельно

### Documentation Track

Можно выполнять независимо:

- актуализация planning-документов;
- чистка устаревших docs;
- подготовка task briefs;
- синхронизация backlog;
- оформление audit reports.

Ограничение: документация должна отражать фактические решения, а не придумывать новый scope.

### Testing / CI Track

Можно выполнять параллельно с большинством задач:

- настройка CI;
- стабилизация test scripts;
- smoke tests;
- unit tests для уже стабильных модулей.

Ограничение: не менять бизнес-логику ради тестов.

### Pricing Review Track

Можно выполнять параллельно с docs и tests:

- аудит pricing engine;
- сверка price sources;
- добавление тестовых сценариев.

Ограничение: нельзя параллелить с изменениями production cost rules.

### Materials Content Track

Можно выполнять параллельно:

- подготовка списка декоров;
- подготовка текстур;
- описание material categories.

Ограничение: не менять Three.js material pipeline без согласования с Three.js агентом.

### Production Planning Track

Можно выполнять параллельно:

- анализ будущей production model;
- описание Basis JSON contract;
- проектирование admin tabs.

Ограничение: не внедрять production changes до стабилизации constructor state.

---

## 2. Запрещено выполнять параллельно

### Constructor State Refactor + Constructor3D UX Changes

Причина: оба направления меняют одну модель данных.

Правило: сначала state model, потом UX interactions.

### Pricing Engine Changes + Production Cost Rules Changes

Причина: высокий риск расхождения стоимости.

Правило: сначала зафиксировать источник цены и тесты, затем менять production cost logic.

### Three.js Architecture Refactor + Deep Visual Scene Rework

Причина: визуальные изменения могут маскировать архитектурные ошибки.

Правило: сначала стабильность сцены, затем визуальное качество.

### Checkout Refactor + State Model Refactor

Причина: checkout зависит от валидного state и pricing.

Правило: сначала state, затем checkout.

### Production Model Refactor + Basis Export Implementation

Причина: export зависит от стабильной production model.

Правило: сначала model, потом export.

### Legacy Constructor Removal + Test Migration

Причина: удаление старого кода без переноса тестов может скрыть регрессии.

Правило: сначала тесты и quarantine, потом удаление.

### Global CSS Cleanup + Active Constructor UI Refactor

Причина: можно случайно сломать визуал и потерять контроль над изменениями.

Правило: CSS cleanup делать блоками, после утверждения конкретного UI-scope.

---

## 3. Очерёдность безопасной работы

1. Documentation Sync.
2. Architecture Boundaries.
3. State Model.
4. Pricing Validation.
5. Three.js Stability.
6. Constructor3D Interactions.
7. Materials.
8. Checkout.
9. Testing / CI.
10. Production Layer.
11. Admin.
12. Release Candidate.

---

## 4. Правило остановки

Если агент обнаружил, что задача требует изменения pricing, checkout, API, Supabase, production model или legacy removal вне заявленного scope, он обязан остановиться и зафиксировать риск в отчёте.
