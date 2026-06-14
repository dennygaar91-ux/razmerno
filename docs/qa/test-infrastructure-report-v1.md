# Test Infrastructure Report v1 — Размерно

Статус: COMPLETED / infrastructure-only.
Дата: 2026-06-14.
Роль: Test Infrastructure Agent.

## 1. Executive Summary

Цель этапа — построить минимальный защитный слой качества перед дальнейшей разработкой без изменения product runtime code, UI, Constructor3D, pricing, checkout, production, admin или Supabase business logic.

Выполнено:

- проведён CI/CD audit validation по текущему repository state;
- усилен существующий GitHub Actions workflow `.github/workflows/qa.yml`;
- добавлен blocking fast CI gate для PR/push в `main`;
- добавлен dependency-free coverage snapshot на базе встроенного V8 coverage;
- добавлена публикация coverage artifact в GitHub Actions;
- подготовлена стратегия Fast / Medium / Heavy tests;
- зафиксирован root cause analysis по Vercel failure investigation;
- обновлён backlog по P0-09, P0-10, P0-15.

Итог:

- P0-09 QA Fast CI Gate — закрыта инфраструктурно.
- P0-10 Coverage & Thresholds — закрыта как baseline coverage system, но требует будущего повышения качества метрики до Istanbul/LCOV.
- P0-15 CI/CD & Vercel Failure Investigation — закрыта как investigation + preventive CI controls; фактические Vercel deployment logs недоступны из текущего интерфейса, поэтому production root cause остаётся ограниченным repository/status evidence.

## 2. CI/CD Audit

### 2.1 What exists

Найден существующий workflow:

- `.github/workflows/qa.yml`

До изменений workflow выполнял:

- checkout;
- Node.js setup;
- `npm ci`;
- `node scripts/infrastructure-audit-report.mjs --check`;
- `node scripts/infrastructure-audit-report.mjs`;
- upload infrastructure inventory artifact;
- `npm run typecheck`;
- `npm run typecheck:api`;
- `npm run build`;
- `npm run check:css-architecture`;
- `npm run check:production-geometry-architecture`.

В `package.json` уже существует большое количество QA/test scripts, включая active Constructor3D, pricing, production, browser smoke, architecture guards и historical stage checks.

### 2.2 What was missing

Критические gaps до изменений:

1. Workflow не запускал mandatory active test set.
2. PR мог пройти typecheck/build без проверки active constructor/pricing/production smoke tests.
3. Coverage tool/report/threshold отсутствовали.
4. Coverage artifact не публиковался.
5. Vercel failure мог проявляться отдельно от GitHub QA, потому что GitHub gate не воспроизводил достаточно проверок до деплоя.
6. Не было явного деления checks на blocking и optional.

### 2.3 What duplicates or overlaps

В `package.json` много исторических `qa:stage*`, `check:stage*`, legacy configurator tests и active constructor tests. Это не удалялось, потому что:

- legacy tests пока являются quarantine safety net;
- stage checks могут использоваться как historical guards;
- текущая задача не включает cleanup/refactor package scripts.

Риск: без отдельной стратегии scripts быстро становятся неуправляемыми. Это вынесено в follow-up.

## 3. Fast CI Gate

### 3.1 Blocking checks

В `.github/workflows/qa.yml` теперь blocking для `push`/`pull_request` в `main`:

1. `npm ci`
2. `node scripts/infrastructure-audit-report.mjs --check`
3. `npm run typecheck`
4. `npm run typecheck:api`
5. `npm run build`
6. Fast active tests:
   - `npm run test:constructor-store`
   - `npm run test:constructor-payload`
   - `npm run test:production-preview`
   - `npm run test:constructor-flow`
   - `npm run test:constructor-pii-order`
   - `npm run test:constructor-three`
   - `npm run test:constructor-three-safety`
   - `npm run test:pricing-catalog`
   - `npm run test:pricing-engine`
   - `npm run test:delivery`
   - `npm run test:pricing-final`
   - `npm run test:geometry`
   - `npm run test:production-export`
7. `node scripts/coverage-report.mjs`
8. `npm run check:css-architecture`
9. `npm run check:production-geometry-architecture`

### 3.2 Optional checks

Optional / not included in fast PR gate yet:

- full `qa:all`;
- full historical `qa:stage*` matrix;
- Playwright desktop/mobile/e2e;
- browser smoke with system browser;
- full production/manufacturing/BASIS/email attachment matrix;
- Vercel post-deploy smoke;
- Supabase migration/policy checks requiring env/secrets;
- visual regression;
- bundle-size reporting.

Причина: эти checks могут быть heavy, flaky, environment-dependent или слишком дорогими для каждого PR.

## 4. Coverage Strategy

### 4.1 Current baseline

Добавлен файл:

- `scripts/coverage-report.mjs`

Он:

- запускает выбранный fast active test set;
- включает `NODE_V8_COVERAGE`;
- собирает raw V8 coverage в `coverage/v8-raw/`;
- генерирует `coverage/coverage-summary.json`;
- генерирует `coverage/coverage-summary.md`;
- проверяет минимальный threshold через `COVERAGE_MIN_BYTES`;
- по умолчанию использует threshold `15%` byte coverage;
- не требует новых npm dependencies.

### 4.2 Why V8 baseline was chosen

Для минимального защитного слоя выбран dependency-free подход, чтобы не менять lockfile и не добавлять новые инструменты без локальной проверки. Это снижает риск сломать install/build pipeline.

Ограничение: V8 byte coverage — это baseline signal, не полноценная line/branch coverage. Его нельзя считать финальной production-grade coverage метрикой.

### 4.3 Publication

GitHub Actions теперь загружает artifact:

- `coverage-summary`
- path: `coverage/`
- retention: 14 days

### 4.4 Recommended thresholds

Текущий baseline:

- byte coverage threshold: `15%`

Рекомендации:

- Stage 1: 15% byte coverage, blocking, чтобы проверить стабильность системы.
- Stage 2: 25–30% byte coverage после 5–10 успешных CI runs.
- Stage 3: перейти на Istanbul/LCOV coverage и ввести thresholds:
  - statements: 35–45%;
  - branches: 25–35%;
  - functions: 35–45%;
  - lines: 35–45%.
- Stage 4: отдельные thresholds для critical modules:
  - constructor state/adapters: 60%+;
  - pricing: 80%+;
  - checkout/order payload: 70%+;
  - production export: 60%+.

## 5. Vercel Failure Analysis

### 5.1 Observed evidence

Repository evidence:

- GitHub combined status for checked commit had `Vercel: failure`.
- GitHub workflow runs for the checked commit were empty.
- Existing QA workflow did not run active test set before Vercel deployment.

### 5.2 Likely root causes

На уровне repository/CI evidence наиболее вероятные причины:

1. Vercel выполнял deployment independently from GitHub QA workflow.
2. GitHub QA gate не был достаточно строгим: typecheck/build есть, active tests отсутствовали.
3. Vercel failure мог быть вызван install/build/runtime env issue, но без Vercel logs подтвердить конкретную ошибку нельзя.
4. Возможен mismatch между тем, что проверяется локально/в GitHub, и тем, что реально запускает Vercel.
5. Если GitHub workflow не запускается для commit, то статус Vercel становится единственным сигналом качества — это небезопасно.

### 5.3 Preventive controls added

Добавлены проверки до деплоя:

- active constructor state/adapters tests;
- active Three adapter/safety tests;
- pricing tests;
- delivery/final pricing smoke;
- geometry and production export smoke;
- baseline coverage threshold;
- existing architecture checks retained.

### 5.4 What still cannot be confirmed

Не подтверждено из-за отсутствия прямого доступа к Vercel logs:

- точная ошибка Vercel build/deploy;
- env mismatch;
- Node/Vite/Vercel adapter mismatch;
- dependency install issue;
- runtime serverless issue.

## 6. Test Execution Strategy

### 6.1 Fast Tests — PR Pipeline

Запускать на каждом PR/push в `main`.

Blocking:

- `npm ci`
- `npm run typecheck`
- `npm run typecheck:api`
- `npm run build`
- active constructor tests;
- active pricing tests;
- key production/geometry smoke tests;
- coverage snapshot threshold;
- CSS/production geometry architecture guards.

Цель: ловить регрессии за короткое время без браузерной и env-heavy матрицы.

### 6.2 Medium Tests — Nightly Pipeline

Рекомендовано добавить отдельный workflow позже:

- `npm run qa:core`
- `npm run qa:production`
- `npm run qa:admin`
- `npm run test:browser-smoke-static`
- `npm run test:constructor3d-e2e`
- `npm run test:desktop-e2e`
- bundle-size report
- coverage with higher reporting detail

Цель: ловить integration/e2e regressions без замедления PR.

### 6.3 Heavy Tests — Release Pipeline

Рекомендовано перед production release:

- full Playwright matrix;
- Vercel preview deployment smoke;
- Supabase migration/policy validation;
- API/order flow integration with mocked external services;
- production export snapshots;
- pricing golden fixtures;
- visual regression;
- bundle/performance budgets.

Цель: release confidence, not daily developer feedback.

## 7. Risks

1. Coverage baseline использует V8 byte coverage, а не Istanbul line/branch coverage.
2. Threshold 15% намеренно низкий, чтобы сначала стабилизировать pipeline.
3. Fast gate может оказаться дольше ожидаемого из-за build + many node tests.
4. Без Vercel logs root cause остаётся вероятностным, а не доказанным до конкретной ошибки.
5. `package.json` содержит много historical scripts; нужен отдельный cleanup/ownership pass.
6. Browser/E2E пока не blocking на PR; UI regressions могут пройти fast gate.
7. Coverage artifacts публикуются, но не комментируются в PR автоматически.
8. Required checks должны быть включены в GitHub branch protection settings вручную.

## 8. Recommended Follow-up Tasks

Для Test Infrastructure / QA:

1. Добавить separate Nightly QA workflow.
2. Добавить Release QA workflow.
3. Перейти с V8 byte coverage baseline на Istanbul/LCOV coverage.
4. Добавить PR coverage summary comment.
5. Добавить Codecov/Coveralls или GitHub Pages artifact publication, если нужен внешний dashboard.
6. Разделить `package.json` scripts на группы: `test:fast`, `test:medium`, `test:heavy`, `qa:release`.
7. Добавить branch protection: required check `QA / Fast CI gate`.
8. Добавить Vercel preview smoke workflow after deployment status.

Для Checkout/API/Pricing agents:

1. P0-11 API Order Flow Tests.
2. P0-12 Checkout Submit Tests.
3. P0-13 Pricing Golden Fixtures & Parity.
4. Direct API handler tests for success/error/idempotency branches.
5. Mocked Resend/Supabase tests.

Для Architecture/Documentation agents:

1. Отдельный package scripts ownership document.
2. Legacy test deprecation plan.
3. Required checks policy document.

## 9. Files changed

Created:

- `scripts/coverage-report.mjs`
- `docs/qa/test-infrastructure-report-v1.md`

Updated:

- `.github/workflows/qa.yml`
- `docs/planning/current-backlog.md`

## 10. Validation performed

Фактически выполнено через GitHub connector:

- найден repository `dennygaar91-ux/razmerno`;
- прочитан `package.json`;
- прочитан `.github/workflows/qa.yml`;
- прочитан `docs/planning/current-backlog.md`;
- прочитан `docs/qa/testing-audit-v1.md`;
- проверен combined status commit: Vercel failure observed;
- проверены workflow runs for checked commit: empty result observed;
- внесены infrastructure-only изменения.

Не запускалось локально из этой среды:

- `npm ci`;
- `npm run typecheck`;
- `npm run build`;
- fast test set;
- `node scripts/coverage-report.mjs`;
- Vercel deployment.

Причина: работа выполнялась через GitHub connector, без локального checkout/runtime и без прямого доступа к Vercel logs.
