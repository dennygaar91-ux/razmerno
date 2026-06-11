# Infrastructure Decomposition Pass — Filling + Shell UI Split

Date: 2026-06-10

## Scope

This pass continued infrastructure-only decomposition after `razmerno-infrastructure-decomposition-all-pass.zip`.

No business logic, pricing, checkout submission, validation rules, Three.js geometry, routes, UX, or visual design were intentionally changed.

## What was decomposed

### FillingStepPanel split

`src/static-pages/constructor/components/FillingStepPanel.tsx` was reduced from a large feature component into a thin orchestrator.

New files:

- `src/static-pages/constructor/components/FillingStepTypes.ts`
- `src/static-pages/constructor/components/FillingSelectionPanel.tsx`
- `src/static-pages/constructor/components/FillingAddMenu.tsx`
- `src/static-pages/constructor/components/FillingFacadeControls.tsx`
- `src/static-pages/constructor/components/FillingElementsList.tsx`

Responsibilities:

- `FillingStepPanel.tsx`: derived state + composition only.
- `FillingSelectionPanel.tsx`: empty state, current selection, section picker.
- `FillingAddMenu.tsx`: local add menu actions for selected zone.
- `FillingFacadeControls.tsx`: section facades, zone facade override, handles, exact-mode toggle.
- `FillingElementsList.tsx`: zone summary, random preset action, zone list, elements list, validation panel.
- `FillingStepTypes.ts`: local prop/type boundaries for filling components.

### Constructor3DPage shell split

Extracted additional shell-level UI blocks from `Constructor3DPage.tsx`:

- `src/static-pages/constructor/components/ConstructorStagebar.tsx`
- `src/static-pages/constructor/components/ConstructorDrawerFooter.tsx`

Responsibilities:

- `ConstructorStagebar.tsx`: stepper and runtime status badge.
- `ConstructorDrawerFooter.tsx`: exact price block, consent footer, primary/secondary actions, submit message/help.

## File size changes

| File | Before this pass | After this pass |
|---|---:|---:|
| `src/static-pages/Constructor3DPage.tsx` | 705 | 576 |
| `src/static-pages/constructor/components/FillingStepPanel.tsx` | 631 | 225 |

## Verification

Successful checks:

```bash
npm run typecheck
npm run build
npm run qa:static
npm run validate:config
npm run test:constructor-store
npm run test:constructor-three
npm run test:pricing-final
```

## Remaining risks

- `Constructor3DPage.tsx` remains a large orchestrator at 576 lines.
- `FillingStepPanel.tsx` is now manageable, but `FillingElementsList.tsx` is 221 lines and can later be split further if needed.
- `constructorStore.ts`, `projectRules.ts`, `constructor3d.css`, and `constructor.css` remain the highest-risk files.
- No CSS cleanup was attempted in this pass.

## Recommended next safe pass

1. Extract `ConstructorScenePanel.tsx` from `Constructor3DPage.tsx`.
2. Extract `ConstructorWorkspaceShell.tsx` if the page remains too large.
3. Start `constructorStore.ts` decomposition only after the page-level UI has stabilized.
