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

Required sub-work:

- PR #43 triage: rebase/fix/continue or replace;
- golden pricing fixtures in main;
- material-aware client/server parity;
- delivery/assembly pricing matrix;
- quote/order/stored price snapshot parity;
- API server-authoritative price boundary verification.

Do not close until final tests are merged and verified on main.

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

Audit reconciliation: P0-16 remains open. Current main appears to implement full manual reset behavior, while older docs described preserving checkout/step. The reset contract must be explicitly reconciled and verified.

Implementation/reconciliation note: current code and focused tests now align on full manual reset to `constructorInitialState`, including checkout/contact/delivery/assembly/consent/transient state reset, while submit success keeps the model/configuration available. This is evidence candidate only; P0-16 remains open until PR review, GitHub QA success, main verification and final backlog evidence.

Closure condition:

- reset contract documented;
- manual reset behavior verified;
- submit-success no-reset rule verified;
- relevant reset/store tests pass;
- typecheck/build pass;
- GitHub QA success;
- backlog updated with evidence.

Do not mix with P2 visual QA work.

### P0-17 Constructor Smoke Test Stabilization

Статус: open.

Источник: `docs/constructor/reset-contract-verification-report-v1.md`.

Зачем: привести smoke test к выбранному reset contract.

Риск: smoke test будет либо падать без продуктовой причины, либо перестанет защищать critical constructor flow.

Reconciliation note: в репозитории не найден completion/fix report, подтверждающий закрытие P0-17. Последний найденный verification report фиксирует, что P0-17 не закрыта и зависит от P0-16.

Audit reconciliation: P0-17 remains open until current-main smoke/store/reset evidence is tied to the accepted reset contract from P0-16.

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

Closure condition:

- PR #52 or replacement merged;
- PR/body/docs wording matches actual duplicate contract;
- customer email failure tested;
- manager email failure policy documented;
- PII-safe logging tests merged;
- GitHub QA success;
- main verification.

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

### Manager Notification Failure Policy

Статус: open.

Owner: 04 API / Orders Agent + 01 Product / Planning Agent.

Reason: If order persistence succeeds but manager notification fails, the product/API contract must define whether the order is successful, warning, failed, or queued for retry.

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

### P1-24 — Edge Banding Policy Lock

Статус: open.

Owner: 07 Production / Manufacturing Agent.

Reason: Factory profile says edgeAllSides, while implementation often uses front-only body edge.

Closure condition:

- body/shelf/facade/drawer edge policy documented;
- implementation aligned;
- tests fail if required sides are missing;
- edge length totals verified.

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

### P2-26B — WebGL Fallback Visual Layout Pass

Статус: open.

Owner: 06 Three.js / Visualization Agent + 08 UX/UI / Design System Agent.

Reason: VQA-005 open and VQA-006 visible/open; fallback layout crowded/clipped.

Closure condition:

- desktop/mobile fallback screenshots show preview/status/actions separated;
- CTA/chips do not overlay drawing;
- P1-10 functional fallback remains green.

### P2-26C — Scene Framing / Camera Fit Pass

Статус: open.

Owner: 06 Three.js / Visualization Agent.

Reason: VQA-009 remains open; desktop/laptop scene composition unbalanced.

Closure condition:

- balanced model framing across viewports;
- no critical model/dimension clipping;
- camera modes usable;
- fresh artifact confirms.

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

Статус: open.

Owner: 05 Infrastructure / QA Agent.

Reason: release readiness needs explicit QA policy for manual visual QA, Chromium-only screenshots, live provider/env verification and coverage upgrades.

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
