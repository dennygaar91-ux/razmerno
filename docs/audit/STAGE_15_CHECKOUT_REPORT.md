# Stage 15 — Checkout inside constructor

Status: completed.

## Implemented
- Preserved checkout inside the active constructor.
- Kept required fields: name, RU phone, email, consent.
- Preserved delivery and assembly toggles.
- Added 30-second resubmit cooldown after successful order submission.
- Kept the model/configuration intact after success.
- Added `check:stage15-checkout-conversion` guard.

## Notes
The checkout remains compact and conversion-focused. Full browser E2E still needs Chromium installed in the execution environment.
