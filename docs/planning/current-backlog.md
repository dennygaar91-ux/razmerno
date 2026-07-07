# Current Backlog — Размерно

Статус: единый operational backlog для агентов.

Этот документ является **единственным источником истины по активным backlog-задачам**. Временные backlog-followup документы после переноса задач должны архивироваться или удаляться из active planning layer.

Последняя сверка: `docs/planning/project-reconciliation-report-v1.md`.

Governance note:

- `docs/planning/accepted-backlog-decisions-v1.md` is a mandatory decision layer for interpreting backlog tasks.
- `docs/planning/current-backlog.md` remains the main backlog source of truth.
- If `current-backlog.md` and accepted decisions appear to conflict, stop and request reconciliation.
- Release v1 documentation hierarchy: `accepted-backlog-decisions-v1.md` §18 → RPES → `mvp-scope.md` / `release-roadmap.md` → this backlog. Governance traceability below does not change task status or closure evidence.

## Release v1 Governance Traceability

Planning input integrated from `docs/planning/razmerno-release-v1-product-decisions-delta-final.md` on 2026-06-26.

- `docs/planning/mvp-scope.md` now documents **Release v1 Scope** while keeping the legacy file path.
- This backlog remains the operational source of truth for task status, evidence and closure conditions.
- Release v1 decisions are traced below by **Capability** and **Release Phase** without changing any task status or closure evidence.

### Release Progress

| Release Phase | Capability focus | Primary outcome | Representative backlog tracks |
|---|---|---|---|
| RV1-A Constructor Core | Core Configuration, Visualization Runtime | stable Constructor3D, state model, submit path, WebGL fallback | P0-01, P0-02, P0-05, P0-06, P0-16, P0-17, P0-18, M8-P0-02, M8-P0-03, P1-10 |
| RV1-B Pricing & Submit Reliability | Pricing Authority, Order Snapshot | backend-owned price, parity fixtures, checkout/API reliability | P0-03, P0-11, P0-12, P0-13, M8-P0-01, M8-P0-04, M8-P0-05 |
| RV1-C Customer Platform | Auth, Drafts, Customer Cabinet | auth gate, email+password, drafts/projects, customer order card | P1-27 |
| RV1-D Orders Lifecycle | Status Model, Change Requests, Audit | domain statuses `Черновик`, `Проверка`, `Оплата`, `В работе`, `Завершено`, `Отмена`; `RZM_0001`, CR, locks, audit trail | P1-28, M9-P1-02, P2-09 |
| RV1-E Operations Workspace | Operations View, Approval View, Manual Pricing | Order Operations Workspace, Approval View, manager adjustment | P1-28, P2-09, P2-25 |
| RV1-F Production Handoff | JSON Snapshot, Manual B3D | mandatory JSON, manual Basis/B3D, preview storage | P1-11A, P1-11B, P1-23, P1-24, БАЗИС-Мебельщик Boundary Lock, Production Export Failure Contract |
| RV1-G Payments & Notifications | Manual Payment, Notification Center | manual payment confirmation, email + in-cabinet notifications | API notification tracks, M8-P0-04, M9-P1-03 |
| RV1-H Release Candidate | QA / Live Verification / Visual Gate | release checklist, live Supabase/email, visual QA | M8-P1-01, M8-P1-02, M8-P1-05, P1-21, P2-20, P2-21, Live Provider / Supabase Order Flow Verification |

### Capability Mapping

Use this table for governance traceability only. Task status and evidence remain in each task block below.

| Capability | Release Phase | Related backlog tasks / tracks |
|---|---|---|
| Core Configuration | RV1-A | P0-01, P0-02, P0-16, P0-17, P0-18, M8-P0-02 |
| Visualization Runtime | RV1-A | P0-05, P0-06, M8-P0-03, P1-10, P2-26A, P2-26B, P2-26C |
| Pricing Authority | RV1-B | P0-03, P0-13, M8-P0-01 |
| Order Snapshot & Submit Reliability | RV1-B | P0-11, P0-12, M8-P0-04, M8-P0-05, P1-09 |
| Auth & Registration | RV1-C | P1-27 |
| Drafts / Projects | RV1-C | P1-27 |
| Customer Cabinet & Order Card | RV1-C | P1-27 |
| Status Model & Order Numbering | RV1-D | P1-28, M9-P1-02 |
| Change Request & Production Lock | RV1-D | P2-09, P1-28 |
| Audit Trail / Event Log | RV1-D | P2-09, P1-28 |
| Operations View | RV1-E | P1-28, P2-25 |
| Approval View | RV1-E | P1-28, P2-09 |
| Manual Manager Price Adjustment | RV1-E | P0-03, P0-13, P1-28 |
| JSON Manufacturing Snapshot | RV1-F | P1-11A, P1-11B, Production Golden Snapshots, Production Export Failure Contract |
| Manual B3D / Basis Handoff | RV1-F | БАЗИС-Мебельщик Boundary Lock, P1-11A, P1-11B |
| Order Preview / Screenshot Storage | RV1-F | P0-11, P0-12 |
| Manual Payment Workflow | RV1-G | P1-28, M9-P1-02 |
| Notification Center & Email | RV1-G | API Order Notification Failure Contracts, M8-P0-04, M9-P1-03 |
| Release QA / Live Verification | RV1-H | M8-P1-01, M8-P1-02, M8-P1-05, Live Provider / Supabase Order Flow Verification, P1-21 |

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
- `needs reconciliation` — задача остаётся открытой, пока не устранён конфликт между RPES / accepted decisions / backlog / evidence wording.
- `obsolete` — потеряло актуальность.
- `duplicate` — перекрыто другой задачей и не должно запускаться отдельно.
- `superseded` — исторический смысл задачи сохранён в другой активной задаче; отдельно не запускать.

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
- PR #52 — superseded for active backlog management by merged PR #84 and PR #92; keep only as historical branch context, not as active triage or closure evidence.

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

Local branch evidence note:

- `9e4a2f13` (`docs: define constructor state ownership contract`) adds `docs/planning/constructor-state-ownership-contract-v1.md` and documents active Constructor3D ownership, active-vs-legacy boundary, snapshot/payload boundary and closure evidence requirements.
- Current repository audit shows `9e4a2f13` is present in local branch `task/p0-03-pricing-source-lock` and is not verified on local `main`.
- This is docs-layer, branch-only evidence and cannot close `P0-02` or `M8-P0-02`.
- Local implementation evidence note: branch-local architecture cleanup removed the specific shared-order legacy type dependency `src/shared/lib/order.ts -> src/configurator/model/compartments.ts` by introducing an order-contract-local layout type in `src/shared/lib/order.ts`; required QA passed locally: `npm.cmd run typecheck`, `npm.cmd run test:checkout-submit-hook`, `npm.cmd run test:constructor-flow`, `npm.cmd run test:mvp-release-verification-e2e`, `git diff --check`.
- Remaining work: `P0-02` stays open until this narrowed payload-boundary cleanup is merged/main-verified and the broader state-ownership closure evidence is complete across focused runtime state-transition tests, constructor payload tests, GitHub QA and merged/main verification.

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

Evidence status note:

- Local branch `task/p0-03-pricing-source-lock` contains `a5263615` (`docs: lock pricing source of truth`), `799b6f89` (`fix: persist server-authoritative order pricing`) and `b433fa2e` (`fix: align admin pricing with stored snapshot`).
- These commits add `docs/planning/pricing-source-of-truth-lock-v1.md` and local runtime evidence for server-owned pricing persistence and admin stored-snapshot semantics.
- Current repository audit does not verify these three commits on local `main`; treat them as branch-only evidence, not merged/main closure evidence.
- Current schema has no persisted source/fallback attribution field, so admin wording remains limited to safe semantics such as `final server snapshot` and `source attribution not persisted`.
- Local implementation evidence (branch-only, not verified on main): `catalog_source_used`, `pricing_source_diagnostic` and `pricing_fallback_reason` are persisted on order submit via migration `20260626_add_order_pricing_source_attribution.sql`; admin read model uses persisted attribution when present and keeps legacy fallback for null rows. `P0-03` / `P0-13` remain open; GitHub QA/main verification `not verified`.
- `P0-03` remains open: pricing formulas were not changed, parity closure still depends on `P0-13`, GitHub QA/main verification and remaining source/fallback evidence.
- QA note for local branch runtime evidence: checkout pricing persistence tests and typecheck were reported locally, but merged/main verification and `typecheck:api` remain `not verified` in this backlog note.
- `338976f3` (`test: add pricing parity evidence pack`) adds branch-only parity evidence in `tests/checkout-submit-hook.test.ts` and `tests/admin-order-summary.test.ts` for stored snapshot recompute, delivery/assembly matrix persistence, material-aware snapshot paths and admin stored-snapshot semantics. `P0-03` remains open; GitHub QA/main verification `not verified`.
- Local architecture cleanup evidence: dead browser runtime-catalog helper `src/pricing/runtimeCatalog.ts`, dead duplicate quick-estimate wrapper `src/shared/lib/estimate.ts` and dead legacy exports `calculateLegacyPrice` / `quickEstimate` / `applyClientPriceMultiplier` were removed after repo-wide reachability check confirmed no active imports. Active MVP pricing path remains `Constructor3D useConstructorQuote -> shared/lib/price.calculatePrice -> pricing/engine -> api/_shared/server-price -> order snapshot -> admin stored snapshot read`.
- Remaining work narrowed: legacy constructor/manual export pricing files under `src/constructor/**` were not removed because they still have local import chains for manual Basis/technical export paths; public MVP pricing still needs source/fallback evidence and P0-13 parity closure.
- Historical pricing audit docs `docs/pricing/pricing-parity-audit-v1.md` and `docs/pricing/pricing-validation-audit-v1.md` now carry a staleness/superseded warning for agent safety; they must not override RPES VI, `pricing-source-of-truth-lock-v1.md`, or live backlog evidence for `P0-03` / `P0-13`.

Объём: M. Зависимости: price sources, delivery, assembly, P0-13. Независимо: частично.

### P0-04 Checkout Reliability

Статус: duplicate / partially covered by P0-11 and P0-12.

Зачем: заявка должна стабильно отправляться с корректными данными.

Риск: потеря конверсии и заявок.

Reconciliation note: contract-scope закрыт через P0-11/P0-12. Остаточный browser-level checkout UX/E2E scope остаётся в `P1-09` и `M9-P1-01`.

### P0-05 Three.js Stability

Статус: open.

Зачем: 3D является основным интерфейсом.

Риск: пользователь видит сломанный продукт.

Committed evidence note:

- `d3f4eb06` (`feat: harden Three.js runtime recovery`) adds branch-only runtime recovery hardening in `Constructor3DPage.tsx`, `LazyThreeFurnitureViewer.tsx`, `ThreeSceneBoundary.tsx` and `ThreeFurnitureViewer.tsx`: explicit recovery reasons (`three-boundary-error`, `three-load-timeout`, `three-context-lost`), `recoveryKey` remount on retry, load-timeout cancel on ready, boundary reset via `resetKey`, context-lost fallback without `webglcontextrestored` auto-remount.
- Local verification gate `2026-06-23` on branch `task/p0-05-threejs-stability`: `npm run test:constructor-three-safety` (14/14 pass), `npm run test:constructor-flow` (16/16 pass), `npm run typecheck` (pass), `npm run build` (pass), `npm run test:webgl-fallback-e2e` (10/10 pass after `npx playwright install chromium`).
- Status remains `open`: GitHub QA/main verification `not verified`; explicit human visual review `not verified`; camera framing visual pass (`P2-26C`) `not verified`.

Объём: XL. Зависимости: scene adapter, state model. Независимо: нет.

### P0-06 WebGL / 2D Fallback

Статус: open.

Зачем: пользователь должен продолжить настройку, если WebGL недоступен.

Риск: часть пользователей не сможет отправить заявку.

Committed evidence note:

- `d3f4eb06` (`feat: harden Three.js runtime recovery`) keeps full 2D fallback (`TwoDFallbackScene`) on boundary/timeout/context-lost failures; retry path clears runtime failure flags and remounts Three.js without mutating committed constructor domain state (covered by `constructorFlowSmoke.test.ts` and `threeSceneSafety.test.ts`).
- `P0-06` remains open: existing WebGL fallback E2E (`tests/browser/webgl-fallback.spec.ts`) was not re-run; browser E2E alignment for new recovery contract `not verified`; GitHub QA/main verification `not verified`.

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

Post-closure maintenance evidence:

- `e7d16e97` (`docs: add RPES role-based audits`) adds role-based findings docs under `docs/audits/role-audits/`.
- `de3c7c80` (`docs: reconcile role audit findings`) adds `docs/planning/role-audit-reconciliation-v1.md`.
- `84330efa` (`docs: update agent operating rules`) updates `AGENTS.md` to the current RPES + role-audit structure.
- `a5263615` and `9e4a2f13` add the pricing source lock and constructor state ownership contract as active planning references.
- These commits reinforce documentation sync and active source hierarchy, but do not reopen or re-close `P0-07`.

Объём: M. Зависимости: audits, backlog. Независимо: да.

### P0-08 Testing Foundation

Статус: duplicate / partially covered by P0-09, P0-10, P0-11, P0-12, P0-14, P0-19.

Зачем: минимальная защита от регрессий.

Риск: крупная декомпозиция станет небезопасной.

Reconciliation note: базовая QA/CI/testing foundation закрыта инфраструктурно и contract-layer задачами. Остаточная работа по extended release/nightly automation и release-process maturity остаётся в `M9-P1-01`, `M9-P1-10` и связанных `M8/M9/M10` QA-задачах, а не в отдельных `P1-14—P1-19`.

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
- Branch-only source-attribution persistence evidence: order submit now stores `catalog_source_used`, `pricing_source_diagnostic`, `pricing_fallback_reason`; does not close P0-13 parity or main verification.

Required sub-work:

- PR #43 triage: rebase/fix/continue or replace;
- golden pricing fixtures in main;
- material-aware client/server parity;
- production-panel pricing parity;
- quote/order/stored price snapshot parity;
- API server-authoritative price boundary verification.

Do not close until final tests are merged and verified on main.

Accepted decisions note: interpret parity closure together with Q8 and the explicit PR #43 decision in `accepted-backlog-decisions-v1.md`; branch-only pricing evidence still cannot close this task.

Committed evidence note:

- `a5263615` (`docs: lock pricing source of truth`) defines the parity evidence model for quote/order/stored snapshot parity, admin summary parity and legacy/demo pricing path guard without closing `P0-13`.
- `799b6f89` (`fix: persist server-authoritative order pricing`) adds committed runtime evidence that stored `total_price`, breakdown, delivery and assembly values follow the existing server pricing stack rather than client-submitted totals.
- `020ba133` (`feat: add safe admin order summary`) adds a safer admin summary baseline for masked PII and explicit `not verified` states.
- `b433fa2e` (`fix: align admin pricing with stored snapshot`) adds committed runtime evidence that admin list/detail use stored server-owned order snapshot fields and safe wording when source attribution is unavailable.
- Source/fallback attribution is still not persisted in schema, so parity evidence may only claim `source attribution not persisted`, not a stronger source/fallback label.
- `P0-13` still stays open until material-aware parity, delivery/assembly matrix coverage, quote/order/stored snapshot parity, admin summary parity, GitHub QA success and main verification are all satisfied together.
- `338976f3` (`test: add pricing parity evidence pack`) adds branch-only evidence in `tests/checkout-submit-hook.test.ts`: stored order snapshot parity for normal order flow, delivery/assembly matrix server recompute, material-aware body/facade snapshot paths; and in `tests/admin-order-summary.test.ts`: admin stored-snapshot parity end-to-end plus local/demo fallback guard. Pricing formulas unchanged; GitHub QA/main verification `not verified`; `P0-13` remains open.

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

Статус: closed.

Owner: 04 API / Orders Agent + 05 Infrastructure / QA Agent.

Closure evidence:

- replacement scope is merged to `main`: PR #84 `fix: align notification failure policy`, merge baseline `af9fd2813bfc68014b852a0fdf6af4cfe9760237`;
- local repository audit confirms `af9fd2813bfc68014b852a0fdf6af4cfe9760237` is contained in local `main`;
- changed files on merged scope: `api/orders.ts`, `tests/checkout-submit-hook.test.ts`;
- pre-merge QA recorded in backlog evidence: `npm.cmd run test:checkout-submit-hook`, `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check`;
- customer email failure path and manager email failure path are covered by merged policy wording;
- `manager_notification_failed` is observable through response/persisted email status/error;
- PII-safe logging evidence is separately merged on `main` via `40d5dbc9 test: lock pii logging sanitization (#89)`.

Verification status:

- merged/main evidence: verified locally via commit containment on `main`;
- GitHub QA success: referenced in merged backlog evidence, not re-run in this docs-only audit;
- live provider verification: not required for this task itself; remains separate in `Live Provider / Supabase Order Flow Verification`.

Accepted decisions note: interpret this task together with the accepted notification policy: customer email failure keeps order success with logged error; manager email failure keeps customer success but must record `manager_notification_failed`; MVP retry is manual, automatic retry queue is later.

Remaining exclusions:

- payload-match idempotency is tracked separately in `Duplicate Submit / Payload-match Idempotency`;
- manual retry remains open in later maturity tracks;
- automatic retry queue and `order_status_events` remain out of scope.

### Duplicate Submit / Payload-match Idempotency

Статус: closed.

Owner: 04 API / Orders Agent.

Closure evidence:

- PR #92 `fix: implement M8-P0-05 idempotency policy` was squash-merged into `main`;
- local repository audit confirms `723a0351` is contained in local `main`;
- merged behavior recorded in backlog evidence: same `Idempotency-Key` + same payload returns the same order/result and does not resend notifications;
- same `Idempotency-Key` + different payload returns `409 conflict`;
- mismatched `Idempotency-Key` and `body.orderId` is rejected before persistence/notifications;
- focused QA recorded before merge: `npm.cmd run test:checkout-submit-hook`, `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check`;
- GitHub checks were recorded green before merge; main verification is recorded in the maturity block.

Verification status:

- merged/main evidence: verified locally via commit containment on `main`;
- runtime/live provider verification: not required for idempotency closure itself.

Accepted decisions note: interpret this task together with accepted idempotency rules: same payload replay returns the same order/result; different payload replay returns `409 conflict`; PR/body wording must not claim stronger replay semantics unless implemented.

Remaining exclusions:

- live Supabase/provider behavior remains open in `Live Provider / Supabase Order Flow Verification`;
- notification retry queue remains a later task and is not part of idempotency closure.

### Manager Notification Failure Policy

Статус: superseded.

Owner: 04 API / Orders Agent + 01 Product / Planning Agent.

Reason: this narrower policy task is now management-wise covered by the merged umbrella task `API Order Notification Failure Contracts`, which already carries the same merged/main evidence and exclusions.

Do not run separately: use `API Order Notification Failure Contracts` for closure evidence, and `M9-P1-03` for retry/queue follow-up scope.

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

### P1-25 — RPES / Backlog MVP Crosswalk

Статус: needs reconciliation.

Why: role-audit reconciliation `RAR-001` and RPES/governance sources show that `P0/P1/M8` release-critical tasks still lack a single explicit RPES-to-backlog crosswalk with per-block status `accepted/open/conflict/not verified`.

Priority correction: treat this as `P0` planning work for execution order and release gating, even while the legacy task id remains `P1-25` in this backlog revision.

Risk: product/planning, UX, pricing and QA work can interpret RPES draft layers and backlog closure wording differently, causing incorrect release-readiness claims.

Owner: 01 Product / Planning Agent.

Evidence needed:

- merged/main crosswalk note mapped to active `P0/P1/M8` tasks;
- explicit status per block: `accepted`, `open`, `conflict`, `not verified`;
- links to accepted decisions and existing backlog evidence, without closing technical tasks automatically.

Dependencies: `P0-07`, `docs/planning/accepted-backlog-decisions-v1.md`, `docs/planning/role-audit-reconciliation-v1.md`.

Do-not-touch constraints:

- do not rewrite RPES volumes wholesale;
- do not close tasks from docs-only findings alone;
- do not change runtime, API, pricing, Supabase, Three.js or production logic.

### P1-26 — Design-system Direction Reconciliation

Статус: needs reconciliation.

Why: `docs/design-system/README.md` still states `mobile-first`, while accepted decisions and current implementation scope fix the active direction as desktop/website-first with mobile redesign deferred.

Risk: UX/design tasks may keep making conflicting visual decisions about constructor shell, stepper, fallback layout and release gate.

Owner: 01 Product / Planning Agent + 08 UX / Design System Agent.

Evidence needed:

- merged/main wording reconciliation across active design-system/planning docs;
- explicit statement of current desktop-first release scope and deferred mobile redesign;
- mapping of affected backlog tasks (`P1-21`, `P2-21`, `TASK 08-UX-07`, `P2-26*`).

Dependencies: `docs/design-system/README.md`, `docs/planning/accepted-backlog-decisions-v1.md`, `docs/planning/role-audit-reconciliation-v1.md`.

Do-not-touch constraints:

- do not redesign mobile UX in this task;
- do not mass-clean runtime CSS/components;
- do not close visual tasks without fresh screenshots and human review.

### P1-27 — Customer Platform MVP Scope Reconciliation

Статус: needs reconciliation.

Why: RPES Volume VII requires auth, cabinet, saved configuration continuity, project/order lists and post-submit visibility, while current backlog has no dedicated scope-decision task for this gap and current repo evidence does not confirm a matching customer UI surface.

Governance traceability note (2026-06-26 final pass): Release v1 planning (`mvp-scope.md`, RPES VII, `accepted-backlog-decisions-v1.md` §18) now explicitly treats customer platform as Release v1-required. This task remains `needs reconciliation` until merged/main implementation inventory and closure evidence exist — documentation alignment alone does not close the task.

Risk: MVP wording can overpromise a customer platform scope that is broader than the verified implementation surface.

Owner: 01 Product / Planning Agent + 04 API / Orders Agent.

Evidence needed:

- merged/main scope decision: full MVP customer platform, narrowed MVP scope, or explicit defer;
- implementation inventory mapped against RPES VII;
- backlog linkage for any runtime follow-up tasks created after the decision.

Branch implementation evidence (2026-06-23, Epic A — Customer Authentication Foundation, `task/epic-a-customer-auth`, not closure):

- Supabase `profiles` migration + `db/customer-profiles.sql`;
- API `GET/PATCH /api/profile` with JWT verification via service role (email immutable; phone/full_name editable; verification extension point reserved);
- frontend auth foundation: `SessionProvider`, `AuthProvider`, `UserContext`, `ProtectedRoute`, `GuestRoute`, `useAuth()`, `useProfile()`, header login/register/logout, checkout auth gate modal;
- tests: `tests/customer-auth.test.ts` (`npm run test:customer-auth`);
- QA blocker fixes (2026-06-23): production fail-closed when `VITE_SUPABASE_*` missing; shared `useCheckoutAuthGate` wired in `Constructor3DPage` and legacy `ConstructorPage`;
- explicit non-scope preserved: no Customer Cabinet, drafts server, orders list, notifications, email verification, `user_id` on orders;
- P1-27 status remains `needs reconciliation` until merged/main inventory + closure evidence.

Branch implementation evidence (2026-07-03, Epic B — Customer Projects Foundation, `task/epic-b-projects-foundation`, not closure):

- Supabase `constructor_projects` migration + `db/constructor-projects.sql` (RLS deny-all / API-only);
- API: `GET/POST /api/projects`, `GET/PATCH/DELETE /api/project?id=` with JWT auth, per-user ownership, max 3 active projects, archive via `archived_at`;
- frontend foundation: `src/shared/projects/*`, `useConstructorProjectSync`, server save button + post-login local draft import in `Constructor3DPage`;
- tests: `tests/customer-projects.test.ts` (`npm run test:customer-projects`);
- explicit non-scope preserved: no Customer Cabinet UI, orders list, notifications, `user_id` on orders, project→order conversion.

Branch implementation evidence (2026-07-03, Epic C — Submit Ownership Foundation, `task/epic-b-projects-foundation`, not closure):

- Supabase migration `20260703_add_order_ownership_foundation.sql` + `db/order-ownership.sql`: `user_id`, `public_order_number` (`RZM_0001` sequence/RPC), `domain_status`, optional `constructor_project_id`;
- `POST /api/orders` requires authenticated customer JWT (401 without token); assigns `public_order_number` at submit; `domain_status = "Проверка"`; legacy `status = "new"` preserved;
- optional project→order link via `projectId` with ownership check; profile phone autofill when profile phone empty;
- frontend: `submitOrder` sends `Authorization` bearer + shows `publicOrderNumber` in success message;
- tests: `tests/customer-order-submit.test.ts`, updated `tests/checkout-submit-hook.test.ts` (auth header + ownership columns + malicious price overwrite preserved);
- explicit non-scope preserved: no Customer Cabinet, orders list UI, notifications, change requests, payments, production changes;
- P1-27 status remains `needs reconciliation` until merged/main inventory + closure evidence.

Branch implementation evidence (2026-07-03, Epic D — Customer Workspace API Foundation, `task/epic-b-projects-foundation`, not closure):

- API `GET /api/customer/workspace` with JWT auth via shared `customer-api-auth` (API-only / service-role);
- read model: sanitized `profile`, active `projects`, customer-owned `orders`, `stats` (`activeProjects`, `orders`);
- excludes snapshot, production export, pricing diagnostics, admin/email/internal audit fields;
- orders scoped by `user_id`; projects scoped by authenticated user + active-only in workspace list;
- minimal client helpers: `src/shared/workspace/types.ts`, `src/shared/workspace/workspaceApi.ts`;
- tests: `tests/customer-workspace.test.ts` (`npm run test:customer-workspace`);
- explicit non-scope preserved: no Customer Cabinet UI, notifications, change requests, payments, order edit APIs;
- P1-27 status remains `needs reconciliation` until merged/main inventory + closure evidence.

Branch implementation evidence (2026-07-03, Epic E — Customer Cabinet UI Foundation, `task/epic-b-projects-foundation`, not closure):

- route `/account` with `AccountPageGate` (JWT gate + `AuthModal`, production fail-closed via shared checkout auth policy);
- cabinet UI: dashboard summary, projects list, orders list (`RZM_0001`, domain status), profile summary;
- header: authenticated users link to `/account`, guest login/register preserved, logout unchanged;
- reuse: `CustomerAuthProviders`, `useAuth`, `fetchCustomerWorkspace`, existing Razmerno card/layout tokens (`rzm-info`/`auth.css`);
- tests: `tests/customer-account.test.ts` (`npm run test:customer-account`);
- explicit non-scope preserved: no order detail page, profile edit, project archive/load, notifications, payments, production timeline;
- P1-27 status remains `needs reconciliation` until merged/main inventory + closure evidence.

Branch implementation evidence (2026-07-03, Epic F — Project Resume & Load Foundation, `task/epic-b-projects-foundation`, not closure):

- reuse `GET /api/project?id=` full project payload with persisted `snapshot` (no snapshot schema changes);
- client resume helpers: `src/shared/projects/projectResume.ts`, `useConstructorProjectResume`, `applyStoredConstructorDraftToStore`;
- cabinet projects list: `Открыть в конструкторе` → `/configurator?projectId=...`;
- constructor resume: fetch owned project, restore snapshot into Zustand store + local draft, link submit `projectId`;
- tests: `tests/customer-project-resume.test.ts` (`npm run test:customer-project-resume`);
- explicit non-scope preserved: no project archive UI, no autosave, no order detail, notifications, payments, production timeline;
- P1-27 status remains `needs reconciliation` until merged/main inventory + closure evidence.

Branch implementation evidence (2026-07-03, Project Update Foundation, `task/epic-b-projects-foundation`, not closure):

- constructor sync tracks `currentProjectId` from resumed/saved project;
- server save uses `PATCH /api/project?id=` when `currentProjectId` exists, otherwise `POST /api/projects`;
- UI copy: `Сохранить на сервер` for new project, `Сохранить изменения` for existing;
- helpers: `src/shared/projects/projectSave.ts`, `buildProjectPatchInputFromConstructor`;
- failed PATCH keeps `currentProjectId`; successful PATCH/POST refresh saved project state;
- tests extended in `tests/customer-project-resume.test.ts`;
- explicit non-scope preserved: no autosave, rename/archive/delete UI;
- P1-27 status remains `needs reconciliation` until merged/main inventory + closure evidence.

Branch implementation evidence (2026-07-03, Epic G — Customer Order Detail Read-only, `task/epic-b-projects-foundation`, not closure):

- API `GET /api/customer/order?id=` with JWT auth and ownership by `user_id`;
- safe read model: `publicOrderNumber`, `domainStatus`, contacts, delivery/assembly flags, dimensions/materials summary, pricing summary (шкаф/доставка/сборка);
- excludes `order_id`, `production_export`, raw `price_breakdown`, pricing diagnostics, email/admin/audit fields;
- frontend `/account/order/:id`, links from cabinet orders list, read-only `CustomerOrderDetailCard`;
- tests: `tests/customer-order-detail.test.ts` (`npm run test:customer-order-detail`);
- explicit non-scope preserved: no cancel/change requests, notifications, payments, production timeline, profile/project changes;
- P1-27 status remains `needs reconciliation` until merged/main inventory + closure evidence.

Branch implementation evidence (2026-07-03, Epic H — Customer Profile Editing Foundation, `task/epic-b-projects-foundation`, not closure):

- reuses existing `GET/PATCH /api/profile` (no new APIs);
- profile section in `/account`: view mode + edit mode for `full_name` and `phone`, email read-only;
- client `patchCustomerProfile` + local `updateProfile` refresh in cabinet without full reload;
- tests: `tests/customer-profile-edit.test.ts` (`npm run test:customer-profile-edit`);
- explicit non-scope preserved: no email change, phone verification, password change, notifications, payments, order/project changes;
- P1-27 status remains `needs reconciliation` until merged/main inventory + closure evidence.

Branch implementation evidence (2026-07-03, Epic I-1 — Customer Change Request API Foundation, `task/epic-b-projects-foundation`, not closure):

- migration `supabase/migrations/20260703_add_order_change_requests.sql` + reference `db/order-change-requests.sql`;
- table `public.order_change_requests` with RLS deny-all; service-role API access only;
- customer APIs `POST /api/customer/change-request`, `GET /api/customer/change-requests?orderId=`;
- ownership via existing `getCustomerOrderByIdForUser`; foreign/missing order -> 404;
- safe read model only; no order mutation, status transition, notifications, manager workflow;
- tests: `tests/customer-change-request.test.ts` (`npm run test:customer-change-request`);
- explicit non-scope preserved: no UI, approval, production lock, email, cancellation workflow;
- P1-27 status remains `needs reconciliation` until merged/main inventory + closure evidence.

Branch implementation evidence (2026-07-03, Epic I-2 — Customer Change Request UI Foundation, `task/epic-b-projects-foundation`, not closure):

- order detail `/account/order/:id`: section `Изменения заказа`, empty state, `Запросить изменение` form, history list;
- client `changeRequestApi` + `useCustomerChangeRequests` reuse Epic I-1 APIs with Bearer auth;
- local prepend after POST success; no page reload; success copy `Запрос отправлен менеджеру.`;
- tests: `tests/customer-change-request-ui.test.ts` (`npm run test:customer-change-request-ui`);
- explicit non-scope preserved: no manager reply/approve/reject, notifications, email, production lock, order mutation;
- P1-27 status remains `needs reconciliation` until merged/main inventory + closure evidence.

Branch implementation evidence (2026-07-03, Customer Notifications API Foundation, `task/epic-b-projects-foundation`, not closure):

- migration `supabase/migrations/20260703_add_order_notifications.sql` + reference `db/order-notifications.sql`;
- table `public.order_notifications` with RLS deny-all; service-role API access only;
- customer API `GET /api/customer/notifications` with JWT auth and `user_id` ownership filter;
- safe read model: `id`, `type`, `title`, `message`, `isRead`, `createdAt`, `orderId`;
- tests: `tests/customer-notifications.test.ts` (`npm run test:customer-notifications`);
- explicit non-scope preserved: no UI, bell/badge, mark-as-read API, generation, email, push, websocket, polling, manager workflow;
- P1-27 status remains `needs reconciliation` until merged/main inventory + closure evidence.

Branch implementation evidence (2026-07-05, Epic J-2 — Customer Notifications UI Foundation, `task/epic-b-projects-foundation`, not closure):

- account section `Уведомления` after dashboard summary; cards show title, message, type label, date, read/unread visual;
- client `notificationApi` + `useCustomerNotifications` reuse Epic J-1 `GET /api/customer/notifications` with Bearer auth;
- states: loading, success, empty, error with `retry()`; no polling/realtime/mark-as-read/bell/badge;
- tests: `tests/customer-notifications-ui.test.ts` (`npm run test:customer-notifications-ui`);
- explicit non-scope preserved: no backend/migration, no PATCH/POST, no notification generation, no manager UI;
- P1-27 status remains `needs reconciliation` until merged/main inventory + closure evidence.

Branch implementation evidence (2026-07-05, Customer Notifications Completion, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done** (QA PASS, not closure);
- best-effort generation on authenticated order submit (`order_created`) and change request create (`change_request`);
- mark-as-read APIs `PATCH /api/customer/notification/read` and `PATCH /api/customer/notifications/read-all` with ownership;
- cabinet UI actions `Отметить прочитанным` / `Отметить все прочитанными` with local state update, no reload;
- tests extended in `customer-notifications.test.ts`, `customer-notifications-ui.test.ts`, `customer-order-submit.test.ts`, `customer-change-request.test.ts`;
- pre-commit audit PASS (2026-07-05): generation, mark-as-read, ownership, safe read model, forbidden scope preserved;
- QA passed locally: `npm run test:customer-notifications` (17), `npm run test:customer-notifications-ui` (13), `npm run test:customer-order-submit` (8), `npm run test:customer-change-request` (13), `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- commit: `d1ab3b7d` (`feat(customer): complete notifications workflow`, branch-only, not closure);
- explicit non-scope preserved: no bell/badge/realtime/polling/email/push/preferences/manager workflow;
- P1-27 status remains `needs reconciliation` until merged/main inventory + closure evidence.

Branch implementation evidence (2026-07-05, Operations Workspace — Orders Queue Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done** (QA PASS, not closure);
- `GET /api/operations/workspace` returns safe operations queue read model via admin JWT/session auth and service-role store reuse;
- route `/operations` + `/operations/orders/:id` with API-backed queue UI and reuse of existing admin order detail flow;
- client `operationsApi` + `useOperationsWorkspace` mirror customer workspace hook conventions; frontend has no direct DB access;
- tests: `tests/operations-workspace.test.ts` (6), `tests/operations-workspace-ui.test.ts` (7);
- QA passed locally: `npm run test:operations-workspace` (6), `npm run test:operations-workspace-ui` (7), `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- evidence correction: actual final HEAD for this Epic is `782cb441`; previous backlog reference `ed39b5fd` was superseded by amend chain;
- final implementation commit recorded by agent final report: `782cb441` `feat: add operations orders queue foundation` (branch-only, not closure);
- explicit non-scope preserved: no production/admin CRM/payments/realtime/status-change workflow expansion;
- P1-27 status remains `needs reconciliation`; P1-28 unchanged.

Branch implementation evidence (2026-07-05, Operations Approval View — Manual Review Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done** (QA PASS, not closure);
- `GET /api/operations/order?orderId=` returns safe manual review read model via admin JWT/session auth; `production_export` summarized server-side only;
- route `/operations/orders/:id` shows `OperationsManualReviewView` with approval summary, disabled action placeholders, and reused `AdminOrderDetailPage`;
- client `operationsReviewApi` + `useOperationsOrderReview`; frontend has no direct DB access;
- tests: `tests/operations-order-review.test.ts` (5), `tests/operations-manual-review-ui.test.ts` (7); updated `tests/operations-workspace-ui.test.ts`;
- QA passed locally: `npm run test:operations-order-review`, `npm run test:operations-manual-review-ui`, `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- commit: see final agent report / final HEAD after commit (`feat: add operations manual review foundation`, branch-only, not closure);
- explicit non-scope preserved: no approve/reject/status mutation/manual pricing write/production review workflow;
- P1-27 status remains `needs reconciliation`; P1-28 unchanged.

Branch implementation evidence (2026-07-05, Operations Manual Pricing Draft Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done** (QA PASS, not closure);
- reuses existing `GET /api/operations/order?orderId=` safe pricing summary fields; no new API/write endpoint;
- `OperationsManualPricingDraftSection` on manual review screen: current safe pricing summary, local-only draft input, disabled «Сохранить ручную цену»;
- tests: `tests/operations-manual-pricing-draft-ui.test.ts` (6);
- QA passed locally: `npm run test:operations-manual-pricing-draft-ui`, `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- commit: see final agent report / final HEAD after commit (`feat: add operations manual pricing draft foundation`, branch-only, not closure);
- explicit non-scope preserved: no manual pricing write, no order total/breakdown mutation, no status change;
- P1-27 status remains `needs reconciliation`; P1-28 unchanged.

Branch implementation evidence (2026-07-05, Operations Manual Pricing Write Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done** (QA PASS, not closure);
- API: `POST /api/operations/manual-pricing-draft` with admin auth, server-side validation, safe DTO response; `GET /api/operations/order?orderId=` now includes optional `manualPricingDraft` readback;
- DB: `order_manual_pricing_drafts` table migration with RLS deny-all (`supabase/migrations/20260705_add_order_manual_pricing_drafts.sql`);
- frontend: active save in `OperationsManualPricingDraftSection` via API client only, loading/success/error states, persisted draft summary after reload;
- tests: `tests/operations-manual-pricing-write.test.ts` (6), updated `tests/operations-manual-pricing-draft-ui.test.ts`, updated `tests/operations-order-review.test.ts`;
- QA passed locally: `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- commit: see final agent report / final HEAD after commit (`feat: add operations manual pricing write foundation`, branch-only, not closure);
- explicit non-scope preserved: no approve/reject, no order/production status mutation, no payment flow, no customer-facing final price update;
- P1-27 status remains `needs reconciliation`; P1-28 unchanged.

Branch implementation evidence (2026-07-05, Operations Manual Pricing Migration Verification Prep, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done** (QA PASS, not closure);
- migration/script consistency checked: `supabase/migrations/20260705_add_order_manual_pricing_drafts.sql` ↔ `db/order-manual-pricing-drafts.sql` (core DDL, unique `order_id`, positive price, draft-only status);
- RLS deny-all checked in migration and reference SQL;
- API validation vs DB constraints checked: server min/max price and reason max length; DB positive price + draft status align with store/validation;
- safe readback checked: `manualPricingDraft` safe DTO only, no raw PII/`production_export`/`price_breakdown`;
- no status/production/payment/customer-facing price mutation checked in write/read tests;
- tests added/updated: `tests/operations-manual-pricing-migration-prep.test.ts` (11), `tests/operations-manual-pricing-write.test.ts` (+upsert, reason length), `tests/operations-order-review.test.ts` (+draft readback);
- QA passed locally: `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- commit: see final agent report / final HEAD after commit (`test: add manual pricing migration verification prep`, branch-only, not closure);
- Live Supabase migration **not applied**; live verification **not performed**;
- P1-27 status remains `needs reconciliation`; P1-28 unchanged.

Branch implementation evidence (2026-07-05, Live Supabase Verification — Manual Pricing Draft, `task/epic-b-projects-foundation`, not closure):

- branch local status: **blocked/partial-live-verification**;
- preflight PASS: clean working tree, branch `task/epic-b-projects-foundation`;
- blocker: live Supabase/API credentials unavailable in agent runtime (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_KEY` missing; no local `.env`; Supabase CLI not linked; Vercel CLI not authenticated);
- live migration apply: **not performed** (table existence could not be probed live);
- live RLS deny-all: **not verified live** (local migration-prep tests remain green);
- live Service Role write / API smoke / readback: **not performed** (requires env + `SMOKE_BASE_URL` + safe `LIVE_VERIFY_ORDER_ID`);
- added runbook: `scripts/live-manual-pricing-draft-verify.mjs`, npm script `verify:live-manual-pricing-draft`;
- local QA passed after runbook add: `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`, `npm run check:live-manual-pricing-draft-verify`;
- commit: see final agent report / final HEAD after commit (`docs: add manual pricing live verification runbook and blocked evidence`, branch-only, not closure);
- explicit non-scope preserved: no approve/reject, no order/production/payment/customer-facing price mutation attempted live;
- P1-27 status remains `needs reconciliation`; P1-28 unchanged.

Branch implementation evidence (2026-07-06, Live Supabase Verification — Manual Pricing Draft, autonomous retry, `task/epic-b-projects-foundation`, not closure):

- branch local status: **blocked/partial-live-verification**;
- Cursor/Supabase access result: **no usable Supabase credentials discovered** in agent runtime (no `.env`/`.env.local`; shell env empty; Supabase CLI not logged in; Vercel project not linked; no Supabase MCP integration in workspace);
- preflight PASS: clean working tree, branch `task/epic-b-projects-foundation`;
- runbook enhanced: `scripts/load-project-env.mjs` auto-loads standard env files before live verify;
- `npm run verify:live-manual-pricing-draft` result: exit `2`, blocker `missing_required_env` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_KEY`);
- live migration apply: **not performed**;
- live table/RLS/API smoke: **not performed**;
- local migration-prep + full `npm test` remain green;
- QA passed after runbook enhancement: `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`, `npm run check:live-manual-pricing-draft-verify`;
- commit: see final agent report / final HEAD after commit (`docs: update manual pricing live verification blocker evidence`, branch-only, not closure);
- unblock requires project env available to agent runtime (`.env.local` or authenticated Supabase/Vercel CLI) plus safe `LIVE_VERIFY_ORDER_ID` and `SMOKE_BASE_URL`;
- P1-27 status remains `needs reconciliation`; P1-28 unchanged.

Branch implementation evidence (2026-07-06, Order Submit Failure — Live Verification Blocker, `task/epic-b-projects-foundation`, not closure):

- branch local status: **blocked/needs-fix** (code fix applied; live safe test order not created);
- diagnosis endpoint: `POST /api/orders`;
- diagnosis status chain: **502** (`orders.public_number_allocation_failed`) after env fix; initial failure was **502** with reason `Invalid path specified in request URL` when `SUPABASE_URL` included `/rest/v1/` suffix;
- root cause #1 (fixed in branch): misconfigured `SUPABASE_URL` (`https://<ref>.supabase.co/rest/v1/`) breaks Supabase JS client RPC/table paths;
- root cause #2 (live blocker, not fixed in code): linked live Supabase project schema drift — `orders.order_id` and Epic C ownership columns (`user_id`, `public_order_number`, `domain_status`, `constructor_project_id`) missing; RPC `next_public_order_number` missing; many MVP order columns from repo migrations also missing on live (`dimensions`, `sections`, `filling`, `materials`, `price_breakdown`, email status fields, etc.); live `orders` table uses legacy `order_number` and is empty;
- fix summary: added `api/_shared/supabase-url.ts` `normalizeSupabaseProjectUrl()`; wired all API Supabase stores + `scripts/load-project-env.mjs` to strip `/rest/v1` suffix/trailing slash;
- tests added: `tests/api-supabase-url.test.ts` (3), wired `npm run test:api-supabase-url`;
- live order submit re-test after URL fix: still **502**, RPC error `Could not find the function public.next_public_order_number`;
- safe test order id: **not created** (no `LIVE_VERIFY_ORDER_ID` candidate); manual Supabase insert not used per project rules;
- remaining required fix: apply repo Supabase migrations to linked live project per `docs/production/vercel-deploy-runbook.md` / `supabase/deploy/deploy-all.sql` and Epic C migrations at minimum `supabase/migrations/20260703_add_order_ownership_foundation.sql` plus prior MVP order schema migrations; then re-run customer `POST /api/orders` smoke to obtain `RZ-YYYYMMDD-NNNN`;
- note: URL normalization only unblocks future live verification once schema is aligned; branch-only evidence, not merged/main closure;
- `.env.local` remained uncommitted/gitignored;
- P1-27 status remains `needs reconciliation`; P1-28 unchanged.

Branch implementation evidence (2026-07-06, Read-only MCP Audit — Live Supabase Schema vs Repository Migrations, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (audit only, QA PASS, not closure)**;
- Supabase MCP connected (`user-supabase`); Vercel MCP connected (`user-vercel`);
- live schema inspected read-only via MCP (`list_tables`, `list_migrations`, `execute_sql` SELECT only);
- connected project ref: `gxfpgulkrpmlxfeuegpg`; project URL: `https://gxfpgulkrpmlxfeuegpg.supabase.co`;
- live `supabase_migrations.schema_migrations`: **empty** (no repo migrations recorded/applied);
- public tables found (7, all RLS enabled, all 0 rows): `pricing_versions`, `materials`, `hardware_items`, `service_prices`, `orders`, `order_configurations`, `order_events`;
- legacy live `orders` schema drift confirmed: uses `order_number` (not `order_id`), `order_status` enum, `pricing_version_id`, legacy triggers (`trg_orders_order_number` / `set_order_number`), legacy sequence `rzm_order_seq`, legacy functions `generate_order_number` / `set_order_number`; missing all repo MVP payload columns (`dimensions`, `sections`, `filling`, `materials`, `price_breakdown`, email status fields, assembly fields, `production_export`, pricing attribution, Epic C ownership columns);
- missing order submit objects: `orders.order_id`, `orders.user_id`, `orders.public_order_number`, `orders.domain_status`, `orders.constructor_project_id`, RPC `public.next_public_order_number`, sequence `public_order_number_seq`, repo indexes/constraints on `order_id` / `public_order_number`, explicit deny-all RLS policies (RLS enabled but `pg_policies` empty on all public tables);
- missing manual pricing objects: table `order_manual_pricing_drafts` (entire table absent);
- missing Epic/customer tables: `profiles`, `constructor_projects`, `order_notifications`, `order_change_requests`, `order_status_events` (live has different `order_events` instead);
- `supabase/deploy/deploy-all.sql` assessed **insufficient** for order submit (only assembly/status-events/production-export/pricing-attribution alters; does not create base `db/orders.sql` schema, Epic C, manual pricing, or customer tables); idempotent for its own blocks but **not safe as sole reconciliation path** against legacy schema without explicit reconciliation plan;
- pricing reference seed: **not required** for order submit (server pricing can use seed fallback; live catalog tables differ from repo `price_items` contract);
- no migrations applied; no live writes; no live data mutated;
- QA passed locally after audit evidence add: `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- recommended next task: **Live Supabase Schema Reconciliation — Order Submit Prerequisite** (not executed in this audit);
- P1-27 status remains `needs reconciliation`; P1-28 unchanged.

Branch implementation evidence (2026-07-06, Live Supabase Schema Reconciliation — Greenfield Order Submit Prerequisite, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, not closure)**;
- Greenfield decision: user explicitly accepted greenfield reconciliation on empty legacy schema;
- preflight PASS: project ref `gxfpgulkrpmlxfeuegpg`, URL `https://gxfpgulkrpmlxfeuegpg.supabase.co`, all 7 legacy public tables `0 rows`, `schema_migrations` empty, branch `task/epic-b-projects-foundation`, clean working tree;
- dropped legacy objects (empty): `order_configurations`, `order_events`, `orders`, `materials`, `hardware_items`, `service_prices`, `pricing_versions`, legacy functions (`generate_order_number`, `set_order_number`, `set_updated_at`), sequence `rzm_order_seq`, enums (`order_status`, `material_type`, `hardware_type`, `service_type`);
- applied via Supabase MCP `apply_migration`: `greenfield_drop_legacy_schema`, `base_orders_schema` (`db/orders.sql`), repo migrations `20260526_add_order_assembly_fields`, `20260526_add_order_status_events`, `20260527_add_order_production_export` (retry), `20260626_add_order_pricing_source_attribution`, `20260623_add_customer_profiles`, `20260703_add_constructor_projects`, `20260703_add_order_ownership_foundation`, `20260703_add_order_notifications`, `20260703_add_order_change_requests`, `20260705_add_order_manual_pricing_drafts`, plus `greenfield_contract_test_auth_user` for contract-test FK prerequisite;
- `supabase/deploy/deploy-all.sql` assessed insufficient as sole path (confirmed); individual repo migrations + base schema used instead;
- final schema verification PASS: `orders.order_id` + MVP payload columns + Epic C ownership columns + `production_export` + pricing attribution + assembly fields present; RPC `next_public_order_number` present; tables `profiles`, `constructor_projects`, `order_notifications`, `order_change_requests`, `order_status_events`, `order_manual_pricing_drafts` present;
- RLS verification: deny-all policies on `orders`, `profiles`, `constructor_projects`, `order_notifications`, `order_change_requests`, `order_manual_pricing_drafts` (`using(false)` / `with check(false)`); no permissive allow policies;
- `POST /api/orders` live smoke PASS via existing API handler + contract-test auth token: **200**, order id `RZ-20260706-7048` (manager/customer email notifications failed with placeholder Resend key; order persisted per policy);
- `LIVE_VERIFY_ORDER_ID` candidate: `RZ-20260706-7048`;
- `npm run verify:live-manual-pricing-draft` result: **blocked/partial** — `fetch failed` (likely `SMOKE_BASE_URL` API runtime not reachable); table/RLS pre-checks not fully reported due to early API smoke failure when `SMOKE_BASE_URL` set;
- QA passed locally after backlog evidence add: `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- no customer/production data existed before apply; only empty legacy schema dropped; one safe smoke order created through API flow;
- P1-27 status remains `needs reconciliation`; P1-28 unchanged;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-06, Live Supabase Verification — Manual Pricing Draft, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (Live Supabase verification PASS, QA PASS, not closure)**;
- Greenfield reconciliation already completed; safe test order used: `RZ-20260706-7048`;
- root cause of operations readback failure: stale `vercel dev` on `http://localhost:3000` without `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` in API runtime (health checks showed missing Supabase env); operations read model/code was correct against reconciled live schema;
- fix summary: enhanced `scripts/live-manual-pricing-draft-verify.mjs` with `checkApiRuntimeReady` (Supabase env probe via `/api/health` + operations readback preflight), `normalizeSupabaseProjectUrl` usage for service-role probes; exported `normalizeSupabaseProjectUrl` from `scripts/load-project-env.mjs`; added regression test for missing Supabase admin env in `tests/operations-order-review.test.ts`;
- `GET /api/operations/order?orderId=RZ-20260706-7048` readback PASS on API runtime with loaded `.env.local` (`http://localhost:3001`, status 200);
- manual pricing draft write PASS via `POST /api/operations/manual-pricing-draft` (draft price `123000`);
- persisted draft readback PASS via operations order review (`manualPricingDraft.manualTotalPrice=123000`);
- live Supabase confirm: `order_manual_pricing_drafts` row for `RZ-20260706-7048`, status `draft`;
- order status unchanged (`new`); production workflow unchanged (`requires-review`); payment state unchanged; customer-facing `totalPrice` unchanged (`47932`);
- frontend API-only unchanged; RLS deny-all unchanged; Service Role server-side only;
- `npm run verify:live-manual-pricing-draft` result: **ok=true** with `SMOKE_BASE_URL=http://localhost:3001`;
- note: use `SMOKE_BASE_URL` matching the `vercel dev` port that loaded `.env.local`; port `3000` may host a stale runtime without Supabase env;
- QA passed: `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`, `npm run check:live-manual-pricing-draft-verify`;
- P1-27 status remains `needs reconciliation`; P1-28 unchanged;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Operations Review Decision Actions — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, not closure)**;
- approve action: `POST /api/operations/order-decision` with `decision=approve` updates `domain_status` `Проверка` → `Оплата`, legacy `status` `new` → `in_progress`; writes `order_status_events` audit row (`changed_by=operations:approve`); returns safe operations review DTO;
- reject action: same endpoint with `decision=reject` + required `reason` updates `domain_status` → `Отмена` (legacy `status` unchanged); audit row `changed_by=operations:reject`; no order delete;
- API: `api/operations/order-decision.ts`, validation/store/types in `api/_shared/operations-order-decision-*`; admin auth required; 409 when order not in `Проверка`;
- read model: `OperationsOrderReview` extended with `domainStatus`, `reviewDecisionAllowed`, `approvalActionsImplemented=true`;
- UI: `OperationsOrderDecisionSection` on manual review screen — Approve/Reject buttons, reject reason input, loading/success/error states, API-only via `operationsOrderDecisionApi.ts`; reload after success;
- tests: `tests/operations-order-decision.test.ts` (10), updated `operations-order-review`, `operations-manual-review-ui`; `npm run test:operations-order-decision` wired;
- QA passed: `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no production handoff automation (`production_export` untouched); no payment flow; no customer-facing `total_price` mutation; no customer notification; no live migration apply; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Operations Decision Audit Reason — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, not closure)**;
- audit reason persistence: reject `reason` now stored in `order_status_events.reason`; approve stores `null` reason unless optional note provided later;
- migration: `supabase/migrations/20260707_add_order_status_event_reason.sql` (`add column if not exists reason text`); reference `db/order-status-events.sql`; no RLS/policy changes; live apply not performed;
- API: `applyOperationsOrderDecision` inserts `reason` into audit row; `OperationsOrderDecisionResult.auditReason` returned; `getLatestOperationsDecisionAuditByOrderId` loads latest operations audit for review readback;
- read model: `OperationsOrderReview.latestDecisionAudit` exposes safe internal audit summary including persisted reason;
- UI: `OperationsOrderDecisionSection` shows latest audit reason in internal Operations context after reload; reject textarea unchanged;
- tests: updated `operations-order-decision` (11), `operations-order-review` (8), `operations-manual-review-ui`; new `operations-order-decision-migration-prep` (5);
- QA passed: `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no payment flow; no production handoff; no customer-facing `total_price` mutation; no live migration apply; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Operations Decision History — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- API: `GET /api/operations/order` now returns `decisionHistory` (safe list from `order_status_events`, newest-first, cap 20) plus derived `latestDecisionAudit` from first operations event in history;
- store: `listOperationsOrderStatusHistoryByOrderId`, pure mappers in `operations-order-decision-history.ts`;
- UI: `OperationsOrderDecisionHistorySection` on Manual Review — title `История решений`, empty state `Решений пока нет`, shows status transition, reason, actor, date; replaced single latest-audit block in decision section;
- tests: updated `operations-order-review` (9), `operations-order-decision` (12), `operations-manual-review-ui` (9);
- QA passed: `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no new/live migration; no payment flow; no production handoff; no customer-facing `total_price` mutation; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Operations Workspace Status Filters & Decision Badges — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- API/read model: `OperationsWorkspaceOrder` now includes safe `domainStatus` mapped from admin summary; no new migration;
- UI: domain status badge per queue row (`OperationsDomainStatusBadge`), filter controls (Все / Проверка / Оплата / Отмена), filtered empty state, review navigation preserved;
- helpers: `src/shared/operations/workspaceFilters.ts` for frontend-side filtering;
- tests: updated `operations-workspace` (6), `operations-workspace-ui` (10);
- QA passed: `npm run test:operations-workspace`, `npm run test:operations-workspace-ui`, `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no payment flow; no production handoff; no customer-facing `total_price` mutation; no live migration apply; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Operations Review Decision Eligibility Guardrails — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- UI: `OperationsOrderDecisionSection` now renders read-only eligibility state when `reviewDecisionAllowed=false`; approve/reject controls hidden outside `Проверка`;
- copy: `getOperationsDecisionIneligibleMessage` — `Решение уже принято` for `Оплата`/`Отмена`, generic guard for other statuses;
- backend 409 protection unchanged;
- tests: updated `operations-manual-review-ui` (13);
- QA passed: `npm run test:operations-manual-review-ui`, `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no payment flow; no production handoff; no customer-facing `total_price` mutation; no live migration apply; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Operations Workspace Status Counts — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- UI: workspace filter buttons now show counts derived from loaded queue rows (`Все N`, `Проверка N`, etc.);
- helpers: `countOperationsWorkspaceByDomainStatus`, `formatOperationsDomainStatusFilterLabel` in `workspaceFilters.ts`;
- tests: updated `operations-workspace-ui` (11);
- QA passed: `npm run test:operations-workspace-ui`, `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no DB migration; no separate analytics endpoint; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Operations Decision Flow Contract Tests — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- tests: new `tests/operations-decision-flow-contract.test.ts` (5) covering workspace queue → manual review → approve/reject → audit/history readback, 409 guardrails, no production/total_price mutation;
- npm: `test:operations-decision-flow-contract` wired into `npm test`;
- QA passed: `npm run test:operations-decision-flow-contract`, `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no production code changes unless bug found; no payment flow; no live migration apply; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Operations Local Runbook Update — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- docs: extended `docs/production/vercel-deploy-runbook.md` §7 with Operations local workflow — env loading before `vercel dev`, stale port 3000 caveat, `SMOKE_BASE_URL`, safe order `RZ-20260706-7048`, decision actions local-only scope, `20260707_add_order_status_event_reason.sql` live migration caveat, P1-27/P1-28 non-closure;
- QA passed: `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no merge/push/PR; no live migration apply; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Customer Order Status Safe Read Model — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- API: `mapCustomerOrderStatus` maps internal `domain_status` to safe customer `status` DTO (`label`, `stage`, `description`, `nextStep`); raw `domainStatus` removed from customer order detail and workspace read models;
- mapping: `Проверка` → `На проверке`, `Оплата` → `Ожидает оплаты`, `Отмена` → `Отменён`;
- tests: updated `customer-order-detail` (9), `customer-workspace` (5), `customer-account` (10);
- QA passed: `npm run test:customer-order-detail`, `npm run test:customer-workspace`, `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no DB migration; no payment flow; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Customer Order Detail Status Timeline — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- UI: `CustomerOrderStatusTimeline` on customer order detail — current status, safe timeline steps, description and next-step copy;
- no internal audit/raw `order_status_events` exposure;
- tests: updated `customer-order-detail` (10);
- QA passed: `npm run test:customer-order-detail`, `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no payment flow; no internal reject reason exposure; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Customer Notification on Operations Decision — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- API: `createOperationsDecisionNotificationBestEffort` on successful `POST /api/operations/order-decision`; approve → «Заявка проверена» / «ожидает оплаты»; reject → «Заявка отменена» without internal audit reason;
- tests: updated `customer-notifications` (approve/reject), `operations-order-decision` (notification insert on approve POST);
- QA passed: `npm run test:customer-notifications`, `npm run test:operations-order-decision`, `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no email/push; no payment creation; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Customer Notification Bell / Unread Count — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- API: `GET /api/customer/notifications/unread-count` with ownership filter; `countUnreadCustomerNotificationsForUser` store helper;
- UI: `CustomerNotificationBellLink` in header with unread badge; `useCustomerNotificationUnreadCount` hook; mark-as-read compatibility preserved;
- tests: updated `customer-notifications` (unread count store/endpoint), `customer-notifications-ui` (bell/unread entry point);
- QA passed: `npm run test:customer-notifications`, `npm run test:customer-notifications-ui`, `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no realtime/polling; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Customer Decision Notification Contract Tests — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- tests: `tests/customer-decision-notification-contract.test.ts` — approve path, reject path, mark-read decreases unread count, second decision blocked (409);
- wired: `test:customer-decision-notification-contract` in `npm test`;
- QA passed: `npm run test:customer-decision-notification-contract`, `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no payment/production mutation; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Customer Local Workflow Runbook Update — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- docs: `docs/production/vercel-deploy-runbook.md` §8 customer platform local workflow — status mapping, decision→notification, unread bell, test commands, local-only caveats;
- QA passed: `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no live migration apply; no P1-27 closure; no P1-28 change; `.env.local` remains local;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Customer Change Request API Foundation — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- API: `POST /api/customer/change-request` enforces ownership and allows submissions only when `domain_status === Проверка`; order detail exposes `changeRequestAllowed`;
- policy: `isCustomerChangeRequestAllowedForDomainStatus` in `customer-change-request-policy.ts`;
- tests: updated `customer-change-request` (eligibility, 409 for `Отмена`);
- QA passed: `npm run test:customer-change-request`, `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no operations response workflow; no email/push beyond existing submit notification; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Customer Change Request UI — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- UI: order detail passes `changeRequestAllowed` from API; form/button only when eligible; ineligible copy `Изменения недоступны для текущего статуса заявки`;
- tests: updated `customer-change-request-ui` (eligibility, API-only, error state);
- QA passed: `npm run test:customer-change-request-ui`, `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no operations response UI; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Operations Change Request Readback — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- API: `GET /api/operations/order` includes safe `changeRequests` (message, status, createdAt, request type) newest-first;
- UI: `OperationsChangeRequestsSection` on manual review with empty state;
- tests: updated `operations-order-review`, `operations-manual-review-ui`;
- QA passed: `npm run test:operations-order-review`, `npm run test:operations-manual-review-ui`, `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no operations decision actions yet; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Operations Change Request Decision — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- API: `POST /api/operations/change-request-decision` with transitions `submitted|reviewed` → `reviewed|resolved|rejected`;
- UI: decision actions on `OperationsChangeRequestsSection`; reload review after success;
- tests: `tests/operations-change-request-decision.test.ts`, updated manual review UI tests;
- QA passed: `npm run test:operations-change-request-decision`, `npm run test:operations-manual-review-ui`, `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no customer notification on decision yet; no payment/production mutation; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Customer Notification on Change Request Decision — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- API: `createChangeRequestDecisionNotificationBestEffort` on successful operations change request decision;
- notifications: reviewed / resolved / rejected customer-safe copy via `order_updated`; no internal note leak;
- tests: updated `customer-notifications`, `operations-change-request-decision`;
- QA passed: `npm run test:customer-notifications`, `npm run test:operations-change-request-decision`, `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no email/push; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Customer Change Request Contract Tests — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- tests: `tests/customer-change-request-contract.test.ts` — submit, operations readback, decision, notification, unread count, non-owner blocked;
- wired: `test:customer-change-request-contract` in `npm test`;
- QA passed: `npm run test:customer-change-request-contract`, `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no payment/production mutation; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Change Request Local Runbook Update — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- docs: `docs/production/vercel-deploy-runbook.md` §9 change request local workflow;
- QA passed: `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`;
- explicit non-scope: no live migration apply; no P1-27 closure; no P1-28 change; `.env.local` remains local;
- branch-only evidence, not merged/main closure.

- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Payment Readiness Safe Domain Model — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- domain: `api/_shared/payment-readiness-domain.ts` — `awaiting_manual_confirmation` for `Оплата`, `confirmed` for `В работе`, transition guardrails;
- constants: `MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS = В работе` in `order-domain.ts`;
- DTO: `paymentState` on customer order detail; `paymentState` + `paymentConfirmationAllowed` on operations review;
- tests: `tests/payment-readiness-domain.test.ts`;
- explicit non-scope: no payment provider; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Customer Payment Instructions Block — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- UI: `CustomerPaymentInstructionsSection` on order detail when `paymentState === awaiting_manual_confirmation`;
- copy: verified / awaiting payment / manager contact; no payment button, card input, or provider link;
- tests: `tests/customer-payment-instructions-ui.test.ts`;
- explicit non-scope: no payment provider; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Operations Manual Payment Confirmation API — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- API: `POST /api/operations/payment-confirmation` — admin auth, `Оплата` → `В работе`, audit `operations:payment_confirm`;
- store: `operations-payment-confirmation-store.ts`; optional note in `order_status_events.reason`;
- lifecycle per RPES VII: manual confirmation only, no payment provider, no `total_price`/`production_export` mutation;
- tests: `tests/operations-payment-confirmation.test.ts`;
- explicit non-scope: no email/push in this task commit; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Operations Manual Payment Confirmation UI — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- UI: `OperationsPaymentConfirmationSection` in manual review; enabled when `paymentConfirmationAllowed`;
- API client: `operationsPaymentConfirmationApi.ts` → `POST /api/operations/payment-confirmation`;
- tests: updated `operations-manual-review-ui.test.ts`;
- explicit non-scope: no payment provider UI; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Customer Notification on Manual Payment Confirmation — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- notification: `createManualPaymentConfirmationNotificationBestEffort` on payment confirmation; type `order_updated`;
- copy: `Оплата подтверждена` / next-stage message; no internal note leak;
- tests: updated `customer-notifications`, `operations-payment-confirmation`;
- explicit non-scope: no email/push; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

- branch-only evidence, not merged/main closure.

Branch implementation evidence (2026-07-07, Manual Payment Flow Contract Tests — Local Foundation, `task/epic-b-projects-foundation`, not closure):

- branch local status: **done (QA PASS, local-only)**;
- tests: `tests/manual-payment-flow-contract.test.ts` — approve, awaiting payment, confirmation, notification, unread count, blocked outside Оплата;
- wired: `test:manual-payment-flow-contract` in `npm test`;
- explicit non-scope: no payment provider; no production mutation; no P1-27 closure; no P1-28 change;
- branch-only evidence, not merged/main closure.

Dependencies: `docs/specification/volume-07-customer-platform/README.md`, `docs/planning/accepted-backlog-decisions-v1.md`, `docs/planning/role-audit-reconciliation-v1.md`.

Do-not-touch constraints:

- do not invent auth/provider readiness;
- do not change customer auth UX or runtime routes in this task;
- do not mark customer-platform scope closed without merged/main decision evidence.

### P1-28 — Admin MVP Scope Boundary Reconciliation

Статус: needs reconciliation.

Why: RPES Volume VIII and accepted decisions define a minimal MVP admin scope, but open tasks such as `P2-09` and `P2-25` already point toward a broader operations platform without an explicit planning boundary.

Governance traceability note (2026-06-26 final pass): `accepted-backlog-decisions-v1.md` §18 reconciles §12 minimal admin floor with Release v1 Order Operations Workspace (RPES VIII). Extended tracks (`P2-09`, `P2-25`) remain open; this task stays `needs reconciliation` until merged/main boundary evidence closes the gap between floor and workspace scope.

Risk: admin work can drift from minimal MVP operations into unapproved extended workflow scope.

Owner: 01 Product / Planning Agent + 04 API / Orders Agent + 08 UX / Design System Agent.

Evidence needed:

- merged/main admin scope note distinguishing minimal MVP admin from later extended operations scope;
- mapping to `P2-09`, `P2-25`, `M9-P1-02`;
- explicit list of what is in MVP now versus deferred.

Dependencies: `docs/specification/volume-08-admin-platform/README.md`, `docs/planning/accepted-backlog-decisions-v1.md`, `docs/planning/role-audit-reconciliation-v1.md`.

Do-not-touch constraints:

- do not expand admin runtime scope in this task;
- do not close admin visual or production-editor tasks from docs-only reconciliation;
- do not change API/order semantics here.

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

### P2-26D — Active vs Legacy Visualization Ownership Map

Статус: needs reconciliation.

Why: the repo still contains active visualization in `src/static-pages/constructor/three/**` and older visualization in `src/configurator/three/**`, while the backlog has no dedicated ownership-mapping task for this documented duality.

Risk: future visualization fixes can reintroduce legacy dependencies into the active Constructor3D path or split evidence between old and new layers.

Owner: 06 Three.js / Visualization Agent + 01 Product / Planning Agent.

Evidence needed:

- merged/main ownership note for active vs legacy visualization layers;
- allowed import/dependency boundary map;
- linkage from this note to `P0-05`, `P0-06`, `P2-26A`, `P2-26B`, `P2-26C`.

Dependencies: `docs/specification/volume-03-visualization/README.md`, `docs/planning/accepted-backlog-decisions-v1.md`, `docs/planning/role-audit-reconciliation-v1.md`.

Implementation evidence note: local dependency audit confirms active runtime route `/configurator-3d` renders `src/static-pages/Constructor3DPage.tsx` and depends on `src/static-pages/constructor/three/**`, while `src/configurator/three/**` remains reachable only through isolated legacy `src/configurator/ConfiguratorPage.tsx` and legacy-oriented tests. Task remains open until this ownership map is documented on merged/main.

Do-not-touch constraints:

- do not refactor Three.js runtime in this task;
- do not change labels/markers/fallback behavior without accepted decision;
- do not use docs-only mapping as closure evidence for visual tasks.

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

Статус: superseded.

Owner: 08 UX/UI / Design System Agent + 04 API / Orders Agent.

Reason: this narrower VQA item is now management-wise covered by `P2-25 Admin Visual Consistency Pass` plus `P2-26` evidence tracking.

Do not run separately: keep admin visual scope under `P2-25`; keep VQA artifact/evidence under `P2-26`.

### TASK 08-UX-05 — Accessibility / Focus Visual Pass

Статус: superseded.

Owner: 08 UX / Design System Agent.

Reason: duplicate management scope of `P2-22 Accessibility / Focus Visual Pass`.

Do not run separately: use `P2-22` as the single active accessibility/focus visual task.

### TASK 08-UX-06 — Visual Regression / Cross-browser Device Coverage

Статус: superseded.

Owner: 08 UX/UI / Design System Agent + 05 Infrastructure / QA Agent.

Reason: combined management scope is already split more cleanly between `P2-20 Visual Regression Screenshot Suite` and `P2-21 Cross-browser / Device Visual QA Execution`.

Do not run separately: use `P2-20` for screenshot suite coverage and `P2-21` for browser/device execution and closure evidence.

### TASK 08-UX-07 — Design-system Inventory / Token Cleanup

Статус: open.

Owner: 08 UX / Design System Agent.

Reason: Dedicated design-system inventory not confirmed; Constructor3D CSS is layered hardening, not clean DS architecture.

Dependency note: run this after `P1-26`, so inventory/token cleanup follows the reconciled desktop-first design-system direction instead of an outdated mobile-first baseline.

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

Priority note: treat as `P1` / `M8-P1-02` release-gate work even while it remains grouped inside the shared API / Production / QA section.

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

Owner: 07 Production / Manufacturing Agent + 04 API / Orders Agent + 08 UX / Design System Agent.

Reason: Admin production review is partial: no per-panel, per-hole, hardware/SKU operation editing.

Dependency note: do not start implementation planning for this task before `P1-28` fixes the MVP admin boundary versus extended operations scope.

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
- Status: needs reconciliation
- Area: pricing
- Product-visible: yes
- Related existing task: P0-03, P0-13, PR #43 triage
- Acceptance summary: pricing source-of-truth plan and parity closure map must be documented and linked to `P0-03` / `P0-13`; this milestone line must not claim technical parity closure before those tasks close on merged/main evidence.
- Suggested agent: 03 Pricing Agent
- Accepted decisions note: use Q8 pricing source-of-truth rules and the PR #43 stale-branch decision.
- Follow-up evidence note: local branch `task/p0-03-pricing-source-lock` contains `a5263615`, `799b6f89` and `b433fa2e`, but merged/main verification for this planning/evidence pack is not verified in the current repository audit. Keep this milestone line out of `closed` state until the planning artifact itself is verified on `main`.

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
- Committed evidence note: `9e4a2f13` creates `docs/planning/constructor-state-ownership-contract-v1.md`. Status remains `open` because runtime-focused state-transition tests, payload tests, GitHub QA and main verification are still required.

#### M8-P0-03 — Three.js runtime stability and fallback readiness
- Status: open
- Area: visualization
- Product-visible: yes
- Related existing task: P0-05, P0-06, P1-10, P2-26A, P2-26B, P2-26C
- Acceptance summary: error boundary, loading state, camera reset, reduced-quality path and fallback UX verified without weakening existing WebGL fallback E2E.
- Suggested agent: 06 Three.js / Visualization Agent
- Accepted decisions note: fallback must remain a полноценный SVG/2D mode, not a degraded pseudo-preview.
- Committed evidence note: `d3f4eb06` (`feat: harden Three.js runtime recovery`) adds branch-only recovery contract — boundary error, load timeout and WebGL context lost map to full 2D fallback; explicit retry remount via `threeRecoveryAttempt`/`recoveryKey`; recovery handlers do not mutate committed constructor snapshot fields. Local tests: `constructorFlowSmoke.test.ts`, `threeSceneSafety.test.ts`.
- Local verification gate `2026-06-23` on branch `task/p0-05-threejs-stability`: source safety/flow tests pass; browser E2E `tests/browser/webgl-fallback.spec.ts` pass (10/10), including M8-P0-03 recovery controls (`Повторить 3D`, `Запустить упрощённое 3D`) and checkout-from-fallback path; `typecheck` and `build` pass.
- Status remains `open`: camera framing visual pass (`P2-26C`) `not verified`; explicit human visual review (`M8-P1-01`) `not verified`; GitHub QA/main verification `not verified`.

#### M8-P0-04 — Notification failure policy
- Status: closed with evidence
- Area: API / orders
- Product-visible: yes
- Related existing task: API Order Notification Failure Contracts
- Acceptance summary: manager/customer email failure policy chosen, tested, documented and aligned with order success semantics.
- Suggested agent: 04 API / Orders Agent
- Accepted decisions note: customer email failure keeps order success with logging; manager email failure keeps customer success and records `manager_notification_failed`; MVP retry is manual.
- Main evidence: PR #84 `fix: align notification failure policy` merged to `main`; merge baseline `af9fd2813bfc68014b852a0fdf6af4cfe9760237`.
- Changed files: `api/orders.ts`, `tests/checkout-submit-hook.test.ts`.
- QA before merge: `npm.cmd run test:checkout-submit-hook`, `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check`.
- Outcome: manager email failure no longer returns customer-facing `502` after saved order; customer email path continues after manager email failure; `manager_notification_failed` marker is observable through response/persisted email status/error; notification failure logs use generic safe markers instead of raw provider error details.
- Remaining out of scope: idempotency is now tracked as closed through `Duplicate Submit / Payload-match Idempotency`; manual retry remains open; automatic retry queue remains later; separate `order_status_events` notification event model remains out of scope.

#### M8-P0-05 — Duplicate submit and idempotency policy
- Status: closed with evidence
- Area: API / orders
- Product-visible: no
- Related existing task: Duplicate Submit / Payload-match Idempotency
- Acceptance summary: safe repeated submit behavior defined, duplicate notifications prevented, frontend 409/replay handling verified.
- Suggested agent: 04 API / Orders Agent
- Accepted decisions note: same payload replay returns the same order/result; different payload replay returns `409 conflict`.
- Closure evidence:
  - PR #92 `fix: implement M8-P0-05 idempotency policy` was squash-merged into `main`;
  - main includes `723a0351 fix: implement M8-P0-05 idempotency policy`;
  - implementation uses existing `orders.order_id` uniqueness plus canonical payload comparison for durable replay handling without schema migration;
  - same `Idempotency-Key` + same payload returns the same order/result and does not resend manager/customer notifications;
  - same `Idempotency-Key` + different payload returns `409 conflict`;
  - mismatched `Idempotency-Key` and `body.orderId` is rejected before persistence/notifications;
  - missing `Idempotency-Key` keeps existing safe behavior;
  - focused QA passed before merge: `npm.cmd run test:checkout-submit-hook`, `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check`;
  - GitHub checks were green before merge;
  - main verification passed after merge: local `main` fast-forwarded to `723a0351`, working tree clean.

#### M8-P1-02 — Live provider and Supabase persistence verification
- Status: open
- Area: Supabase / live providers
- Product-visible: no
- Related existing task: Live Provider / Supabase Order Flow Verification, P0-14
- Acceptance summary: production-like insert/read, RLS assumptions, safe email recipients and no-PII logging verified with evidence.
- Suggested agent: 05 Infrastructure / QA Agent
- Accepted decisions note: evaluate against accepted Supabase/runtime catalog, notification failure and no-PII decision layer.
- Fresh local evidence note (2026-06-30): current local release-audit shell had all required release env groups missing (`ALLOWED_ORIGINS`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ORDER_MANAGER_EMAIL`, `ADMIN_API_KEY`, `ADMIN_PASSWORD_HASH`, frontend release vars), so live-provider/public-release readiness remains `not verified` and this gate stays open.

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
- Status: closed with evidence
- Area: CI/CD / deploy
- Product-visible: no
- Related existing task: P1-22, QA Release Maturity Matrix
- Acceptance summary: preview/production deploy smoke path documented and executed after main merge; deployment evidence linked without treating dashboard status alone as product QA.
- Closure evidence:
  - post-deploy verification was completed after merge PR #90 into `main`;
  - verified `main` commit: `0e97d4e5 docs: record M8-P1-03 pii logging evidence`;
  - Vercel latest Production deployment for `main` commit `0e97d4e5` was confirmed as `Ready / Latest`;
  - environment was confirmed as `Production / Current`;
  - build/deployment logs showed completed deployment, build, and cache upload;
  - live smoke `/configurator` was executed: the page opened, the constructor loaded, the UI was visible, and the scene showed `3D готово`;
  - verification did not require reading or disclosing secrets or env values;
  - dashboard status was not used as the only signal and was supplemented by live smoke `/configurator`;
  - no runtime, test, package, workflow, API, pricing, Supabase, or order-flow changes were made for this closure update.
- Suggested agent: 05 Infrastructure / QA Agent

#### M8-P1-05 — MVP release candidate checklist
- Status: open
- Area: release readiness
- Product-visible: yes
- Related existing task: QA Release Maturity Matrix, P1-21, P2-26
- Acceptance summary: one end-to-end release candidate pass covers landing to constructor to order persistence to notifications, with manual and automated evidence.
- Suggested agent: 01 Product / Planning Agent
- Fresh local evidence note (2026-06-30): `npm.cmd run qa:mvp-local`, `npm.cmd run test:pricing-engine`, `npm.cmd run test:pricing-final`, `npm.cmd run test:production-export` and `npm.cmd run qa:css-performance` passed locally or returned warning-only inventory; this supports `Local MVP Demo` readiness only and does not close public-release gates without fresh visual review, live-provider verification and merged/main evidence.

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
- Related existing task: P2-25, P2-09
- Acceptance summary: real order list/detail, status change, manager notes, auth hardening and basic audit trail are usable for MVP operations.
- Suggested agent: 04 API / Orders Agent
- Committed evidence note: `020ba133` adds a safe admin order summary baseline, and `b433fa2e` aligns admin pricing semantics with persisted stored snapshot fields. This is partial evidence only; status change, manager notes, auth hardening and audit trail closure evidence are still `not verified`.

#### M9-P1-03 — Email retry and failure queue
- Status: open
- Area: notifications
- Product-visible: yes
- Related existing task: API Order Notification Failure Contracts
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
- Related existing task: P2-20, P2-21
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
- Related existing task: P2-22
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
- Implementation evidence note: repo-wide dependency audit found zero in-repo importers for `src/Landing.tsx`, `src/StaticDesignPages.tsx`, `src/constructor/api.ts`, `src/constructor/analytics.ts`, `src/constructor/store.ts`, `src/constructor/quickEstimate.ts`, `src/constructor/production/index.ts`, `src/constructor/production/exportPackage.ts` and `src/constructor/basis/manualExport.ts`; legacy-removal planning should start from this confirmed set instead of creating a duplicate cleanup task, but zero in-repo imports alone do not prove safe deletion until manual/external entry points, config references and documentation links are checked.
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
