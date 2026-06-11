# Размерно — constructor Zustand state v11

## Что сделано

Состояние нового React-конструктора вынесено из `ConstructorPage.tsx` в отдельный Zustand-store:

`src/static-pages/constructor/store/constructorStore.ts`

## Что перенесено в store

- активный шаг конструктора;
- тип мебели;
- ширина, высота, глубина;
- выбранное наполнение;
- количество секций;
- количество отсеков;
- ручки / без ручек;
- материал;
- расширенные настройки размеров;
- расширенные настройки наполнения;
- доставка;
- сборка;
- адрес доставки;
- контактные поля;
- согласие на обработку ПД.

## Что изменилось

- `ConstructorPage.tsx` больше не хранит основные constructor values в локальных `useState`.
- `ConstructorPage.tsx` читает значения через `useConstructorStore`.
- Все основные setters теперь приходят из store.
- Добавлен тест store:

`src/static-pages/constructor/store/constructorStore.test.ts`

- Добавлен npm script:

`npm run test:constructor-store`

## Что проверяет тест

- размеры clamp-ятся до 0;
- секции и отсеки clamp-ятся до 1;
- `reset()` возвращает начальное состояние.

## Что не трогалось

- backend/API;
- pricing engine;
- delivery engine;
- order flow;
- admin;
- production/geometry/manufacturing logic;
- визуальные CSS-классы.

## Следующий этап

Сформировать адаптер `constructorStore -> production/config payload`, чтобы один источник состояния мог использоваться для:

- расчёта;
- order payload;
- production JSON;
- autosave;
- будущей 3D/geometry сцены.
