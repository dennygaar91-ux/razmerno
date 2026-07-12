# Role Audit — Production / Manufacturing

## Scope

Роль владеет production model/export, Basis boundary, manufacturing validation, panel/hardware/drilling semantics, v3/v4 migration path и factory-facing correctness.

## Sources Reviewed

- `docs/specification/volume-04-furniture-modeling/README.md`
- `docs/specification/volume-05-manufacturing-engine/README.md`
- `docs/specification/volume-09-architecture/README.md`
- `docs/planning/current-backlog.md`
- `docs/planning/accepted-backlog-decisions-v1.md`
- `src/constructor/production/**`
- `src/constructor/production/v4/**`
- `src/constructor/basis/**`
- `src/constructor/basisAdapter.ts`
- `tests/production-export.test.ts`
- `tests/basis-json-documents.test.ts`
- `tests/manufacturing-rules.test.ts`
- `tests/production-json-v4*.test.ts`
- `docs/production/production-json-schema-v4-design.md`

## Current State

- Active production/export layer живёт в `src/constructor/production/**`.
- Repo явно содержит active v3 export path и parallel isolated v4 engineering layer.
- Basis boundary уже оформлен как manual/intermediate JSON path, не как automatic `.b3d`.
- Есть production/manufacturing tests для export, rules, email attachments и многих v4 semantic policies.
- Есть design doc для `razmerno.production.v4`.

## RPES Alignment

- Production слой отделён от customer UI и оформлен как внутренний engine.
- Basis boundary в коде и документации совпадает с accepted decision: manual JSON/intermediate handoff only.
- v4 разворачивается изолированно, а не through unsafe instant runtime switch.

## Backlog Alignment

- `Production Golden Snapshots`
- `P1-11A Resolve Production Golden Snapshot Scope`
- `P1-11B Production v3 Golden Snapshots`
- `P1-23 HDF Thickness Reconciliation`
- `P1-24 Edge Banding Policy Lock`
- `P2-07 Drilling Coordinate Standard`
- `P2-08 Supplier Hardware Catalog`
- `P2-09 Admin Operation Editor`
- `Production Export Failure Contract with API`
- `БАЗИС-Мебельщик Boundary Lock`
- `M9-P1-09 Production and manufacturing validation`
- `M10-P2-06 Manufacturing depth roadmap`

## Gaps

- Backlog прямо фиксирует, что production golden snapshots остаются open; closure evidence не подтверждено.
- Active export uses v3, while RPES V emphasises future v4 basis-oriented model; migration remains incomplete by design.
- В repo одновременно живут v3 runtime, v4 design/policies и historical references to older snapshot scopes, что повышает reconciliation cost.
- HDF, edge banding, drilling and supplier hardware maturity ещё остаются backlog items, то есть manufacturing layer не считается fully locked.

## Risks

- Production risk: drift between active v3 export and evolving v4 semantic model.
- Release risk: отсутствие confirmed golden snapshot coverage around active v3 path.
- Ops risk: manufacturing correctness claims могут быть преувеличены, если опираться только на local tests without approved snapshot scope.

## Recommended Next Tasks

- Сначала закрыть snapshot scope decision for active v3 path and only then build closure evidence.
- Подготовить one-page v3/v4 migration status sheet: active runtime, protected tests, pending semantic modules.
- Отдельно зафиксировать reconciliation status for HDF, edge banding, drilling and hardware catalog.
- Свести Basis boundary wording across RPES, backlog and production docs in one canonical note.

## Evidence Required for Closure

- merged/main golden snapshots around active export path
- explicit snapshot scope decision recorded in backlog/docs
- tests covering panels, edge banding, hardware, drilling, warnings, validation and Basis plan
- main verification for any production/manufacturing closure claim

## Do Not Touch

- production export rules, Basis JSON rules or factory assumptions without accepted decision
- API order flow while trying to patch production findings
- package/workflow changes from docs-only audit
- customer-facing UX to expose manufacturing details
