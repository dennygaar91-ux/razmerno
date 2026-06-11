# Размерно — home redesign v53

## Что сделано

Начаты правки главной страницы по утверждённому направлению:

- главная показывает шкаф, тумбу и комод как равнозначные форматы;
- hero больше не строится только вокруг шкафа;
- визуал стал более предметным и мебельным;
- добавлены референсные изображения пользователя в assets;
- главная стала ближе к направлению: мебельная сцена + модульность + аккуратные UI-подсказки.

## Изменённые файлы

- `src/static-pages/home/HomeHero.tsx`
- `src/static-pages/home/HomeHow.tsx`
- `src/static-pages/home/HomePrice.tsx`
- `src/static-pages/home/HomeKit.tsx`
- `src/static-pages/home/HomeProducts.tsx`
- `src/static-pages/home/HomeFinalCTA.tsx`
- `src/static-pages/shared/SiteHeader.tsx`
- `src/styles/constructor.css`

## Добавленные assets

- `public/assets/home-hero-furniture-scene.jpeg`
- `public/assets/home-hero-modules.jpeg`
- `public/assets/home-kit-flatlay.jpeg`
- `public/assets/home-products-scene.jpeg`
- `public/assets/home-how-preview.jpeg`

## Hero

Hero пересобран в сторону:

- «Соберите мебель под своё место — как понятный конструктор»;
- шкаф, тумба и комод как равнозначные форматы;
- CTA `Открыть конструктор`;
- второй CTA `Как это работает`;
- chips: `Шкафы`, `Тумбы`, `Комоды`;
- фото-сцена + модульные карточки + UI-маркеры.

## Как это работает

Блок пересобран в 4 шага:

1. Введите размеры
2. Соберите наполнение
3. Выберите материал
4. Отправьте заявку

Добавлены мини-иллюстрации внутри карточек, чтобы блок был менее стерильным.

## Стоимость

Блок стал честнее для равнозначных форматов:

- Тумба — ориентир от 14 000 ₽
- Комод — ориентир от 28 000 ₽
- Шкаф — ориентир от 42 000 ₽

Добавлено пояснение, что точная стоимость считается в конструкторе.

## Что получите

Блок усилен через flat-lay reference image:

- детали по размерам;
- фурнитура и крепёж;
- понятная инструкция;
- маркировка деталей.

## Что можно создать

Блок теперь явно показывает три равнозначных формата:

- шкафы;
- комоды;
- тумбы.

Удалён смысл `Основной сценарий / Следующий формат`.

## Header

CTA в header изменён с `Собрать шкаф` на `Открыть конструктор`, чтобы не конфликтовать с решением показывать шкаф, тумбу и комод равнозначно.

## Что не трогалось

- backend/API;
- pricing engine;
- order flow;
- production preview adapter;
- Zustand-store implementation;
- constructor logic;
- checkout;
- admin;
- Supabase/API/env.

## QA

Пройдены проверки:

- `npm run report:visual-qa`
- `npm run check:constructor-architecture`
- `npm run check:static-pages-architecture`
- `npm run check:no-static-html-pages`
- `npm run report:react-components`
- `npm run report:css-inventory`
- `npm run test:constructor-flow`
- `npm run test:constructor-pii-order`
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

## Важное ограничение

Этап не включает pixel-perfect browser review. После проверки в браузере нужно будет отдельно поправить:

- высоту hero;
- кадрирование новых изображений;
- mobile behavior hero;
- плотность карточек;
- возможные несовпадения референсных фото по цвету и контрасту.

## Следующий этап

После проверки главной в браузере перейти к правкам страницы `Замеры`.
