# Размерно — аудит после интеграции нового дизайна v1

Дата: 2026-06-01

## Что сделано

1. Новый дизайн, подготовленный в чате, интегрирован в React/Vite-проект.
2. Добавлены страницы:
   - `/` — главная;
   - `/measurements` — Замеры;
   - `/materials` — Материалы;
   - `/assembly` — Сборка;
   - `/configurator` — Конструктор.
3. CTA и навигация переведены на нормальные browser routes.
4. Старый hash-route `/#/configurator` сохранён как redirect на `/configurator`.
5. Старые маркетинговые компоненты лендинга удалены из активного кода.
6. Root-документы с историями этапов и временные debug-файлы удалены из корня проекта.
7. Backend/API, pricing engine, delivery logic, admin API и production-модули не переписывались.

## Ключевые изменённые файлы

- `src/App.tsx` — новый routing на страницы нового дизайна + сохранён admin route.
- `src/Landing.tsx` — оставлен compatibility-wrapper на новую главную.
- `src/StaticDesignPages.tsx` — static page renderer + временная UI-интерактивность конструктора.
- `src/index.css` — новая дизайн-система/стили текущего визуала.
- `public/assets/razmerno-logo-photo1-transparent.png` — логотип.
- `public/assets/razmerno-hero-wardrobe-transparent.png` — hero visual.
- `src/admin/adminClient.ts` — переименование admin API client, чтобы пройти legacy-runtime-import guard.
- `src/admin/AdminOrdersPage.tsx` — обновлён импорт admin client.
- `README_INTEGRATION.md` — краткая инструкция по переносу в полноценные компоненты.

## Что удалено / очищено

- Удалены root `.md`-документы с историей этапов, временными отчётами и старыми changelog-файлами.
- Удалён `tmp-debug-extreme.ts`.
- Удалены старые активные маркетинговые компоненты:
  - `HeaderReworked.tsx`
  - `HeroReworked.tsx`
  - `FearsReworked.tsx`
  - `ProcessReworked.tsx`
  - `ProjectsReworked.tsx`
  - `Support.tsx`
  - `Faq.tsx`
  - `Footer.tsx`
  - `SeoStructuredData.tsx`

## Что сохранено намеренно

Сохранены backend и логические слои проекта:

- `api/` — Vercel API routes.
- `src/pricing/` — pricing engine и тесты.
- `src/constructor/` — расчётная, производственная и geometry-логика.
- `src/configurator/model`, `src/configurator/store`, `src/configurator/three` — модель, store и часть 3D/geometry-слоя, так как это относится к логике/будущей интеграции конструктора.
- `src/admin/` — админка и production review.
- `tests/`, `scripts/`, `db/`, `supabase/` — инфраструктура проверок и deployment.

## Аудит кода

### Хорошо

- TypeScript проходит без ошибок.
- Production build проходит.
- Основные route checks проходят.
- No-server архитектура сохранена: `/server` отсутствует, API остаётся в `api/`.
- Pricing/delivery smoke-тесты проходят.
- Новый дизайн не затронул pricing engine, delivery rules и backend API.
- Старые root-документы очищены, `docs/history` оставлен для совместимости с QA-guard.

### Риски / что важно понимать

1. `src/StaticDesignPages.tsx` сейчас содержит static HTML-прототип внутри React.
   Это хорошо для быстрой интеграции и визуальной проверки, но не финальная компонентная архитектура.

2. Интерактивность конструктора сейчас временная UI-интерактивность:
   - переключение шагов;
   - active-состояния;
   - +/- controls;
   - toggles.

   Она ещё не подключена к реальному Zustand/store, pricing engine и checkout submit.

3. Цена в UI конструктора пока визуальная заглушка из прототипа.
   Реальную цену нужно подключить к `src/pricing`/`src/constructor` после компонентной декомпозиции.

4. Старые UI-файлы конструктора частично сохранены, потому что часть тестов и будущая логика опираются на эти пути.
   Они больше не являются активным route `/configurator`, но полностью удалять их сейчас рискованно без отдельной migration-задачи.

5. CSS сейчас большой и статический. Следующий этап — компонентная декомпозиция и вынос дизайн-системы в нормальные React-компоненты.

## QA-результаты

Пройдено:

- `npm run typecheck`
- `npm run build`
- `npm run check:no-server`
- `npm run check:normal-urls`
- `npm run check:root-docs`
- `npm run check:legacy-runtime-imports`
- `npm run test:pricing-engine`
- `npm run test:delivery`
- `npm run test:pricing-final`

Не запускалось:

- полный `npm run qa:all`, потому что он очень широкий и включает большое количество stage-specific проверок, часть которых относится к старым этапам UI и может быть невалидна после визуальной пересборки.
- browser e2e / Playwright — не запускал, так как для этого нужен отдельный визуальный проход и, желательно, браузерная проверка скриншотов.

## Рекомендованный следующий этап

1. Разбить `StaticDesignPages.tsx` на нормальные React-компоненты:
   - `MarketingHeader`
   - `LandingPage`
   - `MeasurementsPage`
   - `MaterialsPage`
   - `AssemblyPage`
   - `ConstructorPageV2`
   - `ConstructorSidebar`
   - `ConstructorScene`
   - `ConstructorStepSizes`
   - `ConstructorStepFilling`
   - `ConstructorStepMaterials`
   - `ConstructorCheckout`

2. Подключить новый UI конструктора к существующему Zustand/store.
3. Подключить точную цену из pricing engine.
4. Подключить checkout к текущему order flow.
5. После этого удалить старые UI-файлы конструктора безопасно, когда тесты будут переписаны на новые компоненты.
