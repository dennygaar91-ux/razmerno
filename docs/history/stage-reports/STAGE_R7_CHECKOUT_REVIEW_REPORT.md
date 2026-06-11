# Stage R7 — checkout review and final order snapshot

## 1. Контекст этапа

Цель этапа — проверить финальный путь заявки и сделать checkout более честным: перед отправкой пользователь должен видеть, что именно уйдёт менеджеру, без фейковых fallback-цен и без изменения submit/backend/pricing.

## 2. Что найдено в проекте

После R6 основной сценарий конструктора был стабилизирован, но финальный экран заявки показывал в основном контакты, смету, доставку/сборку и согласие. Не было отдельной карточки с итоговым snapshot проекта: тип мебели, размеры, секции/отсеки, наполнение, фасады, материалы корпуса/фасадов/задней стенки.

Также в checkout UI оставались визуальные fallback-цены `42800`, `31600`, `6400`, `4800`, которые могли выглядеть как реальные значения, если quote ещё не рассчитан.

## 3. Что можно было менять

Изменены только UI/helper/test-слои активного конструктора:

- `src/static-pages/constructor/adapters/constructorCheckoutReview.ts`
- `src/static-pages/constructor/adapters/constructorCheckoutReview.test.ts`
- `src/static-pages/constructor/components/CheckoutProjectReviewCard.tsx`
- `src/static-pages/constructor/components/CheckoutStep.tsx`
- `src/static-pages/constructor/components/ConstructorCheckoutLayout.tsx`
- `src/static-pages/ConstructorPage.tsx`
- `src/static-pages/constructor/components/CheckoutPriceCard.tsx`
- `src/styles/constructor.css`

## 4. Что нельзя было менять

Не трогал:

- checkout submit flow;
- `useConstructorSubmit`;
- backend/API;
- Supabase;
- админку;
- pricing formulas;
- production export internals;
- delivery/assembly rules;
- store/rules бизнес-логику.

## 5. Внесённые правки

### Checkout review helper

Добавлен helper:

```txt
src/static-pages/constructor/adapters/constructorCheckoutReview.ts
```

Он собирает итоговую карточку из уже существующего constructor snapshot:

- тип мебели;
- габариты;
- количество секций и отсеков;
- наполнение по layout;
- фасады open/hinged и ручки/без ручек;
- материал корпуса;
- материал фасадов;
- автоматически подобранную ХДФ-заднюю стенку;
- validation status.

### Checkout project review card

Добавлен компонент:

```txt
src/static-pages/constructor/components/CheckoutProjectReviewCard.tsx
```

Теперь на финальном экране заявки пользователь видит блок **«Что отправится менеджеру»**.

### Checkout integration

`ConstructorCheckoutLayout` и `CheckoutStep` теперь получают:

- `snapshot`;
- `validation`.

Это не меняет submit payload, а только показывает пользователю итоговую сводку.

### Удаление фейковых fallback-цен

В `CheckoutPriceCard` и правой checkout-панели убраны значения-заглушки:

- `42800`;
- `31600`;
- `6400`;
- `4800`.

Если quote ещё не готов, UI показывает **«Считаем»**, а не случайную цену.

### CSS

Добавлен слой:

```txt
Stage R7 — checkout review and final snapshot clarity
```

Он оформляет:

- review-card;
- validation status pill;
- grid итоговых параметров;
- mobile layout для review-card.

## 6. Ревью: план vs факт

План выполнен.

Финальный экран теперь стал проверочным, а не просто формой контактов. Пользователь видит, какие данные проекта уйдут менеджеру, а checkout больше не показывает фейковые fallback-цифры при отсутствии quote.

## 7. Анализ рисков

Риск низкий:

- submit hook не менялся;
- payload builder не менялся;
- backend/API не трогались;
- pricing formula не менялась;
- store/rules не менялись.

Ограничение: визуальный QA через Playwright-скриншоты не выполнялся. Но build, typecheck и профильные тесты прошли.

## 8. Проверки

Успешно выполнено:

```bash
npm install
node --no-warnings --import tsx src/static-pages/constructor/adapters/constructorCheckoutReview.test.ts
npm run test:constructor-payload
npm run test:constructor-flow
npm run test:constructor-store
npm run test:production-preview
npm run typecheck
npm run typecheck:api
npm run build
```

## 9. Следующий шаг

Следующий логичный этап: **Stage R8 — финальный UX/code audit конструктора после R2–R7**.

Нужно пройти весь сценарий, зафиксировать оставшиеся проблемы без новой разработки pricing/production и решить, что ещё нужно довести перед упаковкой как стабильной версии конструктора.
