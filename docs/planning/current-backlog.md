# Current Backlog — Размерно

Статус: единый operational backlog для агентов.

Этот документ является **единственным источником истины по активным backlog-задачам**. Временные backlog-followup документы после переноса задач должны архивироваться или удаляться из active planning layer.

Формат приоритета:

- P0 — блокирует безопасный MVP.
- P1 — требуется для качественного MVP.
- P2 — усиливает production-ready уровень.
- P3 — post-MVP.

---

## P0 — Critical MVP Safety

### P0-01 Unified Constructor Architecture

Зачем: зафиксировать Constructor3D как активную ветку, а legacy Constructor — как quarantine.

Риск: агенты будут менять старый код или дублировать логику.

Объём: XL. Зависимости: architecture audit. Независимо: нет.

### P0-02 Constructor State Model Stabilization

Зачем: единая модель данных для размеров, секций, зон, наполнения, фасадов, материалов, checkout и validation.

Риск: ломается связь UI, 3D, fallback, pricing и checkout.

Объём: L. Зависимости: P0-01. Независимо: нет.

### P0-03 Pricing Engine Validation

Зачем: цена должна быть точной.

Риск: расхождение цены ломает доверие и заявку.

Объём: M. Зависимости: price sources, delivery, assembly. Независимо: частично.

### P0-04 Checkout Reliability

Зачем: заявка должна стабильно отправляться с корректными данными.

Риск: потеря конверсии и заявок.

Объём: M. Зависимости: pricing, validation, order API. Независимо: частично.

### P0-05 Three.js Stability

Зачем: 3D является основным интерфейсом.

Риск: пользователь видит сломанный продукт.

Объём: XL. Зависимости: scene adapter, state model. Независимо: нет.

### P0-06 WebGL / 2D Fallback

Зачем: пользователь должен продолжить настройку, если WebGL недоступен.

Риск: часть пользователей не сможет отправить заявку.

Объём: M. Зависимости: P0-05. Независимо: нет.

### P0-07 Documentation Sync

Зачем: единый источник истины для агентов.

Риск: агенты читают устаревшие документы.

Объём: M. Зависимости: audits, backlog. Независимо: да.

### P0-08 Testing Foundation

Зачем: минимальная защита от регрессий.

Риск: крупная декомпозиция станет небезопасной.

Объём: L. Зависимости: стабильные границы модулей. Независимо: частично.

### P0-09 QA Fast CI Gate

Статус: закрыто инфраструктурно.

Зачем: сделать тесты обязательной частью CI.

Риск: регрессии проходят в main несмотря на существующие тесты.

Итог: GitHub QA gate включает install, typecheck, build, active constructor/pricing/production fast tests, coverage snapshot и architecture guards.

Документ: `docs/qa/test-infrastructure-report-v1.md`.

### P0-10 Coverage & Thresholds

Статус: закрыто как baseline.

Зачем: измеряемое качество тестов.

Риск: невозможно понимать реальное покрытие.

Итог: добавлен dependency-free V8 coverage snapshot; будущий upgrade — Istanbul/LCOV.

Документ: `docs/qa/test-infrastructure-report-v1.md`.

### P0-11 API Order Flow Tests

Статус: закрыто.

Зачем: защитить критический сценарий создания заявки.

Риск: поломка заказов в production.

Итог: API order flow покрыт в `tests/checkout-submit-hook.test.ts`: создание заявки, persistence contract, manager/customer notification branches, validation/error branches и request cooldown/rate-limit contract.

Доказательство: GitHub Actions QA run `27574702631` завершился `success`; шаги `Install dependencies`, `Typecheck frontend`, `Typecheck API`, `Build frontend` и `Fast active tests` прошли. В `.github/workflows/qa.yml` шаг `Fast active tests` включает `npm run test:checkout-submit-hook`.

Документ: `docs/api/api-contract-completion-report-v1.md`.

### P0-12 Checkout Submit Tests

Статус: закрыто.

Зачем: проверить success/error/cooldown сценарии.

Риск: потеря заявок и конверсии.

Итог: checkout submit contract покрывает active Constructor3D submit source contract, customer validation, API success/failure handling, idempotency key, cooldown/no-reset guard, delivery и assembly validation.

Доказательство: GitHub Actions QA run `27574702631` завершился `success`; `Fast active tests` прошёл и содержит `npm run test:checkout-submit-hook`.

Документ: `docs/api/api-contract-completion-report-v1.md`.

### P0-13 Pricing Golden Fixtures & Parity

Статус: закрыто.

Зачем: гарантировать точную цену на клиенте и сервере.

Риск: расхождение стоимости.

Итог: добавлены реальные pricing golden fixtures и parity guard, который явно проверяет равенство `Frontend Price = Checkout Payload Price = Backend Server Price = Stored Order Price = Golden Fixture Expected Price`. Покрыты сценарии `wardrobe-small`, `wardrobe-medium`, `wardrobe-large`, `wardrobe-with-delivery`, `wardrobe-with-assembly`, `wardrobe-with-delivery-and-assembly`, `warning-unknown-delivery-zone`, `error-outside-mkad-without-distance`.

Доказательство: GitHub Actions QA run `27595433250` / run number `174` завершился `success` на commit `95f6459a3dfe191868e4ca71ef0f4b20642c31f2`; шаги `Install dependencies`, `Typecheck frontend`, `Typecheck API`, `Build frontend` и `Fast active tests` прошли. `Fast active tests` включает `npm run test:pricing-engine`, который запускает pricing engine smoke и `tests/pricing-parity.test.ts`.

Документ: `docs/pricing/pricing-parity-completion-report-v1.md`.

### P0-14 Supabase Contract Tests

Статус: закрыто.

Зачем: защитить схему БД, миграции и политики.

Риск: скрытые ошибки данных и безопасности.

Итог: Supabase contract coverage включает deterministic env-missing repository behavior, insert mapping, client IP hashing, schema/RLS/static migration contract, admin order mapping и status event mapping.

Доказательство: GitHub Actions QA run `27574702631` завершился `success`; `Fast active tests` прошёл и содержит `npm run test:checkout-submit-hook`.

Документ: `docs/api/api-contract-completion-report-v1.md`.

### P0-15 CI/CD & Vercel Failure Investigation

Статус: закрыто как investigation + preventive CI controls; точная Vercel build error не подтверждена, потому что Vercel logs недоступны из текущего GitHub-only интерфейса.

Зачем: устранить текущие сбои пайплайна.

Риск: невозможность доверять релизам.

Документ: `docs/qa/test-infrastructure-report-v1.md`.

### P0-16 Constructor Reset Contract Resolution

Статус: implementation applied; closure pending real `typecheck`, `build` and constructor test evidence.

Источник: перенесено из `docs/planning/backlog-followups-test-infrastructure-v1.md`; уточнено в `docs/constructor/constructor-core-audit-v1.md`; повторно проверено в `docs/constructor/reset-contract-verification-report-v1.md`; исправление описано в `docs/constructor/reset-contract-fix-report-v2.md`.

Ответственный: Constructor Core Agent.

Зачем: определить целевое поведение `reset()` и зафиксировать единый reset contract для constructor state.

Риск: `constructorStore.test.ts` и `constructorFlowSmoke.test.ts` проверяли разные ожидания, что делало smoke-тесты нестабильными.

Implementation finding: `reset()` переведён на full project reset по `constructorInitialState`: сбрасываются размеры, секции, зоны, наполнение, материалы, validation, checkout/contact/service fields, step и store-level transient state.

Closure condition: закрыть P0-16 можно только после подтверждённого успешного запуска `npm run typecheck`, `npm run build` и релевантных constructor tests.

Объём: M. Зависимости: P0-02, P0-08. Независимо: частично.

### P0-17 Constructor Smoke Test Stabilization

Статус: implementation applied; closure pending real `typecheck`, `build` and constructor test evidence.

Источник: перенесено из `docs/planning/backlog-followups-test-infrastructure-v1.md`; уточнено в `docs/constructor/constructor-core-audit-v1.md`; повторно проверено в `docs/constructor/reset-contract-verification-report-v1.md`; исправление описано в `docs/constructor/reset-contract-fix-report-v2.md`.

Ответственный: Constructor Core Agent.

Зачем: привести `constructorFlowSmoke.test.ts` к текущему поведению constructor state/reset contract после решения P0-16.

Риск: smoke test будет либо падать без продуктовой причины, либо перестанет защищать critical constructor flow.

Implementation finding: `constructorFlowSmoke.test.ts` синхронизирован с full project reset и дополнительно проверяет очистку consent, deliveryEnabled и assemblyEnabled.

Closure condition: закрыть P0-17 можно только после подтверждённого успешного запуска constructor smoke/store tests.

Объём: M. Зависимости: P0-16. Независимо: нет.

### P0-18 Constructor3D Architecture Guard Implementation

Источник: `docs/constructor/constructor-core-audit-v1.md` + `docs/planning/constructor3d-guard-spec-v1.md`.

Ответственный: Architecture Guard Agent.

Зачем: enforce active Constructor3D boundary (`src/static-pages/Constructor3DPage.tsx`, `src/static-pages/constructor/**`) against legacy imports, direct API/Supabase/admin/server imports and forbidden layer crossings.

Риск: агенты могут случайно вернуть legacy constructor/runtime dependencies в активный Constructor3D.

Объём: M. Зависимости: P0-01, P0-02, P0-08. Независимо: частично.

### P0-19 Dependency Layer Recovery Verification

Статус: закрыто.

Источник: `docs/qa/fast-active-tests-recovery-report-v1.md`; финальное подтверждение: `docs/api/api-contract-completion-report-v1.md`.

Ответственный: Test Infrastructure / Dependency Recovery Agent.
