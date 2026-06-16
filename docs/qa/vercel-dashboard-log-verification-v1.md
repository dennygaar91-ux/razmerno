# P1-22 Vercel Dashboard Log Verification v1 — Размерно

Дата: 2026-06-16  
Роль: 05 Infrastructure / QA Agent  
Scope: infrastructure / deployment verification only

## 1. Executive Summary

P1-22 проверен по доступным GitHub evidence, но не может быть закрыт: прямого доступа к Vercel Dashboard и raw deployment logs через текущий инструментальный контур нет.

Текущий вывод: `Vercel: failure` подтверждается на актуальном `main` commit, а также на PR/merge commits из предыдущего расследования. GitHub QA evidence остаётся зелёным для релевантных PR runs, поэтому это не доказывает поломку продуктового кода, но блокирует Vercel-based release validation и screenshot QA на Vercel deployment.

P1-22 должен оставаться в состоянии `blocked / waiting for Vercel Dashboard logs` до получения raw logs и успешного Vercel redeploy.

## 2. Scope

In scope:

- проверка актуального GitHub `main` commit;
- проверка GitHub Actions evidence;
- проверка GitHub combined status / Vercel status context;
- сверка GitHub QA path с Vercel deployment unknowns;
- фиксация Vercel Dashboard data checklist;
- release-impact decision;
- documentation update.

Out of scope:

- visual QA screenshot pass;
- UI/CSS changes;
- Constructor changes;
- Pricing changes;
- API/order changes;
- Three.js changes;
- Production/manufacturing changes;
- GitHub issues.

## 3. Previous Investigation Summary

Предыдущий документ: `docs/qa/vercel-deployment-error-investigation-v1.md`.

Предыдущий вывод:

```text
J — Unknown due to missing logs
```

Предыдущий evidence:

- PR #47 `P1-21 Release / Post-MVP Visual QA Matrix` был docs-only.
- GitHub Actions QA run #205 (`27628914104`) завершился `success`.
- Vercel status был `failure` на PR #47 final head и merge commit `49a635fe8831376e8afa32ebbcebd17a7a80025b`.
- Vercel failure также был виден на более ранних merge commits PR #44 и PR #46.
- Raw Vercel logs были недоступны через GitHub connector.

## 4. GitHub QA Status

Актуальный `main` на момент проверки:

```text
6f16e3d95204ab7ee054f39674fd19abe71ce284
```

GitHub connector evidence:

- `fetch_commit(main)` вернул commit `6f16e3d95204ab7ee054f39674fd19abe71ce284`.
- `fetch_commit_workflow_runs` для этого commit вернул пустой список workflow runs через текущий connector.
- `get_commit_combined_status` для этого commit вернул Vercel status `failure`.

Последний подтверждённый QA run по P1-22-related docs branch до этой проверки:

```text
PR #48 head: 1f7923276ffe69ed202c277030335b5a99dcbdc3
QA run: #207
Run id: 27630247517
Conclusion: success
```

Предыдущий релевантный P1-21 QA run:

```text
PR #47 QA run: #205
Run id: 27628914104
Conclusion: success
```

Repository QA workflow path:

```text
Node.js: 22
Install: npm ci
Frontend typecheck: npm run typecheck
API typecheck: npm run typecheck:api
Build: npm run build
Build script: vite build
```

## 5. Vercel Deployment Status

Vercel status visible through GitHub combined status:

| Commit | Context | State | Notes |
|---|---|---|---|
| `6f16e3d95204ab7ee054f39674fd19abe71ce284` | Vercel | failure | Current `main` at verification time |
| `56d5a8fa9be5d2f408e75484abf48977b5d6a318` | Vercel | failure | PR #48 merge commit from previous investigation |
| `1f7923276ffe69ed202c277030335b5a99dcbdc3` | Vercel | failure | PR #48 head |
| `49a635fe8831376e8afa32ebbcebd17a7a80025b` | Vercel | failure | PR #47 merge commit |

Impact classification:

```text
Both PR/preview-related commits and main commits show Vercel failure status in GitHub combined status.
```

The live production alias and raw Vercel deployment state cannot be confirmed from GitHub-only evidence.

## 6. Vercel Raw Logs

Vercel raw logs were not available through the current GitHub connector or available tools.

Blocked status:

```text
Blocked: Vercel Dashboard logs are required to proceed.
```

No exact error stack was obtained.

No install/build/postbuild/output/function/runtime step failure can be confirmed without Dashboard logs.

## 7. GitHub vs Vercel Comparison

GitHub Actions is known:

| Item | GitHub Actions evidence |
|---|---|
| Runtime | Node.js 22 |
| Install | `npm ci` |
| Build | `npm run build` |
| Build implementation | `vite build` |
| Output expected from Vite | `dist` |
| QA scope | typecheck, API typecheck, build, active tests, P1-09, P1-10, P1-13, coverage, architecture checks |

Repository Vercel configuration:

| Item | Repository evidence |
|---|---|
| `vercel.json` | SPA rewrites only |
| Build command | Not defined in repository |
| Install command | Not defined in repository |
| Output directory | Not defined in repository |
| Root directory | Not defined in repository |
| Framework preset | Not defined in repository |
| Node.js version | Not defined in repository; no `engines.node` field confirmed in previous investigation |

Vercel Dashboard unknowns:

- actual install command;
- actual build command;
- actual Node.js version;
- framework preset;
- root directory;
- output directory;
- environment variable availability by Preview/Production;
- exact failing step;
- exact error stack;
- whether the failure is Git integration/project-level rather than repository-level.

## 8. Root Cause Classification

Classification:

```text
Unknown due to missing logs
```

Confidence:

- High confidence that GitHub-visible evidence is insufficient to determine exact root cause.
- Medium-high confidence that this is not caused by P1-21 docs-only changes, because the failure is repeated across multiple commits.
- Low confidence for any specific root cause until Vercel raw logs are available.

Potential categories still open:

1. External Vercel configuration issue.
2. Environment variable issue.
3. Build/runtime mismatch.
4. Root/output directory mismatch.
5. Install/build command mismatch.
6. Vercel Git integration issue.
7. False-positive or stale deployment status, not confirmable without Dashboard deployment list.

## 9. Root Cause Evidence

Evidence supporting `unknown due to missing logs`:

- GitHub QA succeeds on relevant PR runs.
- GitHub combined status shows Vercel failure on PR and main commits.
- Repository `vercel.json` does not define build/install/output/root/runtime settings.
- Dashboard-only settings and deployment logs are unavailable through current tools.
- Vercel status target is visible from GitHub, but raw build logs and exact stack are not exposed through the GitHub connector.

## 10. Fix Applied / Fix Required

No repository deploy/config fix was applied.

Reason:

```text
Raw logs are required before changing vercel.json, package scripts, Node engines, env docs, or deployment settings. Any repository fix before exact error evidence would be speculative.
```

Required Vercel Dashboard data:

1. Screenshot or text of Build Logs for the failed deployment.
2. Exact error stack.
3. Deployment URL or deployment id.
4. Commit SHA for that deployment.
5. Build command.
6. Install command.
7. Output directory.
8. Root directory.
9. Framework preset.
10. Node.js version.
11. Environment variables list without secret values.
12. Vercel project settings screenshot for Framework Preset, Root Directory, Build Command, Output Directory, Install Command and Node.js Version.
13. If env-related: names of missing env variables only, without values.
14. Confirmation whether failure occurs in Preview, Production, or both.
15. Confirmation whether latest `main` redeploy was manually retried.

Expected fix paths after logs:

- If Node mismatch: align Vercel Node.js version with GitHub Node 22 or add `engines.node` only after compatibility is confirmed.
- If build command mismatch: set Vercel build command to `npm run build`.
- If install command mismatch: set install command to `npm ci` or confirm Vercel default works with `package-lock.json`.
- If output mismatch: set output directory to `dist`.
- If root mismatch: set root directory to repository root.
- If env missing: add missing env variables in the relevant Vercel environment without exposing values in docs.
- If integration stale: reconnect/redeploy project from latest `main`.

## 11. Vercel Redeploy Verification

No Vercel redeploy was triggered or verified through the current tools.

Result:

```text
No redeploy success evidence.
```

P1-22 cannot be closed.

## 12. Release Impact

GitHub QA confidence:

```text
Green for prior relevant PR QA evidence (#205 and #207).
```

Vercel deployment confidence:

```text
Blocked / failing status visible from GitHub.
```

Release impact:

- This is not proof that the product code is broken.
- This is a blocker for Vercel-based preview validation.
- This is a blocker for Vercel-based production release confidence.
- This blocks using Vercel deployment as the source for visual QA screenshot evidence.

## 13. Visual QA Screenshot Pass Decision

Decision:

```text
Do not start the next Vercel-based UX/UI visual QA screenshot pass until P1-22 has raw logs and either a confirmed non-blocker reason or successful Vercel redeploy evidence.
```

Local screenshot checks may be useful for visual exploration, but they must not be treated as Vercel release/deploy evidence.

## 14. Remaining Risks

1. The exact Vercel error stack is still unknown.
2. The failing step is unknown.
3. Preview vs Production environment parity is unknown.
4. Dashboard settings may differ from GitHub QA assumptions.
5. A dashboard-level issue may require user action outside the repository.
6. Current `main` still shows Vercel failure through GitHub status.

## 15. Closure Review

| Criterion | Status |
|---|---|
| Vercel raw logs obtained | Not done |
| Exact error stack obtained | Not done |
| Root cause classified | Partial: unknown due to missing logs |
| Release impact determined | Done |
| Repository fix applied | Not applied; no root cause evidence |
| Vercel redeploy success | Not done |
| Report created | Done |
| Backlog update | Required: P1-22 should remain open/blocked until logs are provided |
| GitHub issues untouched | Done |
| Visual QA screenshot pass decision | Done: blocked for Vercel-based pass |

Final P1-22 status:

```text
blocked / waiting for Vercel Dashboard logs
```
