# QA Manual Checklist

This root-level checklist is kept because `scripts/qa-static-checks.mjs` expects the production QA handoff documents in the repository root.

## Core smoke path

- Open the landing page.
- Open `/constructor` and `/configurator`.
- Open `/constructor-3d` and verify the current 3D branch loads.
- Change width, height and depth.
- Change section count.
- Switch between 3D and fallback/2D where available.
- Verify the price remains visible and recalculates after configuration changes.
- Open checkout.
- Validate required name, RU phone and email fields.
- Toggle delivery and assembly.
- Submit a test order only in a safe development environment.

## Stage 2 cleanup guard

- No runtime UX changes were intended in Stage 2.
- Root historical stage reports/classes should live under `docs/history/**`.
- Legacy constructor files must not be deleted until route/test migration confirms the new active branch is stable.
