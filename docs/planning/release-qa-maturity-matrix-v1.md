# Release QA Maturity Matrix v1

Status: planning policy for release readiness. This document does not change CI, package scripts, runtime code, providers, or workflows.

Source of truth: `docs/planning/current-backlog.md`.

## Required for MVP Release Candidate

| Area | Required Evidence | Notes |
| --- | --- | --- |
| Fast repository QA | `npm run typecheck`, `npm run build`, and scoped tests for changed areas | Required for most implementation PRs. Docs-only PRs may use `git diff --check` plus status verification. |
| Constructor contracts | Constructor smoke/store/submit checks pass when constructor state, reset, submit, or checkout behavior changes | Use focused scripts before broad checks. |
| Architecture boundaries | Constructor3D architecture guard passes when active constructor boundaries are touched | Warnings are acceptable only when documented as non-blocking. |
| Deployment status | GitHub/Vercel PR checks succeed before merge | Open PRs or branch-only evidence are not closure evidence. |
| Backlog evidence | Closure evidence is recorded in `current-backlog.md` after merge and main verification | Closure evidence PR is separate from implementation PR when practical. |

## Manual or Release-Gate Evidence

| Area | Policy | Notes |
| --- | --- | --- |
| Visual QA screenshots | Manual/release-gate unless a task explicitly adds automated visual coverage | Screenshot artifacts alone do not close visual tasks. |
| Cross-browser/device QA | Manual/release-gate until a dedicated browser/device matrix is implemented | Chromium-only checks must be labelled as partial. |
| Live provider verification | Manual/release-gate for real Vercel/Supabase/provider environments | Do not require secrets or live provider calls for ordinary local PRs. |
| Admin/release smoke | Manual/release-gate unless admin/runtime scope is directly changed | Keep admin checks out of unrelated docs/runtime tasks. |

## Deferred Hardening

| Area | Upgrade Path |
| --- | --- |
| Coverage | Keep current baseline until a scoped coverage upgrade task defines thresholds and reporting. |
| Nightly/release workflows | Add only through a dedicated workflow task with explicit permission to edit `.github/**`. |
| Test quarantine | Define ownership and expiry rules before adding quarantine mechanics. |
| Cross-browser automation | Add after the manual matrix identifies required browsers/devices and stable fixtures. |

## Stop Conditions

- Do not change `package.json`, `package-lock.json`, `.github/**`, provider code, API/order flow, pricing, admin, Supabase, or production export from this matrix task.
- Stop if a release QA decision requires live secrets, workflow edits, package script ownership changes, or broad runtime refactor.
- Do not close backlog tasks from manual or partial QA evidence unless the task's closure condition explicitly allows it.
