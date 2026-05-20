# UIKit integration progress

## Stage 1 — Audit and branch

Status: complete.

Branch: ui-update.

Base commit: c2944dbf0ac473cf5b752421364b035b8e392c71.

Notes:

- Main project routes inspected.
- Landing keeps existing content sections.
- Constructor is currently wrapped by the public Header and must be separated during constructor redesign.
- Existing constructor has many CSS layers; UIKit integration will be additive first, then page-by-page.

## Stage 2 — UIKit foundation

Status: complete.

Implemented:

- Added compact UIKit React component layer.
- Added UIKit CSS slices for tabs, buttons, cards, empty states, material cards and price card.
- Imported UIKit CSS from main.jsx.
- Kept existing content and constructor logic untouched.

Progress: 100%.

## Stage 3 — Landing UIKit/reference redesign

Status: complete.

Implemented:

- Added new LandingUIKit page.
- Switched the root route to LandingUIKit.
- Preserved the product meaning of Razmerno: furniture constructor, dimensions, filling, material, preliminary estimate, technology review and self-assembly kit.
- Added hero, process, base models, assembly kit, materials, FAQ and final CTA sections.
- Used the new UIKit components for button and status patterns.
- Kept the old Landing.jsx as fallback while the redesign is still staged in the ui-update branch.

Progress: 100%.
