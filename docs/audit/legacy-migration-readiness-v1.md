# Legacy Migration Readiness v1 — Размерно

Статус: COMPLETED.

Дата: 2026-06-14.

Роль: Architect Agent.

## 0. Scope

Документ оценивает готовность legacy-зоны к миграции.

Runtime не изменялся.

## 1. Executive decision

Legacy migration is NOT ready for deletion.

Legacy is ready only for:

```txt
inventory -> test ownership mapping -> active replacement planning
```

Удаление или перемещение legacy-кода сейчас запрещено.

## 2. Readiness by area

| Area | Status | Readiness | Owner |
|---|---|---:|---|
| `src/configurator/context.tsx` | central legacy root | Not ready | Architect + Constructor Core + Pricing |
| `src/configurator/model/**` | legacy layout model | Not ready | Constructor Core + QA |
| `src/configurator/store/**` | bridge/migration layer | Not ready | Architect + QA + Constructor Core |
| `src/configurator/three/**` | legacy Three coverage | Not ready | Three.js + QA |
| `src/static-pages/ConstructorPage.tsx` | explicit legacy route | Not ready | Architect + QA |
| legacy package scripts | historical/test-backed | Not ready | QA |

## 3. What can be done first

### 3.1 QA Agent

First safe task:

Create legacy test ownership map.

Goal:

Classify each legacy test as:

- still required;
- migration candidate;
- historical only;
- removable later.

No test deletion.

### 3.2 Constructor Core Agent

First safe task:

Map legacy layout concepts to active Constructor3D concepts.

Compare:

- legacy `SectionModel`;
- legacy `CompartmentModel`;
- active sections;
- active zones/compartments;
- active filling model.

No implementation until mapping is accepted.

### 3.3 Pricing Agent

First safe task:

Classify legacy `calculatePrice` wrapper.

Determine if it is:

- obsolete;
- historical test helper;
- still used by legacy route;
- dangerous duplicate.

No formula changes.

### 3.4 Three.js Agent

First safe task:

Map legacy Three test coverage to active scene coverage.

No visual rewrite.

## 4. What must wait

### 4.1 Deleting `context.tsx`

Must wait until:

- state types are independent;
- reducer logic migrated or retired;
- validation migrated;
- pricing wrapper retired;
- ConfigProvider removed;
- bridge tests migrated;
- active route fully covered.

### 4.2 Deleting `configStore` / bridge

Must wait until:

- no tests require bridge;
- no runtime route uses ConfigProvider mirror;
- active Constructor3D state is canonical;
- QA confirms no hidden imports.

### 4.3 Deleting legacy model tests

Must wait until:

- active Constructor Core tests cover the same layout invariants;
- active zone/filling model is stable;
- QA maps coverage equivalence.

### 4.4 Deleting legacy Three tests

Must wait until:

- active Three.js tests cover performance/texture/markers/highlight/deferred geometry;
- old tests are classified historical;
- Three.js Agent accepts replacement coverage.

### 4.5 Removing legacy routes

Must wait until:

- business decision confirms no manual fallback need;
- QA confirms active route is stable;
- any documentation or links to legacy route are removed;
- rollback strategy exists.

## 5. Migration readiness gates

Legacy migration can move to implementation only after:

1. `check:constructor3d-guard` is connected and passing.
2. Legacy test ownership map exists.
3. Active state source-of-truth is documented.
4. Pricing source-of-truth is documented.
5. Active Three.js coverage map exists.
6. QA command map separates current vs historical scripts.

## 6. Current blockers

### Blocker 1

`check:constructor3d-guard` exists as script file but is not yet connected in `package.json` and has not been run.

### Blocker 2

Legacy tests are not classified.

### Blocker 3

`context.tsx` still combines too many responsibilities.

### Blocker 4

Legacy route imports active components/hooks, creating hybrid dependency risk.

### Blocker 5

Historical scripts remain mixed with current scripts.

## 7. Recommended next Architect action

Next Architect action:

Full Architecture Dependency Graph.

Reason:

Legacy dependency map is now documented, but project-level cross-layer dependencies still need a full graph before opening implementation branches.

## 8. Conclusion

Legacy can be treated as documented quarantine, not as deletion-ready code.

The project should not attempt legacy removal until QA and active replacement coverage are complete.
