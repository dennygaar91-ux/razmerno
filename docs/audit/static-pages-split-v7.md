# Размерно — static pages split v7

## Что сделано

Большой `StaticDesignPages.tsx` разбит на ленивые page-модули.

## Изменения

- Создана папка `src/static-pages/`.
- Добавлены модули:
  - `HomePage.tsx`
  - `MeasurementsPage.tsx`
  - `MaterialsPage.tsx`
  - `AssemblyPage.tsx`
  - `ConstructorPage.tsx`
  - `StaticHtmlPage.tsx`
- `App.tsx` теперь lazy-load страниц через `React.lazy`.
- `StaticDesignPages.tsx` больше не содержит огромный HTML map и оставлен только как маленький compatibility marker.
- Логика конструктора перенесена в `ConstructorPage.tsx`.
- Lazy pricing bridge сохранён внутри страницы конструктора.

## Почему это важно

До этого весь HTML всех страниц лежал в одном `StaticDesignPages.tsx`, поэтому любая страница тащила большой общий static map. Теперь страницы отделены на уровне модулей, и Vite может разнести их по chunks.

## Что не сделано

- HTML ещё не превращён в нормальные React-компоненты.
- CSS ещё остаётся в общем `index.css`.
- Конструктор всё ещё transition bridge, а не полноценная Zustand/store интеграция.

## Следующий этап

Разделить CSS на page-level файлы или вынести конструктор из static HTML в реальные React-компоненты.
