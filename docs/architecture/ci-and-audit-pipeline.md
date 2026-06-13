# CI and Audit Pipeline — «Размерно»

Дата: 2026-06-13
Тип: infrastructure / CI documentation.

## 1. Назначение

Документ фиксирует, как устроен текущий GitHub Actions pipeline проекта и как использовать его для безопасной дальнейшей разработки.

Главная цель pipeline — не заменить ручной review, а дать минимальный автоматический барьер против регрессий:

- TypeScript errors;
- API type errors;
- broken frontend build;
- missing architecture docs;
- CSS architecture issues;
- production geometry architecture issues;
- repository inventory artifacts.

## 2. Workflow file

Текущий workflow:

```text
.github/workflows/qa.yml
```

Название workflow:

```text
QA
```

Triggers:

- push в `main`;
- pull request в `main`;
- manual `workflow_dispatch`.

## 3. Permissions

```yaml
permissions:
  contents: read
```

Это безопасный read-only режим для CI. Workflow не должен писать в репозиторий.

## 4. Concurrency

```yaml
concurrency:
  group: qa-${{ github.ref }}
  cancel-in-progress: true
```

Если в одну ветку быстро прилетает несколько commit, старый прогон отменяется, новый остаётся актуальным.

## 5. Current job

Job:

```text
qa / Typecheck and build
```

Runner:

```text
ubuntu-latest
```

Node:

```text
22
```

Timeout:

```text
20 minutes
```

## 6. Pipeline steps

Порядок текущих шагов:

1. Checkout repository.
2. Setup Node.js.
3. Install dependencies: `npm ci`.
4. Infrastructure inventory check:
   ```bash
   node scripts/infrastructure-audit-report.mjs --check
   ```
5. Generate infrastructure inventory artifact:
   ```bash
   node scripts/infrastructure-audit-report.mjs
   ```
6. Upload infrastructure inventory artifact.
7. Typecheck frontend:
   ```bash
   npm run typecheck
   ```
8. Typecheck API:
   ```bash
   npm run typecheck:api
   ```
9. Build frontend:
   ```bash
   npm run build
   ```
10. Check CSS architecture:
   ```bash
   npm run check:css-architecture
   ```
11. Check production geometry architecture:
   ```bash
   npm run check:production-geometry-architecture
   ```

## 7. Infrastructure inventory script

Script:

```text
scripts/infrastructure-audit-report.mjs
```

Modes:

### Check-only mode

```bash
node scripts/infrastructure-audit-report.mjs --check
```

Used in CI as a guard. It does not write generated files. It checks that required architecture/audit docs exist.

### Report generation mode

```bash
node scripts/infrastructure-audit-report.mjs
```

Generates:

```text
docs/audits/generated/repository-inventory-latest.json
docs/audits/generated/repository-inventory-latest.md
```

In GitHub Actions these files are uploaded as artifact, not committed.

## 8. Artifact

Artifact name:

```text
repository-infrastructure-inventory
```

Retention:

```text
14 days
```

Expected artifact contents:

- `repository-inventory-latest.md`
- `repository-inventory-latest.json`

Purpose:

- inspect largest files;
- inspect files over 500/1000 lines;
- inspect route signals;
- inspect docs coverage;
- inspect protected-zone import signals.

## 9. How to interpret inventory report

### Largest files

This list is a prioritization signal. A large file is not automatically bad, but it needs ownership and decomposition strategy.

### Files over 500 lines

These are decomposition candidates. Do not refactor them automatically.

### Protected-zone import signals

These are candidates for review only. A signal means that a UI/admin file imports something related to protected zones such as pricing/order/production. It may be legitimate, but it should be explicitly understood.

### Docs coverage

Missing docs are treated as CI blockers because architecture docs are part of the current infrastructure foundation.

## 10. What to do if CI fails

### Failure in `npm ci`

Likely causes:

- lockfile mismatch;
- package registry issue;
- dependency conflict.

Action:

- do not change code blindly;
- inspect log;
- if lockfile issue, fix in dedicated dependency task.

### Failure in infrastructure inventory

Likely causes:

- required architecture/audit doc missing;
- script syntax error;
- Node version incompatibility.

Action:

- inspect missing docs list;
- add/restore docs if needed;
- do not bypass unless intentionally changing architecture docs policy.

### Failure in frontend typecheck

Likely causes:

- TS error in frontend code;
- broken import;
- type mismatch after refactor.

Action:

- fix only the failing area;
- avoid broad refactor;
- rerun CI.

### Failure in API typecheck

Likely causes:

- server/API type error;
- incorrect import from frontend-only module;
- incompatible Vercel/serverless type.

Action:

- treat as protected-zone issue;
- do not mix with UI work;
- document risk.

### Failure in build

Likely causes:

- Vite build error;
- broken dynamic import;
- CSS/import issue;
- env assumptions leaking into build.

Action:

- inspect log;
- fix smallest area;
- avoid changing product logic.

### Failure in CSS architecture check

Likely causes:

- CSS file exceeds guard;
- required CSS docs missing;
- generated inventory mismatch.

Action:

- follow `docs/architecture/css-ownership-map.md`;
- no purge-first fix.

### Failure in production geometry architecture check

Likely causes:

- production geometry boundary violation;
- missing architecture guard condition;
- accidental edit in protected production layer.

Action:

- stop and review before changing production code.

## 11. Current limitation

At the time of writing, GitHub API calls from the assistant returned no workflow runs for recent commits. Possible reasons:

- Actions disabled in repository settings;
- workflow not yet indexed;
- GitHub connector only filters PR-triggered runs;
- run is delayed/cancelled;
- repository settings require manual enablement.

Until a real workflow run is visible, CI must be treated as configured but not verified.

## 12. Verification checklist

The pipeline is considered verified only when:

- a `QA` run appears in GitHub Actions;
- `npm ci` completes;
- infrastructure inventory check completes;
- artifact is uploaded;
- frontend typecheck completes;
- API typecheck completes;
- build completes;
- CSS architecture check completes;
- production geometry check completes.

## 13. Recommended future improvements

### CI-1. Separate fast and full workflows

Create:

- `qa-fast.yml`: docs, typecheck, build;
- `qa-full.yml`: production tests, browser tests, Playwright, pricing scenarios.

### CI-2. PR comments

Add summary comment on PR with:

- largest files changed;
- protected-zone touched;
- generated inventory summary.

### CI-3. Playwright artifacts

For visual/UX work:

- screenshots;
- trace artifacts;
- HTML report.

### CI-4. Price QA matrix

Add generated report for price scenarios once scenarios are formalized.

### CI-5. Dependency graph

Extend infrastructure report with import graph and cycles.

## 14. Rules for future agents

1. Never claim checks passed unless a CI run or local log confirms it.
2. If workflow run is invisible, say so directly.
3. Treat generated inventory as advisory, not absolute truth.
4. Do not fix CI by weakening checks unless explicitly approved.
5. Keep docs and backlog aligned after infrastructure changes.
6. Protected zones require separate task, separate report, and extra QA.
