# Infrastructure Decomposition Pass 03 — Materials step extraction

Date: 2026-06-10

## Goal

Continue infrastructure-only decomposition of `src/static-pages/Constructor3DPage.tsx` without changing runtime behavior, UX, visual design, pricing, checkout, Three.js logic, routing, validation rules, or business logic.

## Scope

This pass extracted the materials step UI from the page-level orchestrator into a dedicated component.

## Created files

- `src/static-pages/constructor/components/MaterialsStepPanel.tsx`

The new component contains:

- `MaterialsStepPanel`
- `MaterialSelectionSummary`
- `MaterialSummaryItem`
- `MaterialPicker`
- `BackPanelMaterialPreview`
- local material swatch style helper

## Changed files

- `src/static-pages/Constructor3DPage.tsx`
- `docs/decomposition-plan.md`
- `docs/infrastructure-decomposition-pass-03.md`

## Result

`Constructor3DPage.tsx` was reduced from 2019 lines to 1789 lines.

## Behavior impact

No intended behavior changes.

The extracted component still receives all data and callbacks through props from the page orchestrator:

- body material value
- facade material value
- selected material metadata
- selected facade metadata
- validation state
- material update callbacks
- facade material update callbacks
- auto-fix callback
- existing `StepIntro` and `ValidationAssist` renderers

## Checks

Passed:

- `npm run typecheck`
- `npm run build`
- `npm run qa:static`
- `npm run validate:config`
- `npm run test:constructor-store`
- `npm run test:constructor-three`
- `npm run test:pricing-final`

## Deferred work

- Extract filling step panel.
- Extract checkout step panel.
- Split `constructorStore.ts` into feature-oriented slices/actions only after UI extraction is stable.
- Do not perform full CSS cleanup until the page-level UI decomposition is mostly complete.
