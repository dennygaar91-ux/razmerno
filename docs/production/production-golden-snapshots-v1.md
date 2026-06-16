# Production Golden Snapshots v1

## 1. Executive Summary

Production Golden Snapshots v1 adds regression protection for the current `razmerno.production-model.v2` JSON layer. The snapshot contract is generated from the existing production engine, `buildProductionModel(project)`, and covers panels, material/decor identity, dimensions, edge banding, hardware, drilling/operations, technologist-check flags, totals and the current Basis/export-ready plan shape.

This task deliberately does not change production business rules. It protects the current output shape so future production, pricing or admin changes do not silently break manufacturing data.

## 2. Scope

In scope:

- production golden fixture cases for wardrobe MVP scenarios;
- deterministic production snapshot normalization;
- production snapshot contract tests generated from the current production engine;
- guard coverage for fixture/test/docs/workflow/script ownership;
- explicit QA workflow steps for production golden snapshots.

Out of scope:

- `.b3d` generation;
- full Basis integration;
- factory certification;
- pricing parity changes;
- API/order contract changes;
- UI, Constructor3D or Three.js changes.

## 3. Production Layer Inventory

Current source-of-truth production engine:

- `src/constructor/productionModel.ts` exports `buildProductionModel(project)`.
- `src/constructor/productionModel.types.ts` defines `ProductionModel`, `ProductionPanel`, `HardwareItem`, `DrillingOperation` and Basis/export plan types.
- `src/constructor/productionRules.ts` stores manufacturing rules used by the engine.
- `src/constructor/productionModelPanels.ts` normalizes panel fields such as material titles, area and edge length.
- `src/constructor/productionModelEdges.ts` builds edge-banding objects.
- `src/constructor/productionModelDrilling.ts` creates drilling/operation records for mounts, hinges, runners, shelf pins and rods.
- `src/constructor/productionModelTotals.ts` aggregates panel, edge, drilling and hardware totals.
- `src/constructor/productionModelBasis.ts` stores the current Basis/export-ready plan and notes.
- `src/constructor/hardwareCatalog.ts` supplies hardware catalog data.

Important limitation: `src/constructor/productionModel.ts` and related type files are explicitly marked as legacy production model v2. The file is still active because pricing, payload, manual export, Basis adapter and existing drilling/rules flows depend on it. This snapshot layer protects the active legacy-v2 production JSON without treating it as a final manufacturing architecture.

## 4. Golden Snapshot Contract

The contract preserves stable production output only:

- schema and source;
- product type and dimensions;
- thickness;
- panel IDs, roles, material type, material/decor IDs, dimensions, quantity, face side, edge banding, Basis placement and facade metadata;
- hardware IDs, catalog item IDs, quantities, unit and related panel IDs;
- drilling/operation IDs, panel IDs, coordinates, diameter/depth, side, purpose, template ID and `requiresTechnologistCheck`;
- totals;
- derived production status flags;
- Basis/export plan statuses and shape.

Volatile fields are excluded by the normalizer and guard:

- `generatedAt`;
- `createdAt`;
- `updatedAt`;
- `orderId`;
- `projectId`;
- `timestamp`.

Arrays are sorted by stable IDs. Numeric values are rounded to four decimal places to remove precision noise while preserving manufacturing dimensions.

## 5. Golden Cases

The fixture file is `tests/fixtures/production-golden-cases.ts`.

Golden cases:

1. `basic-wardrobe` — single-section wardrobe with minimum filling and hinged facade.
2. `wardrobe-with-shelves` — three-section wardrobe with shelves to cover shelf panels, partitions and shelf-pin drilling.
3. `wardrobe-with-drawers-and-rod` — mixed wardrobe with drawers and clothes rod to cover drawer runners, rod hardware, drawer facade and manual-check operations.
4. `wardrobe-with-production-warnings` — open wardrobe with rod operation to keep stable technologist-check warning flags.

All cases are wardrobe-focused because the current manufacturing logic is safest for wardrobes. Tumba/dresser manufacturing expansion is not added in this scope.

## 6. Snapshot Normalization

The test file exports `normalizeProductionSnapshot(output)` in `tests/production/production-golden-snapshots.test.ts`.

The normalizer:

- removes volatile fields recursively;
- sorts panels, hardware and drilling by stable IDs;
- sorts related panel IDs;
- rounds numeric values to four decimals;
- preserves manufacturing-relevant values rather than masking real differences;
- derives `productionStatus.requiresTechnologistCheck` from operation flags;
- keeps Basis/export plan data in the snapshot contract.

## 7. Test Coverage

The test file is `tests/production/production-golden-snapshots.test.ts`.

Coverage:

- builds snapshots through `buildProductionModel(project)`;
- verifies four golden cases;
- verifies deterministic repeated output;
- verifies no volatile fields;
- verifies schema/source/product shape;
- verifies panel, drilling and hardware coverage;
- verifies required panel roles per case;
- verifies required hardware IDs per case;
- verifies required operation purposes per case;
- verifies totals match normalized production arrays;
- verifies Basis/export plan remains present.

The tests do not compare fake hardcoded JSON. They call the production engine for every case.

## 8. Guard Coverage

The guard file is `scripts/check-production-golden-snapshots.mjs`.

The guard checks:

- required fixture/test/docs files exist;
- at least four golden cases exist;
- expected golden case IDs exist;
- tests reference `buildProductionModel` and `normalizeProductionSnapshot`;
- volatile field filtering exists;
- deterministic repeated-output assertion exists;
- package scripts are present;
- QA workflow contains explicit production golden snapshot guard/test steps;
- obvious fake-output markers are absent.

## 9. QA Workflow Integration

The intended QA workflow steps are:

```yaml
- name: Production golden snapshots guard
  run: npm run check:production-golden-snapshots

- name: Production golden snapshots tests
  run: npm run test:production-golden-snapshots
```

These steps should live near existing production-related checks in `.github/workflows/qa.yml`, after `Fast active tests` / production export coverage and before later P1 visual/browser checks.

## 10. CI Evidence

Pending at document creation time.

Required evidence before closure:

- PR QA run completed with `success`;
- logs show `npm run check:production-golden-snapshots`;
- logs show `npm run test:production-golden-snapshots`;
- existing P1-09, P1-10 and P1-13 checks remain green;
- final PR head commit is recorded in `docs/planning/current-backlog.md`;
- PR number, run number, run ID and merge commit are recorded after merge.

## 11. Known Limitations

- This is not `.b3d` generation.
- This is not full Basis integration.
- This is not factory production certification.
- This is regression protection for the current production JSON layer.
- The protected engine is still marked as legacy production model v2 and should not be treated as the final manufacturing architecture.
- The warning case uses current `requiresTechnologistCheck` operation flags because the current `ProductionModel` type does not expose a separate top-level `warnings` array.

## 12. Remaining Risks

- Current production model is tied to legacy geometry and should later be reconciled with `src/constructor/geometry/*`.
- Warnings are derived from operation flags, not from a dedicated production warning model.
- Basis/export data is a plan/shape, not executable `.b3d` output.
- Hardware catalog quantities are protected at contract level, but exact factory-approved articles remain future scope.

## 13. Closure Review

Production Golden Snapshots can be closed only after:

1. package scripts are present;
2. QA workflow explicitly runs guard and tests through `npm run`;
3. PR QA run succeeds;
4. CI evidence is recorded;
5. PR is merged to `main`;
6. `docs/planning/current-backlog.md` records final PR, run, commit and merge evidence;
7. P1-22 remains open/blocked.
