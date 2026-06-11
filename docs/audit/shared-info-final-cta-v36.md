# Размерно — shared info final CTA v36

## Что сделано

Вынесены повторяемые финальные CTA-блоки информационных страниц в общий компонент.

## Новый файл

- `src/static-pages/shared/InfoFinalCTA.tsx`

## Что делает InfoFinalCTA

Компонент централизует структуру:

```tsx
<section className="rzm-info-final rzm-reveal">
  <div>
    <span className="rzm-how-chip-title">...</span>
    <h2>...</h2>
    <p className="rzm-hero-lead">...</p>
  </div>
  <a className="rzm-cta" href="/configurator">...</a>
</section>
```

Поддерживает props:

- `chip`
- `title`
- `lead`
- `ctaLabel`
- `href`

## Где подключено

- `src/static-pages/measurements/MeasurementsFinalCTA.tsx`
- `src/static-pages/materials/MaterialsFinalCTA.tsx`
- `src/static-pages/assembly/AssemblyFinalCTA.tsx`

## Что сохранено

- CSS-классы;
- тексты;
- CTA labels;
- ссылка `/configurator`;
- визуальные CSS-значения.

## Что не трогалось

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

Провести небольшой architecture review static pages после серии v30–v36 и зафиксировать, что ещё осталось декомпозировать.
