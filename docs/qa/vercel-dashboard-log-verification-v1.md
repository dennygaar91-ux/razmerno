# P1-22 Vercel Dashboard Log Verification v1 — Размерно

Дата: 2026-06-16  
Роль: 05 Infrastructure / QA Agent  
Scope: infrastructure / deployment verification only

## 1. Executive Summary

P1-22 закрыта по результатам Vercel Dashboard log verification и successful Preview redeploy.

Raw Vercel log подтвердил исходную ошибку на ветке `p1-22-vercel-dashboard-log-verification`, commit `3bb8907acd5fe62076b09098037daf0bc2763180`:

```text
/vercel/path0/node_modules/.bin/vite: Permission denied
Error: Command "npm run build" exited with 126
```

После dashboard-level исправления и redeploy without cache Preview deployment стал `Ready / Latest`.

## 2. Scope

In scope:

- Vercel deployment diagnostics;
- GitHub QA vs Vercel build comparison;
- raw log evidence capture;
- root cause classification;
- dashboard fix verification;
- release / visual QA gate decision.

Out of scope:

- UI / CSS;
- Constructor;
- Pricing;
- API/orders;
- Three.js;
- Production/manufacturing;
- GitHub issues.

## 3. Previous Investigation Summary

Previous report: `docs/qa/vercel-deployment-error-investigation-v1.md`.

Previous classification:

```text
J — Unknown due to missing logs
```

P1-22 was opened because GitHub QA was green while Vercel deployment status was failure, and raw logs were not available through the GitHub connector.

## 4. GitHub QA Status

PR: #49 `P1-22 Vercel Dashboard Log Verification`  
Branch: `p1-22-vercel-dashboard-log-verification`  
Verified head SHA before final docs update: `3bb8907acd5fe62076b09098037daf0bc2763180`

GitHub Actions evidence:

```text
Workflow: QA
Run number: 213
Run id: 27632361399
Status: completed
Conclusion: success
```

Final PR head after docs/backlog closure:

```text
Head SHA: 304cd0480c4cca3676d3fa8d4a01d6b142f7c13e
QA run: 238
Status: completed
Conclusion: success
```

GitHub QA uses Node 22, `npm ci`, and `npm run build`.

## 5. Vercel Deployment Status

Initial failed Vercel build evidence:

```text
Branch: p1-22-vercel-dashboard-log-verification
Commit: 3bb8907
Vercel CLI: 54.14.0
Command: npm run build
Failure: node_modules/.bin/vite permission denied
Exit code: 126
```

Successful redeploy evidence:

```text
Deployment id: 5PWvVXh5i53mYXjv98AsxsFSzh26
Environment: Preview
Status: Ready / Latest
Source branch: p1-22-vercel-dashboard-log-verification
Commit: 3bb8907
Duration: 51s
```

Final PR-head Vercel bot evidence after docs/backlog update:

```text
Deployment id: 7Mo6ZJtAkdgHnTASzTt18S3r1peN
Environment: Preview
Status: Ready
```

Final PR-head GitHub combined status evidence:

```text
Context: Vercel
State: success
Head SHA: 304cd0480c4cca3676d3fa8d4a01d6b142f7c13e
```

## 6. Vercel Raw Logs

Failure excerpt:

```text
Running "npm run build"
> vite build
sh: line 1: /vercel/path0/node_modules/.bin/vite: Permission denied
Error: Command "npm run build" exited with 126
```

Successful redeploy excerpt:

```text
Running "install" command: `npm ci`...
added 184 packages, and audited 185 packages in 10s
> vite build
vite v7.3.2 building client environment for production
built in 9.01s
Deployment completed
```

Non-blocking Vercel output warnings were observed for unused TypeScript symbols in `api/_shared/server-price.ts`. They did not fail deployment and are outside P1-22.

## 7. GitHub vs Vercel Comparison

| Item | GitHub Actions | Failed Vercel deploy | Successful Vercel redeploy |
|---|---|---|---|
| Install | `npm ci` | partial/default install behavior | `npm ci` |
| Build | `npm run build` | failed at `vite` executable permission | completed |
| Cache | clean CI | stale/invalid Vercel cache likely involved | redeploy without cache |
| Result | success | failure, exit 126 | Ready / Latest |

## 8. Root Cause Classification

Confirmed classification:

```text
External Vercel configuration/cache/runtime issue.
```

Specific conclusion:

```text
The failed Vercel deployment used a broken/stale install/runtime path where node_modules/.bin/vite was not executable. The issue was resolved by aligning Vercel build settings with GitHub QA expectations and redeploying without build cache.
```

Confidence: high.

## 9. Root Cause Evidence

Evidence chain:

1. GitHub QA on PR #49 passed with run #213.
2. Vercel failed before fix with `node_modules/.bin/vite: Permission denied`.
3. Vercel settings/logs showed build cache/runtime mismatch context.
4. Vercel redeploy was triggered without cache after settings alignment.
5. Vercel then executed `npm ci`, installed full dependencies, completed `vite build`, and produced `Ready / Latest`.
6. Final PR-head deployment after docs/backlog update also reported `Ready` through Vercel bot and `success` through GitHub combined status.

## 10. Fix Applied / Fix Required

Repository code/config changes applied:

```text
None.
```

Dashboard-level fix applied by user:

```text
Framework Preset: Vite
Root Directory: repository root
Install Command: npm ci
Build Command: npm run build
Output Directory: dist
Redeploy: without cache
```

Recommended persistent Dashboard setting:

```text
Node.js Version: align with GitHub QA Node 22.x where available.
```

## 11. Vercel Redeploy Verification

Redeploy result:

```text
Deployment id: 5PWvVXh5i53mYXjv98AsxsFSzh26
Status: Ready / Latest
Environment: Preview
Commit: 3bb8907
Duration: 51s
```

Final PR-head Vercel result:

```text
Deployment id: 7Mo6ZJtAkdgHnTASzTt18S3r1peN
Status: Ready
Environment: Preview
GitHub combined status: success
```

P1-22 deployment blocker is resolved for PR #49 Preview deployments.

## 12. Release Impact

Release impact after fix:

```text
No current Vercel Preview deployment blocker for PR #49.
```

This does not rewrite older historical failed deployments, but confirms the current deployment path works with corrected Dashboard settings and clean cache.

## 13. Visual QA Screenshot Pass Decision

Decision:

```text
The next Vercel-based visual QA screenshot pass can start after main deployment/content verification is complete.
```

## 14. Remaining Risks

1. Main deployment after PR #49 merge still needs confirmation.
2. Vercel Dashboard settings must remain aligned with GitHub QA: `npm ci`, `npm run build`, `dist`, Vite preset, Node 22.x where available.
3. Non-blocking TypeScript unused-symbol warnings in `api/_shared/server-price.ts` may become relevant if future Vercel settings enforce stricter typecheck.
4. Older failed Vercel statuses may remain historically failed.

## 15. Closure Review

| Criterion | Status |
|---|---|
| Vercel raw logs obtained | Done |
| Exact error stack obtained | Done |
| Root cause classified | Done |
| Release impact determined | Done |
| Repository fix applied | Not required |
| Dashboard fix applied | Done |
| Vercel redeploy success | Done |
| Final PR-head Vercel success | Done |
| Final PR-head GitHub QA success | Done |
| Report updated | Done |
| Backlog update | Done |
| GitHub issues untouched | Done |
| Visual QA screenshot pass decision | Done |

Final P1-22 status:

```text
closed
```
