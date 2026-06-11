# Stage 19 legacy cleanup

Status: test-backed legacy quarantine.

The active user-facing constructor routes now point to `Constructor3DPage`.
Legacy constructor code remains available only through explicit legacy routes and test-backed modules.

## Why not delete all legacy files now

`src/configurator/**` still contains geometry, historical tests, and bridge tests used by the regression suite. Removing it in one pass would lower confidence in pricing, geometry, layout and marker behavior. The safe Stage 19 decision is quarantine + explicit routing + guards, not blind deletion.

## Cleanup state

- Active route: 3D-first constructor.
- Explicit legacy routes: `/constructor-legacy`, `/configurator-legacy`.
- No active autosave/draft restore.
- Stage 13–19 guards are added.
- Full removal can happen after legacy tests are migrated to the active 3D-first modules.
