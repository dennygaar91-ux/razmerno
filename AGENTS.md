# AGENTS.md

Practical rules for all agents working on the Razmerno project.

## 1. Project identity

- Project: `Razmerno` / `Размерно`.
- Product: online constructor for cabinet furniture.
- User-facing language: Russian.
- Source of truth: GitHub `main` plus `docs/planning/current-backlog.md`.
- Operational backlog source of truth: `docs/planning/current-backlog.md` only.
- `docs/planning/current-backlog-kanban-v1.md` is an operational kanban view only.
- Old ZIP archives, local branches, closed PRs, draft PRs and branch-only reports are not source of truth unless the user explicitly says so.

## 2. Fixed agent list

Use only these agent names in task prompts and reports:

1. `01 Product / Planning Agent`
2. `02 Constructor Agent`
3. `03 Pricing Agent`
4. `04 API / Orders Agent`
5. `05 Infrastructure / QA Agent`
6. `06 Three.js / Visualization Agent`
7. `07 Production / Manufacturing Agent`
8. `08 UX/UI / Design System Agent`

Every task prompt must end with:

```text
Обращаться к агенту: <agent name>
```

## 3. Current baseline

- Current accepted GitHub baseline after PR #79: `b5065571 test: add delivery assembly pricing parity matrix`.
- PR #80 `ui: refine constructor 3d client shell` was closed without merge after failed visual review.
- Do not reuse, cherry-pick or continue PR #80 unless the user explicitly requests forensic analysis.

## 4. Default workflow

Do not jump from a problem statement directly into implementation when the task is risky or ambiguous.

Default sequence:

1. Read `AGENTS.md`.
2. Read the relevant section of `docs/planning/current-backlog.md`.
3. Read the relevant accepted product decisions.
4. Decide whether the task requires read-only audit first.
5. Freeze the scope.
6. Execute one narrow change only.
7. Report evidence and limits.

## Accepted Backlog Decisions Layer

Before changing `docs/planning/current-backlog.md`, agents must read:

- `docs/planning/accepted-backlog-decisions-v1.md`

Before implementation, agents must also read this file if the task affects:

- pricing;
- API/orders;
- idempotency;
- Supabase verification;
- production materials;
- HDF;
- edge banding;
- Constructor3D;
- WebGL fallback;
- visual QA;
- release maturity.

`docs/planning/current-backlog.md` remains the main backlog source of truth.

`docs/planning/accepted-backlog-decisions-v1.md` does not replace the backlog. It is a mandatory decision layer for interpreting backlog tasks.

If `current-backlog.md` and accepted decisions appear to conflict, the agent must stop and request reconciliation. The agent must not choose its own interpretation.

## 5. Frozen decisions block

Every implementation prompt must contain:

```text
Already accepted decisions that must not be violated
```

Typical protected decisions:

- 3D / visual constructor is the core customer-facing experience.
- The scene or fallback preview must not become a cramped side preview unless explicitly scoped.
- Settings/forms support the scene; they must not dominate by accident.
- Price is exact, not preliminary.
- Warnings are about validation/manufacturability, not about approximate pricing.
- UI tasks must not change checkout/order flow, API, pricing, Supabase or production/manufacturing layers.
- Do not expose complex production internals to customers unless explicitly scoped.
- Do not revive legacy Constructor or weaken Constructor3D guard boundaries.

If a task conflicts with these decisions, stop and ask.

## 6. Scope discipline

One task means one narrow layer.

Good scopes:

- `Only stepper readability`.
- `Only one pricing parity fixture group`.
- `Only stale PR triage documentation`.
- `Only one API failure policy decision`.

Bad scopes:

- `Improve constructor UI`.
- `Clean CSS`.
- `Stabilize backend`.
- `Fix pricing`.
- `Make it production-ready`.

Split broad tasks before implementation.

## 7. Read-only audit first for risky areas

Start with read-only audit unless implementation scope is already frozen and narrow:

- Constructor layout or state model.
- Three.js scene, camera, fallback, markers or overlays.
- Pricing engine or client/server parity.
- API/order submit behavior.
- Notification failure or idempotency policy.
- Supabase/live provider checks.
- Production/manufacturing export, drilling, hardware, Basis boundary.
- `package.json`, `package-lock.json`, `.github/**`.
- Global CSS/design-system cleanup.
- Routing, app shell or deployment workflow.

Read-only audit means: no branch, no edits, no commits, no PR.

## 8. GitHub workflow

- Work from GitHub `main` unless another base is explicitly named.
- Create a feature/docs branch for any change.
- Do not work directly on `main`.
- Prefer small PRs.
- Do not merge a PR unless the user explicitly says to merge.
- Close failed broad PRs instead of repeatedly patching them when returning to `main` is safer.
- Do not touch GitHub issues. Do not use issue update tools.

## 9. Closure evidence rules

A task can be marked closed only when current-backlog closure rules are satisfied:

- merged PR or direct main evidence;
- GitHub QA success for technical tasks;
- main verification;
- backlog updated with evidence.

Not closure evidence by itself:

- open PR;
- draft PR;
- branch-only tests;
- branch-only docs;
- report-only evidence;
- screenshot capture success without visual review;
- local/manual claim without CI or artifact evidence.

## 10. Must-not-touch rules

Do not change without separate explicit scope:

- GitHub issues;
- `package.json`;
- `package-lock.json`;
- `.github/**`;
- API/order flow;
- pricing engine/runtime;
- Supabase/RLS/storage contracts;
- production/manufacturing exports;
- admin operations;
- global CSS/design-system layers;
- routing/app shell;
- dependencies.

Do not run `npm audit fix`. Do not commit generated dependency/build folders or environment files.

## 11. QA policy

Use QA according to scope. Do not run every command automatically.

- Docs-only: inspect diff; runtime QA is normally not required.
- Runtime/TypeScript: targeted tests plus `npm run typecheck` and `npm run build` where available.
- Pricing: pricing-specific tests and checkout/order boundary tests when affected.
- API/orders: order/API tests and typecheck/build where available.
- Constructor/Three.js: constructor store/flow/three/fallback tests where relevant.
- Visual closure: fresh screenshot evidence plus explicit visual review.

If checks cannot be run, state that clearly and rely on GitHub Actions after PR creation.

## 12. Visual work rules

- Visual tasks require explicit route, viewport and state scope.
- Do not perform broad layout rewrites.
- Do not make scene/fallback secondary unless explicitly scoped.
- Successful build or screenshot capture does not prove visual closure.
- Production URL can verify merged/deployed work only.
- PR work needs preview evidence when visual closure is claimed.

## 13. Reporting format

Every work report must include:

- Summary.
- Branch.
- PR number/link if created.
- Files changed.
- What changed.
- What was intentionally not touched.
- QA/checks run or not run.
- Risks/limitations.
- Next recommended step.

## 14. Stop conditions

Stop and ask if:

- The task is ambiguous.
- The task conflicts with accepted decisions.
- The diff becomes broad.
- The task crosses multiple domains unexpectedly.
- The task requires package/workflow changes.
- The task requires closing backlog status without evidence.
- Visual results cannot be verified for a visual closure claim.
- API/pricing/order/Supabase/production changes appear in a UI task.
- UI/layout changes appear in a pricing/API task.
- GitHub tool output indicates stale branch, merge conflict, truncation risk or blocked action.

## 15. Token efficiency

- Read only relevant sections first.
- Do not summarize the whole project unless asked.
- Do not paste large files in responses.
- Prefer targeted search over broad scans.
- Prefer narrow docs-only or test-only PRs when possible.
- Ask before another iteration if a PR already looks structurally wrong.

## 16. GitHub tool safety rules

- GitHub tool blocks are safety-layer events, not necessarily repository permission failures.
- If a GitHub write action is blocked once, stop repeating the same action and report the manual fallback.
- Prefer GitHub tools for reading files, creating branches, small file edits, and comparing branches.
- Avoid large write payloads in tool calls.
- Avoid long PR bodies, large markdown tables, and large code fences in `create_pull_request` calls.
- If `create_pull_request` is blocked, leave the branch ready and ask the user to open the PR manually through GitHub UI.
- Manual PR fallback format: base `main`, compare the prepared branch, short title, short docs-only/runtime scope summary.
- Keep commits small and file changes narrow to reduce connector risk.
- Do not replace very large files through `update_file` unless there is no safer option.
- Prefer creating small new docs files over rewriting large existing docs files.
- If an update to a large file is required, first fetch the current file, keep the replacement minimal, and stop if GitHub reports truncation or blocked action.
- After any blocked GitHub action, do not attempt workaround loops that repeatedly call the same blocked tool.
- Always run or request `compare_commits` after connector-based edits to verify changed files and branch distance from `main`.
- PR creation and merge can be manual user actions; agent work is still valid if branch commits and compare evidence exist.
