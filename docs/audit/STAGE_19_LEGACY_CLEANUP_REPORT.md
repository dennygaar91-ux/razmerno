# Stage 19 — Legacy cleanup and quarantine

Status: completed as safe quarantine, not blind deletion.

## Implemented
- Active routes remain bound to the 3D-first constructor.
- Legacy constructor remains available only through explicit legacy routes.
- Added `docs/legacy/LEGACY_CLEANUP_STAGE19.md`.
- Added `check:stage19-legacy-cleanup` guard.

## Why not delete `src/configurator/**` now
Some legacy modules are still test-backed and support regression confidence for geometry, layout and bridge behavior. Full deletion should happen only after those tests are migrated to the active 3D-first modules.
