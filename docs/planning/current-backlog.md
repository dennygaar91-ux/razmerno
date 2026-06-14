# Current Backlog — Размерно

Статус: единый backlog для агентов.

Формат приоритета:

- P0 — блокирует безопасный MVP.
- P1 — требуется для качественного MVP.
- P2 — усиливает production-ready уровень.
- P3 — post-MVP.

---

## P0 — Critical MVP Safety

### P0-01 Unified Constructor Architecture

Зачем: зафиксировать Constructor3D как активную ветку, а legacy Constructor — как quarantine.

Риск невыполнения: агенты будут менять старый код или дублировать логику.

Объём: XL.

Зависимости: architecture audit.

Независимо: нет.

### P0-02 Constructor State Model Stabilization

Зачем: единая модель данных для размеров, секций, зон, наполнения, фасадов, материалов, checkout и validation.

Риск: ломается связь UI, 3D, fallback, pricing и checkout.

Объём: L.

Зависимости: P0-01.

Независимо: нет.

### P0-03 Pricing Engine Validation

Зачем: цена должна быть точной.

Риск: расхождение цены ломает доверие и заявку.

Объём: M.

Зависимости: price sources, delivery, assembly.

Независимо: частично.

### P0-04 Checkout Reliability

Зачем: заявка должна стабильно отправляться с корректными данными.

Риск: потеря конверсии и заявок.

Объём: M.

Зависимости: pricing, validation, order API.

Независимо: частично.

### P0-05 Three.js Stability

Зачем: 3D является основным интерфейсом.

Риск: пользователь видит сломанный продукт.

Объём: XL.

Зависимости: scene adapter, state model.

Независимо: нет.

### P0-06 WebGL / 2D Fallback

Зачем: пользователь должен продолжить настройку, если WebGL недоступен.

Риск: часть пользователей не сможет отправить заявку.

Объём: M.

Зависимости: P0-05.

Независимо: нет.

### P0-07 Documentation Sync

Зачем: единый источник истины для агентов.

Риск: агенты читают устаревшие документы.

Объём: M.

Зависимости: audits, backlog.

Независимо: да.

### P0-08 Testing Foundation

Зачем: минимальная защита от регрессий.

Риск: крупная декомпозиция станет небезопасной.

Объём: L.

Зависимости: стабильные границы модулей.

Независимо: частично.

### P0-09 QA Fast CI Gate

Статус: закрыто инфраструктурно — `.github/workflows/qa.yml` теперь содержит blocking fast CI gate для PR/push в `main`.

Зачем: сделать тесты обязательной частью CI.

Риск: регрессии проходят в main несмотря на существующие тесты.

Объём: M.

Итог: blocking gate включает `npm ci`, `npm run typecheck`, `npm run typecheck:api`, `npm run build`, active constructor/pricing/production fast tests, coverage snapshot и architecture guards.

Документ: `docs/qa/test-infrastructure-report-v1.md`.

### P0-10 Coverage & Thresholds

Статус: закрыто как baseline — добавлен dependency-free V8 coverage snapshot с минимальным threshold; требуется будущий переход на Istanbul/LCOV для production-grade line/branch coverage.

Зачем: измеряемое качество тестов.

Риск: невозможно понимать реальное покрытие.

Объём: M.

Итог: добавлен `scripts/coverage-report.mjs`, GitHub Actions публикует artifact `coverage-summary`, baseline threshold `COVERAGE_MIN_BYTES=15`.

Документ: `docs/qa/test-infrastructure-report-v1.md`.

### P0-11 API Order Flow Tests

Зачем: защитить критический сценарий создания заявки.

Риск: поломка заказов в production.

Объём: L.

### P0-12 Checkout Submit Tests

Зачем: проверить success/error/cooldown сценарии.

Риск: потеря заявок и конверсии.

Объём: M.

### P0-13 Pricing Golden Fixtures & Parity

Зачем: гарантировать точную цену на клиенте и сервере.

Риск: расхождение стоимости.

Объём: L.

### P0-14 Supabase Contract Tests

Зачем: защитить схему БД, миграции и политики.

Риск: скрытые ошибки данных и безопасности.

Объём: M.

### P0-15 CI/CD & Vercel Failure Investigation

Статус: закрыто как investigation + preventive CI controls; точная Vercel build error не подтверждена, потому что Vercel logs недоступны из текущего GitHub-only интерфейса.

Зачем: устранить текущие сбои пайплайна.

Риск: невозможность доверять релизам.

Объём: M.

Итог: зафиксировано, что у проверенного commit был `Vercel: failure`, при этом GitHub workflow runs для commit отсутствовали; усилен GitHub QA gate, чтобы больше ошибок ловилось до деплоя.

Документ: `docs/qa/test-infrastructure-report-v1.md`.

---

## P1 — MVP Quality

### P1-01 Constructor3D UX Completion

Задачи: выбор зон, локальное меню, наполнение, фасады, random preset.

Объём: XL.

Зависимости: P0-02, P0-05.

### P1-02 Material System

Задачи: реальные текстуры, категории, swatches, zoom-preview.

Объём: L.

Зависимости: Three.js material pipeline.

### P1-03 3D Furniture Details

Задачи: петли, направляющие, ручки, штанги, базовая фурнитура.

Объём: XL.

Зависимости: hardware model, scene architecture.

### P1-04 Warning / Error System

Задачи: warning, blocking warning, error, auto-fix для простых случаев.

Объём: M.

Зависимости: validation model.

### P1-05 Checkout UX Completion

Задачи: итоговая смета, доставка, сборка, контакты, согласие, success state.

Объём: M.

Зависимости: pricing, order flow.

### P1-06 Legacy Constructor Cleanup Plan

Задачи: миграция тестов, quarantine, безопасное удаление после подтверждения.

Объём: L.

Зависимости: tests.

### P1-07 CI/CD Quality Gates

Задачи: typecheck, build, tests as required checks.

Объём: M.

Зависимости: package scripts.

### P1-08 Design System Stabilization

Задачи: tokens, buttons, forms, cards, focus states, spacing.

Объём: L.

Зависимости: актуальный UI scope.

### P1-09 Constructor3D Submit E2E

Задачи: полноценные Playwright сценарии оформления заявки.

### P1-10 WebGL Fallback E2E

Задачи: принудительная проверка fallback при отказе WebGL.

### P1-11 Production Golden Snapshots

Задачи: детерминированные снапшоты production model/export.

### P1-12 Admin API & Integration Tests

Задачи: прямое тестирование admin API и статусов.

### P1-13 Material / Texture Parity Tests

Задачи: соответствие материалов UI, pricing и 3D.

### P1-14 Nightly QA Workflow

Задачи: отдельный nightly pipeline для medium tests, Playwright smoke, bundle report и расширенной coverage публикации.

Источник: `docs/qa/test-infrastructure-report-v1.md`.

### P1-15 Release QA Workflow

Задачи: отдельный release pipeline для full Playwright matrix, Vercel preview smoke, Supabase validation, production snapshots и release readiness checks.

Источник: `docs/qa/test-infrastructure-report-v1.md`.

### P1-16 Package Scripts Ownership

Задачи: разделить scripts на `test:fast`, `test:medium`, `test:heavy`, `qa:release`; зафиксировать ownership и legacy deprecation plan.

Источник: `docs/qa/test-infrastructure-report-v1.md`.

### P1-17 Istanbul / LCOV Coverage Upgrade

Задачи: заменить baseline V8 byte coverage на production-grade Istanbul/LCOV line/branch/function coverage и PR summary comment.

Источник: `docs/qa/test-infrastructure-report-v1.md`.

---

## P2 — Production-Ready Depth

1. Production Model Decomposition.
2. Manufacturing Rules Engine.
3. Basis Export JSON.
4. Admin Orders.
5. Admin Production Panel.
6. Production Revisions.
7. Operation editor for hinges/guides/drilling.
8. Detailed production warnings.
9. Visual regression testing.
10. Cross-browser testing matrix.
11. Property-based state testing.
12. Vercel preview deployment smoke after deployment status.

---

## P3 — Post-MVP

1. AI Assembly System.
2. B2B Mode.
3. Kitchens.
4. Automatic `.b3d` generation.
5. Cinematic assembly animation.
6. Deep Three.js optimization.
7. CRM/logistics integration.
8. Full PDF binary generation.
9. Real email attachments.
10. Full mobile E2E matrix.
11. Automated performance budgets.
