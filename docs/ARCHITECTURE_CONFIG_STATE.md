# Configurator state architecture

## Current transition state

The project is moving from legacy `ConfigProvider/useConfig` to Zustand.

## Current source of truth

During transition:

- `ConfigState.layout` is the structural source of truth for sections and compartments.
- `ConfigState.filling` remains a derived compatibility field for pricing, checkout and old UI.
- Reducer actions that change layout must recalculate filling through `summarizeLayoutFilling`.
- Legacy actions that change filling must rebuild layout through `makeCompatibleLayout`.

## New component rule

New or migrated components should use:

```ts
useConfigBridge()
```

instead of direct:

```ts
useConfig()
```

## Not done yet

- Full context removal.
- Full layout-only pricing.
- Full layout-only checkout payload.
