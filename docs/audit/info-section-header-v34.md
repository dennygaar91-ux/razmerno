# Размерно — info section header v34

## Что сделано

Продолжен вынос повторяемых UI-паттернов: `SectionHeader variant="info"` подключён к информационным страницам.

## Изменённые файлы

### Замеры

- `src/static-pages/measurements/MeasurementsBasics.tsx`
- `src/static-pages/measurements/MeasurementsSteps.tsx`
- `src/static-pages/measurements/MeasurementsMistakes.tsx`

### Материалы

- `src/static-pages/materials/MaterialsPalette.tsx`
- `src/static-pages/materials/MaterialsChoice.tsx`

### Сборка

- `src/static-pages/assembly/AssemblyKit.tsx`
- `src/static-pages/assembly/AssemblyTools.tsx`
- `src/static-pages/assembly/AssemblySupport.tsx`

## Что изменено

Повторяющийся блок:

```tsx
<div className="rzm-info-section-head rzm-reveal">
  ...
</div>
```

заменён на:

```tsx
<SectionHeader
  variant="info"
  chip="..."
  title="..."
  lead="..."
/>
```

## Что сохранено

- CSS-классы через `SectionHeader`;
- тексты;
- заголовки;
- lead-тексты;
- структура секций после header;
- CTA;
- карточки;
- визуальные CSS-значения.

## Что не трогалось

- split-секции с другой layout-структурой (`rzm-info-split`);
- standalone checklist/timeline sections;
- CSS;
- backend/API;
- pricing engine;
- order flow;
- production preview;
- Zustand-store;
- constructor logic.

## Почему split-секции не трогались

Некоторые секции используют нестандартную layout-структуру: диаграмма + текстовый блок. Их нельзя безопасно заменить на `SectionHeader` без риска изменить визуальную композицию. Поэтому на этом этапе заменены только секции с прямым `rzm-info-section-head`.

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

Вынести повторяемые карточки информационных страниц: `InfoCard`, `InfoCardGrid`, возможно `NumberBadge`.
