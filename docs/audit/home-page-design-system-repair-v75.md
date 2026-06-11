# Размерно — Home page design-system repair v75

## Цель этапа

Привести в порядок главную страницу после того, как на ней «поехали» тексты, расположение элементов и дизайн-система.

## Что сделано

### Hero

- Убран тяжёлый многострочный заголовок с ручными переносами.
- Новый заголовок стал короче и стабильнее:
  - `Мебель под ваш размер — без сложных чертежей`
- Уменьшен риск налезания текста на изображение.
- Hero собран как единая большая карточка с контролируемыми колонками.
- Убран лишний визуальный слой с псевдо-мебелью поверх фотографии.
- Оставлена одна главная фотография и две спокойные подсказки:
  - `под ваш размер`;
  - `Проверим перед запуском`.

### Блок «Как это работает»

- Заголовок упрощён:
  - `От размера до заявки — четыре шага`
- Тексты карточек стали короче.
- Шаги выровнены по единой карточной системе.
- Уменьшены размеры иллюстраций и карточек.

### Блок комплекта

- Заголовок заменён на более прямой:
  - `Что приезжает в комплекте`
- Сетка стала стабильнее: слева изображение, справа три смысловые карточки.
- Карточки приведены к более компактному виду.

### Блок форматов мебели

- Заголовок заменён:
  - `Шкаф, тумба и комод под ваш размер`
- Тексты карточек укорочены.
- Showcase и карточки приведены к более ровной визуальной системе.

### FAQ и финальный CTA

- Укорочены supporting-тексты.
- Уточнён финальный CTA:
  - `Соберите первый проект`
- Упорядочены отступы, радиусы и типографика.

## Изменённые файлы

- `src/static-pages/home/HomeHero.tsx`
- `src/static-pages/home/HomeHow.tsx`
- `src/static-pages/home/HomeKit.tsx`
- `src/static-pages/home/HomeProducts.tsx`
- `src/static-pages/home/HomeFAQ.tsx`
- `src/static-pages/home/HomeFinalCTA.tsx`
- `src/styles/constructor.css`

## Что не трогалось

- Конструктор.
- Pricing.
- Order flow.
- API/backend.
- Admin.
- Supabase.
- Заявки.
- Производственная логика.

## QA

Пройдены проверки:

- `npm run typecheck`
- `npm run build`
- `npm run test:browser-smoke-static`
- `npm run check:constructor-architecture`
- `npm run check:static-pages-architecture`
- `npm run check:no-static-html-pages`
- `npm run report:react-components`
- `npm run report:visual-qa`
- `npm run report:css-inventory`
- `npm run test:constructor-store`
- `npm run test:constructor-flow`
- `npm run test:constructor-pii-order`
- `npm run test:constructor-draft`
- `npm run test:constructor-payload`
- `npm run test:production-preview`
- `npm run test:constructor-three`
- `npm run test:constructor-three-safety`
- `npm run check:no-server`
- `npm run check:normal-urls`
- `npm run check:root-docs`
- `npm run check:legacy-runtime-imports`
- `npm run test:pricing-engine`
- `npm run test:delivery`
- `npm run test:pricing-final`
- `npm run report:css-usage`

## Что нужно проверить глазами

- Не стал ли hero слишком спокойным.
- Достаточно ли читается главный смысл.
- Не хочется ли вернуть более сильную Lego/конструктор-метафору, но уже без поломки композиции.
- Нормально ли смотрятся отступы между блоками на desktop.
- Не слишком ли компактными стали карточки на mobile.
