# Размерно — static constructor order bridge v4

## Что сделано

Новый static UI конструктора связан с существующим клиентским order flow через `submitOrder` из `src/shared/lib/order`.

## Добавлено

- Импорт `submitOrder` и `validateCustomer` в `StaticDesignPages.tsx`.
- Checkout-поля получили data-атрибуты:
  - `data-checkout-name`
  - `data-checkout-phone`
  - `data-checkout-email`
  - `data-checkout-consent`
  - `data-delivery-toggle`
  - `data-assembly-toggle`
  - `data-delivery-address`
- Добавлена маска телефона.
- Добавлена клиентская валидация имени, телефона, email, адреса доставки и согласия на ПД.
- Добавлен honeypot.
- Submit теперь вызывает `submitOrder(payload)`.
- Payload собирается из текущих UI-значений:
  - тип мебели;
  - размеры;
  - секции;
  - выбранное наполнение;
  - материал;
  - доставка;
  - сборка;
  - цена;
  - контакты.

## Что важно

- Это переходный мост между static UI и настоящей логикой.
- Backend и API не переписывались.
- В production заявка пойдёт через текущий `submitOrder` → `/api/orders` или `VITE_ORDER_API_URL`.
- В local dev без Vercel API можно использовать `VITE_USE_MOCK_API=true`, чтобы проверять UX без реальной отправки.

## Ограничения

- Payload пока approximate, потому что static UI ещё не подключён к Zustand/store и pricing engine напрямую.
- Следующий правильный этап — заменить ручную сборку payload на реальные selectors/store/pricing values.
