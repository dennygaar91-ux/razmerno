# Размерно — constructor React component v8

## Что сделано

Static HTML конструктора заменён на настоящий React-компонент `src/static-pages/ConstructorPage.tsx`.

## Главное изменение

До этого конструктор был HTML-строкой + DOM-query bridge. Теперь ключевые состояния конструктора живут в React state:

- активный шаг;
- тип мебели;
- размеры;
- наполнение;
- секции/отсеки;
- материал;
- ручки / без ручек;
- доставка;
- сборка;
- контактные поля;
- согласие на ПД;
- submit-состояние.

## Что сохранено

- Текущая дизайн-система и CSS-классы.
- Визуальная структура левой панели и правой сцены.
- Lazy pricing imports.
- Связка с `calculatePrice`.
- Связка с `calculateDeliveryQuote`.
- Связка с `calculateAssemblyQuote`.
- Отправка через `submitOrder`.
- Валидация через `validateCustomer`.

## Что улучшилось

- Убрана ручная работа с DOM для основных состояний.
- Убрана зависимость конструктора от `dangerouslySetInnerHTML`.
- `ConstructorPage` стал отдельным lazy chunk.
- Размер constructor chunk уменьшился примерно с 35.00 kB до 26.16 kB.
- Стало проще дальше подключать Zustand/store и реальные selectors.

## Что не сделано

- Остальные страницы пока остаются static HTML modules.
- CSS пока остаётся в общем `index.css`.
- Производственная модель и manufacturing layer ещё не подключены к новому UI.
- Настоящие 3D/Three.js сцена и geometry builder пока не включены в новый экран.

## Следующий этап

Разбить `ConstructorPage.tsx` на подкомпоненты:
- `ConstructorHeader`
- `ConstructorStepper`
- `SizesStep`
- `FillStep`
- `MaterialsStep`
- `CheckoutStep`
- `ConstructorScene`
- `useConstructorQuote`
- `useConstructorSubmit`

После этого будет безопаснее подключать Zustand/store.
