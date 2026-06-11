# Stage 16 — Reset without autosave

Status: completed.

## Implemented
- Reset remains available from the constructor header.
- Reset confirmation copy now says contacts and checkout options are preserved.
- Store reset now resets configuration but preserves active step, contact, delivery, assembly and consent state.
- Autosave/draft restore remains disabled.
- Added `check:stage16-reset-no-autosave` guard.

## Notes
This follows the accepted decision: autosave is postponed, but reset is still available.
