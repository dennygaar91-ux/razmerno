# Constructor3D State Ownership Contract — v1

## Purpose

Этот документ фиксирует границы владения состоянием для active Constructor3D и задаёт контракт между UI, constructor state, визуализацией, серверным order state и downstream snapshots/payloads. Документ сам по себе не закрывает `P0-02 Constructor State Model Stabilization`.

## Sources Reviewed

- `AGENTS.md`
- `docs/specification/README.md`
- `docs/specification/volume-02-constructor/README.md`
- `docs/specification/volume-09-architecture/README.md`
- `docs/planning/current-backlog.md`:
  - `P0-01 Unified Constructor Architecture`
  - `P0-02 Constructor State Model Stabilization`
  - `P0-16 Constructor Reset Contract Resolution`
  - `P0-17 Constructor Smoke Test Stabilization`
  - `P0-18 Constructor3D Architecture Guard Implementation`
  - `M8-P0-02 Constructor state ownership contract`
- `docs/planning/role-audit-reconciliation-v1.md`
- `docs/audits/role-audits/02-constructor-audit.md`
- `docs/planning/accepted-backlog-decisions-v1.md`:
  - active Constructor3D path
  - legacy constructor quarantine
  - separate Constructor3D state ownership decision

## Active Constructor Path

- Constructor3D is the active constructor path for customer-facing runtime scope.
- Legacy Constructor remains quarantine/reference-only scope unless an explicit accepted decision re-opens it.
- Runtime code remains the source of current implementation facts.
- RPES and accepted decisions remain the source of target architecture and target ownership boundaries.
- No audit, branch-only implementation, or local report may redefine the active path on its own.

## State Ownership Map

The ownership model below uses one responsibility per layer and follows the RPES architecture chain `UI -> state -> validation -> pricing -> production model -> order -> snapshots`.

| Domain | Primary owner | Contract |
| --- | --- | --- |
| Dimensions | Constructor State | Committed cabinet geometry and related normalized values belong to Constructor State. UI may hold temporary form edits before commit. |
| Sections | Constructor State | Structural decomposition of the product belongs to Constructor State because RPES treats sections as the modeling basis, not only total size. |
| Zones | Constructor State | Interactive zone identity and mapping to product structure belong to Constructor State. Visualization may consume zones but must not become the source of zone truth. |
| Compartments | Constructor State | Internal compartment structure belongs to Constructor State as part of the saved/restored product configuration. |
| Filling | Constructor State | Shelves, drawers, hanging areas and other filling selections belong to Constructor State as user configuration, not to Three.js. |
| Facades | Constructor State | Facade selections and configuration belong to Constructor State and feed both preview and order payload preparation. |
| Materials | Constructor State | Material selections used for preview, pricing inputs and order preparation belong to Constructor State until server-authoritative order calculation takes over. |
| Handles | Constructor State | Handle selection is part of the committed product configuration and must not live only in render state or ad hoc UI state. |
| Delivery | Constructor State | User-selected delivery option belongs to Constructor State as a committed commercial input and may be reset only by the accepted reset contract. |
| Assembly | Constructor State | User-selected assembly option belongs to Constructor State as a committed commercial input and may be reset only by the accepted reset contract. |
| Checkout/contact fields | Constructor State | Committed checkout/contact data used for submit belongs to Constructor State. Draft typing may temporarily exist in UI state before commit. |
| Validation/errors | Split ownership | Validation status for committed constructor data belongs to Constructor State; transient field-level presentation state belongs to UI. Server-side validation errors belong to server response state and must not silently rewrite constructor truth. |
| Price snapshot inputs | Constructor State | The input set sent to pricing preview/order preparation originates from committed Constructor State. Calculated final price does not belong to Constructor State once server authority applies. |
| Production payload inputs | Constructor State | Inputs required to derive production/export payloads originate from committed Constructor State, but the resulting production payload is a downstream artifact, not the state source itself. |

## Required Boundary Contracts

### `sceneRenderMode` ownership

- `sceneRenderMode` is a presentation-mode flag.
- It belongs to active Constructor3D application state only as a visualization-control field.
- It must not redefine product structure, pricing truth or production truth.
- Three.js may consume it to choose representation mode, but must not become its long-term owner.

### `exact` / `advanced` flags ownership

- `exact` and `advanced` flags are user-intent/configuration-control flags for the active constructor flow.
- They belong to Constructor State when they affect committed configuration, validation or payload derivation.
- Purely temporary UI toggling before confirmation may exist in draft state, but the committed value must reconcile back into Constructor State.
- These flags must not live only inside scene components.

### `selectedZoneId` / `selectedCompartmentId` bridge

- `selectedZoneId` and `selectedCompartmentId` form a bridge between UI interaction, structural state and visualization.
- The canonical selected identifiers belong to Constructor State so that UI, fallback modes and scene stay synchronized.
- Three.js may emit selection events and highlight the current selection, but it must not own the canonical selected ids.
- UI-only hover/focus affordances may remain transient and local if they do not redefine committed selection.

### UI draft state vs committed constructor state

- UI draft state may hold incomplete input, typing buffers, local modal state and temporary selectors.
- Committed Constructor State must hold only normalized values that are valid for saved configuration, preview calculation inputs, payload preparation and state restoration.
- Draft state must not silently bypass constructor validation or create a second business-state source of truth.
- Commit points must be explicit wherever an edit crosses from temporary input into product configuration.

### Client preview state vs server authoritative order state

- Client preview state may derive non-authoritative estimates and summaries from committed Constructor State.
- Server authoritative order state owns final validated order data, final accepted pricing result and persisted order snapshot semantics.
- Client preview must not claim final order truth unless parity has been proven and accepted for the relevant field.
- Server responses must not be treated as equivalent to local scene state without an explicit mapping boundary.

### Snapshot/payload boundary

- Constructor State is the upstream business configuration.
- Quote snapshot inputs, order submit payload inputs and production payload inputs are derived artifacts from that configuration.
- Stored quote/order snapshots become immutable records after server-side processing and must not feed backward as the editable state source except through an explicit restore/import contract.
- Payload shape changes must be treated as downstream contract work, not as implicit constructor-state changes.

### Reset contract boundary

- Manual reset behavior is governed by the accepted `P0-16` contract.
- Manual reset returns constructor-related state to the agreed initial state boundary, including committed checkout/contact, delivery, assembly, consent and transient constructor state covered by that contract.
- Reset semantics must remain centralized and testable rather than duplicated across UI widgets, scene handlers or fallback flows.
- Any exception to full reset requires an explicit accepted decision.

### Submit-success no-reset boundary

- Successful submit follows the accepted `P0-16` and `P0-17` contract: the model/configuration remains available after successful order request.
- Submit success may clear request lifecycle/transient submit state, but must not silently wipe committed product configuration.
- Any post-submit UX cleanup must respect the no-reset contract unless a later accepted decision changes it.

### WebGL fallback state boundary

- WebGL fallback is a rendering/runtime capability boundary, not a separate business-state model.
- Fallback mode must consume the same committed Constructor State as the primary 3D experience.
- Fallback-specific view state may exist locally, but product structure, selections, validation and submit inputs must remain shared with the active constructor state source.
- A render failure must not mutate product truth.

### Production export input boundary

- Constructor State owns the editable inputs required for production/export preparation.
- Production/export artifacts, Basis-oriented structures and manufacturing payloads are downstream derived outputs and must not replace Constructor State as the editable source.
- Three.js preview is never production truth.
- Export readiness requires separate production validation beyond the existence of constructor fields.

## Active vs Legacy Boundary

- Active Constructor3D may use modules and dependencies explicitly scoped to the active constructor path.
- Active Constructor3D may consume shared utilities only where those utilities do not reintroduce legacy ownership, hidden state forks or forbidden import paths.
- Legacy Constructor may remain as quarantine/reference code for migration, comparison or controlled extraction work.
- Active Constructor3D must not inherit business-state truth from legacy constructor stores, legacy scene-local state, or undocumented cross-import bridges.
- Legacy code must not quietly regain control over active dimensions, sections, zones, compartments, filling, materials, checkout, validation or payload shaping.
- Any cross-boundary reuse must remain architecture-guard-safe and explicitly justified in scoped work.

## Closure Evidence Required

For `P0-02 Constructor State Model Stabilization` and `M8-P0-02 Constructor state ownership contract`, closure requires all of the following:

- this ownership contract merged to `main`;
- focused state-transition tests covering the documented ownership boundaries;
- constructor payload tests covering snapshot/payload derivation from committed state;
- reset and submit-success tests remaining green against the accepted `P0-16` and `P0-17` contract;
- architecture guard remaining green for active-vs-legacy boundaries;
- GitHub QA success for the implementation/verification PRs;
- main verification after merge;
- `docs/planning/current-backlog.md` updated with closure evidence.

Audit docs, branch-only work, local claims and standalone screenshots are not closure evidence by themselves.

## Do Not Close Yet

This document does not close:

- `P0-02 Constructor State Model Stabilization`
- `M8-P0-02 Constructor state ownership contract`

This document is a boundary lock only. Implementation, tests, GitHub QA, main verification and backlog evidence are still required.

## Next Implementation Scope

After this document is committed, the next runtime implementation task should be a focused `P0-02` follow-up that aligns the active Constructor3D store and selection bridge with this contract:

- make canonical ownership explicit for `sceneRenderMode`, `exact`/`advanced`, `selectedZoneId` and `selectedCompartmentId`;
- remove or quarantine any remaining legacy/scene-local ownership conflicts in the active path;
- add focused state-transition and payload-boundary tests without broad constructor refactoring.
