# Vercel Deployment Error Investigation v1 — Размерно

Дата: 2026-06-16  
Роль: 05 Infrastructure / QA Agent  
Scope: infrastructure / deploy investigation only

## 1. Executive Summary

Проведено расследование расхождения между GitHub Actions QA и Vercel deployment status после закрытия P1-21.

Ключевой вывод: GitHub Actions QA для final PR #47 head прошёл успешно, но Vercel deployment status показывает `failure` и для PR head, и для merge commit, который сейчас является `main`. Точные Vercel raw logs недоступны через текущий GitHub connector, поэтому root cause нельзя подтвердить до просмотра Vercel Dashboard.

Наиболее честная классификация: **J. Unknown due to missing logs**. Рабочие гипотезы: Vercel project settings, env variables, Node/runtime setting, build command, output directory, root directory или Git integration.

P1-21 маловероятно является причиной, потому что PR #47 был docs-only, а Vercel failure виден также на более ранних merge commits.

## 2. Scope

In scope:

- GitHub Actions status review;
- Vercel status evidence visible from GitHub;
- PR #47 / merge commit deployment signal review;
- repository deploy/build configuration review;
- package/workflow/env/deployment docs comparison;
- investigation report;
- backlog update.

Out of scope:

- visual QA screenshot execution;
- UI/CSS changes;
- Constructor changes;
- Pricing changes;
- API/order changes;
- Three.js changes;
- Production/manufacturing changes;
- GitHub issues.

## 3. Current GitHub QA Status

Current `main` commit:

```text
49a635fe8831376e8afa32ebbcebd17a7a80025b
```

PR #47 metadata:

- PR: #47 `P1-21 Release / Post-MVP Visual QA Matrix`
- State: merged
- Final PR head: `5639ff5b549f76e4a754d658ca08e7a9d463ca0f`
- Merge commit: `49a635fe8831376e8afa32ebbcebd17a7a80025b`
- Changed files: `docs/planning/current-backlog.md`, `docs/ux/release-visual-qa-matrix-v1.md`

GitHub Actions evidence for final PR head:

- Workflow: `QA`
- Run number: `205`
- Run id: `27628914104`
- Job: `Fast CI gate`
- Job id: `81698171000`
- Conclusion: `success`

Successful job steps included install, infrastructure inventory, frontend typecheck, API typecheck, frontend build, fast active tests, P1-09 E2E, P1-10 E2E, P1-13 E2E, coverage snapshot, CSS architecture check and production geometry architecture check.

GitHub QA status: **success**.

## 4. Current Vercel Status

GitHub combined status for PR #47 final head:

```text
commit: 5639ff5b549f76e4a754d658ca08e7a9d463ca0f
context: Vercel
state: failure
```

GitHub combined status for PR #47 merge commit / current `main`:

```text
commit: 49a635fe8831376e8afa32ebbcebd17a7a80025b
context: Vercel
state: failure
```

Vercel bot comment on PR #47:

```text
Project: razmerno
Deployment: Error
Updated: Jun 16, 2026 3:30pm UTC
```

Additional historical evidence:

- PR #46 merge commit `7be24a586a3541fab2cdf9e23fa2cc8cedefc2b3` also has `Vercel: failure`.
- PR #44 merge commit `119ea6f1225b68f9ca0d38ff1c3e1bba1660a5fb` also has `Vercel: failure`.

This means the Vercel error did not first appear with the P1-21 docs-only change.

## 5. Deployment Error Evidence

Evidence available through GitHub connector:

1. PR #47 changed only docs/planning files.
2. GitHub Actions run #205 on final PR head completed successfully.
3. Vercel status is failure on the PR head.
4. Vercel status is failure on the merge commit that is now `main`.
5. Vercel status failure also exists on earlier merge commits, including PR #44 and PR #46 merge commits.
6. Vercel bot comment gives deployment status `Error`, but not the raw build/runtime stack.

Vercel raw logs were not available through the current GitHub connector. This report is based on GitHub status checks, repository configuration, and available CI evidence.

## 6. GitHub QA vs Vercel Comparison

### GitHub QA command path

`.github/workflows/qa.yml` uses:

```yaml
runs-on: ubuntu-latest
node-version: 22
npm ci
npm run typecheck
npm run typecheck:api
npm run build
```

`package.json` defines:

```json
"build": "vite build"
```

GitHub QA therefore validates install, typecheck, API typecheck and Vite frontend build on Node 22.

### Vercel command path from repository configuration

Repository-level `vercel.json` contains only SPA rewrites for `/configurator` and `/configurator/(.*)` to `/index.html`.

No repository-level Vercel build command, install command, output directory, root directory, framework preset or Node version is defined in `vercel.json`.

### Package / lockfile notes

`package.json`:

- `build`: `vite build`
- no `engines.node` field found
- React 18.3.1
- Vite 7.3.2
- TypeScript 5.9.3

`package-lock.json`:

- lockfileVersion: `3`

### Env docs

The repository documents required Vercel production env variables in:

- `.env.example`
- `.env.production.example`
- `docs/production/vercel-deploy-runbook.md`
- `docs/production/vercel-env-fill-guide.md`

The GitHub connector cannot verify whether these variables are present in the Vercel project dashboard.

## 7. Root Cause Hypotheses

| Classification | Hypothesis | Evidence | Confidence | Impact | Recommended fix |
|---|---|---|---|---|---|
| A | False-positive / stale deployment status | Failure repeats across multiple commits. | Low | Low if proven stale. | Check dashboard deployment list. |
| B | Preview-only issue | PR head failed, but merge commit also failed. | Medium-low | Could block preview QA. | Check production deployment status. |
| C | Main/production deployment issue | Current `main` commit has `Vercel: failure`. Live alias not verified. | Medium | Potential release blocker. | Check production alias and latest deployment. |
| D | Build command mismatch | GitHub command is known; Vercel command is not visible in repo. | Medium | Can break deploy while GitHub succeeds. | Verify Vercel install/build/output/root settings. |
| E | Missing environment variable | Required env variables are documented; dashboard values cannot be verified. | Medium | Can break serverless build/runtime. | Verify Preview and Production env. |
| F | Node/npm/runtime mismatch | GitHub pins Node 22; repo has no `engines.node`; Vercel Node setting not visible. | Medium | Can break build/runtime. | Verify Vercel Node.js version. |
| G | Vite/build output mismatch | `vite build` should output `dist`; dashboard output directory not visible. | Low-medium | Could break if output dir is wrong. | Verify output directory is `dist`. |
| H | Routing/rewrite issue | Current rewrites are narrow; routing usually does not cause build failure. | Low | Runtime path risk, less likely build Error. | Review logs before changing rewrites. |
| I | Vercel integration/config issue | Empty preview URL in bot data and repeated failures. | Medium-high | Blocks preview evidence. | Inspect Git integration and project settings. |
| J | Unknown due to missing logs | Raw Vercel logs unavailable. | High | Root cause cannot be closed. | Get exact dashboard logs. |

## 8. Root Cause Conclusion

Confirmed root cause: **not available from GitHub evidence alone**.

Most defensible conclusion:

```text
J. Unknown due to missing logs
```

Most likely operational area:

```text
Vercel project/dashboard configuration, environment variables, Node/runtime setting, build command/output directory/root directory, or Git integration.
```

P1-21 is unlikely to be the direct cause because PR #47 changed only documentation files, GitHub QA run #205 passed, and Vercel failure is also present on earlier merge commits.

No code/config fix was applied because the logs are insufficient to justify a specific repository change without risk of random deploy fixes.

## 9. Release Impact

GitHub QA release gate:

```text
success
```

Vercel deployment confidence:

```text
not confirmed / failing status visible from GitHub
```

Release impact:

- This is not evidence that product code is broken, because GitHub install/typecheck/build/E2E succeeded.
- This is a release/deployment confidence blocker for Vercel-based preview or production release validation.
- This blocks using the failed Vercel preview deployment as the source for screenshot QA.
- A local/browser screenshot pass could technically run against a locally built app, but it would not prove Vercel deployment readiness.

Recommended release decision:

```text
Do not use Vercel preview/main deployment for the next visual QA screenshot pass until Vercel raw logs are reviewed or a successful Vercel deployment is confirmed.
```

## 10. Recommended Fix

No repository fix should be applied until Vercel logs identify the failing step.

Required data from Vercel Dashboard:

1. deployment log;
2. build command;
3. install command;
4. Node version;
5. root directory;
6. output directory;
7. environment variables availability by environment: Preview and Production;
8. framework preset;
9. exact error stack;
10. whether deployment failed during install, build, serverless function build, route validation, or post-build.

Likely fixes depending on logs:

- If Node mismatch: set Vercel Node version in dashboard or add a repository `engines.node` field after confirming compatibility.
- If build command mismatch: set Vercel build command to `npm run build`.
- If install command mismatch: set install command to `npm ci` or align with lockfile strategy.
- If output mismatch: set output directory to `dist`.
- If root directory mismatch: set Vercel root directory to repository root.
- If env missing: add missing variables in Vercel Preview/Production environments.
- If Vercel integration stale: reconnect project / redeploy latest `main`.

## 11. Actions Taken

- Reviewed PR #47 metadata and changed files.
- Reviewed GitHub Actions run #205 and job steps.
- Reviewed Vercel combined status for PR #47 final head.
- Reviewed Vercel combined status for PR #47 merge commit / current `main`.
- Checked Vercel status on earlier merge commits PR #44 and PR #46.
- Reviewed `package.json`.
- Reviewed `package-lock.json` top-level metadata.
- Reviewed `.github/workflows/qa.yml`.
- Reviewed `vercel.json`.
- Reviewed `vite.config.ts`.
- Reviewed `tsconfig.json`.
- Reviewed `.env.example` and `.env.production.example`.
- Reviewed Vercel deployment/env documentation.
- Created this investigation report.
- Updated `docs/planning/current-backlog.md` with P1-22 Vercel dashboard log verification follow-up.

No UI/CSS/Constructor/Pricing/API/Three.js/Production files were changed.

GitHub issues were not changed.

## 12. Remaining Risks

1. Vercel raw logs are still unavailable from the GitHub connector.
2. Current `main` still has a visible `Vercel: failure` status in GitHub combined status.
3. The live production alias status cannot be verified from the current connector output.
4. Vercel Preview and Production environments may have different env variables; both need dashboard verification.
5. If the next visual QA uses local build only, it will not validate Vercel deploy readiness.

## 13. Closure Review

| Criterion | Status |
|---|---|
| Investigation report created | Done |
| GitHub QA status recorded | Done: run #205, success |
| Vercel status recorded | Done: PR head and merge commit failure |
| Raw logs availability recorded | Done: unavailable through GitHub connector |
| Root cause classified | Done: J / unknown due to missing logs |
| Release impact recorded | Done |
| Recommended next action recorded | Done: Vercel dashboard log verification |
| Backlog updated | Done: P1-22 added |
| Unrelated code/UI/API/pricing/production untouched | Done |
| GitHub issues untouched | Done |

Decision:

```text
Vercel Deployment Error Investigation v1 is complete as a GitHub-evidence investigation, but the deployment issue itself remains open until Vercel dashboard logs are reviewed.
```
