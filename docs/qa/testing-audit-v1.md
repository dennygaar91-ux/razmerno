# Testing Audit v1 — Размерно

Статус: audit-only.  
Дата: 2026-06-14.  
Роль: QA Lead.  
Scope: аудит качества, тестовой инфраструктуры и CI/CD без изменения runtime-кода.

## 0. Ограничения этапа

На этом этапе не менялись:

- функционал;
- pricing;
- constructor;
- Three.js;
- production layer;
- checkout;
- admin;
- API/Supabase runtime.

Изменение выполнено только в документации: создан этот QA-аудит.

Фактический локальный запуск `npm`/Playwright/Supabase/deploy smoke в этой среде не выполнялся. Аудит основан на чтении репозитория, package scripts, тестов, GitHub Actions workflow, плановых документов и архитектурных аудитов.

## 1. Executive Summary

Проект имеет заметную тестовую базу: unit/smoke tests на Node/tsx, Playwright browser specs, static guard scripts, typecheck/build scripts и production/deploy checks. Однако тестовая инфраструктура сейчас фрагментирована и перегружена историческими stage-командами.

Ключевой вывод: тесты есть, но quality gate пока слабый. GitHub Actions workflow `QA` запускает install, infrastructure inventory, frontend/API typecheck, build, CSS architecture check и production geometry architecture check, но не запускает основной набор unit/integration/e2e/smoke тестов. Это не соответствует целевому Stage 09 Testing & CI/CD, где должны быть typecheck, build, unit tests, smoke tests и CI quality gate.

Главные риски:

1. Нет единого coverage report и coverage thresholds.
2. CI не запускает основной набор тестов.
3. Legacy test ownership не классифицирован.
4. API и Supabase почти не покрыты интеграционными тестами.
5. Pricing нуждается в golden fixtures и server/client parity tests.
6. Checkout не имеет полноценного e2e submit-flow с mocked API branches.
7. Static guard scripts полезны, но хрупки: многие проверки основаны на поиске строк и stage-маркеров.

## 2. Проверенные источники

Перед аудитом изучены:

- `docs/planning/README.md`;
- `docs/planning/master-development-plan-v1.md`;
- `docs/planning/current-backlog.md`;
- `docs/planning/mvp-scope.md`;
- `docs/planning/architecture-decisions.md`;
- `docs/planning/agent-workflow.md`;
- `docs/planning/parallelization-rules.md`;
- `docs/planning/release-roadmap.md`;
- `docs/audit/documentation-audit-v1.md`;
- `docs/audit/architecture-audit-v1.md`;
- `docs/audit/architecture-blockers-v1.md`;
- `package.json`;
- `.github/workflows/qa.yml`;
- `playwright.config.ts`;
- ключевые test/spec файлы;
- ключевые source files для Constructor3D, store, pricing, checkout, production, API и Supabase.

## 3. Состояние тестовой инфраструктуры

### 3.1 Test runner landscape

В проекте одновременно используются:

- custom Node/tsx tests с ручными `assert`/`test` wrappers;
- `node:test` в части Three.js safety/adapter tests;
- Playwright specs в `tests/browser/**`;
- static guard scripts в `scripts/check-*.mjs`;
- deploy smoke script;
- infrastructure inventory scripts.

Проблема: нет единого test runner standard, нет единой команды `test`, нет coverage tool, нет thresholds.

### 3.2 TypeScript checks

Есть два ключевых уровня:

- `npm run typecheck` — frontend/source typecheck;
- `npm run typecheck:api` — отдельная проверка API/serverless и связанных production/pricing/shared модулей.

Риск: основной `tsconfig.json` включает только `src` и `vite.config.ts`, поэтому API обязательно должен проверяться отдельной командой `typecheck:api`. Если CI пропустит `typecheck:api`, API может выпасть из типовой защиты.

### 3.3 Build pipeline

Есть:

- `npm run build` → `vite build`;
- Playwright web server: `npm run build && npm run preview -- --host 127.0.0.1 --port 4173`;
- bundle-related scripts: `report:bundle`, `check:bundle-budget`.

Риск: build проверяет сборку, но не гарантирует корректность pricing/order/API/Supabase branches.

### 3.4 GitHub Actions / CI

Есть workflow `.github/workflows/qa.yml`:

- trigger: push/pull_request на `main`, manual dispatch;
- Node 20;
- `npm ci`;
- infrastructure inventory;
- frontend typecheck;
- API typecheck;
- frontend build;
- CSS architecture check;
- production geometry architecture check.

Пробел: workflow не запускает unit tests, integration tests, Playwright tests, deploy smoke, production tests и normalized QA suite.

### 3.5 Coverage

Coverage-инфраструктура не обнаружена:

- нет отдельного coverage script;
- нет threshold config;
- нет CI upload coverage artifact;
- нет coverage matrix по доменам.

Это главный QA-пробел для долгосрочной агентской разработки.

## 4. Coverage Matrix

| Зона | Риск | Текущее покрытие | Основные пробелы | Рекомендуемые тесты | Priority |
|---|---:|---|---|---|---|
| Test infrastructure | High | Много npm scripts, Node/tsx tests, Playwright, static guards | Нет coverage, нет единого runner, нет test ownership map | Ввести command map, coverage tool, thresholds, разделить fast/slow suites | P0 |
| CI/CD | Critical | GitHub Actions запускает typecheck/build/2 architecture checks | CI не запускает tests/e2e/smoke; нет required quality gate | Добавить jobs: unit, integration, browser-smoke, production-smoke manual/env-gated | P0 |
| TypeScript | Medium | `typecheck` + `typecheck:api` | API зависит от отдельной команды | Оставить оба checks обязательными в CI | P0 |
| Build | Medium | Vite build, Playwright preview build | Build не ловит runtime API/Supabase branches | Build + smoke route checks + browser smoke | P0 |
| Constructor3D | High | Playwright `configurator3d.spec.ts`, static guards, Three runtime guard | Нет real WebGL failure simulation, visual regression, successful submit mock, cross-browser | Browser e2e with mocked API, fallback tests, visual/a11y checks | P0/P1 |
| constructorStore | High | Store unit tests: dimensions, layout, filling, validation, production snapshot, draft/random/autofix | Нет property/invariant/fuzz tests, нет selector ownership map | Invariant matrix: dimensions/sections/zones/filling/facades/checkout/validation | P0 |
| Pricing | Critical | Catalog, engine, delivery, breakdown, runtime catalog, final smoke | Нет golden price fixtures, нет client/server parity, нет full boundary matrix | Golden snapshots по дилерскому прайсу, server/client parity, delivery/assembly matrix | P0 |
| Checkout | Critical | Payload tests, browser required-fields tests, submit hook boundary in legacy, active `useConstructorSubmit` code | Нет mocked submit success/failure e2e, cooldown/idempotency tests, API branch coverage | Mocked API Playwright, hook-level tests, API error branch tests | P0 |
| Production model | High | Geometry, production export, manufacturing rules, BASIS JSON, email attachments, production preview | Матрица изделий/размеров неполная; мало invalid-layout tests | Production golden snapshots, invalid layout rejection, revision/warnings classification tests | P1 |
| API | Critical | `typecheck:api`, static guards, source validation exists | Нет direct handler integration tests с mocked req/res/Supabase/email/rate-limit | Handler tests for orders/health/admin: method/origin/env/rate/validation/db/email branches | P0 |
| Supabase | Critical | SQL/migration/static deploy guards, runtime fallback to seed for price items | Нет local Supabase migration/RLS/schema tests | Migration smoke, RLS/policy tests, schema drift check, seeded integration tests | P0/P1 |
| E2E | High | Playwright desktop/mobile projects, configurator and configurator3d specs | Не подключено к CI; мало API/network assertions | CI browser smoke desktop, nightly mobile/cross-browser, network mocks | P1 |
| Smoke tests | Medium | Static browser smoke, deploy smoke script, UI logic smoke | Deploy smoke не в обязательном CI; static smoke хрупкий | Smoke split: static fast, browser smoke, deploy smoke manual/production | P1 |
| Admin | High | Stage guards and API contract static checks | Нет browser/admin e2e и real mocked API integration | Admin API handler tests + admin page smoke with mocked endpoints | P2 |

## 5. Детальный аудит зон

### 5.1 Constructor3D

Уровень риска: High.

Текущее покрытие:

- browser spec открывает `/configurator-3d`, проверяет shell, stepper, viewport, random preset action;
- browser spec проходит scenario: sizes → filling → materials → checkout validation;
- checkout controls проверяются в browser spec;
- reset dialog и basic WCAG markers проверяются в browser spec;
- static guards проверяют stage markers, наличие reset dialog, primary CTA, WCAG tokens;
- Three runtime stability guard проверяет fallback/error boundary/retry/context loss tokens.

Отсутствующие тесты:

- реальный WebGL context lost test в браузере;
- forced fallback e2e без WebGL;
- successful submit e2e с mocked `/api/orders`;
- error submit branches: 400/429/502/network timeout;
- visual regression для 3D/2D scene states;
- accessibility audit через axe или аналог;
- mobile Constructor3D smoke в CI.

Рекомендуемые тесты:

1. `tests/browser/configurator3d-submit.spec.ts` — mocked API success/error.
2. `tests/browser/configurator3d-fallback.spec.ts` — forced WebGL unavailable/fallback path.
3. `tests/browser/configurator3d-a11y.spec.ts` — keyboard/focus/aria smoke.
4. Visual smoke screenshots для sizes/fill/materials/checkout.

### 5.2 constructorStore

Уровень риска: High.

Текущее покрытие:

- clamp размеров, секций и зон;
- reset behavior;
- derived materials/validation;
- furniture safe defaults;
- manual/equalized section widths;
- manual/equalized zone heights;
- selected compartment filling;
- rods blocked for non-wardrobe;
- validation targets selected compartment;
- facade layout modes;
- scene view/render modes;
- production snapshot lifecycle and PII-free state;
- draft save/load/restore PII-free;
- random preset;
- validation autofix.

Отсутствующие тесты:

- property-based invariants: сумма ширин = total width, сумма высот = total height после любой последовательности actions;
- action sequence tests для конфликтов selection/filling/facade/materials;
- selector ownership tests после будущей декомпозиции slices;
- edge cases для минимальных/максимальных размеров и множественных auto-fix подряд;
- explicit tests на отсутствие PII в любых draft/snapshot/log-like states.

Рекомендуемые тесты:

1. Store invariant matrix.
2. Random action sequence smoke без внешних зависимостей.
3. Selector map tests после декомпозиции.
4. PII regression test across draft/order/production snapshot boundaries.

### 5.3 Pricing

Уровень риска: Critical.

Текущее покрытие:

- catalog seed counts and selected known prices;
- +30% markup check на Kronospan item;
- basic engine tests: non-zero breakdown and drawers increase total;
- delivery tests: no delivery, Moscow/MKAD, outside MKAD 50 ₽/км, address validation;
- final pricing smoke: realistic total bounds;
- breakdown rows positive;
- runtime catalog fallback to seed without Supabase env;
- pricing policy фиксирует `CLIENT_PRICE_MULTIPLIER = 1.3` and exact-price rules.

Отсутствующие тесты:

- golden price fixtures для 5–10 типовых конфигураций;
- client/server parity: quote in Constructor3D vs `calculateServerPrice`;
- delivery + assembly combined total matrix;
- materials matrix by body/facade/back panel;
- edge banding/package exact regression;
- negative tests на недоступные/битые price items;
- tests that prevent accidental return to `isPreliminary: true`.

Рекомендуемые тесты:

1. `pricing-golden.test.ts` — fixed fixtures with exact totals.
2. `pricing-server-client-parity.test.ts` — same payload, same total.
3. `pricing-policy.test.ts` — coefficient, cutting/drilling inclusion, exact price invariant.
4. `pricing-boundaries.test.ts` — min/max dimensions and sections.

### 5.4 Checkout

Уровень риска: Critical.

Текущее покрытие:

- browser specs check required fields and interact with delivery/assembly toggles;
- constructor payload tests check layout/materials/total/delivery/assembly/consent;
- active submit hook validates customer/delivery/consent, blocks submit if quote missing, sends payload through `submitOrder`, has 30s cooldown;
- client submit layer sends POST to `/api/orders` or configured API URL and mock mode avoids localStorage PII.

Отсутствующие тесты:

- active `useConstructorSubmit` hook unit/integration test;
- successful submit with mocked API;
- server validation error branch;
- rate limit branch;
- manager email failure branch;
- customer email failure still success branch;
- cooldown branch after success;
- no-reset-model invariant after successful submit;
- idempotency key assertion.

Рекомендуемые тесты:

1. `constructor-submit-hook.test.ts` for active hook.
2. Playwright route mock for `/api/orders` success/error.
3. API handler integration tests for order branches.
4. No-reset and cooldown regression tests.

### 5.5 Production model

Уровень риска: High.

Текущее покрытие:

- geometry tests cover wardrobe/dresser/nightstand basics, panels, hardware, drilling, totals, Basis plan;
- production export package test checks schema, units, source, panels, edge banding, Basis plan and validation;
- manufacturing rules test checks factory profile, rules schema, auto repairs, validation status, manual review, revisions;
- BASIS JSON/documents test checks JSON, serialized output, production document bundle and email attachments;
- production preview adapter checks PII-free preview, materials/thicknesses, section facade modes, production pricing bundle.

Отсутствующие тесты:

- golden production snapshots by product/size/filling/facade mode;
- invalid layout rejection matrix;
- warnings classification: client-visible vs manager-only;
- revision lifecycle tests;
- production pricing coupling tests with current pricing source of truth;
- detailed hardware/drilling coordinate invariants.

Рекомендуемые тесты:

1. `production-golden-snapshots.test.ts`.
2. `production-invalid-layout.test.ts`.
3. `production-warning-visibility.test.ts`.
4. `production-pricing-boundary.test.ts`.

### 5.6 API

Уровень риска: Critical.

Текущее покрытие:

- API typecheck script exists;
- `api/orders.ts` validates origin, method, env, rate limit, honeypot, payload, server price recalculation, production export, Supabase insert and email branches;
- `api/_shared/order-validation.ts` validates name, RU phone, email, dimensions, layout, delivery, assembly and consent;
- deploy smoke can call `/api/health` and admin orders endpoint;
- admin API contract checks are static token checks.

Отсутствующие тесты:

- direct handler tests for `api/orders.ts`;
- mocked Supabase success/failure;
- mocked email manager/customer success/failure;
- mocked rate limit;
- CORS/origin matrix;
- honeypot branch;
- 405/403/400/429/502/503 status matrix;
- API response schema snapshots.

Рекомендуемые тесты:

1. `api-orders-handler.test.ts` with mocked req/res and dependency seams.
2. `api-health-handler.test.ts`.
3. `api-admin-orders-handler.test.ts`.
4. Contract snapshots for success/error payloads.

### 5.7 Supabase integration

Уровень риска: Critical.

Текущее покрытие:

- Supabase client wrapper exists;
- missing Supabase env returns skipped success for order insert/update helpers;
- stage checks verify presence of deploy SQL and docs;
- predeploy guard checks migrations/docs/env examples;
- runtime catalog test checks price seed fallback when Supabase env is missing.

Отсутствующие тесты:

- local Supabase migration apply test;
- schema drift check against expected `orders`, `order_status_events`, price items tables;
- RLS/policy tests;
- service role vs anonymous access tests;
- insert/update integration tests against local Supabase;
- production env mode check in CI.

Рекомендуемые тесты:

1. `supabase:migration-smoke` in CI/manual job.
2. `supabase-schema-contract.test.ts`.
3. `supabase-orders-integration.test.ts` with local/test DB.
4. RLS and permissions tests.

## 6. Критические пробелы

### P0-01 — CI не запускает тесты

Сейчас GitHub Actions workflow не запускает основной набор unit/integration/e2e tests. Это главный blocker для безопасной работы следующих агентов.

Минимальный следующий шаг:

```bash
npm run typecheck
npm run typecheck:api
npm run build
npm run test:constructor-store
npm run test:constructor-payload
npm run test:production-preview
npm run test:constructor-flow
npm run test:constructor-three
npm run test:pricing-catalog
npm run test:pricing-engine
npm run test:delivery
npm run test:pricing-breakdown
npm run test:pricing-final
npm run test:production-export
npm run test:manufacturing-rules
npm run test:basis-documents
npm run test:email-attachments
```

### P0-02 — Нет coverage thresholds

Без coverage report нельзя объективно понять текущее покрытие. Нужно ввести хотя бы минимальные thresholds по critical modules.

Рекомендуемый минимум:

- pricing: branches/statements >= 80%;
- constructor store/actions: statements >= 75%;
- API shared validation/server-price/order-db: statements >= 75%;
- production model/export: statements >= 70%;
- checkout payload/submit: statements >= 75%.

### P0-03 — Legacy test ownership unknown

В проекте есть legacy `src/configurator/**` tests и active `src/static-pages/constructor/**` tests. До классификации нельзя удалять legacy-тесты или считать покрытие нового Constructor3D достаточным.

Нужно создать test ownership map:

- active Constructor3D coverage;
- legacy coverage still required;
- duplicate tests;
- tests to migrate;
- tests safe to archive later.

### P0-04 — API/Supabase без интеграционных тестов

API содержит критичный order flow, но тесты на реальные handler branches не обнаружены. Supabase покрыт в основном статическими deploy guards, а не интеграционными проверками.

### P0-05 — Pricing без golden source-of-truth matrix

Есть хорошие базовые tests, но нет набора эталонных конфигураций с фиксированной ценой. Для продукта с точной ценой это критично.

## 7. Рекомендуемый CI/CD target

### Fast required checks для Pull Request

```bash
npm ci
npm run typecheck
npm run typecheck:api
npm run build
npm run test:constructor-store
npm run test:constructor-payload
npm run test:production-preview
npm run test:constructor-flow
npm run test:constructor-three
npm run test:pricing-catalog
npm run test:pricing-engine
npm run test:delivery
npm run test:pricing-breakdown
npm run test:pricing-final
npm run test:production-export
npm run test:manufacturing-rules
npm run test:basis-documents
npm run test:email-attachments
```

### Browser smoke job

```bash
npm run test:constructor3d-e2e
npm run test:desktop-e2e
```

Можно сначала сделать non-blocking/manual, затем required после стабилизации Playwright в CI.

### Deploy smoke job

```bash
SMOKE_BASE_URL=https://razmerno.ru npm run smoke:deploy
```

Только manual или post-deploy job, потому что требует live environment.

### Nightly / full QA

`qa:all` сейчас перегружен историческими проверками. Его лучше не делать первым обязательным PR gate. Правильнее создать нормализованный `qa:required`, а `qa:all`/legacy stage checks запускать nightly или вручную до cleanup.

## 8. Приоритеты внедрения тестов

### P0 — немедленно

1. Подключить в GitHub Actions fast unit/integration scripts.
2. Создать QA command map и test ownership map.
3. Добавить API handler tests для `api/orders.ts`.
4. Добавить pricing golden fixtures.
5. Добавить checkout submit mocked success/failure tests.
6. Добавить coverage tool + минимальные thresholds.

### P1 — после P0

1. Подключить Playwright browser smoke к CI.
2. Добавить WebGL fallback browser tests.
3. Добавить Supabase migration/schema smoke.
4. Добавить production golden snapshots.
5. Добавить accessibility smoke для Constructor3D.

### P2 — hardening

1. Visual regression screenshots.
2. Property-based store/layout invariants.
3. Cross-browser matrix.
4. Admin e2e/API integration.
5. Performance budgets for Three.js and bundle.

## 9. Что проверено

Проверено:

- planning/audit документация;
- package scripts;
- GitHub Actions workflow;
- Playwright config;
- browser specs;
- Constructor3D coverage;
- constructorStore tests;
- pricing tests;
- checkout payload/submit boundaries;
- production model/export tests;
- API source and validation layer;
- Supabase helper and deploy guard scripts;
- smoke/deploy scripts.

## 10. Что не проверено

Не проверено фактическим запуском в этой среде:

- `npm ci`;
- `npm run typecheck`;
- `npm run typecheck:api`;
- `npm run build`;
- Playwright browser tests;
- deploy smoke на live URL;
- Supabase migrations against live/local DB;
- Vercel deployment logs.

Причина: текущий этап выполнен как GitHub repository audit без локального runtime execution.

## 11. Финальное QA-заключение

Проект имеет сильную начальную тестовую базу для отдельных доменов, особенно для constructor store, production export, pricing catalog и 3D adapter. Но текущий уровень качества нельзя считать production-ready, потому что тесты не собраны в обязательный CI quality gate, нет coverage thresholds, а самые критичные runtime boundaries — API, Supabase, checkout submit и pricing parity — покрыты недостаточно.

Следующий безопасный шаг: не писать новый функционал, а стабилизировать QA foundation — подключить fast tests в CI, создать test ownership map, добавить API/Supabase/pricing golden/checkout submit tests и только после этого продолжать behavior-changing работы в Constructor3D, pricing, checkout или production.
