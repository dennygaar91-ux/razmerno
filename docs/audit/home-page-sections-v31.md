# Размерно — HomePage sections v31

## Что сделано

Продолжена декомпозиция React-страниц: `HomePage.tsx` разбит на секционные компоненты.

## Новые файлы

- `src/static-pages/home/HomeHero.tsx`
- `src/static-pages/home/HomeHow.tsx`
- `src/static-pages/home/HomePrice.tsx`
- `src/static-pages/home/HomeKit.tsx`
- `src/static-pages/home/HomeProducts.tsx`
- `src/static-pages/home/HomeCustomProject.tsx`
- `src/static-pages/home/HomeFAQ.tsx`
- `src/static-pages/home/HomeFinalCTA.tsx`
- `src/static-pages/home/HomeFooter.tsx`

## Что изменено

`src/static-pages/HomePage.tsx` теперь стал composition layer:

```tsx
<SiteHeader activePage="home" />
<main className="rzm-home-main">
  <HomeHero />
  <HomeHow />
  <HomePrice />
  <HomeKit />
  <HomeProducts />
  <HomeCustomProject />
  <HomeFAQ />
  <HomeFinalCTA />
</main>
<HomeFooter />
```

## Что сохранено

- HTML-разметка секций;
- CSS-классы;
- тексты;
- CTA;
- ссылки;
- FAQ;
- footer content;
- header из `SiteHeader`.

## Что не трогалось

- CSS-значения;
- backend/API;
- pricing engine;
- order flow;
- production preview;
- Zustand-store;
- constructor logic.

## Результат

Главная страница стала легче для дальнейшей работы: теперь можно менять отдельные секции без риска задеть всю страницу.

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

Так же декомпозировать информационные страницы или начать вынос повторяемых карточек лендинга в shared UI components.
