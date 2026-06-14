# Architecture Boundaries v1 — Размерно

Статус: управляющий документ для следующих агентов.
Дата: 2026-06-14.
Основание: `docs/audit/architecture-gap-analysis-v1.md`.

## 0. Назначение документа

Этот документ фиксирует фактические архитектурные границы проекта после gap-аудита.

Цель — не описать идеальную будущую архитектуру, а защитить текущий репозиторий от ошибочных изменений:

- не развивать legacy вместо активного Constructor3D;
- не смешивать UI, pricing, checkout, production и API;
- не втягивать P2/P3-задачи в ближайший MVP;
- не менять опасные зоны без отдельного архитектурного этапа.

Документ не требует немедленного рефакторинга. Он нужен как карта допустимых и запрещённых действий для следующих агентов.

## 1. Главный архитектурный принцип

Активный продуктовый путь MVP:

```txt
src/App.tsx
  → src/static-pages/Constructor3DPage.tsx
  → src/static-pages/constructor/**
```

Все новые изменения конструктора должны идти через эту ветку, если в задаче явно не сказано другое.

Legacy и transitional ветки нельзя использовать как основу для нового функционала.

## 2. Ownership map

## 2.1 App / routing layer

Файлы:

- `src/App.tsx`
- `src/main.tsx`

Ответственность:

- маршрутизация;
- lazy loading страниц;
- глобальные providers / error boundary;
- глобальные CSS entrypoints;
- analytics init.

Разрешено:

- docs-backed route map;
- осторожная правка маршрута только в отдельном route-scope;
- добавление route guard только после архитектурного review.

Запрещено:

- добавлять business logic;
- считать price;
- делать order submit;
- импортировать production internals;
- добавлять новые constructor branches без planning-документа.

## 2.2 Active Constructor3D page layer

Файлы:

- `src/static-pages/Constructor3DPage.tsx`
- `src/static-pages/constructor/components/**`
- `src/static-pages/constructor/hooks/**`
- `src/static-pages/constructor/store/**`
- `src/static-pages/constructor/rules/**`
- `src/static-pages/constructor/three/**`
- `src/static-pages/constructor/adapters/**`

Ответственность:

- текущий 3D-first UX конструктора;
- step orchestration;
- выбор секций/зон;
- локальное меню;
- materials UI;
- checkout UI внутри конструктора;
- безопасная связь с quote/order hooks;
- WebGL fallback / 2D fallback UI;
- state selectors / actions для active constructor.

Разрешено:

- развивать только в рамках текущего planning scope;
- декомпозировать без изменения поведения;
- добавлять focused hooks вместо расширения God Facade;
- усиливать guards и tests вокруг active path;
- улучшать fallback, если это не меняет pricing/checkout/order contracts.

Запрещено:

- импортировать `src/configurator/**`;
- считать финальную цену вручную вне approved quote/pricing path;
- делать прямые API calls из page component, если уже есть approved hook/adapter;
- менять production model из UI;
- добавлять P3 features;
- смешивать Three.js visual rewrite с state refactor;
- расширять `useConstructorPageState` без необходимости.

## 2.3 Active constructor store layer

Файлы:

- `src/static-pages/constructor/store/constructorStore.ts`
- `src/static-pages/constructor/store/constructorStoreTypes.ts`
- `src/static-pages/constructor/store/constructorSelectors.ts`
- `src/static-pages/constructor/store/*Slice.ts`
- `src/static-pages/constructor/store/*test.ts`

Текущее состояние:

- implementation уже частично sliced;
- root interface всё ещё широкий;
- `useConstructorPageState` агрегирует слишком много state/actions.

Ответственность:

- canonical constructor UI state;
- dimensions;
- furniture type;
- sections;
- zones / compartments;
- filling;
- facades;
- materials;
- scene mode;
- validation state;
- checkout UI state;
- production snapshot state только как read/preview state.

Разрешено:

- добавлять domain selectors;
- делить root type на domain interfaces;
- сохранять compatibility shim;
- писать tests на state invariants.

Запрещено:

- переносить server pricing formulas в store;
- хранить PII в localStorage;
- смешивать order submit side effects со state actions;
- напрямую мутировать production model;
- импортировать legacy `src/configurator/context.tsx`.

## 2.4 Constructor rules layer

Файлы:

- `src/static-pages/constructor/rules/**`

Ответственность:

- клиентские правила UI-конфигурации;
- normalizers;
- zone/filling/facade/material UI rules;
- validation для понятных клиентских ошибок.

Разрешено:

- выделять правила по доменам;
- добавлять tests на нормализацию;
- улучшать readable naming без массового переименования.

Запрещено:

- считать production cost;
- внедрять manufacturing rules глубже MVP;
- напрямую читать Supabase/API;
- добавлять сложную технологическую логику, видимую клиенту.

## 2.5 Three.js active layer

Файлы:

- `src/static-pages/constructor/three/**`
- `src/static-pages/constructor/components/LazyThreeFurnitureViewer.tsx`
- `src/static-pages/constructor/components/SceneRuntimePanels.tsx`

Ответственность:

- active 3D scene;
- furniture preview model;
- material visualization;
- camera modes;
- selection targets;
- runtime failure handling;
- reduced quality;
- WebGL diagnostics;
- fallback bridge.

Разрешено:

- stability work;
- adapter decomposition;
- runtime error boundary improvements;
- fallback reliability;
- performance safety checks.

Запрещено:

- делать глубокий visual rewrite одновременно с state refactor;
- импортировать legacy `src/configurator/three/**`;
- менять pricing/checkout из Three.js layer;
- блокировать заявку при сбое WebGL, если fallback доступен.

## 2.6 Pricing layer

Файлы:

- `src/pricing/**`
- `src/static-pages/constructor/hooks/useConstructorQuote.ts`
- `src/static-pages/constructor/adapters/**pricing**`
- `src/shared/lib/pricing-core.ts`
- API pricing validation paths

Ответственность:

- точная цена;
- единый pricing source-of-truth;
- delivery;
- assembly;
- materials;
- edge / packaging;
- server-side validation compatibility.

Разрешено:

- audit;
- tests;
- source-of-truth mapping;
- bugfix только с отдельным pricing scope.

Запрещено:

- менять формулы в рамках UI/architecture cleanup;
- использовать legacy `src/configurator/context.tsx.calculatePrice` для active Constructor3D;
- показывать preliminary price, если planning требует точную цену;
- расходить client quote и server recalculation.

## 2.7 Checkout / order flow layer

Файлы:

- `src/static-pages/constructor/hooks/useConstructorSubmit.ts`
- checkout components в `src/static-pages/constructor/components/**`
- `api/orders.ts`
- shared order payload adapters

Ответственность:

- contact fields;
- RU phone / email requirements;
- delivery toggle + address;
- assembly toggle;
- consent;
- submit cooldown;
- success без reset модели;
- payload for order API.

Разрешено:

- audit;
- tests;
- UI decomposition без изменения behavior;
- payload invariant checks.

Запрещено:

- менять order contract без API review;
- менять API/Supabase в constructor UI task;
- сбрасывать модель после success;
- хранить PII в localStorage;
- обходить server validation.

## 2.8 Production layer

Файлы:

- `src/constructor/production/**`
- `src/constructor/geometry/**`
- `tests/production-*`
- `tests/manufacturing-*`
- admin production review files

Ответственность:

- production model;
- panels;
- hardware basics;
- drilling basics;
- production warnings для менеджера/админки;
- manual technologist review;
- Basis JSON planning / documents where applicable.

Разрешено:

- audit;
- tests;
- docs;
- decomposition plan.

Запрещено:

- менять production cost rules параллельно pricing changes;
- показывать сложную production logic клиенту;
- внедрять automatic `.b3d` generation в MVP;
- менять schema/API без отдельного production scope.

## 2.9 Admin layer

Файлы:

- `src/admin/**`
- `api/admin/**`
- admin docs/checks

Ответственность:

- список заявок;
- карточка заявки;
- статусы;
- контакты;
- production warnings;
- ручная обработка.

Разрешено:

- audit;
- tests;
- docs;
- isolated admin tasks after constructor/pricing/checkout stabilization.

Запрещено:

- менять admin в constructor architecture tasks;
- менять Supabase/RLS из UI-задачи;
- добавлять CRM/logistics integration до post-MVP.

## 2.10 Legacy runtime layer

Файлы:

- `src/configurator/**`
- `src/static-pages/ConstructorPage.tsx`
- legacy/simple constructor tests and bridge scripts

Статус:

Test-backed quarantine.

Ответственность:

- сохранять историческое покрытие до миграции;
- не быть источником нового функционала.

Разрешено:

- читать для migration map;
- переносить tests на active constructor;
- добавлять explicit quarantine docs;
- удалять только после отдельного migration approval.

Запрещено:

- развивать продуктовый UX;
- импортировать оттуда в active Constructor3D;
- считать новую цену;
- чинить active bugs через legacy path;
- использовать `context.tsx` как source of truth.

## 3. Dangerous imports

## 3.1 Запрещённые импорты для active constructor

Для файлов внутри:

```txt
src/static-pages/constructor/**
src/static-pages/Constructor3DPage.tsx
```

запрещены импорты из:

```txt
src/configurator/**
src/configurator/context.tsx
src/configurator/store/**
src/configurator/three/**
src/configurator/model/**
```

Исключения:

- временные migration tests;
- explicitly named migration scripts;
- docs-only references.

## 3.2 Pricing import risk

Запрещено использовать legacy pricing wrapper:

```txt
src/configurator/context.tsx → calculatePrice
```

как источник цены для active Constructor3D.

Если файл UI напрямую импортирует низкоуровневый price helper, агент обязан остановиться и проверить approved pricing path.

## 3.3 Production import risk

UI layer не должен напрямую импортировать production internals, если есть adapter/hook boundary.

Опасный паттерн:

```txt
component/page → production model internals
```

Допустимый паттерн:

```txt
component/page → hook/adapter → typed preview/snapshot
```

## 3.4 API import risk

React components не должны напрямую импортировать Vercel API handlers.

Допустимый паттерн:

```txt
component/hook → fetch client / adapter → api endpoint
```

## 4. Agent stop rules

Агент обязан остановиться и написать risk report, если задача требует:

- изменить pricing formula;
- изменить checkout submit flow;
- изменить API contract;
- изменить Supabase schema / RLS;
- изменить production model;
- удалить legacy route/code;
- сделать массовое CSS cleanup;
- сделать Three.js visual rewrite вместе с architecture refactor;
- добавить post-MVP feature в MVP;
- использовать `src/configurator/**` как основу нового функционала.

## 5. Safe next-step sequence

Рекомендуемая очередность следующих архитектурных этапов:

1. Architecture Guard Agent:
   - создать/обновить guard на active Constructor3D boundaries;
   - запретить active imports из `src/configurator/**`;
   - не менять runtime behavior.

2. Legacy Migration Map Agent:
   - составить карту tests/scripts, завязанных на `src/configurator/**`;
   - разделить на required / migration candidate / historical / removable later.

3. QA Command Map Agent:
   - разделить package scripts на current / legacy / historical / release-only;
   - зафиксировать, какие checks запускать для каждого типа задач.

4. Constructor State Boundary Agent:
   - подготовить план разделения root store interface;
   - вынести domain selectors;
   - уменьшить роль `useConstructorPageState`.

5. Pricing Source-of-Truth Agent:
   - найти все pricing helpers;
   - классифицировать source-of-truth / legacy / preview / formatting;
   - ничего не менять в формулах без отдельного разрешения.

## 6. Definition of Done для архитектурных задач

Архитектурный этап считается безопасно завершённым, если:

- явно указан scope;
- перечислены изменённые файлы;
- нет изменений pricing/checkout/API/Supabase/production/admin без разрешения;
- legacy не удалён без migration plan;
- добавлены или обновлены guards/tests/docs по изменённой границе;
- отчёт содержит риски и следующий этап.

## 7. Краткое правило для новых агентов

Если агент сомневается, куда вносить изменение конструктора, по умолчанию используется только:

```txt
src/static-pages/Constructor3DPage.tsx
src/static-pages/constructor/**
```

Если задача требует `src/configurator/**`, `api/**`, `supabase/**`, `src/admin/**`, `src/pricing/**` или `src/constructor/production/**`, сначала нужен отдельный scoped audit и разрешение на этот слой.
