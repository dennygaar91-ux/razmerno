# Размерно — shared info cards v35

## Что сделано

Продолжен вынос повторяемых UI-паттернов статических страниц: добавлены общие компоненты для информационных карточек.

## Новые файлы

- `src/static-pages/shared/InfoCard.tsx`
- `src/static-pages/shared/InfoCardGrid.tsx`

## Что делает InfoCard

Компонент централизует повторяемую структуру карточки:

```tsx
<article className="rzm-info-card rzm-reveal">
  <div className="rzm-info-card-top">
    <span className="rzm-how-step-number">...</span>
    <h3>...</h3>
  </div>
  <p className="rzm-step-text">...</p>
</article>
```

## Что делает InfoCardGrid

Компонент централизует grid wrapper:

```tsx
<div className="rzm-info-grid rzm-info-grid--three">...</div>
<div className="rzm-info-grid rzm-info-grid--two">...</div>
```

Поддерживает:

- `variant="three"`
- `variant="two"`

## Где подключено

### Замеры

- `src/static-pages/measurements/MeasurementsBasics.tsx`
- `src/static-pages/measurements/MeasurementsSteps.tsx`
- `src/static-pages/measurements/MeasurementsMistakes.tsx`

### Материалы

- `src/static-pages/materials/MaterialsChoice.tsx`

### Сборка

- `src/static-pages/assembly/AssemblyKit.tsx`
- `src/static-pages/assembly/AssemblySupport.tsx`

## Что сохранено

- CSS-классы;
- тексты;
- номера/буквы бейджей;
- заголовки карточек;
- grid variants;
- визуальные CSS-значения.

## Что не трогалось

- нестандартные card layouts;
- tools/timeline/checklist;
- CSS;
- backend/API;
- pricing engine;
- order flow;
- production preview;
- Zustand-store;
- constructor logic.

## QA

Пройдены проверки:

- `npm run check:no-static-html-pages`
- `npm run report:css-inventory`
- `npm run test:constructor-store`
- `npm run test:constructor-draft`
- `npm run test:constructor-payload`
- `npm run test:production-preview`
- `npm run typecheck`
- `npm run build`
- `npm run check:no-server`
- `npm run check:normal-urls`
- `npm run check:root-docs`
- `npm run check:legacy-runtime-imports`
- `npm run test:pricing-engine`
- `npm run test:delivery`
- `npm run test:pricing-final`

## Следующий этап

Вынести повторяемые CTA-блоки информационных страниц в общий компонент `InfoFinalCTA`.
