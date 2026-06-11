# Размерно — commands checklist v69

## Базовые команды

### `dev`

```bash
npm run dev
```

```text
vite
```

### `build`

```bash
npm run build
```

```text
vite build
```

### `preview`

```bash
npm run preview
```

```text
vite preview
```

### `typecheck`

```bash
npm run typecheck
```

```text
tsc --noEmit
```

### `report:css-usage`

```bash
npm run report:css-usage
```

```text
node scripts/css-usage-report.mjs
```

### `report:css-inventory`

```bash
npm run report:css-inventory
```

```text
node scripts/css-inventory.mjs
```

### `report:visual-qa`

```bash
npm run report:visual-qa
```

```text
node scripts/visual-qa-inventory.mjs
```

### `report:react-components`

```bash
npm run report:react-components
```

```text
node scripts/react-component-inventory.mjs
```

### `test:browser-smoke-static`

```bash
npm run test:browser-smoke-static
```

```text
node scripts/browser-smoke-static.mjs
```

### `test:browser-smoke`

```bash
npm run test:browser-smoke
```

```text
playwright test tests/browser/configurator.spec.ts --project=chromium-desktop
```

### `test:browser-smoke:mobile`

```bash
npm run test:browser-smoke:mobile
```

```text
playwright test tests/browser/configurator.spec.ts --project=chromium-mobile
```

### `test:constructor-three`

```bash
npm run test:constructor-three
```

```text
node --no-warnings --import tsx src/static-pages/constructor/three/threeSceneAdapter.test.ts
```

### `test:constructor-three-safety`

```bash
npm run test:constructor-three-safety
```

```text
node --no-warnings --import tsx src/static-pages/constructor/three/threeSceneSafety.test.ts
```

### `test:constructor-store`

```bash
npm run test:constructor-store
```

```text
node --no-warnings --import tsx src/static-pages/constructor/store/constructorStore.test.ts
```

### `test:constructor-flow`

```bash
npm run test:constructor-flow
```

```text
node --no-warnings --import tsx src/static-pages/constructor/constructorFlowSmoke.test.ts
```

### `test:constructor-pii-order`

```bash
npm run test:constructor-pii-order
```

```text
node --no-warnings --import tsx src/static-pages/constructor/constructorPiiOrderInvariants.test.ts
```

### `test:constructor-draft`

```bash
npm run test:constructor-draft
```

```text
node --no-warnings --import tsx src/static-pages/constructor/store/constructorDraft.test.ts
```

### `test:constructor-payload`

```bash
npm run test:constructor-payload
```

```text
node --no-warnings --import tsx src/static-pages/constructor/adapters/constructorPayload.test.ts
```

### `test:production-preview`

```bash
npm run test:production-preview
```

```text
node --no-warnings --import tsx src/static-pages/constructor/adapters/productionPreviewAdapter.test.ts
```

### `check:constructor-architecture`

```bash
npm run check:constructor-architecture
```

```text
node scripts/check-constructor-architecture.mjs
```

### `check:static-pages-architecture`

```bash
npm run check:static-pages-architecture
```

```text
node scripts/check-static-pages-architecture.mjs
```

### `check:no-static-html-pages`

```bash
npm run check:no-static-html-pages
```

```text
node scripts/check-no-static-html-pages.mjs
```

### `check:no-server`

```bash
npm run check:no-server
```

```text
node scripts/check-no-server.mjs
```

### `check:normal-urls`

```bash
npm run check:normal-urls
```

```text
node scripts/check-normal-urls.mjs
```

### `check:root-docs`

```bash
npm run check:root-docs
```

```text
node scripts/check-root-docs-clean.mjs
```

### `check:legacy-runtime-imports`

```bash
npm run check:legacy-runtime-imports
```

```text
node scripts/check-legacy-runtime-imports.mjs
```

### `test:pricing-engine`

```bash
npm run test:pricing-engine
```

```text
node --no-warnings --import tsx src/pricing/engine.test.ts
```

### `test:delivery`

```bash
npm run test:delivery
```

```text
node --no-warnings --import tsx src/pricing/delivery.test.ts
```

### `test:pricing-final`

```bash
npm run test:pricing-final
```

```text
node --no-warnings --import tsx src/pricing/finalPricingSmoke.test.ts
```

## Рекомендуемый порядок локальной проверки

```bash
npm install
npm run typecheck
npm run build
npm run report:react-components
npm run report:visual-qa
npm run report:css-inventory
npm run report:css-usage
npm run test:browser-smoke-static
npm run test:constructor-three
npm run test:constructor-three-safety
npm run test:constructor-store
npm run test:constructor-flow
npm run test:constructor-pii-order
npm run test:constructor-draft
npm run test:constructor-payload
npm run test:production-preview
npm run test:pricing-engine
npm run test:delivery
npm run test:pricing-final
```

## Browser smoke после установки Playwright browsers

```bash
npx playwright install chromium
npm run test:browser-smoke
npm run test:browser-smoke:mobile
```
