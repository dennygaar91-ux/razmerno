# Размерно — HomePage React v27

## Что сделано

Начат этап приоритета 3: постепенный отказ от static HTML modules.

## Изменения

`src/static-pages/HomePage.tsx` переведён из HTML-строки + `StaticHtmlPage` в обычный React/JSX-компонент.

## Что изменилось технически

До:

```tsx
import { StaticHtmlPage } from "./StaticHtmlPage";

const html = "...";

export default function HomePage() {
  return <StaticHtmlPage html={html} />;
}
```

После:

```tsx
export default function HomePage() {
  return (
    <>
      ...
    </>
  );
}
```

## Что сохранено

- HTML-структура главной страницы.
- Текущие CSS-классы.
- Тексты.
- Ссылки.
- Header/footer markup.
- FAQ `details`.
- Все CTA.

## Что не трогалось

- CSS значения;
- backend/API;
- pricing engine;
- order flow;
- production preview;
- Zustand-store;
- constructor logic;
- info pages.

## Почему это важно

Главная страница больше не зависит от `dangerouslySetInnerHTML` через `StaticHtmlPage`. Это упрощает дальнейший перенос лендинга на нормальные React-компоненты по секциям.

## Следующий этап

Перевести следующую static info page в React/JSX или разбить `HomePage.tsx` на секционные компоненты:

- `HomeHeader`
- `HomeHero`
- `HomeHowItWorks`
- `HomeKit`
- `HomeProducts`
- `HomeFAQ`
- `HomeFinalCTA`
- `HomeFooter`
