# Размерно — constructor store autosave v21

## Что сделано

Начат приоритет 3: улучшение технической архитектуры нового конструктора.

## Новые файлы

- `src/static-pages/constructor/store/constructorSelectors.ts`
- `src/static-pages/constructor/store/constructorDraft.ts`
- `src/static-pages/constructor/store/constructorDraft.test.ts`
- `src/static-pages/constructor/hooks/useConstructorDraftLifecycle.ts`

## Изменения в store

- Добавлены отдельные selectors для чтения state и actions.
- `ConstructorPage.tsx` теперь использует именованные selectors вместо inline selector-функций.
- В store добавлен action `restoreDraft`.

## Autosave / restore

Добавлен безопасный draft lifecycle:

- draft сохраняется с debounce 500 ms;
- draft восстанавливается при открытии конструктора;
- draft не содержит PII:
  - имя;
  - телефон;
  - email;
  - адрес доставки;
  - honeypot/company;
  - consent.
- в UI добавлена строка статуса:
  - «Черновик восстановлен»
  - «Черновик сохранён»
  - «Черновик сброшен»
  - «Черновик сохраняется автоматически»
- добавлена кнопка «Сбросить черновик».

## Что специально не сохраняется

- `contact`
- `deliveryAddress`
- `consent`
- `company/honeypot`

Это соответствует правилу: localStorage может хранить только конфигурацию, но не персональные данные и не заказ.

## Дополнительные проверки

Добавлен script:

`npm run test:constructor-draft`

Он проверяет:

- draft не содержит PII;
- невалидный draft игнорируется;
- restore переносит только безопасные поля;
- clear удаляет draft.

## Что не трогалось

- backend/API;
- pricing engine;
- order flow;
- production preview adapter;
- production geometry;
- admin;
- маршруты;
- CSS дизайн-системы кроме строки статуса draft.

## Следующий этап приоритета 3

Разделить CSS не глобальным cleanup, а аккуратно: сначала вынести constructor CSS в отдельный файл и подключить его через `src/index.css`, без изменения классов и визуала.
