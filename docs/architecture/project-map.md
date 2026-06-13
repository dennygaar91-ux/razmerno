# Project Map — «Размерно»

Дата: 2026-06-13
Тип: архитектурная карта репозитория.

## 1. Назначение

Этот документ фиксирует карту проекта «Размерно»: основные директории, точки входа, связи и зоны риска. Цель — дать агенту-разработчику и архитектору быстрый ориентир перед любыми изменениями.

## 2. Главные entry points

| Файл | Назначение | Статус |
|---|---|---|
| `src/main.tsx` | Монтирование React-приложения, подключение CSS, ErrorBoundary, analytics init | active |
| `src/App.tsx` | Client-side routing и lazy loading страниц | active / critical |
| `vite.config.ts` | Vite config, React/Tailwind plugin, alias, manual chunks | active / infra |
| `tsconfig.json` | TypeScript strict config | active / infra |
| `vercel.json` | Vercel rewrites/build/deploy config | active / deploy |
| `api/orders.ts` | Главный endpoint заявок | protected / critical |

## 3. Директории верхнего уровня

| Директория | Назначение | Комментарий |
|---|---|---|
| `.github/workflows/` | GitHub Actions workflow | Добавлен `qa.yml` для typecheck/build/static checks. |
| `api/` | Vercel serverless functions | Protected zone: order/admin/API/backend. |
| `docs/` | Архитектура, аудиты, backlog, agent rules, history | Требует последовательного наполнения. |
| `public/` | Static assets, textures, public files | Трогать осторожно, влияет на визуал/material preview. |
| `scripts/` | QA/static checks/build guards | Инфраструктурный слой. Менять отдельными этапами. |
| `src/` | Frontend + shared business logic + production modules | Основная кодовая база. |
| `tests/` | Browser/unit/production tests | Использовать для regression gates. |

## 4. `src/` map

| Директория | Назначение | Риск |
|---|---|---|
| `src/admin/` | Admin UI, order dashboard, production review | High / protected in current phase |
| `src/config/` | JSON-конфиги материалов/цены/manifest | Medium; влияет на pricing/order |
| `src/configurator/` | Legacy/foundation configurator model/context | High; legacy quarantine candidate |
| `src/constructor/` | Production geometry/export/manufacturing layer | Critical / protected |
| `src/pricing/` | Catalog pricing, delivery, assembly, production pricing | Critical / protected |
| `src/shared/` | Shared libs: order, price wrapper, analytics, materials | High; cross-cutting dependencies |
| `src/static-pages/` | Landing/static pages/constructor containers | Medium/High |
| `src/styles/` | CSS architecture: global, constructor legacy, constructor3d modules | High |

## 5. Static pages map

| Путь | Назначение |
|---|---|
| `src/static-pages/HomePage.tsx` | Главная страница, декомпозирована на `home/*` blocks. |
| `src/static-pages/MeasurementsPage.tsx` | Страница замеров. |
| `src/static-pages/MaterialsPage.tsx` | Страница материалов. |
| `src/static-pages/AssemblyPage.tsx` | Страница сборки. |
| `src/static-pages/Constructor3DPage.tsx` | Активная 3D-first страница конструктора. |
| `src/static-pages/ConstructorPage.tsx` | Legacy/older constructor route. |
| `src/static-pages/shared/` | Shared header/static UI. |
| `src/static-pages/home/` | Sections главной страницы. |
| `src/static-pages/constructor/` | Constructor UI/logic/store/three/adapters. |

## 6. Constructor map

| Зона | Назначение | Правило |
|---|---|---|
| `src/static-pages/Constructor3DPage.tsx` | Page orchestrator новой 3D-first ветки | Не менять без QA baseline. |
| `src/static-pages/ConstructorPage.tsx` | Legacy constructor page | Только поддержка/миграция. |
| `src/static-pages/constructor/components/` | UI components конструктора | Менять малыми scoped этапами. |
| `src/static-pages/constructor/hooks/` | Quote, submit, production preview, page state | Protected by order/pricing constraints. |
| `src/static-pages/constructor/store/` | Zustand store, selectors, slices, canonical state | Source of truth for current constructor state. |
| `src/static-pages/constructor/rules/` | Validation/normalization/rules | Менять только с tests. |
| `src/static-pages/constructor/adapters/` | Constructor state → order/production/layout bridges | Critical bridge. |
| `src/static-pages/constructor/three/` | Three.js runtime/model/scene/selection | High visual regression risk. |

## 7. Pricing / order / production map

| Зона | Назначение | Protected |
|---|---|---:|
| `src/pricing/engine.ts` | Catalog pricing engine | yes |
| `src/pricing/pricingPolicy.ts` | Прайс metadata, коэффициент ×1.3 | yes |
| `src/shared/lib/price.ts` | Shared price wrapper + legacy fallback | yes |
| `src/shared/lib/order.ts` | Client order submit | yes |
| `src/static-pages/constructor/hooks/useConstructorQuote.ts` | Client quote calculation | yes |
| `src/static-pages/constructor/hooks/useConstructorSubmit.ts` | Checkout submit state | yes |
| `api/_shared/server-price.ts` | Server recalculation | yes |
| `api/orders.ts` | Final order endpoint | yes |
| `src/constructor/production/` | Production export package | yes |
| `src/constructor/geometry/` | Geometry production model | yes |

## 8. CSS map

| Файл/директория | Назначение | Комментарий |
|---|---|---|
| `src/styles/base.css` | Base variables, body, global primitives | Active. |
| `src/index.css` | Landing/global/shared classes | Active. |
| `src/styles/constructor.css` | Legacy/main constructor CSS monolith | Quarantine candidate, no purge. |
| `src/styles/constructor3d.css` | Barrel import for 3D constructor CSS | Active. |
| `src/styles/constructor3d/*` | Split 3D CSS modules | Active. |

## 9. Docs map

| Документ/директория | Назначение |
|---|---|
| `docs/agent/` | Agent rules/tasks. |
| `docs/audits/` | Formal audit reports. |
| `docs/architecture/` | Architecture map and boundaries. |
| `docs/history/` | Historical stage notes / archived logs. |
| `docs/BACKLOG.md` | Project backlog. Требует актуализации после новых audits. |
| `docs/css-architecture-audit.md` | CSS audit. |
| `docs/css-migration-plan.md` | CSS migration plan. |
| `docs/css-class-inventory.json` | Machine-generated CSS class inventory. |

## 10. Development rules

1. Перед изменениями читать relevant docs.
2. Protected zones менять только отдельной задачей.
3. Не смешивать infrastructure docs, UX redesign и business logic changes.
4. Не удалять legacy без migration/tests.
5. Для CSS — split first, no purge first.
6. Для constructor state — сначала document ownership, потом refactor.
7. Для pricing/order/API — сначала contract tests, потом изменения.
