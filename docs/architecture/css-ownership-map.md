# CSS Ownership Map — «Размерно»

Дата: 2026-06-13
Тип: architecture boundary document.

## 1. Назначение

Документ фиксирует ownership CSS-слоёв проекта. Цель — не допустить случайной поломки визуала при cleanup, split, migration или future redesign.

CSS в проекте исторически развивался этапами, поэтому прямой purge или массовое переименование классов запрещены без visual baseline.

## 2. Главный принцип

CSS cleanup должен идти по схеме:

```text
inventory → ownership map → visual baseline → split without deletion → scoped cleanup → visual QA → deletion
```

Запрещённая схема:

```text
grep unused → delete → hope it works
```

## 3. Current CSS entry map

| Файл | Назначение | Ownership | Риск |
|---|---|---|---|
| `src/styles/base.css` | CSS variables, base body styles, global primitives | Global foundation | Medium |
| `src/index.css` | Landing/global/shared classes | Landing/shared UI | Medium |
| `src/styles/constructor.css` | Legacy/main constructor CSS monolith | Legacy constructor / old stages | High |
| `src/styles/constructor3d.css` | Barrel import for split 3D constructor CSS modules | Active 3D constructor | Medium |
| `src/styles/constructor3d/*` | Split active constructor3d CSS modules | Active 3D constructor | Medium/High |

## 4. `src/styles/base.css`

### Owns

- root color variables;
- global font family;
- body background;
- base box sizing;
- base link/button behavior.

### Do not use for

- page-specific layout;
- constructor-specific overrides;
- landing section styles;
- temporary stage patches.

### Change rule

Changing this file can affect the entire site. Require:

- build;
- visual check landing;
- visual check constructor;
- visual check admin if admin uses global variables.

## 5. `src/index.css`

### Owns

- landing/home page classes;
- shared marketing blocks;
- some global utility-like classes;
- footer/FAQ/material visual classes.

### Does not own

- active 3D constructor internals;
- legacy constructor internals;
- production/admin business UI;
- Three.js canvas internals.

### Risk

`src/index.css` may contain shared primitives used by multiple pages. Do not delete classes based only on static search because dynamic class names and shared markup can create false positives.

## 6. `src/styles/constructor.css`

### Owns

- legacy constructor styles;
- old constructor layout;
- historical stage selectors;
- potential fallback/compatibility styles;
- classes still needed by legacy route or tests.

### Status

Legacy monolith / quarantine candidate.

### Change rule

Do not purge. Do not mass rename. Do not move until:

1. active imports are known;
2. legacy route ownership is decided;
3. screenshots are captured;
4. tests are migrated;
5. user approves cleanup.

### Allowed safe work

- document classes;
- generate inventory;
- identify candidate dead selectors;
- mark as quarantine candidate;
- split only if import order and visual baseline are preserved.

## 7. `src/styles/constructor3d.css`

### Owns

- import order for active 3D constructor CSS modules.

### Current model

This file is a barrel. It should remain small and only import feature/stage CSS modules.

### Change rule

Changing import order may change cascade and visual result. Treat import order as behavior.

Do not reorder imports without:

- explicit reason;
- build;
- visual baseline comparison;
- QA report.

## 8. `src/styles/constructor3d/*`

### Owns

Active 3D constructor UI layers.

Current known modules:

- `00-base.css`
- `10-scene-foundation.css`
- `11-scene-selection-markers.css`
- `20-filling-controls.css`
- `21-facade-controls.css`
- `30-materials.css`
- `40-random-preset.css`
- `50-validation.css`
- `60-checkout.css`
- `70-ui-kit-a11y-base.css`
- `71-price-clarity.css`
- `72-layout-hierarchy.css`
- `80-sizes-step.css`
- `81-filling-step-polish.css`
- `82-materials-step-polish.css`
- `83-checkout-final-polish.css`
- `84-scene-info-simplification.css`
- `85-loading-performance-states.css`
- `86-reset-wcag-hardening.css`
- `90-working-2d-fallback.css`
- `91-compact-constructor-shell.css`
- `92-ui-role-system.css`
- `93-sizes-product-logic.css`
- `94-filling-facade-exact-mode.css`
- `95-real-materials-preview.css`
- `96-product-scene-composition.css`

### Rule

These files should gradually move from stage-numbered names to semantic names, but not before visual baseline.

Recommended future semantic structure:

```text
src/styles/constructor3d/
  shell.css
  scene.css
  scene-selection.css
  drawer.css
  controls.css
  sizes-step.css
  filling-step.css
  materials-step.css
  checkout-step.css
  validation.css
  price.css
  accessibility.css
  fallback-2d.css
  material-preview.css
```

## 9. CSS inventory source

Existing inventory:

```text
docs/css-class-inventory.json
```

Existing docs:

```text
docs/css-architecture-audit.md
docs/css-migration-plan.md
```

Important: `maybeUnusedCount` is not a delete-list. It is only a candidate list.

False positives can happen because of:

- dynamic className strings;
- composed class names;
- test snapshots;
- markdown examples;
- legacy route usage;
- runtime-generated modifiers.

## 10. Route ownership

| Route | Primary CSS |
|---|---|
| `/` | `base.css`, `index.css` |
| `/measurements` | `base.css`, `index.css`, page-specific static styles if any |
| `/materials` | `base.css`, `index.css`, page-specific static styles if any |
| `/assembly` | `base.css`, `index.css`, page-specific static styles if any |
| `/constructor`, `/configurator`, `/constructor-3d`, `/configurator-3d` | `base.css`, `constructor3d.css`, `constructor3d/*`, possibly shared primitives |
| `/constructor-legacy`, `/configurator-legacy` | `base.css`, `constructor.css`, possibly shared primitives |
| `/admin`, `/admin/orders/:id` | `base.css`, Tailwind utilities, shared variables, admin classes |

## 11. Safe CSS workflow

Before any CSS cleanup:

1. Capture screenshots:
   - landing hero;
   - landing materials;
   - landing FAQ/footer;
   - constructor sizes step;
   - constructor filling step with selected zone;
   - constructor materials step;
   - checkout step;
   - 2D fallback;
   - validation error;
   - reset dialog.
2. Run:
   - `npm run typecheck`;
   - `npm run build`;
   - `npm run check:css-architecture`.
3. Change one CSS ownership area at a time.
4. Do not mix selector deletion and visual redesign.
5. Report changed classes.

## 12. Prohibited actions

- Delete `constructor.css` before legacy route decision.
- Reorder `constructor3d.css` imports casually.
- Rename CSS classes without updating all usages and tests.
- Merge landing and constructor CSS cleanup in one commit.
- Remove maybe-unused classes from inventory without visual verification.
- Add new ad-hoc CSS patches outside ownership structure.

## 13. Backlog

1. Create visual baseline checklist.
2. Add screenshot artifacts to GitHub Actions or Playwright workflow.
3. Replace stage-numbered `constructor3d` CSS names with semantic names after baseline.
4. Quarantine `constructor.css` after legacy route decision.
5. Update `docs/css-architecture-audit.md` after current split state.
6. Add owner comments to CSS barrel files.
7. Build CSS usage report into CI only as warning first, not blocker.
