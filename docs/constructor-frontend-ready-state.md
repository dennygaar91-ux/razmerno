# Constructor frontend ready state

Документ фиксирует текущее состояние frontend конструктора после серии UX/UI, accessibility, storage, checkout и Three.js-preparation правок.

## Общий статус

```txt
Frontend конструктора — 95–97% pre-MVP готовности после успешного build и визуальной проверки.
```

Без нового `npm run build` честный статус ниже:

```txt
Кодовая готовность — 93–95%
Требуется финальная проверка build + browser QA
```

## Текущая карта этапов

```txt
Этап 1. Общая UI-полировка страницы конструктора — 92%
Этап 2. Левая панель UX-мастера — 94%
Этап 3. Центральный viewer / визуал шкафа — 94%
Этап 4. Правая панель стоимости и проекта — 98%
Этап 5. Окно оформления заказа — 97%
Этап 6. Материалы и фурнитура — 95%
Этап 7. Наполнение шкафа — 95%
Этап 8. Состояния, ошибки и подсказки — 99%
Этап 9. Адаптив desktop / laptop — 94%
Этап 10. Подготовка под финальный 3D / Three.js — 97%
Этап 11. Сохранение / загрузка проекта во фронте — 98%
Этап 12. Финальный UX-проход по сценарию пользователя — 97%
```

## Что готово

### 1. Основной UX-сценарий

Собран полный frontend путь:

```txt
размеры → наполнение → материалы → стоимость → сохранение → checkout → заявка
```

Пользователь может:

- менять размеры;
- менять количество секций;
- редактировать наполнение секций;
- выбирать материал, кромку, открывание и фурнитуру;
- видеть стоимость;
- сохранять и загружать проект;
- оформлять заявку через drawer.

### 2. Левая панель настройки

Готово:

- шаг “Размеры”;
- шаг “Наполнение”;
- шаг “Материалы”;
- disabled states;
- подсказки;
- presets наполнения;
- копирование секции;
- применение секции ко всем;
- fallback, если каталог материалов пустой.

### 3. Viewer

Готово:

- CSS preview шкафа;
- quick actions;
- SectionMap;
- active section state;
- semantic structure карты секций;
- fallback active section;
- CanvasSlot bridge под будущий Three.js.

### 4. Правая панель

Готово:

- цена;
- статус проверки;
- параметры;
- материал;
- кромка;
- фурнитура;
- открывание;
- комплект;
- раскрываемая смета;
- compact behavior для laptop.

### 5. Checkout drawer

Готово:

- structured drawer;
- scroll body;
- sticky footer;
- close by overlay / close button / Escape;
- контакты;
- доставка;
- оплата после проверки;
- согласие;
- form validation;
- success-state;
- accessibility attributes.

### 6. Сохранение

Готово:

- localStorage project;
- projectId;
- metadata updatedAt;
- autosave;
- manual save;
- load;
- clear confirmation;
- localStorage availability check;
- in-memory fallback;
- legacy key cleanup.

### 7. Accessibility

Готово для pre-MVP:

- role dialog;
- aria-modal;
- close by Escape;
- role status;
- aria-invalid;
- aria-describedby;
- aria-pressed;
- role group;
- aria-label for quick actions.

Не сделано для production:

- focus trap внутри checkout;
- автоматический focus на первый input/error;
- инструментальная проверка axe/Lighthouse.

### 8. Three.js preparation

Готово:

- `buildViewerSceneProps(project)`;
- `sceneProps.three`;
- `sections.bounds`;
- `sections.slots`;
- `activeSection`;
- `material` contract;
- fallback CanvasSlot;
- документация `docs/threejs-viewer-contract.md`.

## Что осталось до честных 100%

### Обязательное перед фиксацией frontend

1. Выполнить:

```bash
npm run build
```

2. Выполнить:

```bash
npm run dev
```

3. Проверить страницу `/constructor`.

4. Сделать 5 скриншотов:

```txt
1. Общий экран
2. Шаг Размеры
3. Шаг Наполнение
4. Шаг Материалы
5. Checkout drawer
```

5. Пройти manual QA из:

```txt
docs/constructor-manual-qa-checklist.md
```

### Вероятные правки после проверки

1. Если SectionMap мелкий — убрать action-кнопки из карточек секций.
2. Если checkout длинный — объединить Контакты + Доставка или свернуть delivery.
3. Если viewer слишком маленький — убрать `scale(.92)` или настроить сцену точнее.
4. Если правая панель плотная — сделать полноценный accordion для параметров.
5. Если CSS начинает конфликтовать — перейти к CSS cleanup.

## Что не нужно делать сейчас

До нового build и визуальной проверки не нужно:

- добавлять новые UX-фичи;
- добавлять новые CSS-fix файлы;
- переписывать весь CSS;
- подключать реальный Three.js;
- трогать backend;
- делать авторизацию;
- делать мобильную версию.

## Технический долг

Главный долг — CSS-каскад.

Сейчас много polish/fix слоёв. Это допустимо для pre-MVP, но перед production нужно выполнить cleanup по документу:

```txt
docs/constructor-css-layer-map.md
```

## Финальное решение по текущему frontend

До следующего build статус:

```txt
Не добавлять крупные изменения.
Делать только документацию или микроправки accessibility.
После build — точечная визуальная полировка.
```

После успешного build и QA без критичных багов:

```txt
Frontend можно считать pre-MVP готовым.
Следующий этап — выбирать между Three.js viewer и backend-калькулятором.
```
