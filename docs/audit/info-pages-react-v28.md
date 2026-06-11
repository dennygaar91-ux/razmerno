# Размерно — info pages React v28

## Что сделано

Продолжен приоритет 3: оставшиеся static HTML pages переведены в обычные React/JSX-компоненты.

## Изменённые файлы

- `src/static-pages/MeasurementsPage.tsx`
- `src/static-pages/MaterialsPage.tsx`
- `src/static-pages/AssemblyPage.tsx`

## Что изменилось технически

До:

```tsx
import { StaticHtmlPage } from "./StaticHtmlPage";

const html = "...";

export default function MeasurementsPage() {
  return <StaticHtmlPage html={html} />;
}
```

После:

```tsx
export default function MeasurementsPage() {
  return (
    <>
      ...
    </>
  );
}
```

То же сделано для `MaterialsPage` и `AssemblyPage`.

## Что сохранено

- текущая HTML-структура;
- текущие тексты;
- текущие ссылки;
- header/footer markup;
- все CSS-классы;
- CTA;
- active nav states.

## Что не трогалось

- CSS-значения;
- backend/API;
- pricing engine;
- order flow;
- production preview;
- Zustand-store;
- constructor logic.

## Почему это важно

Теперь все основные статические страницы больше не зависят от HTML-строк и `dangerouslySetInnerHTML`. Это упрощает дальнейшую декомпозицию страниц на секционные React-компоненты.

## Что осталось

`StaticHtmlPage.tsx` пока оставлен в проекте, чтобы не делать рискованное удаление без отдельной проверки импортов/истории. В следующем этапе можно удалить его, если он действительно больше нигде не используется.

## Следующий этап

Удалить неиспользуемый `StaticHtmlPage.tsx` и добавить check, который запрещает новые static HTML-string pages.
