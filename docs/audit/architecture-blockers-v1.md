# Architecture Blockers v1 — Размерно

Статус: COMPLETED.
Дата: 2026-06-14.
Роль: Architect Agent.

## 0. Scope

Документ фиксирует блокеры для запуска основных ролей.

Runtime не изменялся.

## 1. Global blockers

### GB-01 — Constructor3D guard not fully accepted

Status:

Script exists:

```txt
scripts/check-constructor3d-architecture.mjs
```

But:

- `package.json` script is not connected;
- guard has not been run;
- typecheck has not been run after guard addition.

Impact:

Blocks behavior-changing runtime work.

Owner:

Architect Agent / local safe patch.

### GB-02 — Legacy test ownership unknown

Status:

Legacy inventory exists, but QA classification of tests does not.

Impact:

Blocks legacy deletion and makes migration risky.

Owner:

QA Agent.

### GB-03 — Pricing source-of-truth not confirmed

Status:

Active pricing exists, but legacy `calculatePrice` wrapper still exists.

Impact:

Blocks pricing implementation and checkout final hardening.

Owner:

Pricing Agent.

### GB-04 — State source-of-truth not confirmed

Status:

Active constructor store exists, but root surface remains broad and legacy state still exists.

Impact:

Blocks checkout implementation and large constructor state refactor.

Owner:

Constructor Core Agent.

## 2. Constructor Core Agent blockers

Blocked by:

1. `check:constructor3d-guard` not connected/run.
2. Active state source-of-truth not documented by Constructor Core Agent.
3. Legacy layout concepts overlap with active zone/filling concepts.
4. `useConstructorPageState` remains broad.

Allowed before blockers cleared:

- docs/audit-only state source-of-truth audit;
- decomposition plan;
- selector map.

Not allowed:

- behavior-changing store refactor;
- checkout state changes;
- pricing changes.

## 3. Three.js Agent blockers

Blocked by:

1. Guard not run to enforce Three layer side-effect boundaries.
2. Active scene/fallback stability not audited.
3. Legacy Three tests not mapped to active coverage.

Allowed before blockers cleared:

- docs/audit-only Three.js stability audit;
- fallback contract review.

Not allowed:

- deep visual rewrite;
- store refactor;
- pricing/checkout changes.

## 4. Pricing Agent blockers

Blocked by:

1. Legacy pricing wrapper still exists.
2. Pricing source-of-truth audit not complete.
3. Production cost coupling not mapped.

Allowed before blockers cleared:

- pricing source-of-truth audit;
- test matrix planning.

Not allowed:

- formula changes;
- production cost changes;
- UI price display changes without Checkout/Constructor alignment.

## 5. Checkout Agent blockers

Blocked by:

1. State source-of-truth not confirmed.
2. Pricing source-of-truth not confirmed.
3. Order payload contract needs isolated review.
4. Guard not fully accepted.

Allowed before blockers cleared:

- checkout contract audit;
- PII boundary audit.

Not allowed:

- submit flow behavior changes;
- API contract changes;
- Supabase/RLS changes;
- pricing formula changes.

## 6. Production Agent blockers

Blocked by:

1. Pricing boundaries unclear.
2. Production/client UI boundary needs audit.
3. Manufacturing warnings need classification.
4. Basis automation is post-MVP/not immediate.

Allowed before blockers cleared:

- production model audit;
- warnings classification;
- Basis JSON readiness review.

Not allowed:

- automatic `.b3d` generation;
- customer-visible production complexity;
- cost formula changes without Pricing Agent alignment.

## 7. QA Agent blockers

Blocked by:

1. Package scripts are overloaded with historical stages.
2. `check:constructor3d-guard` not connected.
3. Legacy tests not classified.

Allowed immediately:

- QA command map;
- legacy test ownership map;
- guard run locally after script hookup.

Not allowed:

- deleting tests before ownership map;
- changing runtime to satisfy old checks;
- rewriting package scripts wholesale.

## 8. Documentation Agent blockers

Blocked by:

1. Some architecture docs now exist but need index/navigation.
2. Planning docs may conflict with older stage numbering.
3. Handoff docs need final accepted guard status.

Allowed immediately:

- docs index update;
- docs navigation;
- handoff consolidation.

Not allowed:

- changing architecture decisions without Architect review;
- treating docs-only plans as completed implementation.

## 9. Recommended unblock sequence

1. Safely add package script:

```json
"check:constructor3d-guard": "node scripts/check-constructor3d-architecture.mjs"
```

2. Run:

```bash
npm run check:constructor3d-guard
npm run typecheck
```

3. QA Agent creates command map and legacy test ownership map.
4. Constructor Core Agent starts state source-of-truth audit.
5. Pricing Agent starts pricing source-of-truth audit.
6. Three.js Agent starts stability audit.
7. Checkout/Production implementation waits for state/pricing boundaries.

## 10. Architect decision

Docs/audit branches can continue.

Behavior-changing implementation branches should wait until guard is connected and reviewed.
