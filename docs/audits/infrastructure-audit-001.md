# Infrastructure Audit 001 — «Размерно»

Дата: 2026-06-13
Репозиторий: `dennygaar91-ux/razmerno`
Ветка: `main`
Тип работ: инфраструктурный аудит и документация без изменения runtime-кода.

## 0. Executive summary

Проект уже прошёл несколько инфраструктурных этапов: есть Vite/React/TypeScript-приложение, Vercel API, Supabase/order layer, production/export layer, набор QA-скриптов и частичная декомпозиция конструктора. Главный вывод текущего аудита: дальнейшая многомесячная разработка возможна, но перед новыми UX/3D/feature-этапами нужно формально закрепить карту проекта, ownership зон и правила работы с legacy/new constructor слоями.

В рамках этого этапа код, дизайн, бизнес-логика, pricing engine, order flow, API, backend, Supabase, admin и export logic не изменялись.

## 1. Scope

Проверялись:

- структура репозитория;
- точки входа приложения;
- routing/runtime boundaries;
- Vite/TypeScript/Vercel конфигурация;
- constructor 3D и legacy constructor boundaries;
- Zustand/store/canonical-state слой;
- pricing/order/API/production boundaries только как зоны риска, без изменения;
- CSS/documentation/QA infrastructure;
- существующие docs и backlog.

Не выполнялись:

- редизайн;
- Three.js-разработка;
- UX-перестройка;
- изменение pricing/order/admin/API/backend/Supabase/export logic;
- удаление legacy-кода;
- массовый рефакторинг;
- запуск локальных команд, потому что работа выполнялась через GitHub connector без shell-доступа к рабочей копии.

## 2. Карта проекта

| Зона | Назначение | Текущий статус | Риск |
|---|---|---|---|
| `src/main.tsx` | React entry point, CSS imports, analytics init, ErrorBoundary | Активная точка входа | Низкий |
| `src/App.tsx` | Client routing, lazy pages, constructor/admin route selection | Критический routing layer | Средний |
| `src/static-pages/` | Landing/info pages + constructor page containers | Активная UI-зона | Средний |
| `src/static-pages/home/` | Блоки главной страницы | Хорошо декомпозировано | Низкий |
| `src/static-pages/shared/` | Shared header/footer/static UI | Активный shared UI | Средний |
| `src/static-pages/constructor/` | Основной UI/logic слой конструктора | Ключевая зона продукта | Высокий |
| `src/static-pages/constructor/store/` | Zustand store, slices, selectors, canonical state | Частично декомпозировано | Высокий |
| `src/static-pages/constructor/three/` | 3D viewer, scene adapter, materials, selection layer | Активный 3D-first слой | Высокий |
| `src/configurator/` | Legacy/foundation configurator model/tests | Legacy/quarantine candidate | Высокий |
| `src/pricing/` | Catalog pricing, delivery, assembly, production pricing | Запрещённая зона текущего этапа | Критический |
| `src/shared/` | Shared libs: order, price wrapper, materials, analytics | Сквозные зависимости | Высокий |
| `src/constructor/` | Production geometry/export/manufacturing layer | Запрещённая зона текущего этапа | Критический |
| `src/admin/` | Admin UI/client/production review | Запрещённая зона текущего этапа | Высокий |
| `api/` | Vercel serverless API | Запрещённая зона текущего этапа | Критический |
| `src/styles/` | Constructor CSS, 3D CSS barrel, split modules | Главный CSS-risk area | Высокий |
| `scripts/` | QA/static architecture guards | Сильная сторона проекта | Средний |
| `tests/` | Unit/browser/production checks | Есть покрытие по ключевым зонам | Средний |
| `docs/` | Rules, backlog, CSS docs, history | Нужна архитектурная нормализация | Средний |

## 3. Основные точки входа

### Frontend

- `src/main.tsx` — импортирует базовые CSS-слои, `App`, `ErrorBoundary`, analytics init и монтирует React-приложение.
- `src/App.tsx` — определяет lazy pages и ручной client-side routing.
- `vite.config.ts` — Vite/React/Tailwind config, alias `@`, chunking для `react-vendor`, `three`, `supabase`, `price-catalog`.
- `tsconfig.json` — strict TypeScript, bundler resolution, path alias `@/*`.

### Routing

`src/App.tsx` содержит маршруты для:

- `/` — главная;
- `/measurements`;
- `/materials`;
- `/assembly`;
- `/constructor` / `/configurator` — активный 3D constructor;
- `/constructor-legacy` / `/configurator-legacy` — legacy constructor;
- `/constructor-3d` / `/configurator-3d` — 3D constructor;
- `/admin` и `/admin/orders/:id` — admin route.

`vercel.json` сейчас явно переписывает только `/configurator` и `/configurator/(.*)` на `index.html`. Это не обязательно ошибка, но требует отдельной deployment-routing проверки для остальных client-side routes.

### API

- `api/orders.ts` — основной order endpoint: CORS/origin/rate-limit/honeypot/validation/server-price/Supabase/email/production export.
- `api/admin/orders.ts` — admin orders listing endpoint.
- `api/_shared/*` — server-side shared modules.

## 4. Критически важные файлы

| Файл | Почему критичен | Правило работы |
|---|---|---|
| `api/orders.ts` | Заявка, серверная цена, Supabase, email, production export | Не менять без отдельного задания и тестов |
| `api/_shared/server-price.ts` | Серверная цена и доставка/сборка | Не менять на этом этапе |
| `src/pricing/engine.ts` | Каталожный pricing engine | Не менять на этом этапе |
| `src/pricing/pricingPolicy.ts` | Источник прайса и коэффициент ×1.3 | Проверить актуальность, но не менять без решения |
| `src/shared/lib/order.ts` | Клиентская отправка заявки | Не менять на этом этапе |
| `src/static-pages/constructor/hooks/useConstructorSubmit.ts` | Checkout submit flow | Не менять на этом этапе |
| `src/static-pages/constructor/hooks/useConstructorQuote.ts` | Клиентский quote/pricing preview | Не менять на этом этапе |
| `src/static-pages/constructor/adapters/constructorPayload.ts` | Мост UI state → order payload → layout | Только после contract tests |
| `src/static-pages/constructor/store/*` | Источник состояния конструктора | Менять только малыми шагами |
| `src/static-pages/constructor/three/*` | 3D scene/runtime | Не трогать в infrastructure-only этапе |
| `src/constructor/production/*` | Production/export/manufacturing package | Не менять на этом этапе |
| `src/admin/*` | Admin MVP | Не менять на этом этапе |

## 5. Список крупных файлов и зон

Данные ниже объединяют фактическую проверку через GitHub и существующие проектные docs/inventory.

| Файл | Размер / статус | Комментарий |
|---|---:|---|
| `src/styles/constructor.css` | 10805 строк | Legacy CSS monolith. Главный кандидат на quarantine/split без purge. |
| `src/index.css` | 843 строки | Global/landing/shared styles. Не удалять без отдельного audit. |
| `src/styles/constructor3d.css` | 27 строк barrel | Сейчас импортирует split-модули `src/styles/constructor3d/*`. |
| `src/styles/constructor3d/00-base.css` | 557 строк | Крупный active 3D CSS module. |
| `src/styles/constructor3d/92-ui-role-system.css` | 365 строк | Крупный active 3D CSS module. |
| `src/styles/constructor3d/81-filling-step-polish.css` | 326 строк | Крупный active 3D CSS module. |
| `src/styles/constructor3d/60-checkout.css` | 323 строки | Крупный active 3D CSS module. |
| `src/static-pages/Constructor3DPage.tsx` | около 578 строк по текущему GitHub-read | 3D page orchestrator, prop-heavy. |
| `src/static-pages/constructor/three/threeSceneAdapter.ts` | около 423 строк | 3D model builder; высокий риск визуальных регрессий. |
| `src/admin/AdminOrdersPage.tsx` | около 410 строк | Admin dashboard + login + table + production review. |
| `src/static-pages/constructor/adapters/constructorPayload.ts` | около 374 строк | Critical adapter. |
| `src/configurator/model/compartments.ts` | около 364 строк | Legacy/foundation layout model. |
| `src/static-pages/constructor/hooks/useConstructorPageState.ts` | около 352 строк | Aggregation hook for store read/actions/snapshot. |
| `src/shared/materials/materialCatalog.ts` | около 330 строк | Material catalog + aliases. |
| `package.json` | около 370 строк | Большой список scripts/QA commands. |

Отдельно: существующий `docs/BACKLOG.md` фиксирует более старые или альтернативные оценки для некоторых файлов (`Constructor3DPage.tsx`, `constructorStore.ts`, `projectRules.ts`). Текущий аудит показывает, что часть этих зон уже была декомпозирована: например `constructorStore.ts` сейчас является composition-файлом вокруг slices, а `projectRules.ts` — barrel export. Это нужно актуализировать в backlog отдельным этапом, не сейчас.

## 6. Потенциальные god-components / кандидаты на декомпозицию

### Высокий приоритет, но не в текущем этапе

1. `src/static-pages/Constructor3DPage.tsx`
   - orchestrates WebGL diagnostics, 3D fallback, page state, quote, submit, reset, stagebar, drawer, scene;
   - содержит очень широкий prop-passing в `DrawerContent` и scene layer;
   - безопасная декомпозиция возможна только после baseline checks.

2. `src/static-pages/constructor/hooks/useConstructorPageState.ts`
   - агрегирует десятки selectors/actions и строит snapshot;
   - полезный слой, но слишком широкий;
   - будущая декомпозиция: `useConstructorReadModel`, `useConstructorActions`, `useConstructorSnapshot`.

3. `src/static-pages/constructor/adapters/constructorPayload.ts`
   - критический bridge: UI state → order payload → production layout;
   - сначала нужны contract tests / snapshot tests, затем точечная декомпозиция.

4. `src/static-pages/constructor/three/threeSceneAdapter.ts`
   - строит 3D model panels, shelves, drawers, rods, facades, selection frames, interaction targets;
   - нельзя дробить без visual regression baseline.

5. `src/styles/constructor.css`
   - legacy CSS monolith;
   - нельзя удалять напрямую;
   - нужно перевести в quarantine strategy после проверки active imports.

### Средний приоритет

- `src/admin/AdminOrdersPage.tsx` — разделить login/dashboard/table/production review, но admin запрещён текущими ограничениями.
- `src/shared/materials/materialCatalog.ts` — позже отделить data catalog от helpers/aliases.
- `package.json` — нормализовать QA scripts через script groups или docs index.

## 7. Дублирование и пересечения логики

### 7.1 New constructor vs legacy constructor

Есть две активные страницы конструктора:

- `Constructor3DPage.tsx` — новая 3D-first ветка;
- `ConstructorPage.tsx` — legacy/older constructor.

Обе используют общий `useConstructorPageState`, `useConstructorQuote`, `useConstructorSubmit` и общий store. Это правильная попытка не плодить расчёт/checkout, но риск в том, что изменение ради одной страницы может сломать другую.

Рекомендация: до любых новых этапов зафиксировать ownership:

- active route: `Constructor3DPage.tsx`;
- legacy route: только поддержка/миграция тестов;
- shared state/hooks: protected compatibility layer.

### 7.2 Pricing layers

Цепочка pricing сейчас выглядит так:

- `src/pricing/engine.ts` — catalog price engine;
- `src/shared/lib/price.ts` — wrapper и legacy fallback;
- `src/static-pages/constructor/hooks/useConstructorQuote.ts` — client quote state;
- `api/_shared/server-price.ts` — server recalculation;
- `api/orders.ts` — final submit flow.

Это допустимая layered architecture, но любое изменение здесь должно быть отдельным этапом с regression tests.

### 7.3 Layout / compartment / zone semantics

Есть пересечения:

- `src/configurator/model/compartments.ts` — legacy layout model;
- `src/static-pages/constructor/adapters/constructorPayload.ts` — constructor snapshot → layout;
- `src/static-pages/constructor/store/constructorCanonicalState.ts` — canonical sections/zones state;
- `src/static-pages/constructor/rules/*` — active normalized rules.

Рекомендация: создать `docs/architecture/constructor-state-and-layout.md`, где зафиксировать source of truth для `section`, `zone/compartment`, `fillingLayout`, `facadeLayout`, `zoneFacadeLayout`.

### 7.4 CSS layers

CSS уже частично разбит:

- `src/styles/constructor3d.css` — barrel import;
- `src/styles/constructor3d/*` — feature/stage split modules;
- `src/styles/constructor.css` — legacy monolith;
- `src/index.css` — global/landing/shared.

Существующие `docs/css-architecture-audit.md`, `docs/css-migration-plan.md`, `docs/css-class-inventory.json` уже дают хорошую основу. Следующий шаг — не purge, а ownership map.

## 8. Аудит документации

### Найдено и полезно

- `docs/agent/architect-rules.md` — правила архитектора и запреты по зонам.
- `docs/agent/task-001-architecture-audit.md` — прошлое ТЗ на архитектурный аудит.
- `docs/BACKLOG.md` — backlog, но требует актуализации после новых split-этапов.
- `docs/css-architecture-audit.md` — CSS audit.
- `docs/css-migration-plan.md` — CSS migration plan.
- `docs/css-class-inventory.json` — machine-generated CSS inventory.
- `docs/history/.gitkeep` — папка history существует.

### Проблемы

1. Нет единой карты архитектуры проекта.
2. Нет `docs/architecture/` с ownership boundaries.
3. `docs/agent/task-001-architecture-audit.md` ожидает `architecture-audit-001.md`, а текущая задача требует `infrastructure-audit-001.md`. Нужно развести типы аудитов:
   - architecture audit — архитектура и кодовые связи;
   - infrastructure audit — структура, docs, QA, ownership, technical debt.
4. `docs/BACKLOG.md` частично устарел по размерам некоторых файлов после декомпозиции.
5. Нет `docs/audits/README.md` / audit index.
6. Нет ADR/decision log для ключевых решений.

## 9. Рекомендуемая структура документации

Проектировать, не удалять:

```text
docs/
  architecture/
    README.md
    project-map.md
    runtime-boundaries.md
    constructor-state-and-layout.md
    pricing-and-order-boundaries.md
    css-ownership-map.md
  audits/
    README.md
    infrastructure-audit-001.md
    architecture-audit-001.md
  agent/
    architect-rules.md
    task-001-architecture-audit.md
    task-002-infrastructure-map.md
  history/
    .gitkeep
    YYYY-MM-DD-stage-notes.md
  BACKLOG.md
  css-architecture-audit.md
  css-migration-plan.md
  css-class-inventory.json
```

Важно: на текущем этапе создан только этот файл. Остальные документы — proposal/backlog.

## 10. Технический долг

### High priority

1. Актуализировать pricing source metadata: `src/pricing/pricingPolicy.ts` указывает `validUntil: "2026-04-01"`, что уже в прошлом относительно даты аудита 2026-06-13. Нельзя менять без бизнес-решения, но риск нужно поднять.
2. Зафиксировать active/legacy constructor ownership, чтобы не ломать shared hooks при развитии новой 3D-first ветки.
3. Создать architecture docs для state/layout/order/pricing boundaries.
4. Актуализировать `docs/BACKLOG.md`, потому что часть строк/рисков уже изменилась после декомпозиции.
5. Добавить автоматический line-count report для code/docs, чтобы future audits не зависели от ручного GitHub-read.

### Medium priority

1. Декомпозировать `Constructor3DPage.tsx` после baseline checks.
2. Разделить `useConstructorPageState.ts` на read/actions/snapshot layers.
3. Составить route/rewrite audit для Vercel client-side routes.
4. Разделить admin page, но только когда ограничения по admin будут сняты.
5. Подготовить contract tests вокруг `constructorPayload.ts`.
6. Создать CSS ownership map.

### Low priority

1. Создать audit index в `docs/audits/README.md`.
2. Создать ADR index для продуктовых/технических решений.
3. Нормализовать naming: `compartment` в коде vs `zone` в UI.
4. Улучшить package scripts discoverability через docs.

## 11. Риски

| Риск | Вероятность | Влияние | Комментарий |
|---|---:|---:|---|
| Изменение shared constructor hooks ломает legacy или new flow | Высокая | Высокое | Нужен ownership map и regression tests |
| Pricing source устарел | Средняя | Высокое | Не менять код, но нужна проверка прайса |
| CSS cleanup ломает внешний вид | Высокая | Высокое | Только visual baseline + no-purge split |
| Three.js adapter refactor ломает scene | Средняя | Высокое | Нужны screenshots/e2e/visual QA |
| API/order changes ломают заявки | Средняя | Критическое | Запрещённая зона текущего этапа |
| Docs/backlog устаревают быстрее кода | Высокая | Среднее | Нужен audit index + актуализация backlog |

## 12. Рекомендации по следующим этапам

### Этап 2 — Documentation structure foundation

Создать без изменения кода:

- `docs/architecture/README.md`;
- `docs/architecture/project-map.md`;
- `docs/architecture/runtime-boundaries.md`;
- `docs/audits/README.md`.

### Этап 3 — Ownership boundaries

Создать документы:

- `docs/architecture/constructor-state-and-layout.md`;
- `docs/architecture/pricing-and-order-boundaries.md`;
- `docs/architecture/css-ownership-map.md`.

### Этап 4 — Backlog актуализация

Обновить `docs/BACKLOG.md` с учётом текущего состояния после split/decomposition:

- снять устаревшие размеры, если файл уже декомпозирован;
- оставить реальные активные риски;
- пометить legacy quarantine status.

### Этап 5 — Automated audit scripts

Добавить script/report для:

- line counts;
- largest files;
- docs coverage;
- route map;
- import/dependency map.

Только после согласования, потому что это уже изменение инфраструктурного кода/scripts.

## 13. Checks

Не запускались:

- `npm run typecheck`;
- `npm run build`.

Причина: текущая работа выполнена через GitHub connector, который позволяет читать/создавать/обновлять файлы в репозитории, но не предоставляет shell-доступ к рабочей копии для выполнения npm-команд.

Runtime-код не изменялся, поэтому риск runtime-регрессии от текущего commit минимальный.

## 14. Итог этапа

### Что планировалось

- Изучить структуру репозитория.
- Построить карту проекта.
- Найти крупные файлы и кандидаты на декомпозицию.
- Провести аудит документации.
- Спроектировать структуру будущей документации.
- Сформировать технический долг.
- Создать `docs/audits/infrastructure-audit-001.md`.

### Что сделано

- Изучены ключевые entry points, routing, Vite/TS/Vercel config.
- Изучены constructor 3D, legacy constructor, Zustand/store/canonical-state, quote/submit, payload adapter.
- Изучены protected zones: pricing/order/API/admin/production export без изменения.
- Изучены docs/agent, CSS docs, backlog, CSS inventory.
- Составлена карта проекта.
- Выделены крупные файлы и зоны риска.
- Сформирован technical debt по приоритетам.
- Создан этот отчёт: `docs/audits/infrastructure-audit-001.md`.

### Что не сделано

- Не запускались `npm run typecheck` и `npm run build`.
- Не создавались остальные proposed docs.
- Не обновлялся `docs/BACKLOG.md`.
- Не выполнялся full automated line-count/import graph.
- Не менялся код.

### Почему не сделано

- Shell-доступ для npm-команд недоступен через текущий GitHub connector.
- Пользовательский scope текущего этапа разрешал создать только документацию/отчёт.
- Любые изменения кода/scripts/backlog требуют отдельного задания, чтобы не нарушить ограничения.

### Риски

- Ручной audit может быть неполным без automated repository-wide скрипта.
- Backlog уже частично расходится с текущей структурой после декомпозиции.
- Shared constructor state/hooks остаются главной зоной риска для следующих этапов.

### Backlog

1. Создать `docs/architecture/project-map.md`.
2. Создать `docs/architecture/runtime-boundaries.md`.
3. Создать `docs/architecture/constructor-state-and-layout.md`.
4. Создать `docs/architecture/pricing-and-order-boundaries.md`.
5. Создать `docs/architecture/css-ownership-map.md`.
6. Создать `docs/audits/README.md`.
7. Актуализировать `docs/BACKLOG.md`.
8. Добавить automated line-count/import-map audit script после отдельного согласования.
