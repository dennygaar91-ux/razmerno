# Размерно — static pages architecture review v37

## Что сделано

Проведён architecture review статических страниц после серии v30–v36 и добавлен guard-script, который фиксирует текущую декомпозицию.

## Новый файл

- `scripts/check-static-pages-architecture.mjs`

## Новый npm script

```bash
npm run check:static-pages-architecture
```

## Что проверяет guard

### 1. Наличие shared-компонентов

- `src/static-pages/shared/SiteHeader.tsx`
- `src/static-pages/shared/InfoFooter.tsx`
- `src/static-pages/shared/SectionHeader.tsx`
- `src/static-pages/shared/InfoCard.tsx`
- `src/static-pages/shared/InfoCardGrid.tsx`
- `src/static-pages/shared/InfoFinalCTA.tsx`

### 2. Composition layer страниц

Проверяет, что page files остались лёгкими composition layer:

- `HomePage.tsx`
- `MeasurementsPage.tsx`
- `MaterialsPage.tsx`
- `AssemblyPage.tsx`

Например, `HomePage.tsx` должен содержать:

```tsx
<SiteHeader activePage="home" />
<HomeHero />
<HomeFooter />
```

И не должен снова содержать крупные повторяемые layout-блоки вроде:

- `rzm-header-shell`
- `rzm-info-card`
- `rzm-info-final`

### 3. Количество секционных компонентов

Текущая структура:

#### Home

- `HomeCustomProject.tsx`
- `HomeFAQ.tsx`
- `HomeFinalCTA.tsx`
- `HomeFooter.tsx`
- `HomeHero.tsx`
- `HomeHow.tsx`
- `HomeKit.tsx`
- `HomePrice.tsx`
- `HomeProducts.tsx`

#### Measurements

- `MeasurementsBasics.tsx`
- `MeasurementsChecklist.tsx`
- `MeasurementsFinalCTA.tsx`
- `MeasurementsHardPlaces.tsx`
- `MeasurementsHero.tsx`
- `MeasurementsMistakes.tsx`
- `MeasurementsSteps.tsx`

#### Materials

- `MaterialsChoice.tsx`
- `MaterialsFinalCTA.tsx`
- `MaterialsHero.tsx`
- `MaterialsHowToChoose.tsx`
- `MaterialsPalette.tsx`

#### Assembly

- `AssemblyFinalCTA.tsx`
- `AssemblyHero.tsx`
- `AssemblyKit.tsx`
- `AssemblySupport.tsx`
- `AssemblyTimeline.tsx`
- `AssemblyTools.tsx`

## Текущее состояние архитектуры

### Что хорошо

- Static HTML-string pages удалены.
- `StaticHtmlPage.tsx` удалён.
- Header централизован в `SiteHeader`.
- Info footer централизован в `InfoFooter`.
- Заголовки секций централизованы в `SectionHeader`.
- Информационные карточки централизованы в `InfoCard` и `InfoCardGrid`.
- Финальные CTA информационных страниц централизованы в `InfoFinalCTA`.
- Страницы стали composition layer, а не длинными файлами с полной разметкой.
- CSS не переписывался и не менял визуальные значения.

### Что ещё осталось декомпозировать

1. **Home-specific cards**
   - `HomeHow`
   - `HomePrice`
   - `HomeKit`
   - `HomeProducts`
   - `HomeFAQ`

   Там остаются повторяемые card-паттерны, но они home-specific. Их лучше выносить отдельно, а не смешивать с `InfoCard`.

2. **Info split sections**
   - `MeasurementsHardPlaces`
   - `MaterialsHowToChoose`

   Эти секции имеют layout «диаграмма + текст». Их пока безопаснее не трогать.

3. **Checklist / timeline / tools**
   - `MeasurementsChecklist`
   - `AssemblyTimeline`
   - `AssemblyTools`

   Это разные паттерны. Их стоит выносить только после визуальной проверки.

4. **Shared CTA для home**
   - `HomeFinalCTA` пока отличается от `InfoFinalCTA`.
   - Можно унифицировать позже, но сейчас лучше не смешивать.

## Что не трогалось

- CSS-значения;
- backend/API;
- pricing engine;
- order flow;
- production preview;
- Zustand-store;
- constructor logic.

## Рекомендованный следующий этап

Следующим безопасным шагом лучше сделать не новый cleanup, а guard/inventory для React-компонентов:

- посчитать размеры компонентов;
- найти компоненты больше заданного размера;
- отметить кандидатов на дальнейшую декомпозицию;
- ничего автоматически не удалять.

Это снизит риск регрессов и даст понятный список следующих архитектурных задач.
