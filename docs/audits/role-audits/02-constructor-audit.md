# Role Audit — Constructor

## Scope

Роль владеет active customer-facing constructor flow, state ownership, step sequence, validation handoff, checkout entry contract и separation between active Constructor3D path and legacy/quarantine layers.

## Sources Reviewed

- `docs/specification/volume-02-constructor/README.md`
- `docs/specification/volume-09-architecture/README.md`
- `docs/planning/current-backlog.md`
- `docs/planning/accepted-backlog-decisions-v1.md`
- `src/static-pages/constructor/**`
- `src/configurator/**`
- `src/constructor/**`
- `tests/config-actions-reset.test.ts`
- `tests/config-layout-sync.test.ts`
- `tests/pure-config-state-engine.test.ts`
- `tests/browser/configurator3d.spec.ts`

## Current State

- В репо есть крупный active constructor слой в `src/static-pages/constructor/**`.
- Есть отдельные constructor store slices, rules, validation, adapters, hooks, Three.js integration и checkout components.
- Legacy/older constructor-related layers продолжают существовать в `src/configurator/**` и `src/constructor/**`.
- В backlog already fixed active Constructor3D boundary, reset contract, architecture guard и smoke/E2E tracks.
- Есть широкий набор unit/integration tests вокруг store, rules, payload adapters и reset/consistency contracts.

## RPES Alignment

- Active constructor path действительно сосредоточен вокруг dedicated Constructor3D layer, а не только around old configurator files.
- Constructor path связан с validation, pricing preview, production snapshot preview и submit path.
- Store/rules/tests подтверждают, что constructor рассматривается как central product module, а не как простая form page.

## Backlog Alignment

- `P0-01 Unified Constructor Architecture`
- `P0-02 Constructor State Model Stabilization`
- `P0-16 Constructor Reset Contract Resolution`
- `P0-17 Constructor Smoke Test Stabilization`
- `P0-18 Constructor3D Architecture Guard Implementation`
- `P0-19 Dependency Layer Recovery Verification`
- `P1-09 Constructor3D Submit E2E`
- `M8-P0-02 Constructor state ownership contract`
- `M10-P2-07 Architecture decomposition and legacy removal`

## Gaps

- В repo остаются одновременно `src/static-pages/constructor/**`, `src/configurator/**` и `src/constructor/**`, что сохраняет высокую cognitive и boundary complexity.
- Отдельный explicit state ownership document для fields, которые backlog сам называет спорными (`sceneRenderMode`, exact/advanced flags, selected entity bridge, snapshot/payload boundary), в audit scope не найден.
- Legacy constructor quarantine формально зафиксирован в decision layer, но кодовый слой legacy ещё велик и легко может стать accidental dependency source.
- Конструкторная архитектура остаётся широкой: state, rules, scene, pricing preview, checkout и production preview связаны в нескольких слоях.

## Risks

- Technical risk: возврат legacy dependencies в active path.
- Product risk: неявное state ownership может породить рассинхрон между UI, scene, payload и snapshot.
- QA risk: локальные fixes в одном constructor слое могут не отражать полную contract boundary в других слоях.

## Recommended Next Tasks

- Зафиксировать отдельный constructor state ownership document для disputed fields и boundaries.
- Отдельно картировать allowed imports и ownership между `src/static-pages/constructor`, `src/configurator` и `src/constructor`.
- Подготовить scoped decomposition plan без broad rewrite для самых нагруженных constructor entry files.
- Уточнить quarantine plan для legacy constructor artifacts: keep, isolate stronger, or migrate by documented stages.

## Evidence Required for Closure

- merged/main state ownership document
- guard/test evidence on active Constructor3D boundaries
- scoped smoke/E2E proof for changed constructor contracts
- main verification that active routes still resolve to Constructor3D path

## Do Not Touch

- `src/configurator/**` и `src/constructor/**` без explicit scoped audit
- constructor state model beyond minimal scoped boundary
- checkout/API/pricing/production contracts as part of constructor-only fixes
- mobile redesign without accepted decision
