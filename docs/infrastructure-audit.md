# Infrastructure Audit — структура проекта

Дата: 2026-06-10

## Краткий вывод

Проект функционально продвинулся, но архитектурно находится в переходном состоянии: активный 3D-first конструктор уже закреплён, но рядом живут legacy modules, большие CSS-монолиты, God Component страницы и крупный zustand store. Для долгосрочной разработки основная опасность — не отсутствие функций, а сложность безопасной навигации по кодовой базе для людей и LLM.

## Крупные файлы и риски

| Файл | Строк | Причина риска | Рекомендация |
|---|---:|---|---|
| `src/styles/constructor.css` | 10805 | CSS-монолит старого конструктора/лендинговых слоёв; высокий риск конфликтов cascade и непредсказуемых overrides | После visual QA разрезать на feature CSS/design tokens; перед удалением собрать карту использования классов. |
| `src/styles/constructor3d.css` | 3983 | CSS-монолит активного 3D-конструктора; Stage-слои накоплены поверх друг друга | Стабилизировать через design-system primitives, затем декомпозировать на shell/scene/drawer/forms/checkout. |
| `src/static-pages/Constructor3DPage.tsx` | 2772 | God Component: маршрутизирует шаги, держит UI, scene state, validation, checkout, handlers и runtime fallback | Выносить shell, step panels, scene controller, checkout panel, validation presenter, action handlers в отдельные компоненты/хуки. |
| `src/static-pages/constructor/store/constructorStore.ts` | 1673 | Большой zustand-store: domain state, actions, reset, selection, filling, facades, materials, checkout связаны в одном файле | Разделить на slices: dimensions, layout/zones, filling, materials, checkout, ui, validation; сохранить единый public API. |
| `src/static-pages/constructor/rules/projectRules.ts` | 1429 | Смешаны furniture limits, validation, helper rules, UI-facing messages и production-проверки | Развести на constants, validation rules, production rules, UI messages, autofix rules. |
| `src/index.css` | 843 | Глобальный CSS содержит разные поколения UI-слоёв; риск незаметного влияния на конструктор | Оставить только global tokens/base styles; feature styles перенести в feature CSS или modules. |
| `src/static-pages/constructor/three/threeSceneAdapter.ts` | 820 | Крупный adapter между state и 3D; смешивает материализацию модели, режимы сцены и derived geometry | Разделить на sceneInputAdapter, materialAdapter, selectionAdapter, hardwareAdapter, modeAdapter. |
| `tests/geometry.test.ts` | 664 | Крупный тестовый файл с несколькими типами сценариев; сложен для поддержки | Разбить на panels/drawers/rods/facades/basis geometry tests. |
| `src/constructor/productionModel.ts` | 634 | Production model собирает много смыслов в одном файле; риск ошибки при расширении производства | Разделить на panels, hardware, drilling, warnings, basis/export adapters. |
| `src/static-pages/constructor/components/ConstructorRealisticSvgModel.tsx` | 517 | SVG fallback/render model содержит много геометрии и UI в одном компоненте | Выделить BlueprintViewer, DimensionLines, SectionGrid, ZoneLabels, SVG utils. |
| `src/constructor/geometry/buildHardware.ts` | 452 | Геометрия hardware и правила рендера фурнитуры смешаны | Разделить handles/hinges/slides/rods hardware builders. |
| `src/static-pages/constructor/components/FillStep.tsx` | 428 | Step component может снова стать mini-god-component для наполнения | Дальше делить на ZoneInstruction, ZoneActions, ZoneElementsList, RandomPresetControl. |
| `src/constructor/catalog.ts` | 416 | Каталог конструктора смешивает много справочников | Разделить materials/hardware/furniture/limits catalogs. |
| `src/admin/AdminOrdersPage.tsx` | 409 | Admin page содержит список/детали/фильтры/статусы в одном экране | Разделить на AdminOrdersList, AdminOrderDetail, filters, production tabs. |
| `src/configurator/Visualization.tsx` | 383 | Legacy visualization; риск случайных импортов и путаницы | Оставить в legacy quarantine до миграции тестов, затем удалить. |
| `src/static-pages/constructor/adapters/constructorPayload.ts` | 373 | Payload adapter смешивает order, production, customer и pricing payload | Разделить customerPayload/orderPayload/productionPayload/pricingSnapshot. |
| `src/styles/header.css` | 373 | Header CSS вероятно содержит legacy/landing стили и может влиять на constructor header | Оставить только shared header стили; constructor header вынести отдельно. |
| `src/static-pages/constructor/store/constructorStore.test.ts` | 369 | Тестовый монолит для store actions | Разбить по slices после разделения store. |
| `api/_shared/admin-orders.ts` | 364 | API shared admin orders содержит несколько обязанностей | Разделить query/mapper/status/events/security helpers. |
| `src/configurator/model/compartments.ts` | 363 | Legacy model compartment logic; терминологический конфликт с зонами | До удаления использовать только как test-backed legacy; не импортировать в новую ветку. |
| `src/pricing/productionPanelPricing.ts` | 360 | Pricing для панелей насыщен правилами и условиями | Разделить panelArea, edge, material factor, service cost calculators. |
| `src/configurator/context.tsx` | 359 | Legacy context provider; риск старой архитектуры | Legacy quarantine до удаления. |
| `src/static-pages/constructor/hooks/useConstructorPageState.ts` | 351 | Hook агрегирует слишком много данных страницы | Разделить на useConstructorSelection, useStepState, useSceneInput, useCheckoutState. |
| `src/static-pages/constructor/rules/projectRules.test.ts` | 338 | Тесты разных типов правил в одном файле | Разбить по validation/autofix/limits/production warnings. |
| `src/constructor/geometry/buildPanels.ts` | 333 | Построение панелей с разными правилами в одном файле | Разделить carcass/shelves/facades/backPanel panel builders. |
| `src/shared/materials/materialCatalog.ts` | 329 | Большой каталог материалов; расширение затруднит поддержку | Перейти к data-driven catalog + typed adapters. |
| `src/static-pages/ConstructorPage.tsx` | 322 | Legacy route page; не должен быть активным путём | Держать только explicit legacy route до удаления. |
| `src/constructor/basisAdapter.ts` | 319 | Basis adapter совмещает export mapping и domain transforms | Разделить basis documents, basis geometry mapping, basis metadata. |
| `src/constructor/geometry/buildDrawers.ts` | 303 | Drawer geometry rules в одном файле | Разделить fronts/slides/boxes/spacing helpers. |
| `src/constructor/geometry/types.ts` | 301 | Большой type file; потенциально станет dump-файлом | Разнести domain types по geometry/panels/hardware/drilling. |

## Файлы более 1000 строк

- `src/styles/constructor.css` — 10805 строк.
- `src/styles/constructor3d.css` — 3983 строки.
- `src/static-pages/Constructor3DPage.tsx` — 2772 строки.
- `src/static-pages/constructor/store/constructorStore.ts` — 1673 строки.
- `src/static-pages/constructor/rules/projectRules.ts` — 1429 строк.

## Файлы более 500 строк

- Все файлы из блока >1000.
- `src/index.css` — 843.
- `src/static-pages/constructor/three/threeSceneAdapter.ts` — 820.
- `tests/geometry.test.ts` — 664.
- `src/constructor/productionModel.ts` — 634.
- `src/static-pages/constructor/components/ConstructorRealisticSvgModel.tsx` — 517.

## God Components

### `src/static-pages/Constructor3DPage.tsx`

Причина: содержит step rendering, scene runtime, handlers, checkout, validation UI, material preview, 2D fallback, exact mode, CTA logic.  
Риск: высокая вероятность регрессии при любой правке.  
Рекомендация: декомпозировать по shell/steps/scene/checkout/actions.

### `src/static-pages/constructor/store/constructorStore.ts`

Причина: один store держит много доменов.  
Риск: actions разных областей влияют друг на друга.  
Рекомендация: перейти к slices без изменения public API.

### `src/static-pages/constructor/rules/projectRules.ts`

Причина: смешивает limits, validation, production notes, messages и autofix.  
Риск: невозможно безопасно менять правила без побочных эффектов.  
Рекомендация: разнести по rule modules.

## Нарушения SRP

- Page component выполняет роль controller + view + orchestration + runtime state.
- Store выполняет роль domain state + actions + reset policy + selection + checkout.
- Rules file выполняет роль validation engine + message catalog + production rules.
- CSS files выполняют роль design tokens + feature styles + legacy overrides.
- Three scene adapter выполняет role state adapter + material/geometry/selection mapping.

## Части проекта, которые уже хорошо структурированы

- `src/pricing/**` — много отдельных тестов и доменных pricing modules.
- `src/shared/materials/materialVisuals.ts` — хороший явный mapping для materials visuals.
- `src/static-pages/constructor/three/**` — уже выделены viewer/materials/camera/adapter.
- `src/constructor/geometry/**` — geometry разделена лучше, чем UI слой.
- `docs/audit/**` — есть история решений и stage reports.
- Guards/scripts — много автоматических проверок, но требуется нормализация.

## Части, требующие декомпозиции

1. Active constructor page.
2. Active constructor store.
3. Project rules/validation.
4. CSS layers.
5. Three scene adapter.
6. 2D fallback model.
7. Production model.
8. Legacy quarantine.
9. Package scripts / QA commands.
