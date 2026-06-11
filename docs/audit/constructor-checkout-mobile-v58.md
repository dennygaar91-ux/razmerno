# Размерно — constructor checkout + mobile polish v58

## Что сделано

Продолжены правки конструктора после v57: улучшена читаемость checkout-step, добавлен mobile polish и декомпозирован checkout на подкомпоненты.

## Изменённые файлы

- `src/static-pages/constructor/components/CheckoutStep.tsx`
- `src/static-pages/constructor/components/CheckoutSummaryCard.tsx`
- `src/static-pages/constructor/components/CheckoutContactCard.tsx`
- `src/static-pages/constructor/components/CheckoutPriceCard.tsx`
- `src/static-pages/constructor/components/CheckoutOptionsCard.tsx`
- `src/static-pages/constructor/components/CheckoutNextCard.tsx`
- `src/static-pages/constructor/components/CheckoutConsentCard.tsx`
- `src/styles/constructor.css`

## Checkout readability

Checkout-step пересобран по смысловым блокам:

1. summary card с текущей стоимостью;
2. контакты;
3. смета;
4. доставка/сборка;
5. что будет после заявки;
6. согласие.

## Новый summary card

Добавлен верхний блок:

- `Финальный шаг`;
- заголовок `Заявка`;
- короткое пояснение;
- отдельная dark price card с текущей стоимостью.

## Контакты

Блок контактов получил:

- заголовок `Контакты`;
- пояснение, зачем нужны телефон и email;
- badge `обязательно`.

## Смета

Смета стала отдельной читаемой карточкой:

- корпус и фасады;
- фурнитура и крепёж;
- кромление и подготовка;
- доставка и сборка.

## Доставка и сборка

Блок `Дополнительно` стал визуально чище:

- active state у доставки/сборки;
- уточнён текст по сборке: `+10% к стоимости мебели`;
- поле адреса остаётся только при включенной доставке.

## Mobile polish

Добавлены mobile-правки:

- сцена и sidebar компактнее;
- stepper на mobile стал горизонтально скроллируемым;
- submit block стал sticky внизу;
- цена в scene header лучше адаптируется;
- checkout summary на mobile складывается в одну колонку.

## Декомпозиция

`CheckoutStep.tsx` после первой правки стал flagged candidate. Исправлено декомпозицией:

- `CheckoutSummaryCard`
- `CheckoutContactCard`
- `CheckoutPriceCard`
- `CheckoutOptionsCard`
- `CheckoutNextCard`
- `CheckoutConsentCard`

После декомпозиции:

```text
Flagged candidates: 0
```

## Что не трогалось

- backend/API;
- pricing engine;
- order flow implementation;
- production preview adapter;
- admin;
- Supabase/API/env.

## QA

Пройдены проверки:

- `npm run report:react-components`
- `npm run report:visual-qa`
- `npm run check:constructor-architecture`
- `npm run check:static-pages-architecture`
- `npm run check:no-static-html-pages`
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

- sticky submit на реальном mobile;
- не перекрывает ли sticky block последние поля;
- читаемость checkout cards на 390px;
- горизонтальный stepper на touch;
- итоговую плотность checkout.

## Следующий этап

Следующий логичный этап — scene labels polish + sidebar visual hierarchy после проверки конструктора в браузере.
