# Stage 13 — Validation UX

Status: completed.

## Implemented
- Added active Stage 13 validation markers in the 3D-first constructor.
- Preserved and guarded the blocking/non-blocking validation model through `blocksCheckout`.
- Kept warning/error visual separation with status-card roles.
- Ensured validation messages can be announced with polite live regions where they affect the main action.
- Added `check:stage13-validation-ux` guard.

## Notes
Deep production warnings remain hidden from the customer-facing layer unless they affect the user's next action.
