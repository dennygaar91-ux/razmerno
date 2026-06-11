# Размерно — client-safe validation UI v15

## Что сделано

Клиентский интерфейс конструктора стал проще и спокойнее: техническая production-сводка больше не показывается обычному клиенту напрямую.

## Изменения

### Для клиента

В `ConstructorScene` добавлен мягкий блок:

- «Автопроверка»
- «Размеры приняты для расчёта»
- «Наполнение собрано по секциям»
- «Перед запуском заказ проверит менеджер»

Клиент больше не видит слова:

- панели;
- присадка;
- БАЗИС;
- production;
- технолог;
- drilling;
- hardware count.

### Для debug/dev

Инженерная сводка сохранена, но показывается только если включён debug mode:

- `?debug=1`
- или `localStorage.rzmDebug = "1"`

В debug-блоке остаются:

- panels;
- hardware;
- drilling;
- basisSteps;
- warnings;
- errors;
- requiresTechnologistCheck;
- validation status.

## CSS

Добавлены классы:

- `.rzm-client-validation-card`
- `.rzm-client-validation-head`
- `.rzm-client-validation-status`
- `.rzm-client-validation-status--warning`
- `.rzm-client-validation-list`
- `.rzm-client-validation-note`
- `.rzm-production-preview-summary`

## Что сохранено

- `productionPreviewAdapter`;
- lazy loading production preview;
- production summary для тестирования;
- все проверки и тесты.

## Что не трогалось

- backend/API;
- pricing engine;
- delivery;
- order flow;
- admin;
- production geometry internals.

## Следующий этап

Визуально проверить конструктор. Если клиентский блок всё ещё кажется лишним, можно перенести его ниже в checkout или сделать компактнее.
