# Pricing Source of Truth Lock — v1

## Purpose

Этот документ фиксирует pricing source hierarchy, client/server boundary, fallback semantics и evidence expectations для текущего MVP scope.

Документ не закрывает `P0-03` и `P0-13`, не заменяет implementation evidence и не является closure evidence сам по себе.

## Sources Reviewed

- `AGENTS.md`
- `docs/specification/README.md`
- `docs/specification/volume-06-pricing-engine/README.md`
- `docs/planning/current-backlog.md`
  - `P0-03 Pricing Engine Validation`
  - `P0-13 Pricing Golden Fixtures & Parity`
  - `M8-P0-01 Pricing parity closure plan`
- `docs/planning/role-audit-reconciliation-v1.md`
- `docs/audits/role-audits/03-pricing-audit.md`
- `docs/planning/accepted-backlog-decisions-v1.md`
  - `## 4. Pricing Decisions`

## Pricing Source Hierarchy

1. `Supabase/runtime catalog` is the primary MVP pricing source.
2. Server-authoritative calculation is the source of final order price.
3. Client preview is a non-authoritative UX estimate unless parity is explicitly proven for the relevant path.
4. Seed/bundled catalog is allowed only as fallback, bootstrap or development path.
5. Stored quote/order price snapshot is the immutable audit record after server calculation.

Interpretation rules:

- The existence of a client quote does not make the client the final pricing authority.
- The existence of a seed fallback does not make seed the active MVP source of truth.
- If source hierarchy and implementation differ, RPES and accepted decisions win until explicit reconciliation changes them.

## Client / Server Boundary

Client may:

- calculate and display preview pricing for UX responsiveness;
- recalculate visible totals when user changes dimensions, materials, delivery or assembly options;
- show non-authoritative estimate states, loading states or error states;
- transmit quote context, selected materials and pricing-related inputs to the server.

Server must own:

- final authoritative calculation for order creation;
- source resolution for catalog data;
- final delivery and assembly calculation used for order persistence;
- creation of the persisted quote/order price snapshot;
- mismatch detection between client preview and server-resolved result where such comparison is supported;
- safe failure behavior when pricing cannot be authoritatively resolved.

Boundary rule:

- Customer-facing constructor may show a calculated number, but final order price must be server-resolved and stored as a server-owned snapshot.

## Fallback Semantics

Seed/bundled catalog can be used only when:

- runtime catalog is unavailable in development or controlled fallback scenarios;
- the system needs bootstrap data before runtime catalog is available;
- an explicit fallback path is logged and traceable.

Seed/bundled catalog must not:

- be presented as the primary MVP source of truth;
- silently replace runtime catalog while claiming authoritative parity;
- create a false claim that client preview equals final order price;
- close parity tasks without explicit evidence that fallback behavior is covered and acceptable;
- be treated as production truth merely because it returns a number.

Required fallback expectations:

- fallback status must be explicit in technical/admin diagnostics;
- fallback must not silently erase source attribution;
- fallback must not be described to the customer as a confirmed final server price if authoritative server resolution is not proven.

## Admin Reporting Semantics

Admin may display the following categories:

- `final`: server-resolved order price stored in the authoritative snapshot.
- `preview`: client-side or pre-submit estimate that is not yet the authoritative order record.
- `mismatch`: confirmed difference between client preview and server-resolved result.
- `warning`: pricing source fallback, partial verification, or parity concern that does not by itself redefine final price.
- `not verified`: any pricing interpretation not backed by merged/main evidence or required parity verification.

Admin rules:

- Admin may show source attribution, mismatch state and pricing warnings.
- Admin must treat the stored server-owned snapshot as the final operational number for the order.
- Admin must not present unverified preview values as final merely because they exist in UI or local test output.
- Customer-facing UI should not expose internal client/server mismatch diagnostics.

## Required Parity Evidence

Required evidence before parity-related closure claims:

### Material-aware client/server parity

- merged/main fixtures proving parity for selected body and facade material paths;
- evidence that material tokens used by client preview and server calculation refer to the same pricing meaning;
- explicit verification that no hidden legacy/demo material path overrides the active result.

### Delivery/assembly matrix

- merged/main parity coverage for no-delivery/no-assembly, delivery-only, assembly-only and combined scenarios;
- evidence for the accepted delivery and assembly rules used in final order calculation;
- proof that delivery and assembly remain separate lines from product price where RPES requires it.

### Quote/order/stored snapshot parity

- evidence that displayed quote, submitted order payload and persisted server snapshot are aligned or that any server override is intentional and documented;
- proof that stored snapshot is immutable audit record after server calculation;
- explicit main verification for the active path.

### Admin summary parity

- evidence that admin summary uses authoritative snapshot semantics for final values;
- explicit handling for preview, mismatch, warning and not verified states;
- no hidden dependence on branch-only or local-only pricing interpretation.

### Legacy/demo pricing path guard

- evidence that legacy/demo pricing paths do not silently act as active MVP truth;
- guard or verification showing that non-authoritative paths are isolated from final order semantics;
- explicit confirmation that branch-only historical pricing logic is not used as closure evidence.

### GitHub QA

- required pricing-related GitHub QA must succeed for the relevant implementation scope;
- parity claims must not rely only on local/manual assertions.

### Main verification

- closure-level pricing claims require merged/main evidence;
- backlog wording for parity closure must be satisfied on main, not only on a feature branch or docs audit.

## Related Backlog Tasks

- `P0-03 Pricing Engine Validation`
- `P0-13 Pricing Golden Fixtures & Parity`
- `M8-P0-01 Pricing parity closure plan`

Current backlog note:

- This document uses `current-backlog.md` as operational baseline.
- It does not reclassify or re-close any related task.

## Do Not Close Yet

The following must remain open until implementation evidence exists and is verified against backlog closure wording:

- `P0-03 Pricing Engine Validation`
- `P0-13 Pricing Golden Fixtures & Parity`

Do not treat this docs lock as sufficient evidence for:

- material-aware parity closure;
- delivery/assembly parity closure;
- quote/order/stored snapshot parity closure;
- admin summary parity closure;
- live source-of-truth verification closure;
- GitHub QA closure;
- main verification closure.

## Next Implementation Scope

After this docs lock is committed, the next runtime implementation scope should be:

- finish the remaining authoritative parity path for `P0-13`, prioritizing quote/order/stored snapshot parity and admin summary parity under the locked source hierarchy;
- keep source-lock decisions unchanged unless a separate accepted decision explicitly updates them.
