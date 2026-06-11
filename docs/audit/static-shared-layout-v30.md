# Размерно — static shared layout v30

## Что сделано

Продолжен приоритет 3: после перевода static pages в React/JSX начата декомпозиция повторяющейся layout-разметки.

## Новые файлы

- `src/static-pages/shared/SiteHeader.tsx`
- `src/static-pages/shared/InfoFooter.tsx`

## Что изменено

### SiteHeader

Повторяющийся header вынес из страниц:

- `HomePage.tsx`
- `MeasurementsPage.tsx`
- `MaterialsPage.tsx`
- `AssemblyPage.tsx`

Теперь страницы используют:

```tsx
<SiteHeader activePage="..." />
```

Поддерживаются active states:

- `home`
- `measurements`
- `materials`
- `assembly`

### InfoFooter

Повторяющийся footer информационных страниц вынес в:

```tsx
<InfoFooter />
```

Используется в:

- `MeasurementsPage.tsx`
- `MaterialsPage.tsx`
- `AssemblyPage.tsx`

Home footer пока оставлен внутри `HomePage.tsx`, потому что его структура отличается от info footer.

## Что сохранено

- текущие CSS-классы;
- визуальные значения CSS;
- nav links;
- mobile menu;
- CTA;
- active nav states;
- тексты footer.

## Что не трогалось

- backend/API;
- pricing engine;
- order flow;
- production preview;
- Zustand-store;
- constructor logic;
- CSS cleanup.

## Результат

Уменьшено дублирование React-разметки. Header теперь централизован, и будущие изменения меню/логотипа/CTA нужно делать в одном месте.

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

Разбить `HomePage.tsx` на секционные компоненты: `HomeHero`, `HomeHow`, `HomeKit`, `HomeProducts`, `HomeFAQ`, `HomeFinalCTA`, `HomeFooter`.
