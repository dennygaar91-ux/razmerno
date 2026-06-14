# Architecture Critical Path Review v1 — Размерно

Статус: READY.

Дата: 2026-06-14.

Роль автора: Architect Agent.

## 0. Назначение

Документ фиксирует архитектурный порядок запуска основных ролей после текущей подготовки.

Он не выполняет задачи этих ролей.

Он определяет:

- что блокирует запуск;
- что можно делать параллельно;
- что нельзя запускать до guard/inventory;
- какие handoff-документы нужны.

## 1. Current architecture status

### Завершено

- Architecture Gap Analysis.
- Architecture Boundaries.
- Architecture Guard docs-only phase.
- Constructor3D Guard Implementation Task brief.
- Legacy Migration Master Plan.
- Architect Agent Master Roadmap.
- Handoff Packages for 5 roles.

### Не завершено

- Constructor3D guard implementation.
- Legacy inventory.
- Full dependency graph.
- QA command map.

## 2. Главный P0-блокер

До начала runtime-задач других ролей необходимо реализовать:

```txt
check:constructor3d-guard
```

Причина:

пока active Constructor3D не защищён от:

- legacy imports;
- direct pricing bypass;
- direct checkout/API bypass;
- Three.js → pricing/checkout leakage;
- store → API/Supabase leakage.

## 3. Critical path

### Step 1 — Architect Agent

Constructor3D Guard Implementation.

Цель:

- scripts-only guard;
- no runtime changes;
- package script `check:constructor3d-guard`.

Gate:

- guard passes.

---

### Step 2 — Architect Agent

Legacy Architecture Inventory.

Цель:

- classify `src/configurator/**`;
- identify tests/scripts/routes/bridge dependencies;
- no deletion.

Gate:

- legacy inventory accepted.

---

### Step 3 — Architect Agent

Full Architecture Dependency Graph.

Цель:

- map Constructor3D / Pricing / Checkout / Production / Admin / API / Supabase / Legacy.

Gate:

- blockers known.

---

### Step 4 — Constructor Core Agent

Constructor Core State Audit.

Цель:

- source-of-truth state audit;
- `useConstructorPageState` split plan;
- selector/domain map.

Gate:

- no behavior-changing state refactor until audit accepted.

---

### Step 5 — Pricing Agent

Pricing Source-of-Truth Audit.

Цель:

- confirm exact price path;
- identify legacy pricing helpers;
- prevent client/server mismatch.

Gate:

- pricing source-of-truth accepted.

---

### Step 6 — Three.js Agent

Three.js Stability Audit.

Цель:

- WebGL/fallback stability;
- scene adapter responsibility;
- runtime error handling.

Gate:

- no deep visual rewrite before stability baseline.

---

### Step 7 — Checkout Agent

Checkout Contract Audit.

Цель:

- submit path;
- required fields;
- PII boundaries;
- success/cooldown behavior.

Gate:

- state and pricing boundaries confirmed.

---

### Step 8 — Production Agent

Production Model Audit.

Цель:

- production model ownership;
- hardware/drilling/warnings;
- client-visible vs admin-only boundaries.

Gate:

- no production cost changes without Pricing Agent alignment.

## 4. Parallelization matrix

## 4.1 Can run after guard passes

Can run in parallel as docs/audit-only:

- Constructor Core state audit;
- Pricing source-of-truth audit;
- Three.js stability audit;
- Production model audit;
- QA command map.

## 4.2 Must not run in parallel

Do not run together:

- Constructor state implementation + Checkout implementation;
- Pricing formula changes + Production cost changes;
- Three.js architecture refactor + Constructor state refactor;
- Legacy removal + test migration;
- global CSS cleanup + Constructor UI changes.

## 5. Role blockers

### Constructor Core Agent blockers

Blocked by:

- missing Constructor3D guard;
- missing legacy inventory;
- unclear state source-of-truth.

### Pricing Agent blockers

Blocked by:

- active guard missing direct pricing bypass checks;
- legacy pricing paths not inventoried.

### Three.js Agent blockers

Blocked by:

- guard missing Three layer side-effect checks;
- risk of mixing scene work with state/checkout changes.

### Checkout Agent blockers

Blocked by:

- state boundary not confirmed;
- pricing source-of-truth not confirmed.

### Production Agent blockers

Blocked by:

- pricing boundaries unclear;
- production/client UI boundary not fully mapped.

## 6. Recommended immediate next action

Immediate next action:

```txt
Architect Agent — Constructor3D Guard Implementation
```

Use:

```txt
docs/planning/agent-task-constructor3d-guard-implementation-v1.md
```

Do not start runtime implementation branches before this guard is implemented and accepted.

## 7. Architecture decision

The five role handoffs are ready, but execution should wait for guard implementation unless the role is performing docs/audit-only work.

Runtime implementation must wait.
