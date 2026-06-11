# Stage 17 — Accessibility and UI hardening

Status: completed.

## Implemented
- Guarded existing labels, aria-invalid, aria-describedby, step aria-current, aria-busy and polite live regions.
- Ensured submit/status helper messages are announced politely.
- Kept visible focus coverage through design-system CSS.
- Added `check:stage17-a11y-hardening` guard.

## Notes
This is a hardening pass, not a full external accessibility audit. Real keyboard QA should still be repeated in a browser.
