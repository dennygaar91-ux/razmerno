# Размерно — React + Vite

## Запуск
```bash
npm install
npm run dev
```

## Сборка
```bash
npm run build
```

## Структура
- `src/router/AppRouter.jsx` — маршруты
- `src/components/ui` — базовые UI-компоненты
- `src/components/layout` — header/footer/sidebar/menu
- `src/pages/Home` — каждый блок главной отдельным файлом
- `src/pages/Constructor` — конструктор по отдельным зонам: header, left panel, viewport, right panel
- `src/pages/Auth` — вход/регистрация
- `src/pages/Account` — личный кабинет
- `src/pages/AccountOrder` — страница заказа
- `src/data` — данные для рендера списков
- `src/utils/calculatePrice.js` — расчет предварительной цены

## Что работает
- Роутинг `/`, `/constructor`, `/auth`, `/account`, `/account/order/:id`
- Мобильное меню
- FAQ accordion
- Переключение вход/регистрация
- Конструктор: размеры, полки, ящики, штанга, материал, фурнитура, пересчет цены
- Mockup viewport под будущий Three.js
- Аккаунт и переходы по заказам
- Галерея заказа
