# Architecture Coupling Report v1 — Размерно

Статус: COMPLETED.
Дата: 2026-06-14.
Роль: Architect Agent.

## 0. Scope

Документ фиксирует сильные, слабые и опасные связи между слоями.

Код не изменялся.

## 1. Executive Summary

Самые опасные связи сейчас:

1. Legacy `context.tsx` объединяет state, pricing, validation и React Context.
2. Legacy route `ConstructorPage.tsx` использует active constructor hooks/components.
3. Package scripts смешивают historical stages и current active checks.
4. Pricing имеет active path и legacy wrapper path.
5. Production/API/Admin layers уже присутствуют в scripts и коде, но должны запускаться после constructor/pricing/checkout boundaries.

## 2. Strong coupling

### SC-01 — Legacy context as root

Связанные зоны:

- `src/configurator/context.tsx`
- `src/configurator/state/**`
- `src/configurator/store/**`
- `src/configurator/model/**`
- legacy tests.

Тип связи:

Strong / legacy / transitional.

Риск:

Нельзя удалить или развивать одну часть без понимания всей цепочки.

Mitigation:

Test ownership map + active replacement plan.

### SC-02 — Constructor3D page orchestration

Связанные зоны:

- page state hook;
- quote hook;
- submit hook;
- scene runtime;
- drawer UI;
- validation;
- reset/runtime states.

Тип связи:

Strong / active.

Риск:

Page-level changes can affect state, checkout, quote and scene simultaneously.

Mitigation:

Constructor Core Agent should reduce broad orchestration with focused hooks after guard passes.

### SC-03 — Checkout depends on pricing and state

Связанные зоны:

- constructor snapshot;
- quote;
- contact/consent/delivery/assembly state;
- submit hook;
- order payload adapter.

Тип связи:

Strong / active.

Риск:

Checkout implementation before state/pricing stabilization may create regressions.

Mitigation:

Checkout Agent starts after Constructor Core state audit and Pricing source-of-truth audit.

### SC-04 — Production preview depends on quote/snapshot

Связанные зоны:

- constructor snapshot;
- quote;
- production preview adapter;
- production model.

Тип связи:

Strong / backend-facing.

Риск:

Production cost or manufacturing decisions can leak into customer UI or diverge from pricing.

Mitigation:

Production Agent and Pricing Agent must align before cost-related changes.

## 3. Weak coupling

### WC-01 — Landing/info pages

Landing/info pages are mostly separate from constructor runtime.

Risk:

Low, except global CSS leakage.

Mitigation:

CSS ownership map before global cleanup.

### WC-02 — Admin route and public route split

Admin is routed separately from public pages.

Risk:

Medium because API/Supabase contracts are shared with orders/production.

Mitigation:

Admin changes only after order/API/Supabase scope is clear.

## 4. Dangerous coupling

### DC-01 — Active constructor to legacy risk

Status:

No reviewed direct active-to-legacy import found in sampled active files, but deterministic verification requires running the new guard.

Risk:

P0.

Mitigation:

Connect and run `check:constructor3d-guard`.

### DC-02 — Legacy pricing wrapper

`src/configurator/context.tsx` exposes `calculatePrice`, and legacy selectors consume it.

Risk:

P0.

Mitigation:

Pricing Agent must classify it as legacy/transitional before any pricing implementation.

### DC-03 — Legacy validation wrapper

`src/configurator/context.tsx` exposes `validate`, `hasErrors`, step statuses.

Risk:

P1.

Mitigation:

Constructor Core / Checkout must use active validation only.

### DC-04 — Historical package scripts

`package.json` contains many stage families from different development epochs.

Risk:

P1.

Mitigation:

QA Agent must create current/legacy/historical/release command map.

### DC-05 — Global CSS imports

Constructor CSS appears global via app entrypoint from earlier audit.

Risk:

P1/P2.

Mitigation:

No global cleanup until visual ownership map exists.

## 5. Hidden dependency risks

1. Dynamic imports in legacy `ConfigProvider` hide bridge dependency.
2. Tests may preserve old behavior even if active runtime no longer uses it.
3. Active shared constructor components are used by legacy `ConstructorPage`.
4. API and Supabase contracts may be indirectly tied to checkout payloads.
5. Production preview may rely on snapshot shape from Constructor Core state.

## 6. Recommended coupling reduction sequence

1. Connect/run Constructor3D guard.
2. QA Agent maps legacy tests.
3. Constructor Core Agent maps state/source-of-truth.
4. Pricing Agent maps source-of-truth.
5. Three.js Agent isolates scene/fallback responsibilities.
6. Checkout Agent hardens submit contract.
7. Production Agent separates client-visible and admin-only production warnings.

## 7. Conclusion

Current coupling is manageable if roles stay isolated. The project should not attempt large cleanup or legacy deletion before guard + test ownership + source-of-truth audits are complete.
