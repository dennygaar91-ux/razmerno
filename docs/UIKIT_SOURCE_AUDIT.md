# UIKit source audit

Branch: main-copy.

## Source

Uploaded UIKit archive: `UIKit(2).zip`.

## Useful UIKit source files

Design documentation:

- `RAZMERNO_DESIGN_SYSTEM.md`
- `src/styles/theme.css`
- `src/styles/index.css`
- `default_shadcn_theme.css`

Razmerno components:

- `PillTabs.tsx`
- `SegmentedControl.tsx`
- `StatusBadge.tsx`
- `PriceCard.tsx`
- `ProjectCard.tsx`
- `SectionControl.tsx`
- `QuickScenario.tsx`
- `EmptyState.tsx`
- `MaterialCard.tsx`
- `TopBar.tsx`
- `WardrobeCanvas.tsx`
- `AccountSidebar.tsx`
- `CheckoutDrawer.tsx`
- `FeatureCard.tsx`
- `HeroSection.tsx`

## Important implementation note

The UIKit components are TypeScript/Tailwind-oriented and depend on libraries that are not currently part of the main project flow, including:

- `lucide-react`
- `motion/react`
- shadcn-style UI primitives
- Tailwind utility classes

Therefore, the safe strategy is not to copy them directly into routes and not to replace existing pages.

## Safe integration strategy

1. Copy the visual tokens from UIKit into a bridge CSS layer.
2. Gradually apply these tokens to existing components.
3. Preserve all current routes and business logic.
4. Use UIKit components as reference patterns, not as direct runtime dependencies until dependencies are intentionally added and verified.
5. Redesign block by block.

## UIKit design tokens to preserve

- Background: `#F8F8F6`
- Foreground: `#111111`
- Card: `#FFFFFF`
- Border: `#E6E6E3`
- Muted: `#F1F1EF`
- Muted foreground: `#6F6F6F`
- Primary: `#111111`
- Primary foreground: `#FFFFFF`
- Success: `#10B981`
- Warning: `#F59E0B`
- Destructive: `#DC2626`
- Radius: `0.75rem`

## Stage 1.2 status

UIKit source audit complete.
