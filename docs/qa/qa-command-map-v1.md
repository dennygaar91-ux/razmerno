# QA Command Map v1 — Размерно

Статус: audit-only.  
Дата: 2026-06-14.  
Роль: QA Lead.  
Scope: классификация QA/test/build/CI команд без изменения `package.json`, runtime-кода или workflow.

## 0. Ограничения

Не изменялись:

- `package.json`;
- `.github/workflows/**`;
- source/runtime files;
- pricing;
- constructor;
- Three.js;
- checkout;
- production;
- admin;
- API/Supabase.

Документ нужен, чтобы новые агенты не путали актуальные QA-команды, historical stage checks и legacy quarantine checks.

## 1. Executive Summary

В проекте есть большое количество npm scripts. Они делятся на несколько разных эпох и назначений:

1. Core checks — обязательный минимум для любого runtime PR.
2. Active Constructor3D checks — актуальная ветка MVP.
3. Active constructor store/adapters tests — новая state/order/production-preview линия.
4. Pricing tests — критичная линия точной цены.
5. Production tests — export/manufacturing/Basis/documents.
6. Browser smoke / Playwright — пользовательские сценарии.
7. API/admin/Supabase/deploy checks — serverless и production readiness.
8. Legacy/configurator tests — test-backed quarantine, не источник нового функционала.
9. Historical stage guards — полезны как regression markers, но не должны управлять текущим roadmap.

Главный риск: `qa:all` слишком широкий и смешивает исторические этапы с текущим MVP. Его нельзя использовать как единственный понятный quality gate для всех агентов без предварительной нормализации.

## 2. Recommended command tiers

### Tier 0 — Docs-only tasks

Для задач, которые меняют только документацию:

```bash
# no runtime checks required by default
```

Рекомендация: если документ затрагивает QA/CI/build commands, вручную сверять `package.json` и `.github/workflows/**`.

### Tier 1 — Minimum runtime PR gate

Минимум для любого изменения source/config/runtime:

```bash
npm run typecheck
npm run typecheck:api
npm run build
```

Статус: должен быть required в CI.

### Tier 2 — Required fast QA gate for current MVP

Рекомендуемый fast suite для PR после стабилизации:

```bash
npm run typecheck
npm run typecheck:api
npm run build
npm run test:constructor-store
npm run test:constructor-payload
npm run test:production-preview
npm run test:constructor-draft
npm run test:constructor-flow
npm run test:constructor-pii-order
npm run test:constructor-three
npm run test:constructor-three-safety
npm run test:pricing-catalog
npm run test:pricing-engine
npm run test:delivery
npm run test:pricing-breakdown
npm run test:pricing-final
npm run test:production-export
npm run test:manufacturing-rules
npm run test:basis-documents
npm run test:email-attachments
```

Примечание: перед подключением в CI нужно один раз прогнать локально и убрать flaky/obsolete commands отдельным QA implementation этапом.

### Tier 3 — Browser smoke gate

```bash
npm run test:constructor3d-e2e
npm run test:desktop-e2e
```

Статус: P1. Сначала можно сделать non-blocking/manual, затем required.

### Tier 4 — Production/deploy gate

```bash
npm run predeploy:guard
SMOKE_BASE_URL=https://razmerno.ru npm run smoke:deploy
```

Статус: manual/post-deploy. Не должен запускаться как обычный PR gate без env.

## 3. Command ownership matrix

| Command / family | Ownership | Current role | Risk | Recommendation |
|---|---|---|---:|---|
| `typecheck` | QA / Frontend | Frontend TS check | Medium | Required in CI |
| `typecheck:api` | QA / API | API/serverless TS check | High | Required in CI |
| `build` | QA / Frontend | Vite build | Medium | Required in CI |
| `qa:core` | QA | Core typecheck/build/audit | Medium | Useful but includes `npm audit`; keep separate from fast dev loop |
| `qa:frontend` | QA / Frontend | typecheck + build | Medium | Useful local shortcut |
| `qa:api` | QA / API | API typecheck | High | Keep required if API changes |
| `qa:production` | Production QA | production export/manufacturing/Basis/email docs tests | High | Required before production layer changes |
| `qa:admin` | Admin QA | admin final check | High | Required only for admin changes |
| `qa:cleanup` | Architecture QA | cleanup/architecture guard | Medium | Run only in cleanup/architecture scope |
| `qa:all` | Historical mega-suite | Everything mixed | High | Do not use as primary agent instruction until normalized |
| `qa:all:normalized` | QA | Better grouping, still broad | Medium | Candidate for future full suite |

## 4. Active Constructor3D command group

Current active/MVP constructor work should prefer these commands:

```bash
npm run test:constructor-store
npm run test:constructor-payload
npm run test:production-preview
npm run test:constructor-draft
npm run test:constructor-flow
npm run test:constructor-pii-order
npm run test:constructor-three
npm run test:constructor-three-safety
npm run test:constructor3d-e2e
npm run test:constructor3d-wcag-e2e
```

Risk notes:

- `test:constructor3d-e2e` and `test:constructor3d-wcag-e2e` require Playwright/browser environment.
- `test:constructor-three` checks adapter/model output, not real WebGL runtime.
- `test:constructor-three-safety` is mostly source/static safety, not full runtime behavior.

Missing active command:

```bash
npm run check:constructor3d-guard
```

This command is referenced by architecture blockers/guard specs, but must be implemented/connected in a separate scripts-only task, not in this QA documentation task.

## 5. Pricing command group

Current pricing checks:

```bash
npm run build:price-seed
npm run check:price-integrity
npm run test:pricing-catalog
npm run test:pricing-engine
npm run test:delivery
npm run test:pricing-breakdown
npm run test:runtime-catalog
npm run test:pricing-final
```

Risk notes:

- Good coverage exists for catalog seed, markup, delivery and smoke totals.
- Missing golden fixtures and server/client parity tests.
- Any pricing change must run the full group and update pricing audit docs if source of truth changes.

Recommended future additions:

```bash
npm run test:pricing-golden
npm run test:pricing-parity
npm run test:pricing-policy
```

## 6. Checkout/order command group

Current relevant checks:

```bash
npm run test:constructor-payload
npm run test:constructor-flow
npm run test:constructor-pii-order
npm run test:checkout-payload
npm run test:checkout-submit-hook
npm run test:checkout-submit-hook
```

Risk notes:

- Some checkout commands still target legacy `src/configurator/**`.
- Active Constructor3D submit hook needs dedicated test ownership.
- Browser tests currently check validation/interactivity, but not real mocked submit success/failure.

Recommended future additions:

```bash
npm run test:constructor-submit-hook
npm run test:api-orders-handler
npm run test:constructor3d-submit-e2e
```

## 7. Production command group

Current production checks:

```bash
npm run test:geometry
npm run test:production-export
npm run test:manufacturing-rules
npm run test:basis-documents
npm run test:email-attachments
npm run check:production-env
npm run predeploy:guard
npm run smoke:deploy
```

Risk notes:

- Production export/manufacturing/Basis/documents have foundation tests.
- Supabase/live deploy still needs env-gated integration checks.
- Production golden snapshots are missing.

## 8. Browser / E2E / smoke command group

Current browser/smoke commands:

```bash
npm run test:browser
npm run test:browser-smoke-static
npm run test:browser-smoke
npm run test:browser-smoke:system
npm run test:browser-smoke:mobile
npm run test:desktop-e2e
npm run test:constructor3d-e2e
npm run test:constructor3d-wcag-e2e
```

Risk notes:

- Playwright config builds and previews app before tests.
- Browser tests are not currently part of `.github/workflows/qa.yml`.
- Mobile browser smoke exists as a command, but current product strategy says mobile can be postponed for MVP if it blocks desktop. Keep it non-blocking until explicitly prioritized.

## 9. Legacy/configurator command group

These commands reference legacy or transitional `src/configurator/**` logic and must be treated as quarantine coverage, not current feature surface:

```bash
npm run test:compartments
npm run test:layout-state
npm run test:compartment-ui
npm run test:advanced-layout
npm run test:compartment-editor
npm run test:compartment-counts
npm run test:add-layout-parts
npm run test:layout-payload
npm run test:layout-validation
npm run test:layout-final
npm run test:zustand-foundation
npm run test:zustand-bridge
npm run test:provider-store-sync
npm run test:mobile-bar-zustand-read
npm run test:config-header-zustand-read
npm run test:stepper-zustand-read
npm run test:three-markers-zustand-read
npm run test:highlight-zustand-read
npm run test:three-viewer-zustand-read
npm run test:bridge-read-tests
npm run test:config-actions-coverage
npm run test:config-layout-sync
npm run test:config-actions-reset
npm run test:checkout-payload
npm run test:checkout-submit-hook
```

Rule:

- do not delete;
- do not expand with new feature tests unless explicitly part of legacy migration;
- map each command to active replacement before removal.

## 10. Historical stage guard group

Many commands named `check:stage*`, `qa:stage*`, `check:stage-n*`, `check:stage-q*` are historical or stage-specific guards.

Classification:

- Useful as regression markers.
- Dangerous as primary agent instructions because stage numbering conflicts with current roadmap.
- Must be preserved until ownership map and migration plan are complete.

Rule for agents:

If a prompt says only “run the relevant checks”, do not automatically run every historical stage command. Choose commands by changed area.

## 11. Proposed CI jobs

### Job 1 — required-core

```yaml
- npm ci
- npm run typecheck
- npm run typecheck:api
- npm run build
```

### Job 2 — required-fast-tests

```yaml
- npm run test:constructor-store
- npm run test:constructor-payload
- npm run test:production-preview
- npm run test:constructor-flow
- npm run test:constructor-three
- npm run test:pricing-catalog
- npm run test:pricing-engine
- npm run test:delivery
- npm run test:pricing-breakdown
- npm run test:pricing-final
- npm run test:production-export
- npm run test:manufacturing-rules
- npm run test:basis-documents
- npm run test:email-attachments
```

### Job 3 — browser-smoke

```yaml
- npm run test:constructor3d-e2e
- npm run test:desktop-e2e
```

Start as non-blocking/manual if CI browser stability is unknown.

### Job 4 — deploy-smoke

Manual or post-deploy only:

```yaml
- SMOKE_BASE_URL=${{ vars.SMOKE_BASE_URL }} npm run smoke:deploy
```

## 12. Next QA tasks

P0:

1. Create `docs/qa/legacy-test-ownership-v1.md`.
2. Add CI fast tests after local verification.
3. Add coverage tool and thresholds.
4. Add active Constructor3D guard script in separate scripts-only implementation task.

P1:

1. Add browser smoke job.
2. Add mocked checkout submit e2e.
3. Add pricing golden/parity tests.
4. Add API handler tests.

## 13. Final note

This map is a governance artifact. It does not prove commands currently pass. Before turning any group into required CI, run it locally or in a temporary CI branch and fix obsolete/flaky checks without changing business logic.
