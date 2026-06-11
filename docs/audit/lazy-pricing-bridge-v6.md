# Размерно — lazy pricing bridge v6

## Что сделано

Оптимизирован bridge между static UI конструктора и pricing engine.

## Изменения

- Убраны top-level imports pricing/delivery/assembly из `StaticDesignPages.tsx`.
- Pricing modules теперь загружаются лениво через dynamic import только внутри конструктора:
  - `./shared/lib/price`
  - `./pricing/delivery`
  - `./pricing/assembly`
- Главная и информационные страницы больше не должны подтягивать pricing catalog в initial path.
- Расчёт цены, доставки, сборки и payload заявки сохранён.
- При открытии checkout или изменении параметров конструктора вызывается lazy `renderQuote()`.

## Зачем это нужно

В v5 Vite вынес price catalog в отдельный chunk около 564 KB. Это лучше, чем main bundle, но static import всё равно делает pricing частью client graph. Lazy import снижает риск загрузки прайса на главной и информационных страницах.

## Ограничения

- Это всё ещё переходный static bridge.
- Следующий этап — разбить `StaticDesignPages.tsx` на отдельные React-компоненты/страницы, чтобы полностью убрать огромный HTML JSON из общего client bundle.
