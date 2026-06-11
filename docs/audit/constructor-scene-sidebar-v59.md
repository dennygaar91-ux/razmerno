# Размерно — constructor scene/sidebar polish v59

## Что сделано

Продолжены правки конструктора после v58: улучшена визуальная иерархия sidebar и читаемость scene labels.

## Изменённые файлы

- `src/static-pages/constructor/components/ConstructorScene.tsx`
- `src/static-pages/constructor/components/ConstructorSidebar.tsx`
- `src/styles/constructor.css`

## Sidebar visual hierarchy

Добавлен новый блок текущего шага:

- название активного шага;
- короткий заголовок;
- пояснение, что нужно сделать на текущем шаге.

Примеры:

- `Начните с габаритов`
- `Соберите внутренности`
- `Подберите внешний вид`
- `Отправьте заявку`

Также добавлен compact status в верхней части sidebar:

```text
ширина × высота × глубина мм
```

## Scene labels polish

В scene header добавлен более понятный заголовок:

```text
{Тип мебели} в текущей конфигурации
```

Описание изменено на:

```text
Размеры, секции, наполнение и декор собраны в единую схему.
```

## Dimension labels

Размерные labels стали понятнее:

- `Ширина + значение`
- `Высота + значение`
- `Глубина + значение`

Добавлены визуальные маркеры-точки, чтобы labels выглядели как часть интерфейса, а не случайные подписи.

## Fill badge

Badge наполнения получил визуальный `+`-маркер, чтобы лучше считывалась логика добавления/настройки наполнения.

## Client validation

Немного улучшена читаемость блока автопроверки:

- строки стали отдельными мягкими pills;
- блок лучше отделяется от сцены.

## Что не трогалось

- backend/API;
- pricing engine;
- order flow implementation;
- production preview adapter;
- checkout logic;
- admin;
- Supabase/API/env.

## QA

Пройдены проверки:

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

Этап не включает pixel-perfect browser review. После проверки в браузере нужно отдельно оценить:

- не перегружает ли новый sidebar-current-step панель;
- не конфликтуют ли labels с крупной моделью;
- читается ли `Ширина/Высота/Глубина` на 390px;
- не стало ли слишком много chips/labels в scene.

## Следующий этап

Логичный следующий этап — browser-driven visual QA / screenshot checklist или safe CSS usage report перед дальнейшим cleanup.
