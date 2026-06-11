# Размерно — constructor submit hook v10

## Что сделано

Отправка заявки и сборка order payload вынесены из `ConstructorPage.tsx` в отдельный hook:

`src/static-pages/constructor/hooks/useConstructorSubmit.ts`

## Что изменилось

- `ConstructorPage.tsx` больше не содержит большую функцию `handleSubmit`.
- Валидация checkout, delivery address и consent находится в hook.
- Сборка payload заявки находится в hook.
- Вызов `submitOrder(payload)` находится в hook.
- Submit-состояния:
  - `idle`
  - `submitting`
  - `success`
  - `error`
  теперь возвращаются из hook.
- `ConstructorPage.tsx` стал ещё более лёгким orchestration layer.

## Что сохранено

- `submitOrder` и `validateCustomer` используются как раньше.
- Lazy pricing loader используется для `validateDelivery`.
- Существующая backend/API-логика не переписывалась.
- Визуальные классы не менялись.
- Расчёт цены остаётся в `useConstructorQuote`.

## Что не сделано

- Zustand/store пока не подключался.
- Production/manufacturing model не подключалась.
- Реальная 3D-сцена пока не подключалась.

## Следующий этап

Подготовить constructor state module или Zustand slice, чтобы состояние конструктора было отделено от UI-компонентов и могло использоваться для production model, autosave и checkout.
