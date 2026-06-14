# Full Architecture Dependency Graph v1 — Размерно

Статус: COMPLETED.
Дата: 2026-06-14.
Роль: Architect Agent.

## 0. Scope

Документ фиксирует высокоуровневый граф архитектурных зависимостей текущего репозитория.

Не изменялись:

- runtime;
- state logic;
- pricing;
- checkout;
- Three.js;
- API;
- Supabase;
- production layer;
- admin;
- tests;
- package scripts.

Основание:

- `docs/audit/architecture-gap-analysis-v1.md`
- `docs/planning/architecture-boundaries-v1.md`
- `docs/audit/legacy-inventory-v1.md`
- `docs/audit/legacy-dependency-map-v1.md`
- `docs/audit/legacy-migration-readiness-v1.md`

## 1. Executive Summary

Текущая архитектура находится в переходном состоянии.

Главный активный путь продукта:

```txt
App
  -> Constructor3DPage
    -> src/static-pages/constructor/**
      -> constructor store / hooks / components / rules / adapters / three
      -> pricing quote hooks
      -> checkout submit hook
      -> production preview adapter
```

Параллельно остаётся legacy/quarantine путь:

```txt
App
  -> ConstructorPage legacy route
    -> active constructor shared hooks/components

src/configurator/context.tsx
  -> legacy state/reducer/pricing/validation/context
  -> bridge to src/configurator/store/**
```

Основной архитектурный риск — не отсутствие функционала, а пересечение эпох:

- active Constructor3D;
- legacy ConstructorPage;
- old configurator context/store/model;
- historical stage scripts;
- production/admin/API layers from previous stages.

## 2. Layer map

## 2.1 App / Routing Layer

Ownership:

Architect Agent.

Entrypoints:

- `src/App.tsx`
- `src/main.tsx`

Public surface:

- route resolution;
- lazy page loading;
- global app shell concerns.

Imports out:

- `src/static-pages/HomePage`
- `src/static-pages/MeasurementsPage`
- `src/static-pages/MaterialsPage`
- `src/static-pages/AssemblyPage`
- `src/static-pages/ConstructorPage`
- `src/static-pages/Constructor3DPage`
- `src/admin/AdminOrdersPage`

Risk level:

P1.

Reason:

Routing still exposes legacy constructor routes, while active constructor routes map to Constructor3D.

Allowed changes:

Architect Agent only, with route-scope task.

Forbidden changes:

No pricing, checkout, production, admin or UI behavior changes from routing task.

## 2.2 Active Constructor3D Page Layer

Ownership:

Constructor Core Agent, with Architect boundary rules.

Entrypoints:

- `src/static-pages/Constructor3DPage.tsx`
- `src/static-pages/constructor/**`

Public surface:

- constructor UI shell;
- step orchestration;
- scene UI;
- drawer/panel UI;
- hooks/adapters.

Imports out:

- constructor store;
- constructor hooks;
- constructor components;
- constructor rules;
- constructor adapters;
- active Three.js viewer;
- quote hook;
- submit hook;
- production preview hook.

Risk level:

P0/P1.

Reason:

This is the active MVP path. It must not import legacy configurator modules or bypass pricing/checkout boundaries.

Allowed changes:

- Constructor Core Agent for state/UI logic;
- Three.js Agent for scene-specific runtime;
- Checkout Agent for checkout-specific components/hooks;
- Architect Agent only for guards/boundaries.

Forbidden changes:

- direct imports from `src/configurator/**`;
- direct Supabase/API from components;
- direct production mutation logic;
- direct pricing formulas in page components.

## 2.3 Constructor Store Layer

Ownership:

Constructor Core Agent.

Entrypoints:

- `src/static-pages/constructor/store/constructorStore.ts`
- `src/static-pages/constructor/store/constructorStoreTypes.ts`
- `src/static-pages/constructor/store/constructorSelectors.ts`
- store slices.

Public surface:

- canonical constructor UI state;
- domain actions;
- selectors;
- validation state;
- checkout UI state;
- scene UI state.

Imports out:

- constructor rules/options/types;
- local domain utilities.

Risk level:

P0/P1.

Reason:

Root store remains a broad interface even if implementation is sliced.

Allowed changes:

Constructor Core Agent.

Forbidden changes:

- API/Supabase calls;
- order submit side effects;
- pricing formula changes;
- production mutation logic.

## 2.4 Constructor Rules / Domain UI Layer

Ownership:

Constructor Core Agent.

Entrypoints:

- `src/static-pages/constructor/rules/**`
- constructor options/types.

Public surface:

- client validation;
- normalizers;
- zone/filling/facade/material UI rules.

Risk level:

P1.

Reason:

Concepts overlap with legacy `src/configurator/model/compartments.ts`; accidental reuse would regress the active model.

Allowed changes:

Constructor Core Agent.

Forbidden changes:

- production/manufacturing deep logic;
- server pricing;
- checkout submit logic.

## 2.5 Three.js Active Layer

Ownership:

Three.js Agent.

Entrypoints:

- `src/static-pages/constructor/three/**`
- `src/static-pages/constructor/components/LazyThreeFurnitureViewer.tsx`
- `src/static-pages/constructor/components/SceneRuntimePanels.tsx`

Public surface:

- scene input adapter;
- viewer runtime;
- WebGL availability;
- scene quality;
- fallback bridge.

Risk level:

P1.

Reason:

Scene work can accidentally leak into state/pricing/checkout if boundaries are not guarded.

Allowed changes:

Three.js Agent.

Forbidden changes:

- pricing;
- checkout submit;
- Supabase/API;
- production model;
- state model refactor in the same phase.

## 2.6 Pricing Layer

Ownership:

Pricing Agent.

Entrypoints:

- `src/pricing/**`
- `src/shared/lib/pricing-core.ts`
- constructor quote adapters/hooks;
- API pricing validation paths.

Public surface:

- exact quote calculation;
- pricing breakdown;
- delivery/assembly/material rules;
- server/client consistency contracts.

Risk level:

P0.

Reason:

Legacy `src/configurator/context.tsx` also exposes `calculatePrice`, creating duplicate price surface.

Allowed changes:

Pricing Agent only.

Forbidden changes:

- UI redesign;
- production cost changes without alignment;
- direct consumption of legacy calculatePrice as active source-of-truth.

## 2.7 Checkout / Order Flow Layer

Ownership:

Checkout Agent.

Entrypoints:

- `src/static-pages/constructor/hooks/useConstructorSubmit.ts`
- checkout components in active constructor;
- order payload adapter;
- `api/orders.ts` with explicit API scope.

Public surface:

- required fields;
- delivery toggle/address;
- assembly toggle;
- consent;
- submit/cooldown;
- order payload;
- success/error state.

Risk level:

P0/P1.

Reason:

Checkout depends on stable state and pricing boundaries. It must not be changed before those are clear.

Allowed changes:

Checkout Agent.

Forbidden changes:

- pricing formula;
- Supabase schema/RLS;
- production model;
- PII in localStorage;
- model reset after success.

## 2.8 API Layer

Ownership:

Checkout Agent / Production Agent / QA Agent depending on endpoint scope.

Entrypoints:

- `api/**`
- `api/admin/**`
- `api/_shared/**`

Public surface:

- order submission;
- admin operations;
- shared server utilities;
- server validation.

Risk level:

P0/P1.

Reason:

API contracts influence checkout, admin, production and privacy/security boundaries.

Allowed changes:

Only with explicit endpoint scope.

Forbidden changes:

- opportunistic API edits from constructor UI or Three.js tasks.

## 2.9 Supabase Layer

Ownership:

QA Agent / Production Agent / Admin Agent with explicit DB scope.

Entrypoints:

- Supabase client/server utilities;
- SQL/migration docs;
- RLS policies.

Public surface:

- orders storage;
- admin access;
- security boundaries.

Risk level:

P0.

Reason:

PII and access control risk.

Allowed changes:

Only explicit Supabase task.

Forbidden changes:

- implicit schema/RLS changes from checkout/admin feature work.

## 2.10 Production Layer

Ownership:

Production Agent.

Entrypoints:

- `src/constructor/production/**`
- `src/constructor/geometry/**`
- production/manufacturing tests.

Public surface:

- production snapshot;
- panels;
- hardware/drilling basics;
- manufacturing warnings;
- Basis JSON planning.

Risk level:

P1.

Reason:

Production logic must remain backend/admin-facing and must not leak to customer UI as complexity.

Allowed changes:

Production Agent.

Forbidden changes:

- automatic `.b3d` generation in MVP;
- pricing cost formula changes without Pricing Agent;
- customer UI changes.

## 2.11 Admin Layer

Ownership:

Production Agent / future Admin scope.

Entrypoints:

- `src/admin/**`
- `api/admin/**`

Public surface:

- orders list/detail;
- status updates;
- production review;
- admin auth/access.

Risk level:

P1/P2.

Reason:

Admin depends on order/API/Supabase/production stability.

Allowed changes:

Only after constructor/order/production boundaries are stable.

Forbidden changes:

- constructor UX edits;
- pricing formula edits;
- checkout behavior edits.

## 2.12 Legacy Configurator Layer

Ownership:

Architect Agent / QA Agent during migration planning.

Entrypoints:

- `src/configurator/context.tsx`
- `src/configurator/model/**`
- `src/configurator/store/**`
- `src/configurator/three/**`
- legacy tests/scripts.

Public surface:

None for new active work.

Risk level:

P0.

Reason:

This layer contains old state/pricing/validation/model/bridge logic and can be mistaken for current source-of-truth.

Allowed changes:

- docs;
- test ownership mapping;
- migration planning.

Forbidden changes:

- new features;
- active Constructor3D imports;
- deletion before test migration.

## 3. Global dependency graph

```txt
App / Router
  ├─ Landing / info pages
  ├─ Admin route -> Admin layer -> API/Admin -> Supabase
  ├─ Legacy route -> ConstructorPage -> active constructor shared components/hooks
  └─ Active constructor route -> Constructor3DPage
        ├─ Constructor Store
        ├─ Constructor Rules
        ├─ Constructor Components
        ├─ Three.js Active Layer
        ├─ Quote Hook -> Pricing Layer / adapters
        ├─ Submit Hook -> Order Payload Adapter -> API/orders
        └─ Production Preview Adapter -> Production Layer preview

Legacy Configurator
  ├─ context.tsx -> legacy data/model/price/validation/context
  ├─ state/store bridge -> context.tsx
  ├─ model tests
  ├─ three tests
  └─ historical scripts
```

## 4. Architecture status by layer

| Layer | Status | Main risk | Next owner |
|---|---|---|---|
| App/Routing | mixed active + legacy | legacy route exposure | Architect |
| Constructor3D | active | insufficient guard execution | Architect / Constructor Core |
| Store | active but broad | God Store surface | Constructor Core |
| Rules | active | overlap with legacy model | Constructor Core |
| Three.js active | active | stability/fallback | Three.js |
| Pricing | active + legacy duplicate | source-of-truth ambiguity | Pricing |
| Checkout | active | depends on state/pricing | Checkout |
| API | active | contract/security | Checkout/QA |
| Supabase | active infra | PII/access control | QA/Production |
| Production | active/backend/admin-facing | customer leakage/cost coupling | Production |
| Admin | active-ish | depends on order/production/security | Production/Admin scope |
| Legacy | quarantine | accidental reuse | Architect/QA |

## 5. Architecture decision

The project should not open behavior-changing runtime branches until:

1. `check:constructor3d-guard` is connected and run.
2. Legacy test ownership is mapped by QA Agent.
3. Constructor Core Agent confirms active state source-of-truth.
4. Pricing Agent confirms pricing source-of-truth.

Docs/audit-only work can continue in parallel.
