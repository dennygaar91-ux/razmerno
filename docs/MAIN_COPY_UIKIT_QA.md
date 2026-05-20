# Main-copy UIKit redesign QA

Branch: `main-copy`.

Base: clean `main` at `c2944dbf0ac473cf5b752421364b035b8e392c71`.

## What changed

The redesign was implemented as visual override layers only.

No route replacement.
No page replacement.
No constructor logic rewrite.
No checkout submit rewrite.
No new npm dependencies.

## Static QA result

Checked:

- `package.json` unchanged.
- `src/App.jsx` unchanged.
- Existing routes preserved.
- Existing page components preserved.
- UIKit integration added through CSS bridge and CSS override layers.
- Component JSX changes are limited to CSS imports.

## Preserved routes

- `/`
- `/constructor`
- `/constructor/*`
- `/auth`
- `/account`
- `/account/order`

## Important preserved logic

Constructor:

- state
- dimensions
- sections
- active section
- zones
- pricing
- warnings
- project save/load
- remote estimate
- order payload
- checkout drawer

Checkout:

- validation
- delivery mode
- Moscow/MKAD delivery price
- outside MKAD 75 rub/km
- assembly +10%
- payment mode
- agreement checkbox
- submit through `createConstructorOrder(payload)`
- success state

Account:

- sidebar
- active order
- progress
- order history
- saved projects
- links

## Manual QA required

Run locally:

```bash
npm install
npm run build
npm run dev
```

Check pages:

- `/`
- `/constructor`
- `/auth`
- `/account`
- `/account/order`

Constructor checks:

- change dimensions
- change sections
- choose active section
- change shelves/drawers/rail
- change materials
- check price updates
- save project
- copy project link
- open checkout
- submit invalid form and check validation
- submit valid form and check success state

Responsive checks:

- 1536 px
- 1280 px
- 980 px
- 720 px
- 390 px

## Known limitation

This QA was performed through repository-level static review. The final guarantee requires local or CI `npm run build` and visual review on Vercel preview.
