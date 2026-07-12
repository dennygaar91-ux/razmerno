# RPES Local vs Formal Reconciliation

**Status:** planning reconciliation — not RPES rewrite  
**Date:** 2026-07-12  
**Branch:** `task/epic-b-projects-foundation` @ `1f57af35`

## RPES source files

- `docs/specification/README.md`
- `docs/specification/volume-01-product/README.md` … `volume-10-governance/README.md`

## Source-of-truth hierarchy (post–Package 13)

```text
1. User-approved accepted decisions (accepted-backlog-decisions-v1.md, mvp-scope-decision-signoff.md)
2. Local closure governance (local-vs-formal-closure-governance.md)
3. RPES requirements (docs/specification/**)
4. Planning documents / backlog (current-backlog.md, mvp-scope.md, release-roadmap.md)
5. Code and test evidence
```

Code/tests prove **implementation status**; they do not automatically override product requirements. Conflicts require planning reconciliation before **Closed — Formal**.

## Reconciliation table

| RPES area | Local compliance | Formal compliance | Accepted gap / conflict | Future formal action |
|-----------|------------------|-------------------|-------------------------|----------------------|
| Volume I — MVP scope | MVP-local compliant (wardrobe, manual payment) | Formal Pending | Online payment out of scope | merge/main + release owner |
| Volume VI — Pricing | MVP-local compliant (local-contract verified) | Formal Pending | PR #43 not merged | formal pricing closure on main |
| Volume V — Manufacturing | MVP-local compliant (v3 export, no auto-B3D) | Formal Pending | v4 full replacement vs v3 runtime | production v4 migration planning |
| Volume VII — Customer | MVP-local compliant (subset) | Formal Pending | D-15 cancellation, D-16 email-code, D-13 visual | deferrals documented; formal visual gate |
| Volume VIII — Admin/Ops | MVP-local compliant (Manual Review MVP) | Formal Pending | D-07 Approval View vs Manual Review | accepted deferral; extended P2-09/P2-25 open |
| Volume IX — Architecture | MVP-local compliant | Formal Pending | — | live smoke optional |
| Volume X — Governance | Partially compliant | Formal Pending | Hierarchy conflict resolved in §19 | keep evidence sync on formal workflow |

## Known RPES vs implementation gaps

1. **Approval View vs Manual Review** — RPES VIII describes Approval View; MVP implements Manual Review; D-07 deferred standalone Approval View. **Deferred accepted gap.**
2. **Customer cancellation** — RPES/customer lifecycle may imply cancellation; D-15 deferred. **Deferred accepted gap.**
3. **Email-code profile** — D-16 deferred; profile edit is name/phone only. **Deferred accepted gap.**
4. **Production v4** — RPES v1.1 states v4 replaces v3; branch runs v3 export. **Future formal workflow** / planning conflict — not MVP-local non-compliant for current scope if v3 is accepted MVP path.
5. **D-13 visual** — RPES/gates imply visual QA; user deferred. **Deferred accepted gap.**

## Local RC gate vs release readiness

- `check:release-candidate-local --execute` 15/15 PASS on branch with `closureClaimed: false`.
- **MVP-local compliant** for local development gate.
- **Not** formal release readiness (visual, deploy, merge/main excluded).

## Recommended RPES updates (future, not in Package 13)

- Add governance appendix referencing two-level closure (Volume X).
- Clarify Manual Review MVP vs Approval View in Volume VIII when user approves RPES edit.
- Document v3/v4 production migration boundary in Volume V when scope decision closes P1-11A.

## Compliance summary

| Term | Project state |
|------|---------------|
| MVP-local compliant | Customer ops, pricing contracts, production export, manual payment, notification semantics |
| Partially compliant | M8-P1-02 (partial live), M8-P1-05 (local RC only) |
| Deferred accepted gap | D-13, D-15, D-16, D-07 Approval View |
| Future formal workflow | Remote deploy, merge/main QA, full live provider |
| Non-compliant | None critical for agreed MVP-local subset |
| Unclear | Production v4 long-term vs v3 — track under P1-11A |

---

**Обращаться к агенту:** 01 Product / Planning Agent
