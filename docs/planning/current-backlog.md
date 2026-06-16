# Current Backlog — Размерно

Статус: единый operational backlog для агентов.

Этот документ является **единственным источником истины по активным backlog-задачам**. Временные backlog-followup документы после переноса задач должны архивироваться или удаляться из active planning layer.

Последняя сверка: `docs/planning/project-reconciliation-report-v1.md`.

Формат приоритета:

- P0 — блокирует безопасный MVP.
- P1 — требуется для качественного MVP.
- P2 — усиливает production-ready уровень.
- P3 — post-MVP.

Формат статуса:

- `open` — актуально, не закрыто.
- `in progress` — частично сделано, но closure conditions не выполнены.
- `closed` — закрыто и подтверждено документальным evidence.
- `obsolete` — потеряло актуальность.
- `duplicate` — перекрыто другой задачей и не должно запускаться отдельно.

---

## P0 — Critical MVP Safety

### P0-01 Unified Constructor Architecture

Статус: open.

Зачем: зафиксировать Constructor3D как активную ветку, а legacy Constructor — как quarantine.

Риск: агенты будут менять старый код или дублировать логику.

Объём: XL. Зависимости: architecture audit. Независимо: нет.

### P0-02 Constructor State Model Stabilization

Статус: open.

Зачем: единая модель данных для размеров, секций, зон, наполнения, фасадов, материалов, checkout и validation.

Риск: ломается связь UI, 3D, fallback, pricing и checkout.

Объём: L. Зависимости: P0-01. Независимо: нет.

### P0-03 Pricing Engine Validation

Статус: open.

Зачем: цена должна быть точной.

Риск: расхождение цены ломает доверие и заявку.

Reconciliation note: остаётся открытой, потому что pricing audit фиксирует риск расхождения client/server pricing, а API completion report прямо указывает, что P0-13 остаётся открытой отдельной задачей.

Объём: M. Зависимости: price sources, delivery, assembly, P0-13. Независимо: частично.

### P0-04 Checkout Reliability

Статус: duplicate / partially covered by P0-11 and P0-12.

Зачем: заявка должна стабильно отправляться с корректными данными.

Риск: потеря конверсии и заявок.

Reconciliation note: contract-scope закрыт через P0-11/P0-12. Остаточный browser-level checkout UX/E2E scope остаётся в P1-05 и P1-09.

### P0-05 Three.js Stability

Статус: open.

Зачем: 3D является основным интерфейсом.

Риск: пользователь видит сломанный продукт.

Объём: XL. Зависимости: scene adapter, state model. Независимо: нет.

### P0-06 WebGL / 2D Fallback

Статус: open.

Зачем: пользователь должен продолжить настройку, если WebGL недоступен.

Риск: часть пользователей не сможет отправить заявку.

Объём: M. Зависимости: P0-05. Независимо: нет.

### P0-07 Documentation Sync

Статус: in progress.

Зачем: единый источник истины для агентов.

Риск: агенты читают устаревшие документы.

Reconciliation note: backlog обновлён, reconciliation report создан. Master plan и roadmap всё ещё требуют отдельной аккуратной актуализации после подтверждения новой priority matrix.

Объём: M. Зависимости: audits, backlog. Независимо: да.

### P0-08 Testing Foundation

Статус: duplicate / partially covered by P0-09, P0-10, P0-11, P0-12, P0-14, P0-19.

Зачем: минимальная защита от регрессий.

Риск: крупная декомпозиция станет небезопасной.

Reconciliation note: базовая QA/CI/testing foundation закрыта инфраструктурно и contract-layer задачами. Остаточная работа по Fast/Medium/Heavy, nightly/release workflows и quarantine остаётся в P1-14—P1-19.

### P0-09 QA Fast CI Gate

Статус: closed.

Итог: GitHub QA gate включает install, typecheck, build, active constructor/pricing/production fast tests, coverage snapshot и architecture guards.

Документ: `docs/qa/test-infrastructure-report-v1.md`.

### P0-10 Coverage & Thresholds

Статус: closed as baseline.

Итог: добавлен dependency-free V8 coverage snapshot; будущий upgrade — Istanbul/LCOV.

Документ: `docs/qa/test-infrastructure-report-v1.md`.

### P0-11 API Order Flow Tests

Статус: closed.

Итог: API order flow покрыт в `tests/checkout-submit-hook.test.ts`: создание заявки, persistence contract, notification branches, validation/error branches и cooldown/rate-limit contract.

Доказательство: GitHub Actions QA run `27574702631` завершился `success`; `Fast active tests` включает `npm run test:checkout-submit-hook`.

Документ: `docs/api/api-contract-completion-report-v1.md`.

### P0-12 Checkout Submit Tests

Статус: closed.

Итог: checkout submit contract покрывает active Constructor3D submit source contract, validation, API success/failure handling, idempotency key, cooldown/no-reset guard, delivery и assembly validation.

Доказательство: GitHub Actions QA run `27574702631` завершился `success`; `Fast active tests` содержит `npm run test:checkout-submit-hook`.

Документ: `docs/api/api-contract-completion-report-v1.md`.

### P0-13 Pricing Golden Fixtures & Parity

Статус: open.

Зачем: гарантировать точную цену на клиенте и сервере.

Риск: расхождение стоимости.

Reconciliation note: не закрывать без отдельного pricing parity completion evidence. В репозитории найден pricing audit, который фиксирует риск расхождения client/server pricing; API completion report также указывает, что P0-13 остаётся открытой отдельной задачей.

Объём: L. Зависимости: P0-03, pricing sources, client/server parity fixtures.

### P0-14 Supabase Contract Tests

Статус: closed.

Итог: Supabase contract coverage включает deterministic env-missing behavior, insert mapping, client IP hashing, schema/RLS/static migration contract, admin order mapping и status event mapping.

Доказательство: GitHub Actions QA run `27574702631` завершился `success`.

Документ: `docs/api/api-contract-completion-report-v1.md`.

### P0-15 CI/CD & Vercel Failure Investigation

Статус: closed as investigation + preventive CI controls.

Ограничение: точная Vercel build error не подтверждена, потому что Vercel logs недоступны из GitHub-only интерфейса.

Документ: `docs/qa/test-infrastructure-report-v1.md`.

### P0-16 Constructor Reset Contract Resolution

Статус: open.

Источник: `docs/constructor/reset-contract-verification-report-v1.md`.

Зачем: определить целевое поведение `reset()` и зафиксировать единый reset contract для constructor state.

Риск: constructor store и smoke tests могут проверять разные ожидания.

Reconciliation note: в репозитории не найден completion/fix report, подтверждающий закрытие P0-16. Последний найденный verification report фиксирует, что P0-16 не закрыта.

Closure condition: закрыть P0-16 можно только после подтверждённого успешного запуска typecheck, build и релевантных constructor tests, а также после документального решения reset contract.

### P0-17 Constructor Smoke Test Stabilization

Статус: open.

Источник: `docs/constructor/reset-contract-verification-report-v1.md`.

Зачем: привести smoke test к выбранному reset contract.

Риск: smoke test будет либо падать без продуктовой причины, либо перестанет защищать critical constructor flow.

Reconciliation note: в репозитории не найден completion/fix report, подтверждающий закрытие P0-17. Последний найденный verification report фиксирует, что P0-17 не закрыта и зависит от P0-16.

Closure condition: закрыть P0-17 можно только после подтверждённого успешного запуска constructor smoke/store tests.

### P0-18 Constructor3D Architecture Guard Implementation

Статус: open.

Источник: `docs/constructor/constructor-core-audit-v1.md` + `docs/planning/constructor3d-guard-spec-v1.md`.

Зачем: enforce active Constructor3D boundary against legacy imports, direct API/Supabase/admin/server imports and forbidden layer crossings.

Риск: агенты могут случайно вернуть legacy/runtime dependencies в активный Constructor3D.

Объём: M. Зависимости: P0-01, P0-02, P0-08. Независимо: частично.

### P0-19 Dependency Layer Recovery Verification

Статус: closed.

---

## P1 — Quality MVP Evidence

### P1-09 Constructor3D Submit E2E

Статус: closed.

Итог: Constructor3D submit flow покрыт отдельным Playwright E2E, guard-script, package scripts и explicit QA workflow steps.

Доказательство: PR #44 merged в `main`; final PR head `089359351acbec1ba3ff2aee3f7b33c332e3fa24`; merge commit `119ea6f1225b68f9ca0d38ff1c3e1bba1660a5fb`; QA run `191` (`27612249134`) завершился `success`; Playwright result: `5 passed`.

Документ: `docs/constructor/constructor-submit-e2e-report-v1.md`.

### P1-10 WebGL Fallback E2E

Статус: closed.

Итог: WebGL fallback для активного `/configurator-3d` покрыт implementation + E2E proof. При simulated WebGL failure пользователь остаётся в Constructor3D, видит fallback preview, проходит основные шаги, доходит до checkout и submit path не блокируется отсутствием WebGL.

Доказательство: PR #45 `P1-10 WebGL Fallback E2E`; PR QA run #194 (`27615964539`) завершился `success`; verified head commit `f61324fb1de80167ee20c3092d8a049dba676bdd`; job `Fast CI gate` id `81651836131`; workflow steps `P1-10 WebGL fallback E2E guard` and `P1-10 WebGL fallback E2E` завершились `success`.

Команды, явно выполненные в CI:

```bash
npm run check:webgl-fallback-e2e
npm run test:webgl-fallback-e2e
```

Реализовано:

- localhost-only simulation hook `?rzm_webgl=off` в `src/static-pages/constructor/three/useWebGLAvailable.ts`;
- fallback marker `data-testid="webgl-fallback-preview"` в `src/static-pages/constructor/components/SceneRuntimePanels.tsx`;
- browser spec `tests/browser/webgl-fallback.spec.ts`;
- guard-script `scripts/check-p1-10-webgl-fallback-e2e.mjs`;
- package scripts `check:webgl-fallback-e2e` и `test:webgl-fallback-e2e`;
- QA workflow steps `P1-10 WebGL fallback E2E guard` и `P1-10 WebGL fallback E2E`;
- report `docs/visualization/webgl-fallback-e2e-report-v1.md`.

Ограничение evidence: отдельный P1-10 artifact не добавлен из-за блокировки write-вызова при расширении workflow; evidence фиксируется в GitHub Actions step logs и job step summary.

Merge/main note: PR merge и main content verification фиксируются в финальном handoff после merge.

### P1-13 Material / Texture Parity

Статус: in progress.

Итог на текущей ветке: частичная реализация продолжена — добавлены/сохранены material markers, 3D preview markers, WebGL fallback/SVG parity markers, отдельный E2E spec, guard-script, package scripts и QA workflow steps.

Команды, которые должны быть подтверждены CI перед закрытием:

```bash
npm run check:material-texture-parity
npm run test:material-texture-parity
```

Документ: `docs/visualization/material-texture-parity-report-v1.md`.

Closure condition: закрыть P1-13 можно только после PR, successful GitHub Actions QA run на финальном head, обновления evidence в этом backlog, merge в `main` и main content verification.

### P1-21 Release / Post-MVP Visual QA Matrix

Статус: open.

Зачем: расширить visual/browser coverage после закрытия критичных Constructor3D и fallback proof задач.

Риск: без дальнейшей visual QA matrix останутся непокрытыми cross-browser/mobile/device-specific визуальные регрессии.

Важно: P1-21 не входит в scope P1-13 и не закрывается этой задачей.
