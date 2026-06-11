# Размерно — static HTML guard v29

## Что сделано

Завершён этап отказа от static HTML-string pages.

## Изменения

- Удалён файл:

`src/static-pages/StaticHtmlPage.tsx`

- Добавлен guard-script:

`src/scripts/check-no-static-html-pages.mjs`

Correction: actual path:

`scripts/check-no-static-html-pages.mjs`

- Добавлен npm script:

```bash
npm run check:no-static-html-pages
```

## Что проверяет guard

Guard падает, если в `src/static-pages` появится:

- `StaticHtmlPage`
- `dangerouslySetInnerHTML`
- `const html = "..."`
- `const html = \`...\``

## Почему это важно

Теперь нельзя случайно вернуть старую архитектуру static HTML-string pages. Главная и информационные страницы уже переведены в обычные JSX-компоненты, а guard закрепляет это архитектурное решение.

## Что не трогалось

- CSS-значения;
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

## Примечание

`npm run qa:static` отдельно не включался в финальную цепочку этого этапа, потому что в текущем проекте он содержит старую проверку `CheckoutDrawer must require privacy consent`, которая относится к прежней/legacy-части и не связана с этим этапом.
