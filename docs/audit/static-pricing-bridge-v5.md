# Размерно — static pricing bridge v5

## Что сделано

Переходный static UI конструктора теперь использует настоящий pricing engine проекта для расчёта стоимости.

## Изменения

- В `StaticDesignPages.tsx` подключены:
  - `calculatePrice`
  - `formatPrice`
  - `calculateDeliveryQuote`
  - `validateDelivery`
  - `calculateAssemblyQuote`
- UI-цена пересчитывается через `calculatePrice`, а не через ручные прибавки.
- Доставка считается через `calculateDeliveryQuote`.
- Сборка считается через `calculateAssemblyQuote`.
- В checkout обновляются:
  - общая стоимость;
  - материалы;
  - фурнитура/наполнение;
  - услуги/кромление/подготовка;
  - доставка/сборка;
  - поясняющее сообщение по доставке/сборке.
- Payload заявки теперь использует тот же calculated quote.

## Что не сделано

- Static UI ещё не подключён к Zustand/store.
- Геометрия/production model пока не формируется из нового UI.
- Полная связка с manufacturing layer остаётся следующим этапом.

## Почему это безопаснее

Раньше static UI отправлял приблизительный payload с вручную разложенной ценой. Теперь цена и delivery/assembly-часть идут через существующие модули проекта, которые уже покрыты тестами.
