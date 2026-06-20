# Current Backlog — Размерно

Статус: единый operational backlog для агентов.

Этот документ является **единственным источником истины по активным backlog-задачам**. Временные backlog-followup документы после переноса задач должны архивироваться или удаляться из active planning layer.

Последняя сверка: `docs/planning/project-reconciliation-report-v1.md`.

Governance note:

- `docs/planning/accepted-backlog-decisions-v1.md` is a mandatory decision layer for interpreting backlog tasks.
- `docs/planning/current-backlog.md` remains the main backlog source of truth.
- If `current-backlog.md` and accepted decisions appear to conflict, stop and request reconciliation.

Формат приоритета:

- P0 — блокирует безопасный MVP.
- P1 — требуется для качественного MVP.
- P2 — усиливает production-ready уровень.
- P3 — post-MVP.

Формат статуса:

- `open` — актуально, не закрыто.
- `in progress` — частично сделано, но closure conditions не выполнены.
- `closed` — закрыто и подтверждено документальным evidence.
- `closed / disputed` — в backlog есть закрытие, но closure evidence требует reconciliation.
- `open / blocked` — актуально, но выполнение зависит от внешнего решения, PR cleanup или evidence.
- `obsolete` — потеряло актуальность.
- `duplicate` — перекрыто другой задачей и не должно запускаться отдельно.

## Evidence / Closure Rules

A task may be marked closed only when closure evidence exists in main:

- merged PR or direct main evidence;
- GitHub QA success for technical tasks;
- main verification;
- backlog updated with evidence.

The following are not closure evidence by themselves:

- open PR;
- draft PR;
- branch-only tests;
- branch-only docs;
- report-only evidence;
- screenshot artifact success without visual review;
- local/manual claim without CI or artifact evidence.

For visual QA:

- screenshot artifact success confirms capture success only;
- visual closure requires fresh screenshots, visual report, and explicit VQA closed status.

For pricing:

- branch parity work does not close pricing parity until merged and verified in main.

For production:

- customer-facing Three.js preview is not production truth;
- Basis manual JSON is not `.b3d` generation;
- factory-ready handoff must not be claimed without factory/SKU/drilling evidence.

## Open PR Triage Required

The following PRs must not be treated as closure evidence until merged and verified:

- PR #41 — dependency recovery: open/draft/not merged; P0-19 remains disputed until closure evidence is reconciled.
- PR #43 — pricing parity: open/draft/not merged; cannot close P0-13.
- PR #51 — production golden snapshots: open/not merged; not closure-ready because package scripts are not committed and snapshots target legacy v2 while active export uses v3.
- PR #52 — API notification failure contracts: open/not merged; useful branch work, but wording must be corrected from idempotent replay to safe 409 conflict unless true idempotency is implemented.

Next action:

Each PR requires one decision:

- continue/rebase/fix;
- close/recreate;
- close obsolete;
- merge only after fresh QA and main verification.

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

Audit follow-up: требуется зафиксировать ownership contract для `sceneRenderMode`, exact/advanced flags, `selectedZoneId` / `selectedCompartmentId` bridge и snapshot/payload boundary. Не закрывать через visual QA или generic Constructor E2E.

Объём: L. Зависимости: P0-01. Независимо: нет.

### P0-03 Pricing Engine Validation

Статус: open.

Зачем: цена должна быть точной.

Риск: расхождение цены ломает доверие и заявку.

Reconciliation note: остаётся открытой, потому что pricing audit фиксирует риск расхождения client/server pricing, а API completion report прямо указывает, что P0-13 остаётся открытой отдельной задачей.

Audit follow-ups:

- pricing source of truth: bundled seed vs Supabase/runtime catalog;
- MVP hardware/fittings pricing scope;
- rounding / VAT / markup / min charge policy;
- exact delivery price trust decision;
- legacy/demo pricing path guard.

These follow-ups must not be mixed with Production or API implementation PRs unless explicitly scoped.

Accepted decisions note: interpret this task together with Q8 in `accepted-backlog-decisions-v1.md`, where `Supabase/runtime catalog` is the primary MVP price source.

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

Статус: closed.

Зачем: единый источник истины для агентов.

Риск: агенты читают устаревшие документы.

Reconciliation note: backlog обновлён, reconciliation report создан. Master plan и roadmap всё ещё требуют отдельной аккуратной актуализации после подтверждения новой priority matrix.

Implementation evidence candidate:

- `docs/planning/master-development-plan-v1.md` was synced with current backlog status for P0-16, P0-17 and P0-18.
- `docs/planning/release-roadmap.md` now records evidence notes for P0-16, P0-17 and P0-18 closure commits.
- PR #72 was merged.
- Main merge commit: `e8d2cfa2` (`docs: sync planning after P0 closures`).
- PR checks succeeded before merge.
- Local main verification after pulling `e8d2cfa2` passed:
  - `git status --short --branch`;
  - `git log --oneline -5`;
  - targeted `rg` verification for P0-07/P0-16/P0-17/P0-18 planning sync.
- Final `git status --short --branch` was clean.
- Documentation sync is limited to planning docs and does not touch runtime, package/workflow, API, pricing, admin, Supabase, or order flow.

Audit follow-up: open PR triage for #41, #43, #51 and #52 must be coordinated here, but domain-specific implementation remains with 05, 03, 07 and 04 respectively.

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

Audit reconciliation: P0-13 remains open. PR #43 is open/draft/not merged and is branch-only evidence. It cannot close pricing parity. Main closure requires merged pricing golden fixtures, material-aware client/server parity, delivery/assembly matrix coverage, quote/order/stored price snapshot parity, GitHub QA success and main verification.

Implementation evidence candidate:

- `tests/checkout-submit-hook.test.ts` adds P0-13 pricing parity fixtures without changing pricing formulas.
- Fixtures cover default baseline, body material divergence, facade material divergence, no-handle multiplier parity and server assembly base behavior.
- Current evidence confirms material-aware client/server parity gaps remain; P0-13 stays open for the next pricing implementation PR.
- Production-panel parity remains untested in this PR because the safe existing pure test path lives outside the allowed files/scope.
- P0-13B evidence candidate: server pricing now reads selected body/facade material tokens for catalog material pricing; body-material and facade-material parity fixtures now assert client/server parity. P0-13 remains open for delivery/assembly matrix, production-panel parity and quote/order/stored snapshot parity.
- P0-13C evidence candidate: delivery/assembly pricing matrix fixtures cover no delivery/no assembly, Moscow delivery, outside-MKAD delivery, assembly-only, delivery+assembly and material-aware delivery+assembly parity. No runtime pricing changes were required. P0-13 remains open for production-panel parity and quote/order/stored snapshot parity.

Required sub-work:

- PR #43 triage: rebase/fix/continue or replace;
- golden pricing fixtures in main;
- material-aware client/server parity;
- production-panel pricing parity;
- quote/order/stored price snapshot parity;
- API server-authoritative price boundary verification.

Do not close until final tests are merged and verified on main.

Accepted decisions note: interpret parity closure together with Q8 and the explicit PR #43 decision in `accepted-backlog-decisions-v1.md`; branch-only pricing evidence still cannot close this task.

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

Статус: closed.

Источник: `docs/constructor/reset-contract-verification-report-v1.md`.

Зачем: определить целевое поведение `reset()` и зафиксировать единый reset contract для constructor state.

Риск: constructor store и smoke tests могут проверять разные ожидания.

Reconciliation note: в репозитории не найден completion/fix report, подтверждающий закрытие P0-16. Последний найденный verification report фиксирует, что P0-16 не закрыта.

Audit reconciliation: P0-16 closed after PR #66 was merged and verified on main commit `cf407241`.

Implementation/reconciliation note: current code and focused tests align on full manual reset to `constructorInitialState`, including checkout/contact/delivery/assembly/consent/transient state reset, while submit success keeps the model/configuration available.

Closure condition:

- reset contract documented;
- manual reset behavior verified;
- submit-success no-reset rule verified;
- relevant reset/store tests pass;
- typecheck/build pass;
- GitHub QA success;
- backlog updated with evidence.

Evidence:

- PR #66 merged: `docs: reconcile P0-16 reset contract`.
- Main commit after merge: `cf407241` — `docs: reconcile P0-16 reset contract`.
- PR checks succeeded before merge.
- Local main verification after pulling `main` at `cf407241` passed:
  - `npm run test:constructor-store`;
  - `npm run test:constructor-flow`;
  - `npm run test:checkout-submit-hook`;
  - `npm run typecheck`;
  - `npm run build`.
- Final `git status --short` was empty.
- Contract confirmed: manual constructor reset is a full reset to `constructorInitialState`.
- Contract confirmed: submit success does not reset the model/configuration, so the model remains available after a successful order request.
- P0-17 was closed separately with its own evidence in PR #69 on main commit `a57e0cab`.

Do not mix with P2 visual QA work.

### P0-17 Constructor Smoke Test Stabilization

Статус: closed.

Источник: `docs/constructor/reset-contract-verification-report-v1.md`.

Зачем: привести smoke test к выбранному reset contract.

Риск: smoke test будет либо падать без продуктовой причины, либо перестанет защищать critical constructor flow.

Reconciliation note: в репозитории не найден completion/fix report, подтверждающий закрытие P0-17. Последний найденный verification report фиксирует, что P0-17 не закрыта и зависит от P0-16.

Audit reconciliation: P0-17 closed after PR #68 was merged and verified on main, then closure evidence was recorded in PR #69 on main commit `a57e0cab`.

Implementation evidence candidate:

- P0-16 is closed and defines the accepted reset contract.
- Local branch `task/p0-17-constructor-smoke-stabilization` confirms current smoke/store/submit tests already match the accepted contract:
  - manual reset is covered as full reset to `constructorInitialState`;
  - submit success is covered as no-reset for model/configuration.
- PR #68 was merged.
- Main merge commit: `334c743e` (`test: stabilize constructor smoke flow`).
- PR checks succeeded before merge.
- Local main verification after pulling `334c743e` passed:
  - `npm run test:constructor-flow`;
  - `npm run test:constructor-store`;
  - `npm run test:checkout-submit-hook`;
  - `npm run typecheck`;
  - `npm run build`.
- Final `git status --short` was empty.
- Smoke/store/submit tests confirm the P0-16 accepted reset contract:
  - manual reset is a full reset to `constructorInitialState`;
  - submit success does not reset the model/configuration.

Closure condition:

- P0-16 reset contract decided;
- constructor smoke/store tests identified;
- tests pass on final main/PR head;
- typecheck/build pass;
- GitHub QA success;
- backlog updated.

Do not close from generic Constructor E2E evidence alone.

### P0-18 Constructor3D Architecture Guard Implementation

Статус: closed.

Источник: `docs/constructor/constructor-core-audit-v1.md` + `docs/planning/constructor3d-guard-spec-v1.md`.

Зачем: enforce active Constructor3D boundary against legacy imports, direct API/Supabase/admin/server imports and forbidden layer crossings.

Риск: агенты могут случайно вернуть legacy/runtime dependencies в активный Constructor3D.

Audit reconciliation: P0-18 closed after PR #64 was merged and verified on main commit `79829cc4`.

Closure condition:

- dedicated guard script exists;
- package script exists;
- GitHub QA workflow step exists;
- guard blocks active Constructor3D imports from legacy paths;
- guard blocks forbidden direct imports from API/Supabase/admin/server-only modules where applicable;
- QA passes;
- PR merged and main verified.

Evidence:

- Implementation PR: #64 — Add Constructor3D architecture guard.
- Main commit after merge: `79829cc4` — Add Constructor3D architecture guard.
- GitHub Actions PR QA: run #283 succeeded for PR #64.
- Local main verification was run after pulling main at `79829cc4`.
- `git status` on main was clean before verification.
- `npm run check:constructor3d-architecture` passed.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm run test:constructor-payload` passed.
- `npm run test:constructor-store` passed.
- `npm run test:constructor-three` passed.
- `npm run test:constructor-three-safety` passed.
- Final `git status --short` was empty.
- Implementation facts: `scripts/check-constructor3d-architecture.mjs` exists; `package.json` has `check:constructor3d-architecture`; `.github/workflows/qa.yml` runs `npm run check:constructor3d-architecture`.
- Active Constructor3D no longer imports `LayoutModel` from `src/configurator/model/compartments`; `src/static-pages/constructor/layoutTypes.ts` provides the local Constructor3D layout type.
- Constructor3D architecture guard passes with warnings only. Size/decomposition findings are intentionally non-blocking warnings in this PR because P0-18 is about import-boundary enforcement, not component decomposition.

Объём: M. Зависимости: P0-01, P0-02, P0-08. Независимо: частично.

### P0-19 Dependency Layer Recovery Verification

Статус: closed / disputed.

Disputed: requires reconciliation before backlog closure.

Audit reconciliation: P0-19 closure evidence is disputed. PR #41 remains open/draft/not merged and cannot be used as closure evidence. Current main QA evidence suggests dependency install currently works operationally, but the backlog must explicitly identify the merged/main evidence that closed P0-19 or reopen the task as disputed.

Next action:

- identify actual main evidence for dependency recovery;
- document current main `npm ci` / install evidence;
- decide PR #41 fate: close obsolete, recreate minimal dependency PR, or rebase/fix;
- update this task with final evidence.

Do not close from PR #41 while it remains open/draft/not merged.

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

Статус: closed.

Итог: Material / Texture Parity закрыта в `main`. Работа доказывает, что UI material selection, constructor state, 3D preview marker, fallback preview marker/state и submit-compatible state сохраняют один и тот же canonical materialId. Pixel-perfect texture comparison намеренно не входит в scope этой MVP parity-задачи.

Доказательство: PR #46 `P1-13 Material / Texture Parity`; final PR head `08a471503ece858fa887cbe8b47c5d3f2ea289b1`; QA run #200 (`27620370555`), job id `81667288718`, завершился `success`; merge commit `7be24a586a3541fab2cdf9e23fa2cc8cedefc2b3`.

Команды, явно выполненные в CI:

```bash
npm run check:material-texture-parity
npm run test:material-texture-parity
```

Также в CI прошли build, typecheck, P1-09 checks, P1-10 checks, P1-13 guard, P1-13 E2E, coverage checks и architecture checks.

Документ: `docs/visualization/material-texture-parity-report-v1.md`.

Closure summary: Material / Texture Parity is closed in main. The work proves that UI material selection, constructor state, 3D preview marker, fallback preview marker/state and submit-compatible state keep the same canonical materialId. Pixel-perfect texture comparison is intentionally out of scope for this MVP parity task.

### P1-21 Release / Post-MVP Visual QA Matrix

Статус: closed.

Итог: создана release/post-MVP visual QA matrix для UX/UI inventory, design system inventory, screen/state/viewport checks, release readiness criteria, visual blockers, risks и post-MVP visual backlog. Задача закрывает создание матрицы и классификацию visual risks; она не является фактическим browser screenshot execution pass.

Документ: `docs/ux/release-visual-qa-matrix-v1.md`.

Closure summary: P1-21 закрыта как docs/planning-only задача. Матрица фиксирует, что подтверждённых P0 visual blockers по source/docs-аудиту не найдено, но перед public release нужен отдельный visual execution pass по desktop/tablet/mobile/cross-browser состояниям.

### P1-22 Vercel Deployment Dashboard Log Verification

Статус: closed.

Источник: `docs/qa/vercel-deployment-error-investigation-v1.md` + `docs/qa/vercel-dashboard-log-verification-v1.md`.

Итог: Vercel raw logs получены через Dashboard. Root cause классифицирован как external Vercel configuration/cache/runtime issue: failed deployment падал на `node_modules/.bin/vite: Permission denied` / exit 126. После dashboard-level фикса и redeploy without cache Preview deployment стал `Ready / Latest`.

Доказательство: PR #49 `P1-22 Vercel Dashboard Log Verification`; initial verified head commit `3bb8907acd5fe62076b09098037daf0bc2763180`; GitHub Actions QA run #213 (`27632361399`) завершился `success`; Vercel deployment `5PWvVXh5i53mYXjv98AsxsFSzh26` завершился `Ready / Latest` для Preview environment; final PR head `47d397656f2f14072c31acf674868a0cb2d7ce1c`; GitHub Actions QA run #239 (`27647250963`) завершился `success`; final PR-head Vercel status = `success`, target deployment `6s1SC84wysEbv6Y8DCEqw3FWzUrV`.

Dashboard fix applied: Framework Preset `Vite`, Root Directory repository root, Install Command `npm ci`, Build Command `npm run build`, Output Directory `dist`, redeploy without cache. Node.js version should remain aligned with GitHub QA Node 22.x where available.

Closure summary: P1-22 закрыта после получения exact Vercel error stack, root cause classification, successful Vercel Preview redeploy и GitHub QA success. Следующий Vercel-based visual QA screenshot pass можно запускать после merge PR #49 и main deployment/content verification.

### API Order Notification Failure Contracts

Статус: open.

Owner: 04 API / Orders Agent + 05 Infrastructure / QA Agent.

Reason: PR #52 is useful but remains open/not merged. It hardens notification failure handling but wording must be reconciled: duplicate order ID behavior is safe 409 conflict unless true idempotent replay is implemented.

Main evidence update: PR #84 `fix: align notification failure policy` merged to `main` at `af9fd2813bfc68014b852a0fdf6af4cfe9760237`. Changed files: `api/orders.ts`, `tests/checkout-submit-hook.test.ts`. Pre-merge QA: `npm.cmd run test:checkout-submit-hook`, `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check`. Outcome on `main`: manager email failure no longer returns customer-facing `502` after saved order; customer email path continues after manager email failure; `manager_notification_failed` is observable through response/persisted email status/error; notification failure logs use generic safe markers instead of raw provider error details. Remaining out of scope here: duplicate submit / payload-match idempotency remains open, manual retry remains open, automatic retry queue remains later, separate `order_status_events` notification event model remains out of scope.

Closure condition:

- PR #52 or replacement merged;
- PR/body/docs wording matches actual duplicate contract;
- customer email failure tested;
- manager email failure policy documented;
- PII-safe logging tests merged;
- GitHub QA success;
- main verification.

Accepted decisions note: interpret this task together with the accepted notification policy: customer email failure keeps order success with logged error; manager email failure keeps customer success but must record `manager_notification_failed`; MVP retry is manual, automatic retry queue is later.

### Duplicate Submit / Payload-match Idempotency

Статус: open.

Owner: 04 API / Orders Agent.

Reason: Safe duplicate 409 conflict exists in branch evidence, but true payload-match idempotent replay is not confirmed.

Closure condition:

- same payload replay vs different payload conflict behavior decided;
- payload hash/idempotency key or equivalent implemented if chosen;
- no duplicate notifications;
- frontend 409 handling verified;
- GitHub QA success.

Accepted decisions note: interpret this task together with accepted idempotency rules: same payload replay returns the same order/result; different payload replay returns `409 conflict`; PR/body wording must not claim stronger replay semantics unless implemented.

### Manager Notification Failure Policy

Статус: open.

Owner: 04 API / Orders Agent + 01 Product / Planning Agent.

Reason: If order persistence succeeds but manager notification fails, the product/API contract must define whether the order is successful, warning, failed, or queued for retry.

Main evidence update: PR #84 `fix: align notification failure policy` merged to `main` at `af9fd2813bfc68014b852a0fdf6af4cfe9760237`. Changed files: `api/orders.ts`, `tests/checkout-submit-hook.test.ts`. Pre-merge QA: `npm.cmd run test:checkout-submit-hook`, `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check`. Outcome on `main`: manager email failure now keeps customer success semantics, customer email path continues, `manager_notification_failed` is observable through response/persisted email status/error, and notification failure logs use generic safe markers instead of raw provider error details. Remaining follow-up stays separate: manual retry is still MVP-open, automatic retry queue is later, and separate `order_status_events` notification event model was not added in this scope.

Closure condition:

- policy chosen;
- API behavior tested;
- customer/admin messaging documented;
- notification retry/failure logging policy documented.

### Production Golden Snapshots

Статус: open / blocked.

Audit reconciliation: Production Golden Snapshots must remain open. PR #51 is branch-only evidence and cannot close this task because it is open/not merged, does not update package.json, does not update current-backlog.md, and protects legacy production model v2 while active API order export uses production model v3.

Required wording: PR #51 is branch-only evidence and cannot close Production Golden Snapshots until merged into main with stable package scripts and GitHub QA success.

Current blockers:

- PR #51 open/not merged;
- package.json patch empty;
- workflow uses temporary `npm pkg set`;
- snapshots target legacy v2;
- active export uses v3.

Accepted decisions note: PR #51 must not be merged as-is; MVP production snapshots must be aligned with the active v3 path described in `accepted-backlog-decisions-v1.md`.

### P1-11A — Resolve Production Golden Snapshot Scope

Статус: open.

Owner: 07 Production / Manufacturing Agent + 05 Infrastructure / QA Agent.

Reason: PR #51 protects legacy production model v2 while active order export uses production model v3.

Closure condition:

- snapshot scope decision recorded: v2, v3, or split;
- PR #51 repaired or replaced;
- package scripts committed;
- GitHub QA success;
- PR merged;
- main verification.

### P1-11B — Production v3 Golden Snapshots

Статус: open.

Owner: 07 Production / Manufacturing Agent.

Reason: Active API order export uses production model v3, so golden snapshots must protect active v3 production-export path.

Closure condition:

- 4+ v3 golden cases;
- snapshots cover panels, edgeBanding, hardware, drilling, warnings, validation, Basis plan and review block;
- volatile fields normalized;
- package scripts and QA workflow run tests;
- PR merged and main verified.

### P1-23 — HDF Thickness Reconciliation

Статус: open.

Owner: 07 Production / Manufacturing Agent.

Reason: HDF thickness conflict exists: production export/input uses 3 мм while factory profile/drawer bottom path indicates 4 мм.

Closure condition:

- single HDF rule selected or back/drawer distinction documented;
- factory profile aligned;
- tests cover back panel and drawer bottom;
- golden snapshots updated.

Accepted decisions note: current accepted MVP decision is `HDF = 3 мм` in all MVP scenarios unless a later reconciliation explicitly replaces it.

### P1-24 — Edge Banding Policy Lock

Статус: open.

Owner: 07 Production / Manufacturing Agent.

Reason: Factory profile says edgeAllSides, while implementation often uses front-only body edge.

Closure condition:

- body/shelf/facade/drawer edge policy documented;
- implementation aligned;
- tests fail if required sides are missing;
- edge length totals verified.

Accepted decisions note: current accepted MVP decision is body/drawers/shelves = `1 мм` edge banding all around, facades = `2 мм` all around unless a later reconciliation explicitly replaces it.

---

## P2 — Production-ready Visual QA / UX Evidence

### P2-20 Visual Regression Screenshot Suite

Статус: open.

Источник: `docs/ux/release-visual-qa-matrix-v1.md`.

Зачем: добавить screenshot coverage для landing, info pages, Constructor3D, WebGL fallback, materials и checkout states.

Риск: visual regressions могут пройти через code/contract CI.

### P2-21 Cross-browser / Device Visual QA Execution

Статус: open.

Источник: `docs/ux/release-visual-qa-matrix-v1.md`.

Зачем: выполнить visual QA matrix в Chromium, Firefox, Safari/WebKit, Android Chrome, iOS Safari и основных viewport.

Риск: mobile/tablet/browser-specific визуальные поломки останутся непокрытыми.

### P2-26 Vercel Visual QA Findings Implementation Follow-ups

Статус: open.

Источник: `docs/ux/vercel-visual-qa-findings-v1.md`.

Latest verification: `docs/ux/vercel-visual-qa-verification-after-pr57-v1.md`.

Evidence:

- Initial visual QA workflow: `Vercel Visual QA Screenshots`;
- initial run id: `27668876861`;
- initial artifact: `vercel-visual-qa-screenshots-27668876861`;
- initial artifact id: `7687188747`;
- initial commit: `1e25c93578fc8953212d6bf44c0986a9a8a6e3d1`;
- fresh verification run id: `27705896411`;
- fresh artifact: `vercel-visual-qa-screenshots-27705896411`;
- fresh artifact id: `7702467233`;
- fresh artifact digest: `sha256:dd525cc7a3dbb61d959d966baca89d6975f3b71c75bcc0c72d07581ac22f2d9d`;
- fresh commit: `75082c9d595438cd0407ecab287f4a887537667d`;
- screenshots reviewed: 37/37;
- routes reviewed: `/`, `/measurements`, `/materials`, `/assembly`, `/configurator`, `/configurator-3d`, WebGL fallback для `/configurator-3d`, `/admin`;
- viewports reviewed: `1440×900`, `1280×800`, `768×1024`, `390×844`, `375×812`.

Статус visual QA:

```text
Visual QA Review — executed with findings.
After PR #57 verification — partially improved, P2-26 remains open.
```

Severity summary after PR #57 verification:

- Blocker: 0 for checked VQA-001—VQA-005 scope;
- High closed: VQA-001, VQA-004;
- High partial: VQA-002, VQA-003;
- High open: VQA-005.

Release follow-ups:

1. `VQA-001 / Blocker` — mobile constructor shell visually collapses: overlap header/title/reset/stepper, scene уходит ниже длинной controls card.
   - Impact: mobile constructor не release-safe.
   - Owner: 02 Constructor Agent + 08 UX/UI / Design System Agent.
   - Priority: P1 / release blocker.
   - Status: closed after PR #57 visual verification.
   - Evidence: `configurator-3d__mobile-390.png`, `configurator-3d__mobile-375.png`, `configurator-3d__tablet-768.png` from artifact `7702467233`.

2. `VQA-002 / High` — scene labels and add markers are oversized and cover the furniture model.
   - Impact: model preview теряет trust; overlay выглядит как debug layer.
   - Owner: 06 Three.js / Visualization Agent + 08 UX/UI / Design System Agent.
   - Priority: P1/P2 visual release risk.
   - Status: partial after PR #57 visual verification.
   - Remaining issue: active `+` marker and inactive zone bubbles still compete with model; mobile scene crop makes overlay feel heavier.
   - Next owner: 06 Three.js / Visualization Agent + 08 UX/UI / Design System Agent.

3. `VQA-003 / High` — constructor stepper overlaps and loses readability.
   - Impact: пользователь теряет progress context.
   - Owner: 08 UX/UI / Design System Agent + 02 Constructor Agent.
   - Priority: P1/P2.
   - Status: partial after PR #57 visual verification.
   - Remaining issue: mobile/tablet are readable, but desktop/laptop labels remain truncated (`Разм`, `Напо`, `Мате`, `Заяв`).
   - Next owner: 08 UX/UI / Design System Agent + 02 Constructor Agent.

4. `VQA-004 / High` — mobile constructor violates 3D-first hierarchy.
   - Impact: mobile flow выглядит как длинная форма, а не визуальный 3D-конструктор.
   - Owner: 02 Constructor Agent + 08 UX/UI / Design System Agent.
   - Priority: P1/P2.
   - Status: closed after PR #57 visual verification.
   - Evidence: `configurator-3d__mobile-390.png`, `configurator-3d__mobile-375.png`, `configurator-3d__tablet-768.png` from artifact `7702467233`.

5. `VQA-005 / High` — WebGL fallback mobile looks crowded/clipped.
   - Impact: fallback может восприниматься как broken state.
   - Owner: 06 Three.js / Visualization Agent + 08 UX/UI / Design System Agent.
   - Priority: P2.
   - Status: open after PR #57 visual verification.
   - Remaining issue: mobile fallback CTA overlays preview, bottom chip overlaps drawing, helper text/preview area feel clipped; desktop fallback remains crowded at bottom overlay.
   - Next owner: 06 Three.js / Visualization Agent + 08 UX/UI / Design System Agent.

6. `VQA-006 / Medium` — desktop fallback usable but crowded.
   - Owner: 06 Three.js / Visualization Agent + 08 UX/UI / Design System Agent.
   - Priority: P2.
   - Status: open / still visible in fresh artifact.

7. `VQA-007 / Medium` — runtime/price status text concatenated.
   - Owner: 08 UX/UI / Design System Agent + 02 Constructor Agent.
   - Priority: P2.
   - Status: closed for checked Constructor3D screenshots after PR #57 verification.

8. `VQA-008 / Medium` — “Выйти на сайт” weak contrast.
   - Owner: 08 UX/UI / Design System Agent.
   - Priority: P2.
   - Status: acceptable in checked desktop/tablet screenshots; keep under general polish unless it regresses.

9. `VQA-009 / Medium` — scene composition unbalanced; model clusters left.
   - Owner: 06 Three.js / Visualization Agent.
   - Priority: P2.
   - Status: open / still visible in desktop/laptop scene framing.

10. `VQA-010 / Medium` — admin protected screen visually raw/outside design system.
    - Owner: 08 UX/UI / Design System Agent.
    - Priority: P2, covered by / related to P2-25.
    - Status: open.

Closure condition:

P2-26 remains open until VQA-002, VQA-003, VQA-005, VQA-006, VQA-009 and VQA-010 are either closed with fresh screenshot evidence or explicitly split into separate backlog tracks.

Close only after:

- scoped UI/constructor/visualization fixes or explicit backlog split;
- fresh screenshot evidence;
- GitHub QA success;
- updated visual report.

Artifact success confirms capture success, not visual closure.

Accepted decisions note: visual closure for this task family still requires fresh screenshots and explicit visual review under `accepted-backlog-decisions-v1.md`.

Next recommended implementation prompt:

`Constructor Overlay, Stepper Label and WebGL Fallback Visual Polish`

Owners:

- 02 Constructor Agent — shell/stepper component behavior;
- 06 Three.js / Visualization Agent — scene overlay/marker placement and fallback preview composition;
- 08 UX/UI / Design System Agent — responsive visual rules, label hierarchy and fallback layout acceptance.

### P2-26A — Scene Overlay Marker Density Pass

Статус: open.

Owner: 06 Three.js / Visualization Agent + 08 UX/UI / Design System Agent + 02 Constructor Agent.

Reason: VQA-002 remains partial; active `+` marker and zone bubbles compete with model.

Closure condition:

- model remains dominant;
- active `+` compact/non-debug-like;
- inactive bubbles secondary;
- fresh artifact reviewed.

Accepted decisions note: visual closure still requires fresh screenshots and explicit visual review.

### P2-26B — WebGL Fallback Visual Layout Pass

Статус: open.

Owner: 06 Three.js / Visualization Agent + 08 UX/UI / Design System Agent.

Reason: VQA-005 open and VQA-006 visible/open; fallback layout crowded/clipped.

Closure condition:

- desktop/mobile fallback screenshots show preview/status/actions separated;
- CTA/chips do not overlay drawing;
- P1-10 functional fallback remains green.

Accepted decisions note: WebGL fallback must remain a полноценный SVG/2D mode, and visual closure still requires fresh screenshots and explicit visual review.

### P2-26C — Scene Framing / Camera Fit Pass

Статус: open.

Owner: 06 Three.js / Visualization Agent.

Reason: VQA-009 remains open; desktop/laptop scene composition unbalanced.

Closure condition:

- balanced model framing across viewports;
- no critical model/dimension clipping;
- camera modes usable;
- fresh artifact confirms.

Accepted decisions note: visual closure still requires fresh screenshots and explicit visual review.

### P2-22 Accessibility / Focus Visual Pass

Статус: open.

Источник: `docs/ux/release-visual-qa-matrix-v1.md`.

Зачем: проверить keyboard flow, visible focus, labels, aria-live и disabled/error/warning semantics на критичных control states.

Риск: critical flow формально работает, но доступность и visual feedback недостаточны.

### TASK 08-UX-01 — Stepper Readability / VQA-003 Closure

Статус: open.

Owner: 08 UX/UI / Design System Agent + 02 Constructor Agent.

Reason: VQA-003 remains partial due desktop/laptop stepper truncation.

Closure condition:

- fresh screenshots show readable/intentionally standardized labels across viewports;
- active/done/error/warning states distinct;
- no collision with scene/status/exact-toggle.

Accepted decisions note: interpret closure together with the global visual decision layer; screenshot capture alone is not enough without fresh visual review.

### P2-23 Checkout Trust-state Visual Hardening

Статус: open.

Источник: `docs/ux/release-visual-qa-matrix-v1.md`.

Зачем: проверить и при необходимости усилить empty, validation, calculating, quote error, submit progress, success, API error и cooldown states.

Риск: checkout выглядит ненадёжно в момент конверсии.

### P2-24 Footer / Legal Trust Hardening

Статус: open.

Источник: `docs/ux/release-visual-qa-matrix-v1.md`.

Зачем: заменить placeholder document/legal links и убрать public-launch copy о недобавленных юридических данных.

Риск: публичный запуск будет выглядеть незавершённым и снизит доверие.

### P2-25 Admin Visual Consistency Pass

Статус: open.

Источник: `docs/ux/release-visual-qa-matrix-v1.md`.

Зачем: если admin входит в MVP operations, привести login/dashboard/detail/API fallback states к единой визуальной системе и явно отделить demo/internal states.

Риск: операционный UI будет выглядеть как demo и снизит доверие команды к данным.

### TASK 08-UX-04 — Admin Visual Consistency / VQA-010

Статус: open.

Owner: 08 UX/UI / Design System Agent / Admin owner.

Reason: Admin protected screen is raw/outside design system.

Closure condition:

- decision recorded: VQA-010 stays in P2-26 or moves to P2-25;
- admin protected/dashboard/detail/error states use consistent internal design system;
- fresh admin screenshots attached.

### TASK 08-UX-05 — Accessibility / Focus Visual Pass

Статус: open.

Owner: 08 UX/UI / Design System Agent.

Reason: UI-level keyboard/focus states are not fully proven.

Closure condition:

- keyboard/focus screenshot pass exists;
- constructor, drawer, fallback, checkout, disabled/error/warning states covered.

### TASK 08-UX-06 — Visual Regression / Cross-browser Device Coverage

Статус: open.

Owner: 08 UX/UI / Design System Agent + 05 Infrastructure / QA Agent.

Reason: Current screenshot evidence is Chromium-heavy; cross-browser/device coverage not confirmed.

Closure condition:

- visual matrix documented;
- public pages, Constructor3D, fallback, admin, checkout forced states captured.

### TASK 08-UX-07 — Design-system Inventory / Token Cleanup

Статус: open.

Owner: 08 UX/UI / Design System Agent.

Reason: Dedicated design-system inventory not confirmed; Constructor3D CSS is layered hardening, not clean DS architecture.

Closure condition:

- token/component inventory exists;
- one-off Constructor3D overrides classified;
- no mass cleanup without visual regression evidence.

---

## P2 — API / Production / QA Readiness

### Live Provider / Supabase Order Flow Verification

Статус: open.

Owner: 04 API / Orders Agent + 05 Infrastructure / QA Agent.

Reason: Mock tests do not confirm live Supabase/RLS/email provider behavior.

Closure condition:

- staging/live verification report;
- no PII in logs;
- Supabase insert/status updates verified;
- email provider verified with safe recipients;
- failure branches documented.

Accepted decisions note: interpret this task together with accepted Supabase/runtime catalog, idempotency, notification failure and PII-handling decisions from `accepted-backlog-decisions-v1.md`.

### P2-07 — Drilling Coordinate Standard

Статус: open.

Owner: 07 Production / Manufacturing Agent.

Reason: Current drilling coordinates are approximate and require technologist check.

Closure condition:

- panel-local coordinate convention documented;
- operation templates defined;
- collision validation added;
- tests cover hinge/shelf/runner/rod/confirmat.

### P2-08 — Supplier Hardware Catalog

Статус: open.

Owner: 07 Production / Manufacturing Agent.

Reason: Hardware/fittings remain generic; real Hettich/Firmax SKUs and drilling templates are not confirmed.

Closure condition:

- actual SKUs documented;
- drilling templates connected to SKUs;
- fallback rules documented;
- BOM output uses concrete articles where required.

### P2-09 — Admin Operation Editor

Статус: open.

Owner: 07 Production / Manufacturing Agent + 04 API / Orders Agent + Admin/UX owner.

Reason: Admin production review is partial: no per-panel, per-hole, hardware/SKU operation editing.

Closure condition:

- operation edit model defined;
- revisions/audit trail preserved;
- API/Admin contract defined;
- tests cover revision creation and operation override.

### Production Export Failure Contract with API

Статус: open.

Owner: 07 Production / Manufacturing Agent + 04 API / Orders Agent.

Reason: API builds production export before persistence. Failure behavior must be explicit.

Closure condition:

- failure policy chosen;
- API response behavior tested;
- DB/order status behavior tested;
- admin/notification implications documented.

### БАЗИС-Мебельщик Boundary Lock

Статус: open.

Owner: 07 Production / Manufacturing Agent.

Reason: Current Basis layer is manual/intermediate JSON only, not `.b3d` generation.

Closure condition:

- docs clearly state current Basis boundary;
- UI/admin copy does not claim automatic `.b3d`;
- future script requirements documented.

### QA Release Maturity Matrix

Статус: closed.

Owner: 05 Infrastructure / QA Agent.

Reason: release readiness needs explicit QA policy for manual visual QA, Chromium-only screenshots, live provider/env verification and coverage upgrades.

Implementation evidence candidate:

- `docs/planning/release-qa-maturity-matrix-v1.md` documents required, manual/release-gate and deferred QA evidence.
- `docs/planning/release-roadmap.md` links the QA maturity policy from Stage R10.
- PR #74 was merged.
- Main merge commit: `e461ff5d` (`docs: add release QA maturity matrix`).
- PR checks succeeded before merge.
- Local main verification after pulling `e461ff5d` passed:
  - `git status --short --branch`;
  - `git log --oneline -5`;
  - targeted `rg` verification for QA matrix, roadmap link and backlog evidence.
- Final `git status --short --branch` was clean.
- Matrix documents required QA, manual/release-gate QA, cross-browser/device policy, live provider/Supabase/Vercel env policy and coverage upgrade path.

Closure condition:

- release QA matrix documented;
- manual-only vs required checks classified;
- cross-browser/device policy;
- live provider/Supabase/Vercel env plan;
- coverage upgrade path.

---

## P3 — Post-MVP Visual Polish

### P3-10 Advanced Design Token Cleanup

Статус: open.

Источник: `docs/ux/release-visual-qa-matrix-v1.md`.

Зачем: аккуратно унифицировать старые и новые visual layers без массового rewrite.

### P3-11 Rich Loading / Skeleton / Motion Layer

Статус: open.

Источник: `docs/ux/release-visual-qa-matrix-v1.md`.

Зачем: усилить perceived performance, loading, scene transition и micro-interactions после MVP.

### P3-12 Landing Conversion Visual Polish

Статус: open.

Источник: `docs/ux/release-visual-qa-matrix-v1.md`.

Зачем: проводить post-MVP polish главной на основе аналитики и реального funnel evidence.

---

## Engineering Maturity Backlog — 8/10, 9/10, 10/10

Цель раздела: зафиксировать компактную карту зрелости проекта, не заменяя существующие P0/P1/P2/P3 задачи и не закрывая их автоматически.

- `8/10 strong MVP-ready` — основной пользовательский сценарий готов к первым реальным заявкам.
- `9/10 production-ready` — проект готов к более серьёзному трафику, мониторингу и операционной поддержке.
- `10/10 high-maturity production-grade` — зрелая система с расширенной безопасностью, наблюдаемостью, производственной глубиной и процессами поддержки.
- Closure evidence остаётся прежним: PR merged to main, GitHub checks success, backlog evidence, main verification, clean local main.
- Если maturity-задача пересекается с существующей задачей, закрывать нужно связанный existing task или его decomposed PR, а не считать этот раздел самостоятельным evidence.

### Maturity Target Map

| Target | Goal | Required focus | Release impact |
|---|---|---|---|
| 8/10 | Strong MVP-ready | pricing parity, constructor stability, order reliability, live-provider checks, visual execution | Должно быть закрыто перед уверенным public MVP. |
| 9/10 | Production-ready | automation, admin operations, retries, observability, security hardening, rollback | Желательно перед серьёзным трафиком и регулярными заказами. |
| 10/10 | High maturity | visual regression, accessibility, SLO, compliance, load testing, manufacturing depth | Не блокирует MVP, но задаёт долгосрочную инженерную планку. |

### Needed for 8/10 strong MVP-ready

Decision-layer note: all `M8-*` tasks must be interpreted through `docs/planning/accepted-backlog-decisions-v1.md`, especially for pricing source of truth, idempotency, notification failure policy, Constructor3D/WebGL fallback boundaries, visual closure and the `8/10 strong MVP-ready` target itself.

#### M8-P0-01 — Pricing parity closure plan
- Status: open
- Area: pricing
- Product-visible: yes
- Related existing task: P0-03, P0-13, PR #43 triage
- Acceptance summary: golden fixtures, material-aware client/server parity, delivery/assembly matrix, quote/order/stored price parity verified on main.
- Suggested agent: 03 Pricing Agent
- Accepted decisions note: use Q8 pricing source-of-truth rules and the PR #43 stale-branch decision.

#### M8-P1-01 — Visual QA execution gate
- Status: open
- Area: UX/UI visual QA
- Product-visible: yes
- Related existing task: P1-21, P2-20, P2-21, P2-26
- Acceptance summary: fresh desktop/tablet/mobile screenshots reviewed for landing, constructor, checkout and WebGL fallback; blockers documented or split.
- Suggested agent: 08 UX/UI / Design System Agent
- Accepted decisions note: screenshot capture does not close visual work without fresh visual review.

#### M8-P0-02 — Constructor state ownership contract
- Status: open
- Area: constructor state
- Product-visible: no
- Related existing task: P0-02, P0-16, P0-17
- Acceptance summary: dimensions, sections, zones, filling, facades, materials, checkout and validation ownership documented and covered by focused state-transition tests.
- Suggested agent: 02 Constructor Agent
- Accepted decisions note: Constructor3D state ownership is expected to remain an explicit separate document boundary.

#### M8-P0-03 — Three.js runtime stability and fallback readiness
- Status: open
- Area: visualization
- Product-visible: yes
- Related existing task: P0-05, P0-06, P1-10, P2-26A, P2-26B, P2-26C
- Acceptance summary: error boundary, loading state, camera reset, reduced-quality path and fallback UX verified without weakening existing WebGL fallback E2E.
- Suggested agent: 06 Three.js / Visualization Agent
- Accepted decisions note: fallback must remain a полноценный SVG/2D mode, not a degraded pseudo-preview.

#### M8-P0-04 — Notification failure policy
- Status: closed with evidence
- Area: API / orders
- Product-visible: yes
- Related existing task: API Order Notification Failure Contracts, Manager Notification Failure Policy, PR #52 triage
- Acceptance summary: manager/customer email failure policy chosen, tested, documented and aligned with order success semantics.
- Suggested agent: 04 API / Orders Agent
- Accepted decisions note: customer email failure keeps order success with logging; manager email failure keeps customer success and records `manager_notification_failed`; MVP retry is manual.
- Main evidence: PR #84 `fix: align notification failure policy` merged to `main`; merge baseline `af9fd2813bfc68014b852a0fdf6af4cfe9760237`.
- Changed files: `api/orders.ts`, `tests/checkout-submit-hook.test.ts`.
- QA before merge: `npm.cmd run test:checkout-submit-hook`, `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check`.
- Outcome: manager email failure no longer returns customer-facing `502` after saved order; customer email path continues after manager email failure; `manager_notification_failed` marker is observable through response/persisted email status/error; notification failure logs use generic safe markers instead of raw provider error details.
- Remaining out of scope: duplicate submit / payload-match idempotency remains open; manual retry remains open; automatic retry queue remains later; separate `order_status_events` notification event model remains out of scope.

#### M8-P0-05 — Duplicate submit and idempotency policy
- Status: open
- Area: API / orders
- Product-visible: no
- Related existing task: Duplicate Submit / Payload-match Idempotency
- Acceptance summary: safe repeated submit behavior defined, duplicate notifications prevented, frontend 409/replay handling verified.
- Suggested agent: 04 API / Orders Agent
- Accepted decisions note: same payload replay returns the same order/result; different payload replay returns `409 conflict`.

#### M8-P1-02 — Live provider and Supabase persistence verification
- Status: open
- Area: Supabase / live providers
- Product-visible: no
- Related existing task: Live Provider / Supabase Order Flow Verification, P0-14
- Acceptance summary: production-like insert/read, RLS assumptions, safe email recipients and no-PII logging verified with evidence.
- Suggested agent: 05 Infrastructure / QA Agent
- Accepted decisions note: evaluate against accepted Supabase/runtime catalog, notification failure and no-PII decision layer.

#### M8-P1-03 — PII and logging audit
- Status: closed with evidence
- Area: security / privacy
- Product-visible: no
- Related existing task: Live Provider / Supabase Order Flow Verification, order security docs
- Acceptance summary: phone/email/address do not leak into logs, localStorage or unsafe errors; `safeErrorMessage` and request-id logging reviewed.
- Suggested agent: 04 API / Orders Agent
- Closure evidence:
  - runtime-risk path is closed on `main`;
  - `api/_shared/logger.ts` contains content-based redaction and `safeErrorMessage()` sanitization;
  - `api/orders.ts` generic catch does not return raw `error.message` to the customer;
  - `src/shared/lib/order.ts` submit-error analytics no longer sends `String(e)`;
  - PR #89 `test: lock pii logging sanitization` was merged into `main`;
  - main includes `40d5dbc9 test: lock pii logging sanitization (#89)`;
  - PR #89 changed only `tests/pii-logging-sanitization.test.ts`;
  - GitHub checks / Vercel success were confirmed before merge;
  - tests now lock logger redaction, API generic error sanitization, and frontend analytics sanitization;
  - PR #89 introduced no runtime, package, or workflow changes.

#### M8-P1-04 — Vercel post-deploy verification
- Status: open
- Area: CI/CD / deploy
- Product-visible: no
- Related existing task: P1-22, QA Release Maturity Matrix
- Acceptance summary: preview/production deploy smoke path documented and executed after main merge; deployment evidence linked without treating dashboard status alone as product QA.
- Suggested agent: 05 Infrastructure / QA Agent

#### M8-P1-05 — MVP release candidate checklist
- Status: open
- Area: release readiness
- Product-visible: yes
- Related existing task: QA Release Maturity Matrix, P1-21, P2-26
- Acceptance summary: one end-to-end release candidate pass covers landing to constructor to order persistence to notifications, with manual and automated evidence.
- Suggested agent: 01 Product / Planning Agent

### Needed for 9/10 production-ready

#### M9-P1-01 — Automated E2E release suite
- Status: open
- Area: QA automation
- Product-visible: no
- Related existing task: P1-09, P1-10, P2-20, P2-21
- Acceptance summary: happy path, failure path, duplicate submit, pricing parity, delivery/assembly and fallback scenarios covered by release-grade E2E.
- Suggested agent: 05 Infrastructure / QA Agent

#### M9-P1-02 — Admin and manager workflow hardening
- Status: open
- Area: admin / operations
- Product-visible: yes
- Related existing task: P2-25, TASK 08-UX-04, P2-09
- Acceptance summary: real order list/detail, status change, manager notes, auth hardening and basic audit trail are usable for MVP operations.
- Suggested agent: 04 API / Orders Agent

#### M9-P1-03 — Email retry and failure queue
- Status: open
- Area: notifications
- Product-visible: yes
- Related existing task: API Order Notification Failure Contracts, Manager Notification Failure Policy
- Acceptance summary: failed notifications are visible, retryable or safely queued; manual resend and status tracking are defined.
- Suggested agent: 04 API / Orders Agent

#### M9-P1-04 — Observability integration
- Status: open
- Area: observability
- Product-visible: no
- Related existing task: QA Release Maturity Matrix
- Acceptance summary: Sentry or equivalent captures critical client/API errors with request/order correlation and safe PII handling.
- Suggested agent: 05 Infrastructure / QA Agent

#### M9-P1-05 — Security hardening pass
- Status: open
- Area: security
- Product-visible: no
- Related existing task: order security docs, Live Provider / Supabase Order Flow Verification
- Acceptance summary: secrets/env, origin/rate-limit, honeypot, address sanitization and admin access reviewed against release risk.
- Suggested agent: 05 Infrastructure / QA Agent

#### M9-P1-06 — Supabase backup, restore and migration runbook
- Status: open
- Area: data / storage
- Product-visible: no
- Related existing task: P0-14, Live Provider / Supabase Order Flow Verification
- Acceptance summary: backup, restore, migration and RLS verification process is documented and tested in a safe environment.
- Suggested agent: 05 Infrastructure / QA Agent

#### M9-P1-07 — Performance baseline
- Status: open
- Area: performance
- Product-visible: yes
- Related existing task: P0-05, P3-11
- Acceptance summary: Lighthouse, bundle size, Three.js runtime and mobile fallback performance baselines recorded with thresholds or action items.
- Suggested agent: 06 Three.js / Visualization Agent

#### M9-P1-08 — Cross-browser and device QA
- Status: open
- Area: visual QA
- Product-visible: yes
- Related existing task: P2-21, TASK 08-UX-06
- Acceptance summary: Chromium, Firefox and available WebKit/Safari-equivalent checks cover public pages, Constructor3D, checkout, fallback and admin states.
- Suggested agent: 08 UX/UI / Design System Agent

#### M9-P1-09 — Production and manufacturing validation
- Status: open
- Area: production / manufacturing
- Product-visible: no
- Related existing task: Production Golden Snapshots, P1-11A, P1-11B, P1-23, P1-24
- Acceptance summary: HDF, edge banding, production export v3 snapshots, factory profile and Basis boundary are reconciled with tests.
- Suggested agent: 07 Production / Manufacturing Agent

#### M9-P1-10 — Release and rollback process
- Status: open
- Area: release management
- Product-visible: no
- Related existing task: QA Release Maturity Matrix, P1-22
- Acceptance summary: release checklist, rollback procedure, post-deploy smoke and incident trigger rules are documented and rehearsed.
- Suggested agent: 05 Infrastructure / QA Agent

### Needed for 10/10 high-maturity production-grade

#### M10-P2-01 — Full visual regression system
- Status: open
- Area: visual QA automation
- Product-visible: no
- Related existing task: P2-20
- Acceptance summary: screenshot baselines, automated diffs and release/PR gating strategy are in place for critical routes and states.
- Suggested agent: 05 Infrastructure / QA Agent

#### M10-P2-02 — Accessibility audit
- Status: open
- Area: accessibility
- Product-visible: yes
- Related existing task: P2-22, TASK 08-UX-05
- Acceptance summary: keyboard navigation, focus states, ARIA, disabled/error/warning semantics and screen-reader smoke are reviewed and fixed.
- Suggested agent: 08 UX/UI / Design System Agent

#### M10-P2-03 — Advanced observability and SLO
- Status: open
- Area: observability / reliability
- Product-visible: no
- Related existing task: M9-P1-04
- Acceptance summary: dashboards, SLOs, error budgets, latency/error-rate tracking and alert escalation are defined.
- Suggested agent: 05 Infrastructure / QA Agent

#### M10-P2-04 — Incident response playbook
- Status: open
- Area: operations
- Product-visible: no
- Related existing task: none found
- Acceptance summary: severity levels, owner escalation, customer communication and recovery checklist are documented and tested.
- Suggested agent: 01 Product / Planning Agent

#### M10-P2-05 — Data lifecycle and compliance
- Status: open
- Area: data / compliance
- Product-visible: no
- Related existing task: M8-P1-03, M9-P1-06
- Acceptance summary: retention, deletion/export, admin audit logs and access review are defined for customer/order data.
- Suggested agent: 04 API / Orders Agent

#### M10-P2-06 — Manufacturing depth roadmap
- Status: open
- Area: manufacturing
- Product-visible: no
- Related existing task: P2-07, P2-08, P2-09, БАЗИС-Мебельщик Boundary Lock
- Acceptance summary: BOM, drilling maps, Basis/.b3d path, QC checklist and assembly instruction export are decomposed into executable tracks.
- Suggested agent: 07 Production / Manufacturing Agent

#### M10-P2-07 — Architecture decomposition and legacy removal
- Status: open
- Area: architecture
- Product-visible: no
- Related existing task: P0-01, P0-02, P0-18, TASK 08-UX-07
- Acceptance summary: large components, legacy Constructor boundaries, domain contracts and dead code removal are planned without weakening current guards.
- Suggested agent: 02 Constructor Agent

#### M10-P2-08 — Load and stress testing
- Status: open
- Area: performance / API
- Product-visible: no
- Related existing task: M9-P1-07
- Acceptance summary: order submit, rate-limit behavior, Supabase capacity and email provider limits are tested under realistic load assumptions.
- Suggested agent: 05 Infrastructure / QA Agent

#### M10-P2-09 — Customer support operations
- Status: open
- Area: support
- Product-visible: yes
- Related existing task: none found
- Acceptance summary: support/debug checklist, order lookup, failed order recovery and customer-facing FAQ are ready for real customers.
- Suggested agent: 01 Product / Planning Agent

#### M10-P3-01 — Post-MVP product roadmap
- Status: open
- Area: product roadmap
- Product-visible: yes
- Related existing task: P3-12
- Acceptance summary: B2B mode, AI assembly instructions, additional furniture types, customer account/history and production integrations are prioritized after MVP evidence.
- Suggested agent: 01 Product / Planning Agent
