# Role Audit Reconciliation — v1

## Purpose

Этот отчёт сводит findings из role-based audits в единый reconciliation слой между RPES, operational backlog baseline и текущим состоянием репозитория.

Документ является findings-only артефактом. Он не закрывает ни одну backlog-задачу сам по себе, не заменяет merged/main evidence и не является release/QA closure evidence.

## Sources Reviewed

- `docs/specification/**`
- `docs/planning/current-backlog.md`
- `docs/audits/role-audits/**`

## Executive Summary

Главный вывод: в проекте уже есть сильный planning и technical foundation, но между RPES, backlog и implementation остаются несколько cross-role reconciliation gaps, которые нельзя закрывать audit docs alone.

Основные findings:

- RPES уже является primary Source of Truth, но часть томов ещё выглядит как draft/foundation layer, поэтому backlog и implementation требуют явного reconciliation, а не implicit interpretation.
- Pricing остаётся самым чувствительным source-of-truth конфликтом: accepted decision требует `Supabase/runtime catalog` как primary MVP source, тогда как backlog и audits всё ещё фиксируют ambiguity и open parity evidence.
- Constructor3D закреплён как active path, но state ownership contract и legacy boundary simplification ещё не доведены до отдельного explicit документа; свежий dependency audit также подтвердил, что active submit chain всё ещё зависит от legacy layout typing transitively through `src/shared/lib/order.ts -> src/configurator/model/compartments.ts`.
- Customer platform scope в RPES шире, чем явно подтверждённая current implementation surface в role audits.
- Production/manufacturing слой уже богат по коду и тестам, но evidence around active v3 golden snapshots и full manufacturing lock остаётся неполным.
- UX/design-system слой содержит документный drift: `docs/design-system/**` формулирует mobile-first направление, а accepted decisions фиксируют desktop/website-first current scope.
- Admin/order workflow scope требует отдельного product decision pass: admin уже существует как implementation surface, но release/MVP operational boundary ещё не полностью стабилизирована.
- Maximum release audit currently supports `Local MVP Demo` readiness only; `Public MVP Release` remains blocked until live provider / Supabase verification, fresh visual review and merged/main closure evidence are recorded.
- Zero-import cleanup candidates are useful for planning, but zero in-repo imports alone are not deletion evidence until manual/external entry points, config references and documentation links are checked.

## Cross-role Conflicts

### 1. RPES draft depth vs backlog execution detail

- Conflict: RPES уже primary SoT, но часть томов выглядит как draft/scaffold, тогда как backlog содержит более детальные execution tracks и closure wording.
- Impact: роли могут по-разному трактовать, где решение уже принято на уровне RPES, а где ещё нужен explicit planning decision.
- Owner: `01 Product / Planning Agent`
- Recommended resolution: сделать RPES-to-backlog crosswalk по open P0/P1/M8 задачам и пометить для каждого блока `accepted`, `open`, `conflict`, `not verified`.
- Evidence required: merged/main planning doc with crosswalk and explicit reconciliation notes.

### 2. RPES vs implementation on pricing source of truth

- Conflict: accepted decision и RPES pricing direction требуют primary `Supabase/runtime catalog`, while audits and backlog still фиксируют duality `Supabase/runtime catalog` vs `seed fallback`.
- Impact: риск client/server/stored snapshot drift и ambiguity в admin/ops interpretation цены.
- Owner: `03 Pricing Agent` + `01 Product / Planning Agent`
- Recommended resolution: выпустить planning/source-lock doc, который фиксирует authoritative source order, fallback semantics, client preview status и admin reporting semantics без изменения backlog status.
- Evidence required: merged/main source-lock doc plus parity evidence pack linked from backlog task scope.

### 3. RPES vs implementation on customer platform scope

- Conflict: RPES том VII описывает auth, cabinet, projects, orders and post-submit continuity, а role audit не подтвердил сопоставимый явный UI surface в текущем `src` inventory.
- Impact: product promise может оказаться шире, чем реально подтверждённая implementation surface.
- Owner: `01 Product / Planning Agent` + `04 API / Orders Agent`
- Recommended resolution: принять explicit scope decision: full MVP customer platform, partial implementation, or deferred track with narrowed release wording.
- Evidence required: merged/main scope decision doc and implementation inventory linked to current backlog.

### 4. Design-system mobile-first vs accepted desktop-first direction

- Conflict: `docs/design-system/README.md` декларирует mobile-first, а accepted decisions фиксируют current implementation focus as desktop / website first and postpone mobile redesign.
- Impact: UX/UI role может принимать conflicting design decisions, особенно для constructor shell, stepper и fallback layout.
- Owner: `08 UX/UI / Design System Agent` + `01 Product / Planning Agent`
- Recommended resolution: выпустить reconciliation doc for visual/design-system direction and align all active DS docs to accepted desktop-first scope.
- Evidence required: merged/main docs reconciliation with explicit wording update and no ambiguity across active planning/design docs.

### 5. Production/manufacturing scope vs current evidence

- Conflict: RPES V и accepted decisions задают сильный production model direction, но backlog explicitly keeps active v3 golden snapshots, HDF reconciliation, edge banding lock and deeper manufacturing validation open.
- Impact: local code/test richness может быть ошибочно воспринята как production-readiness evidence.
- Owner: `07 Production / Manufacturing Agent` + `05 Infrastructure / QA Agent`
- Recommended resolution: сначала зафиксировать active v3 snapshot scope, затем строить closure evidence только вокруг active runtime path.
- Evidence required: merged/main snapshot scope decision, golden snapshot artifacts, tests and backlog-linked verification.

### 6. Pricing source-of-truth ambiguity vs release gate

- Conflict: release gate требует pricing parity, но pricing role audit и backlog сохраняют open ambiguity around parity closure and authoritative source behavior.
- Impact: pricing remains a release blocker candidate until quote/order/stored snapshot parity is explicitly proven.
- Owner: `03 Pricing Agent`
- Recommended resolution: split doc reconciliation from runtime changes; first lock planning/source map, then complete remaining parity evidence.
- Evidence required: main parity evidence across quote, order, stored snapshot and admin summary.

### 7. Admin/order workflow scope drift

- Conflict: admin already has APIs, pages and backlog tracks, but accepted decision defines only minimal MVP admin scope, while later backlog work expands visual consistency and operation editor directions.
- Impact: scope creep risk between internal admin foundation and broader operations platform.
- Owner: `01 Product / Planning Agent` + `04 API / Orders Agent`
- Recommended resolution: принять explicit admin scope decision for MVP: minimal operations only, or extended operator workflow with its own backlog track.
- Evidence required: merged/main admin scope note with mapping to P2-09, P2-25 and related API/admin tasks.

## Consolidated Gap Matrix

| Gap ID | Area | Related role audit | Related backlog task | Severity | Recommended next action | Runtime change required? yes/no |
|---|---|---|---|---|---|---|
| RAR-001 | RPES/backlog reconciliation | 01 Product / Planning | P0-07, M8-P1-05 | P0 | Create RPES-to-backlog crosswalk and conflict register | no |
| RAR-002 | Pricing source lock | 03 Pricing | P0-03, P0-13, M8-P0-01 | P0 | Write pricing source-of-truth lock doc before further parity claims | no |
| RAR-003 | Constructor state ownership | 02 Constructor | P0-02, M8-P0-02 | P0 | Create explicit state ownership contract doc | no |
| RAR-004 | Live provider / Supabase verification | 04 API / Orders, 05 Infra / QA | Live Provider / Supabase Order Flow Verification, M8-P1-02 | P1 | Prepare live verification plan and evidence format; public release stays blocked until this evidence exists on merged/main | no |
| RAR-005 | Design-system direction drift | 08 UX / Design System | P1-21, P2-21, TASK 08-UX-07 | P1 | Reconcile mobile-first doc wording with accepted desktop-first direction | no |
| RAR-006 | Customer platform scope gap | 04 API / Orders | customer platform-related open scope, M10-P2-09 adjacency | P1 | Record explicit MVP customer platform scope decision | no |
| RAR-007 | Production evidence gap | 07 Production / Manufacturing | P1-11A, P1-11B, P1-23, P1-24, M9-P1-09 | P1 | Fix snapshot scope decision before any closure attempt | no |
| RAR-008 | Admin workflow scope drift | 04 API / Orders, 08 UX / Design System | P2-09, P2-25, TASK 08-UX-04 | P1 | Record admin MVP vs extended operations boundary | no |
| RAR-009 | Visual execution evidence gap | 08 UX / Design System, 05 Infra / QA, 06 Three.js | P2-20, P2-21, P2-26, M8-P1-01 | P1 | Execute screenshot matrix with human review; `Local MVP Demo` readiness does not close public release without this layer | yes |
| RAR-010 | Visualization layer duality | 06 Three.js / Visualization | P2-26A, P2-26B, P2-26C, M8-P0-03, P2-26D, M10-P2-07 | P2 | Document active vs legacy visualization ownership before deeper runtime changes and treat zero-import modules only as cleanup candidates until manual/external entry verification is done | no |

## P0 / P1 / P2 Reclassification Suggestions

Эти suggestions не меняют `current-backlog.md`; они только предлагают дальнейший planning review.

- `RAR-001` should remain `P0`.
  Reason: без reconciliation between RPES and backlog остальные role fixes будут трактоваться неравномерно.

- `RAR-002` should remain `P0`.
  Reason: pricing SoT ambiguity напрямую касается release gate and exact-price promise.

- `RAR-003` should remain `P0`.
  Reason: constructor state ownership является центральным contract gap for active Constructor3D.

- `RAR-004` should remain `P1`, not `P0`.
  Reason: это evidence/verification blocker, но safer to approach after planning/source/ownership docs are locked.

- `RAR-005` should remain `P1`.
  Reason: это не runtime emergency, но high-value planning conflict that can misdirect visual work.

- `RAR-006` should remain `P1` and may need split.
  Suggested split:
  `scope decision` as docs-only planning task;
  `implementation gap` as separate runtime task if scope remains in MVP.

- `RAR-007` should remain `P1`.
  Reason: manufacturing evidence is important, but safest after pricing/planning/verification foundation.

- `RAR-008` should remain `P1` and may need split.
  Suggested split:
  `admin MVP boundary decision`;
  `admin workflow expansion` if explicitly accepted.

- `RAR-009` should stay `P1` for execution readiness, while `P2-20` screenshot suite and broader polish may remain `P2`.

- `RAR-010` should remain `P2`.
  Reason: ownership mapping can be documented now, but runtime consolidation is not first safe move.

## Recommended Next Execution Order

1. Planning reconciliation docs
2. Pricing source-of-truth lock
3. Constructor state ownership contract
4. Live provider / Supabase verification
5. Visual QA execution
6. Production v3 snapshot scope
7. Customer platform scope decision
8. Admin workflow scope decision

## Do Not Close Yet

These tasks must not be closed based on audit docs alone:

- `P0-03 Pricing Engine Validation`
- `P0-13 Pricing Golden Fixtures & Parity`
- `P0-02 Constructor State Model Stabilization`
- `Live Provider / Supabase Order Flow Verification`
- `P2-20 Visual Regression Screenshot Suite`
- `P2-21 Cross-browser / Device Visual QA Execution`
- `P1-11A Resolve Production Golden Snapshot Scope`
- `P1-11B Production v3 Golden Snapshots`
- `P1-23 HDF Thickness Reconciliation`
- `P1-24 Edge Banding Policy Lock`
- `P2-09 Admin Operation Editor`
- `P2-25 Admin Visual Consistency Pass`
- `TASK 08-UX-06 Visual Regression / Cross-browser Device Coverage`

## Next Agent Prompts

### 1. Planning reconciliation docs

Сделай docs-only reconciliation pass между `docs/specification/**`, `docs/planning/current-backlog.md`, `docs/planning/accepted-backlog-decisions-v1.md` и active planning/design docs. Не меняй runtime code и не закрывай tasks. Зафиксируй только confirmed conflicts, proposed wording changes и evidence requirements.

Обращаться к агенту: 01 Product / Planning Agent

### 2. Pricing source-of-truth lock

Сделай docs-only source-of-truth lock для pricing: определи authoritative order of sources, fallback semantics, client preview status, server-authoritative path и admin reporting semantics на основании RPES и accepted decisions. Не меняй pricing code, API, tests или backlog status.

Обращаться к агенту: 03 Pricing Agent

### 3. Constructor state ownership contract

Сделай docs-only state ownership contract для active Constructor3D: зафиксируй ownership и boundaries для `sceneRenderMode`, exact/advanced flags, selected entity bridge, snapshot/payload boundary и active vs legacy state layers. Не меняй runtime code и не закрывай tasks.

Обращаться к агенту: 02 Constructor Agent
