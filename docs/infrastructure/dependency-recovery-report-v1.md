# Dependency Recovery Report v1 — Размерно

Дата: 2026-06-15.

Роль: Dependency Recovery Agent.

Статус: infrastructure-only / dependency layer only.

Scope guard: не менялись constructor logic, reset logic, constructor tests, pricing, checkout, API, Supabase, Three.js functionality, production layer, admin, UI или дизайн.

## 1. Executive Summary

Цель этапа — восстановить возможность установки зависимостей и запуска сборки после сообщений о `403 npm registry access denied`.

Подтверждено:

- проект использует `npm` и `package-lock.json` lockfile version 3;
- `.npmrc` в репозитории отсутствовал до recovery-ветки;
- `package-lock.json` не показывает private registry dependency source;
- platform-specific packages для Rollup, esbuild и lightningcss присутствуют в lockfile и выглядят как публичные npm packages;
- CI использует Node.js 20 и `npm ci`;
- последний проверенный commit имел Vercel failure signal, а GitHub workflow runs для него не были доступны;
- P1-21 Reset Action Separation уже присутствует в `docs/planning/current-backlog.md`, дубль не создавался.

Изменено в dependency layer:

- добавлен `.npmrc` с явным public npm registry, отключением audit/fund side effects и retry-настройками;
- `.github/workflows/qa.yml` изменён с `npm ci` на `npm ci --no-audit --fund=false`;
- в `docs/planning/current-backlog.md` добавлена `P0-19 Dependency Layer Recovery Verification`.

Не подтверждено:

- `npm ci` не был успешно выполнен в текущей agent execution environment;
- `npm install` не был успешно выполнен;
- `npm run typecheck` и `npm run build` не подтверждены после recovery changes;
- точный пакет, вызвавший предыдущий `403`, не локализован, потому что job log с exact package URL недоступен.

Итог: root cause class локализован как npm registry / execution environment configuration issue, а не product code issue. Зависимости нельзя считать восстановленными до успешного `npm ci` или `npm install`.

## 2. Dependency Map

Package manager: `npm`.

Lock file: `package-lock.json`, lockfileVersion 3.

Core scripts:

- `dev`: `vite`;
- `build`: `vite build`;
- `typecheck`: `tsc --noEmit`.

Key versions:

| Dependency | Version |
|---|---:|
| `react` | `^18.3.1` |
| `react-dom` | `^18.3.1` |
| `three` | `^0.163.0` |
| `@react-three/fiber` | `^8.16.0`, locked as `8.18.0` |
| `@react-three/drei` | `^9.105.0` |
| `zustand` | `4.5.5` |
| `@supabase/supabase-js` | `^2.48.1` |
| `vite` | `7.3.2` |
| `@vitejs/plugin-react` | `5.1.1` |
| `typescript` | `5.9.3` |
| `tsx` | `^4.19.0`, locked as `4.22.3` |
| `esbuild` | `0.27.7` via Vite; nested `0.28.0` via `tsx` |
| `rollup` | `4.60.4` observed in platform packages |
| `@tailwindcss/vite` | `4.1.17` |
| `tailwindcss` | `4.1.17` |
| `@playwright/test` | `^1.57.0` |
| `vitest` | not present |

Platform-specific packages:

- `@rollup/rollup-*` optional packages;
- `@esbuild/*` optional packages;
- nested `tsx/node_modules/@esbuild/*` optional packages;
- `lightningcss-*` optional packages.

Risk note: Vite 7.3.2 and `@vitejs/plugin-react` 5.1.1 require Node `^20.19.0 || >=22.12.0`. CI uses Node 20, which should resolve to a compatible patch version, but this still must be proven by CI.

## 3. NPM Investigation

Requested commands:

- `npm ci`;
- `npm install`.

Repository evidence:

- prior CI investigation documented that install failed before project scripts started;
- prior CI investigation documented no explicit registry configuration and no `.npmrc`;
- current workflow before this branch used Node 20 and `npm ci`;
- recovery branch uses `.npmrc` and `npm ci --no-audit --fund=false`.

Local execution limitation:

- local `git clone` from GitHub failed with DNS/network error: `Could not resolve host: github.com`;
- therefore local `npm ci`, `npm install`, `typecheck` and `build` could not be honestly executed from this environment.

The original `403` could not be reproduced with exact package name because the failed job log was not accessible.

## 4. 403 Root Cause Analysis

Candidate A — local/agent environment issue: confirmed as a factor in the current execution environment because GitHub DNS fails and npm registry checks do not complete reliably.

Candidate B — npm registry configuration issue: supported by evidence because `.npmrc` was absent and CI did not explicitly pin registry behavior. Recovery action applied.

Candidate C — broken lockfile: not supported by available evidence. Lockfile is valid JSON, lockfileVersion 3, and root dependency map matches `package.json`.

Candidate D — dependency points to private registry: not supported by available evidence. Repository search found no private npm registry reference.

Candidate E — other cause: still possible. Vercel npm config, GitHub runner cache, organization-level registry policy, temporary npm outage or exact package-level registry response cannot be ruled out without logs.

Conclusion: available evidence points to registry/environment configuration, not to package manifest, lockfile corruption, product code, constructor logic or tests. Exact failed package remains unknown.

## 5. Lockfile Review

Findings:

- `package-lock.json` exists and uses lockfileVersion 3;
- root entry matches `package.json`;
- platform-specific optional binaries are present for Rollup, esbuild and lightningcss;
- no private registry reference was found;
- no direct evidence of lockfile corruption was found.

Lockfile was not regenerated because install could not be verified locally and the observed issue is registry access/configuration rather than dependency graph mismatch.

## 6. GitHub Actions Review

Current workflow:

- runs on push to `main`, pull_request to `main`, and manual dispatch;
- uses `actions/setup-node@v4`, Node 20 and npm cache;
- runs install, typecheck, API typecheck, build, fast active tests, coverage snapshot and architecture checks.

Recovery branch change:

- install step now uses `npm ci --no-audit --fund=false`.

Remaining CI gap:

- no successful workflow run has been observed yet on the recovery branch.

## 7. Dependency Recovery

Applied changes on branch `dependency-recovery-v1`:

1. Added `.npmrc` with public npm registry, install side-effect controls and retry settings.
2. Changed GitHub Actions install command to `npm ci --no-audit --fund=false`.
3. Added backlog item `P0-19 Dependency Layer Recovery Verification`.

Dependency recovery status: configuration recovery applied; operational recovery not yet proven.

## 8. Typecheck Results

Command: `npm run typecheck`.

Result: not confirmed. It was not successfully executed because dependency installation could not be completed in the current environment.

## 9. Build Results

Command: `npm run build`.

Result: not confirmed. It was not successfully executed because dependency installation could not be completed in the current environment.

## 10. Backlog Updates

Updated `docs/planning/current-backlog.md`:

- added `P0-19 Dependency Layer Recovery Verification`.

P1-21 Reset Action Separation:

- checked;
- already present;
- no duplicate created.

No temporary backlog files or follow-up planning files were created.

## 11. Remaining Risks

1. `npm ci` may still fail if CI/Vercel environment-level registry policy overrides project config.
2. The previous `403` package name and URL remain unknown without the original job log.
3. Vercel may use a different install command or npm configuration than GitHub Actions.
4. GitHub Actions must run on the recovery branch to prove dependency recovery.
5. P0-16 and P0-17 cannot be closed until dependency install, typecheck, build and relevant constructor tests are actually confirmed.
6. Required source documents `docs/infrastructure/build-verification-report-v1.md` and `docs/constructor/reset-contract-fix-report-v2.md` were requested but were not found in the repository during this pass.

## Final Status

Minimum success: partially achieved. Root cause class was localized to npm registry/environment configuration rather than product code, private dependency or lockfile corruption.

Full success: not achieved. Dependencies are not proven restored until `npm ci` or `npm install` passes in a clean environment.

Next required action: open/run CI for branch `dependency-recovery-v1`, inspect the `Install dependencies` step, then run/confirm `npm run typecheck`, `npm run build`, and relevant constructor tests. If install still fails, capture the exact package URL and HTTP response before any further dependency changes.
