# Размерно. — React + Vite

Онлайн-конструктор корпусной мебели под размеры в миллиметрах.

## Быстрый старт

```bash
npm install
npm run dev
```

Откроется на http://localhost:5173

## Сборка для продакшена

```bash
npm run build      # собрать в /dist
npm run preview    # превью сборки локально
```

---

## Структура проекта

```
src/
├── main.jsx                   # точка входа, глобальные стили
├── App.jsx                    # роутер
│
├── styles/
│   ├── tokens.css             # CSS-переменные + reset
│   └── atoms.css              # кнопки, kicker, scroll-reveal, wrap
│
├── icons/
│   └── Icon.jsx               # все SVG-иконки как компонент
│                              # <Icon name="check" size={20} />
│
├── hooks/
│   ├── useScrollReveal.js     # IntersectionObserver для .rv / .vis
│   └── useHeader.js           # флаг scrolled для хедера
│
├── components/
│   ├── Header/                # хедер + мобильное меню + селектор города
│   │   ├── Header.jsx
│   │   └── Header.css
│   ├── Footer/
│   │   ├── Footer.jsx
│   │   └── Footer.css
│   └── sections/              # каждый блок лендинга — отдельная папка
│       ├── Hero/              # герой с фото и fear-chips
│       ├── TrustBar/          # полоса доверия (4 пункта)
│       ├── Value/             # «Что вы получите» (4 тёмные карточки)
│       ├── UseCases/          # «Кому подходит» (5 сценариев)
│       ├── HowItWorks/        # «Как работает» (3 шага)
│       ├── Measure/           # «Замер» (SVG-схема + карточки)
│       ├── Cases/             # «Примеры» (фильтр + сетка/слайдер)
│       ├── Materials/         # «Материалы» (ЛДСП/МДФ PNG + фурнитура)
│       ├── ConstructorTeaser/ # тизер конструктора (3D-анимация)
│       ├── Box/               # «Что в коробке» (фото + заметки)
│       ├── Assembly/          # «Сборка» (3 шага + советы)
│       ├── FearFaq/           # «Страхи + FAQ» (10 вопросов)
│       └── FinalCta/          # финальный CTA с живым калькулятором
│
└── pages/
    ├── Landing.jsx            # лендинг — собирает все секции
    ├── ConstructorPage.jsx    # конструктор (three.js placeholder)
    ├── AuthPage.jsx           # вход / регистрация
    ├── AccountPage.jsx        # личный кабинет
    └── AccountOrderPage.jsx   # детали заказа
```

---

## Роуты

| Путь               | Страница          |
|--------------------|-------------------|
| `/`                | Лендинг           |
| `/constructor`     | Конструктор       |
| `/auth`            | Вход / регистрация|
| `/account`         | Личный кабинет    |
| `/account/order`   | Детали заказа     |

Для регистрации: `/auth?mode=register`

---

## Декоры материалов

Положите PNG-файлы в папку `public/materials/`:

```
public/
└── materials/
    ├── ldsp-1.png   (Дуб Сан-Ремо светлый)
    ├── ldsp-2.png   (Дуб Сан-Ремо натуральный)
    ├── ldsp-3.png   (Дуб тёмный)
    ├── ldsp-4.png   (Венге)
    ├── ldsp-5.png   (Белый)
    ├── ldsp-6.png   (Серый)
    ├── ldsp-7.png   (Антрацит)
    ├── ldsp-8.png   (Сонома)
    ├── mdf-1.png    (Белый матовый)
    ├── mdf-2.png    (Серый матовый)
    ├── mdf-3.png    (Чёрный матовый)
    ├── mdf-4.png    (Дуб матовый)
    ├── mdf-5.png    (Бетон)
    ├── mdf-6.png    (Кремовый)
    ├── mdf-7.png    (Таупе)
    └── mdf-8.png    (Дымчатый)
```

Пока PNG не загружены — карточки показывают CSS-цвет как placeholder.

---

## Как добавить новую иконку

В `src/icons/Icon.jsx` добавьте ключ в объект `paths`:

```jsx
'my-icon': <path d="M..." />
```

Использование:
```jsx
<Icon name="my-icon" size={20} />
```

---

## Подключение three.js

В `ConstructorPage.jsx` найдите блок `.cst-view` с комментарием  
`{/* Cabinet wireframe */}` и замените `.cst-cab` на Canvas-рендерер three.js.

В `ConstructorTeaser.jsx` найдите `<div className="cstr__cab" id="three-viewer" />`  
и подключите статичный превью-рендер.

---

## Технологии

- React 18 + React Router 6
- Vite 6
- Чистый CSS (без Tailwind / CSS Modules)
- JetBrains Mono / Montserrat / Inter / Instrument Serif
