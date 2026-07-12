# Local vs Formal Closure Governance

**Status:** active planning/governance policy  
**Version:** 1.0  
**Date:** 2026-07-12  
**Branch evidence baseline:** `task/epic-b-projects-foundation` @ `1f57af35`

## 1. Purpose

Define a two-level closure model so local development can honestly record completed work **without** falsely claiming release readiness, merge/main closure, or full RPES compliance.

## 2. Why this model exists

Package 12 consolidation and the full-project audit showed the primary gap is **governance/state mismatch**: implementation and local evidence often exist on the branch, while backlog and legacy closure language still require merge/main/PR workflow for any "closed" wording.

Local development must be able to close tasks for the **current branch scope** when local evidence passes. Formal release integration remains a **separate milestone**.

## 3. Status taxonomy

| Status | Meaning |
|--------|---------|
| **Planned** | Scoped in backlog/RPES; no implementation started on current branch. |
| **In Progress** | Active implementation on current branch; local evidence incomplete. |
| **Implemented — Local** | Code exists on current branch; focused local evidence not yet collected or not yet passing. |
| **Verified — Local** | Implementation covered by focused tests/local checks; not yet **Closed — Local** or has explicit local caveats. |
| **Verified — Live** | An approved read-only (or explicitly approved) live verification passed for a specific check. Does **not** imply release readiness. |
| **Closed — Local** | Task complete for current local development scope with passing local evidence and no undeclared gaps inside agreed local scope. |
| **Closed — Formal** | Task passed formal workflow: merge/main (or release baseline), CI/GitHub QA where used, remote preview/deploy if frontend/runtime affected, live smoke if required, human visual approval for visual scope, release owner acceptance. |
| **Deferred by User** | User explicitly deferred; not failed and not closed. |
| **Blocked** | Cannot proceed without external decision, env, or dependency. |
| **Out of Scope for MVP** | Explicitly excluded from MVP by accepted decisions. |

**Formal Pending** is shorthand in backlog notes: formal closure not performed; not a separate lifecycle state.

## 4. Local closure criteria

A task may be marked **Closed — Local** only when **all applicable** criteria pass:

1. Implementation exists on the current branch.
2. Task-specific tests pass.
3. `npm test` passes.
4. `npm run typecheck` passes.
5. `npm run typecheck:api` passes.
6. `npm run build` passes.
7. `git diff --check` passes.
8. Tracked tree is clean after intended commits.
9. Evidence is linked (test name, script, artifact path, commit).
10. No known local acceptance gaps remain inside the agreed local scope.
11. Deferred gaps are explicitly listed separately.

**Visual/UX tasks:** require human visual approval for **Closed — Local**, unless explicitly **Deferred by User**.

**Live/data/security tasks:** may include read-only live verification when explicitly approved and relevant (e.g. `order_status_events` RLS probe).

## 5. Formal closure criteria

**Closed — Formal** requires relevant formal gates:

- Merge/main or release-baseline integration
- CI/GitHub QA if used
- Remote Vercel preview verification if frontend/runtime is affected
- Live smoke verification if live behavior is required beyond scoped live checks
- Human visual approval for visual/UX scope
- Backlog/RPES reconciliation where product scope changed
- Release owner acceptance

Formal closure is a **separate milestone** and must **not** block local development or **Closed — Local**.

## 6. Evidence types

| Type | Description |
|------|-------------|
| Static/code evidence | File paths, migrations, API routes |
| Local-unit/integration tested | `npm test`, focused test scripts |
| Local-contract verified | Boundary/parity contract tests |
| Local-RC verified | `check:release-candidate-local --execute` with `closureClaimed: false` |
| Live-verified | Approved read-only live probe PASS |
| Documented only | Planning text without runtime proof |
| Main-merged evidence | Commit on `main` + CI (formal layer) |

## 7. How to represent backlog item state

Use a consistent block in `current-backlog.md`:

```text
Local status:
Formal status:
Evidence:
Deferred gaps:
Formal closure blockers:
```

- **Closed — Local** does not remove **Formal Pending**.
- Legacy single-field `Статус: open` may remain for historical scan; Package 13+ items should use dual fields.

## 8. How to represent RPES compliance

| Term | Meaning |
|------|---------|
| **MVP-local compliant** | Current branch implementation + tests satisfy MVP subset; deferrals documented |
| **Partially compliant** | Some RPES requirements met; gaps or deferrals remain |
| **Deferred accepted gap** | Accepted decision or user deferral overrides RPES item for MVP |
| **Future formal workflow** | Requires merge/deploy/live/visual formal gates |
| **Non-compliant** | Requirement in scope, not implemented, not deferred |
| **Unclear / evidence missing** | Cannot classify from repo evidence |

**Closed — Local** is not RPES full compliance. Formal RPES alignment may require **Closed — Formal** and explicit reconciliation (`docs/planning/rpes-local-formal-reconciliation.md`).

## 9. Examples from current project

### order_status_events RLS

- **localStatus:** Verified — Live; **Closed — Local** eligible  
- **formalStatus:** Formal Pending  
- **Evidence:** `npm run verify:order-status-events-rls-live` PASS; anon `[]`; service_role 200; `liveMutationPerformed: false`  
- **Note:** Does not close full M8-P1-02 live provider verification

### P0-03 / P0-13 pricing

- **localStatus:** Closed — Local eligible (local-contract verified)  
- **formalStatus:** Formal Pending  
- **Evidence:** `test:pricing-parity-contract`, `test:pricing-final-branch-verification-contract`, `test:checkout-submit-hook`

### P1-11A / P1-11B production

- **localStatus:** Closed — Local eligible (local-contract verified)  
- **formalStatus:** Formal Pending  
- **Evidence:** `test:production-export-contract`, `test:production-final-branch-verification-contract`  
- **Formal blockers:** merge/main; factory/Basis acceptance if required

### P1-27 customer platform

- **localStatus:** Closed — Local for MVP subset  
- **formalStatus:** Formal Pending  
- **Evidence:** `test:customer-platform-mvp-boundary-contract`, customer flow tests  
- **deferredGaps:** email-code profile (D-16), cancellation request (D-15), visual approval (D-13)

### P1-28 operations

- **localStatus:** Closed — Local for MVP subset  
- **formalStatus:** Formal Pending  
- **Evidence:** `test:operations-mvp-boundary-contract`, operations flow tests  
- **deferredGaps:** standalone Approval View (D-07), extended operations scope, visual approval

### M9-P1-03 email retry

- **localStatus:** Closed — Local for manual retry / manual attention semantics  
- **formalStatus:** Formal Pending  
- **Evidence:** `test:email-retry-failure-contract`  
- **notClaimed:** automatic retry queue

### D-13 visual

- **localStatus:** Deferred by User  
- **formalStatus:** Not Closed  
- **Evidence:** D-13 tooling exists; human visual approval pending

## 10. Anti-patterns / forbidden claims

Forbidden without explicit negation or formal evidence:

- Local RC PASS ⇒ release-ready
- **Closed — Local** ⇒ merged to `main`
- `order_status_events` RLS live PASS ⇒ full M8-P1-02 live provider verification complete
- Visual QA closed while user deferred visual review
- RPES fully compliant while accepted deferrals exist
- Using PR / pre-PR as **default local workflow** terminology in planning docs

**Closed — Local** is not:

- Release readiness  
- Backlog formal closure (legacy "closed with evidence on main" is **Closed — Formal**)  
- RPES full compliance  
- A substitute for merge/main/live/deploy verification  

---

**Related:** `docs/planning/accepted-backlog-decisions-v1.md` §19, `docs/planning/rpes-local-formal-reconciliation.md`, `artifacts/audit/full-project-audit/`

**Обращаться к агенту:** 01 Product / Planning Agent
