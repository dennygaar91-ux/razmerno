# AGENTS.md — Размерно

## Purpose

Mandatory root instructions for Codex / Cursor / AI agents working in the `razmerno` repository.

Follow this file before any code, docs, QA, planning, PR or merge work.

## Source of Truth

Current hierarchy:

1. `docs/specification/**`
2. `docs/planning/accepted-backlog-decisions-v1.md` if it exists
3. `docs/planning/current-backlog.md`
4. `docs/planning/role-audit-reconciliation-v1.md`
5. `docs/audits/role-audits/**`
6. implementation code
7. historical docs

Rules:

- RPES in `docs/specification/**` is the primary product and engineering Source of Truth.
- `accepted-backlog-decisions-v1.md` is the active decision layer if present.
- `current-backlog.md` is the operational backlog baseline for scope, status and closure wording.
- `role-audit-reconciliation-v1.md` is the active cross-role reconciliation layer.
- `docs/audits/role-audits/**` are findings-only role inputs and do not close tasks by themselves.
- Implementation code shows current repo state, but does not override RPES or accepted decisions without explicit reconciliation.
- Historical docs, old backlog follow-up docs, old ZIP archives, chats, open PRs, draft PRs and local branch claims are not active Source of Truth unless explicitly reconciled.
- If these layers conflict, stop and request reconciliation.
- Repo state and merged/main evidence beat memory, chat, open PRs, draft PRs, branch-only reports and local claims.

## Language

Use Russian for reports, planning, backlog notes and user-facing explanations.

Keep code, filenames, class names, scripts, CLI commands, API names and technical identifiers in English when appropriate.

## Do Not Use GitHub Issues

Do not create, update, close, edit or comment on GitHub issues.

Forbidden:

- `update_issue`
- `update_issue_comment`
- changing issue state
- using GitHub issues as backlog source of truth

Use only repository files and PRs.

## Core Workflow

Default workflow:

1. Read `AGENTS.md`.
2. Read `docs/specification/README.md`.
3. Read only relevant RPES volume(s) from `docs/specification/**`.
4. Read only relevant task block from `docs/planning/current-backlog.md`.
5. Read `docs/planning/role-audit-reconciliation-v1.md`.
6. Read the relevant role audit file from `docs/audits/role-audits/`.
7. Read only relevant accepted decision section if `docs/planning/accepted-backlog-decisions-v1.md` exists.
8. Use `docs/planning/release-roadmap.md` and `docs/planning/release-qa-maturity-matrix-v1.md` only when the task touches release sequencing or evidence policy.
9. Decide whether read-only audit is required.
10. Freeze scope.
11. Read only target files and direct dependencies.
12. Make minimal safe diff.
13. Run scoped QA.
14. Report changed files, commands run, git status, evidence and risks.
15. Update session ledger.
16. Stop at first risky dependency.

Mandatory pre-work reading:

- `docs/specification/README.md`
- `docs/planning/current-backlog.md`
- `docs/planning/role-audit-reconciliation-v1.md`
- relevant role audit file from `docs/audits/role-audits/`

## Product Decision Priority

Do not invent or change product decisions.

Forbidden without explicit accepted decision:

- UX-flow changes
- Constructor3D / 2D behavior changes
- labels / markers behavior changes
- mobile UX changes
- stepper behavior changes
- pricing source-of-truth changes
- pricing rounding changes
- minimum order changes
- customer-facing validation changes
- production validation boundary changes
- Basis JSON / production export changes
- admin MVP scope changes
- release gate changes

If decision is missing or conflicting:

- stop;
- ask exact question;
- do not code;
- do not create PR.

## Anti-Assumption Rule

Do not invent facts.

Forbidden to invent:

- backlog status
- closure evidence
- PR merge status
- GitHub Actions status
- Vercel status
- file contents
- dependencies
- product approval
- visual approval
- release readiness
- production readiness

If not verified, say `not verified`.

## Anti-Overengineering Rule

Default strategy: minimal safe diff.

Forbidden without explicit scope:

- broad refactor
- unrelated cleanup
- full-file rewrite
- changing unrelated files
- new abstraction
- new architecture layer
- legacy/dead code removal
- package/workflow changes
- UX redesign
- production logic redesign

During docs-only tasks:

- do not touch unrelated runtime files;
- do not mass-clean up design system or runtime code;
- do not use docs-only audit findings as a reason to rewrite implementation.

## Large File Rule

Files over 1000 lines are large.

Do not start with full-file read.

Use:

- task block
- section heading
- line range
- search result neighborhood
- direct dependency scope

Examples:

```text
Read only P0-13 block.
Read only lines 1180–2001.
Read only section "## Production Rules Discovery Block".
Find "manager_notification_failed" and read 80 lines before / 120 lines after.
```

## Session Ledger Rule

Within same agent chat/session, do not reread full backlog each iteration if role, scope and task family stay same.

First run must create compact ledger:

- source files read
- accepted decisions used
- active task
- closed tasks in session
- changed files
- QA commands run
- remaining risks
- next allowed scope

Every follow-up must update ledger.

Reread relevant backlog/decisions if:

- new chat/session
- agent role changed
- task family changed
- new main commit appeared
- pricing/API/Supabase/production/Basis/package/workflow touched
- stop condition hit
- ledger conflicts with repo
- closure evidence needed

Ledger never replaces repo source of truth.

## Read-only Audit First

Start with read-only audit unless implementation scope is already frozen and narrow for:

- Constructor layout or state model
- Three.js scene, camera, fallback, markers or overlays
- Pricing engine or client/server parity
- API/order submit behavior
- Notification failure or idempotency policy
- Supabase/live provider checks
- Production/manufacturing export, drilling, hardware, Basis boundary
- `package.json`, `package-lock.json`, `.github/**`
- Global CSS/design-system cleanup
- Routing, app shell or deployment workflow

Read-only audit means: no branch, no edits, no commits, no PR.

## Stop Conditions

Stop if task needs:

- `package.json`
- `package-lock.json`
- `.github/**`
- Supabase schema / migrations / RLS
- pricing formulas
- API order flow
- idempotency / notification semantics
- production export / Basis JSON rules
- product decision not in accepted decisions
- visual approval
- UX-flow / layout / interaction model change
- full-file rewrite of large file
- diff beyond scope
- tests failing outside scope

Return short stop report. Do not improvise.

## Visual / UX Rules

Visual closure requires:

- fresh screenshots
- explicit visual review
- explicit human visual approval
- desktop/tablet/mobile coverage if responsive
- confirmation screenshot artifact is not closure by itself

Code changes alone cannot close visual task.

Do not change visual concept without accepted decision.

## Production / Manufacturing Rules

Customer-facing Three.js preview is not production truth.

Basis JSON is not automatic `.b3d`.

Do not claim factory-ready handoff without:

- production rules
- Basis JSON specification
- validation rules
- SKU/article mapping if hardware involved
- drilling/edge/HDF rules
- tests / golden snapshots
- merged/main evidence

## GitHub Workflow

- Work from GitHub `main` unless another base is explicitly named.
- Create a feature/docs branch for any change.
- Do not work directly on `main` in local agent workflows.
- Prefer small PRs.
- Do not merge a PR unless the user explicitly says to merge.
- Close failed broad PRs instead of repeatedly patching them when returning to `main` is safer.
- Do not touch GitHub issues. Do not use issue update tools.

## Closure Evidence Rules

Task can be marked closed only when current-backlog closure rules are satisfied:

- merged PR or direct main evidence;
- GitHub QA success for technical tasks;
- main verification;
- backlog updated with evidence.

Additional evidence rules:

- audit docs do not close tasks;
- docs-only audits do not close tasks;
- branch-only work does not close tasks;
- draft/open PRs are not closure evidence;
- screenshots and raw artifacts require explicit visual review before visual closure;
- screenshot/artifact capture success alone is not visual closure.

Not closure evidence by itself:

- open PR;
- draft PR;
- branch-only tests;
- branch-only docs;
- branch-only audit reports;
- report-only evidence;
- screenshot capture success without visual review;
- local/manual claim without CI or artifact evidence.

Do not close tasks from docs-only audits, role-audit findings or reconciliation reports alone.

## Autonomous Run Limit

Do not take whole backlog autonomously.

Default:

- 1 task per implementation prompt
- max 2 tasks only for safe docs-only/test-only scope
- stop at first risky dependency

Autonomous run must define:

- allowed categories
- forbidden categories
- max task count
- stop conditions

## QA

Run only scoped QA unless prompt says otherwise.

Common commands may include:

```bash
npm run typecheck
npm run build
npm run test:constructor-flow
npm run test:constructor-store
npm run test:checkout-submit-hook
npm run test:pricing-engine
npm run test:pricing-final
git diff --check
git status --short --branch
```

Use exact commands required by task.

If command unavailable or fails outside scope, stop and report.

## Report Format

Every implementation report must include:

- changed files
- commands run
- `git status --short --branch`
- evidence produced
- uncertainty / `not verified`
- next recommended scope

Recommended additions when useful:

- task
- files read
- why each file changed
- diff summary
- QA results
- updated session ledger
- remaining risks
- stop conditions hit, if any

## Agent Roles

Use only fixed project agents:

1. `01 Product / Planning Agent`
2. `02 Constructor Agent`
3. `03 Pricing Agent`
4. `04 API / Orders Agent`
5. `05 Infrastructure / QA Agent`
6. `06 Three.js / Visualization Agent`
7. `07 Production / Manufacturing Agent`
8. `08 UX / Design System Agent`

## Current Execution Order

Current recommended execution order:

1. planning reconciliation docs
2. pricing source-of-truth lock
3. constructor state ownership contract
4. live provider / Supabase verification
5. visual QA execution
6. production v3 snapshot scope
7. customer platform scope decision
8. admin workflow scope decision

## Forbidden Behavior

Forbidden:

- using old backlog-followup or historical planning docs as active source of truth;
- closing tasks from docs-only audits, role audits or reconciliation docs;
- using open PRs or draft PRs as closure evidence;
- mass-cleaning design system or runtime code without visual evidence and explicit scope;
- touching unrelated runtime files during docs-only tasks.

Every prompt must end with:

```text
Обращаться к агенту: <agent name>
```

## Short Rule

If task can be solved by reading 1 section and 3 files, do not read whole backlog or whole repo.
