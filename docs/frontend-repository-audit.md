# Frontend repository audit — Размерно constructor

Дата: текущий технический аудит после UX/UI-полировки конструктора.

## Итоговая оценка

Frontend конструктора находится в рабочем pre-MVP состоянии, но перед финальным merge/deploy нужна ручная проверка в браузере. Главные риски сейчас не в бизнес-логике, а в визуальной плотности и накопленном CSS-каскаде.

## Что выглядит хорошо

### 1. Основной сценарий

Сценарий собран целиком:

1. размеры;
2. наполнение;
3. материалы и фурнитура;
4. правая панель стоимости;
5. сохранение;
6. checkout drawer;
7. success-state заявки.

### 2. Data shape

Каталог стал ближе к будущей production-структуре:

- MATERIALS;
- EDGE_OPTIONS;
- HANDLE_OPTIONS;
- HARDWARE_OPTIONS;
- DEFAULT_PROJECT.

Нормализация проекта подтягивает отсутствующие поля и снижает риск падения после загрузки старого localStorage.

### 3. Payload

`constructorPayload.js` уже передаёт материал, кромку, открывание, фурнитуру, estimate, production и delivery/payment данные из checkout.

### 4. Three.js preparation

`CanvasSlot` уже работает как bridge: если передан `renderCanvas`, он отдаёт сцену будущему Canvas; если нет — остаётся CSS fallback.

### 5. Storage

`constructorStorage.js` усилен:

- localStorage availability check;
- in-memory fallback;
- projectId;
- metadata;
- legacy cleanup.

## Главные риски

### Риск 1. CSS-каскад

Сейчас `ConstructorSummaryProduct.css` импортирует много polish/fix файлов. Это допустимо для быстрой итерации, но долгосрочно плохо поддерживается.

Текущая модель:

```txt
ConstructorConfigPolish.css
ConstructorViewerPolish.css
ConstructorCheckoutPolish.css
ConstructorDesktopPass.css
ConstructorMaterialsPolish.css
ConstructorProjectSafety.css
ConstructorStatusPolish.css
ConstructorScreenshotFixes.css
ConstructorSectionMapFix.css
ConstructorFinalCompactFix.css
```

Риск: одно изменение в нижнем import может неожиданно перекрыть стили выше.

Рекомендация после визуальной проверки: разнести стили по компонентам и оставить один `ConstructorAdaptive.css` для breakpoint-логики.

### Риск 2. Плотность на 1366×768

На маленьком laptop могут быть плотными:

- правая панель;
- карта секций;
- checkout drawer;
- шаг материалов.

Часть текстов уже скрывается через media queries, но это нужно проверить глазами.

### Риск 3. Quick actions в SectionMap

В карточках секций есть быстрые сценарии. Это удобно, но может быть слишком мелко при 5–6 секциях.

Рекомендация: если на скриншоте мелко — убрать action-кнопки из карточек и оставить только верхний сценарий + левую панель.

### Риск 4. Checkout длина

Checkout содержит 4 шага. Сейчас body scrollable, footer sticky. Но на 1366×768 может восприниматься как тяжёлый.

Рекомендация: если длинно — объединить Контакты + Доставка или сделать delivery collapsed.

### Риск 5. activeSection fallback

`ConstructorViewer` теперь защищён от отсутствующей активной секции через `EMPTY_SECTION`. Это снижает риск runtime error при старом/битом проекте.

### Риск 6. Нет фактического build-run в браузере

Без `npm run build` и `npm run dev` нельзя честно утверждать 100%. Нужно проверить локально.

## Что исправлено в ходе аудита

1. Усилен `constructorStorage.js`.
2. Добавлен `docs/threejs-viewer-contract.md`.
3. Исправлена семантика `SectionMap`.
4. Добавлен `StatusBadge.jsx`.
5. Добавлены стили под новую структуру `SectionMap`.
6. Защищён `ConstructorConfig` от пустых props.
7. Правая панель стала показывать кромку и фурнитуру.
8. Добавлены compact-fixes для checkout и summary.
9. Защищён `ConstructorViewer` от отсутствующей activeSection.

## Что проверить вручную

### Build

```bash
npm install
npm run build
```

### Dev

```bash
npm run dev
```

### Браузерные сценарии

1. Открыть конструктор.
2. Изменить высоту, ширину, глубину.
3. Изменить количество секций: 1, 2, 3, 4, 5, 6.
4. Выбрать каждую секцию.
5. Применить сценарии: одежда, полки, ящики.
6. Использовать quick actions.
7. Перейти в материалы.
8. Выбрать материал, кромку, открывание, фурнитуру.
9. Проверить правую панель.
10. Раскрыть смету.
11. Сохранить проект.
12. Обновить страницу.
13. Загрузить проект.
14. Нажать Очистить и отменить.
15. Очистить реально.
16. Открыть checkout.
17. Отправить пустую форму.
18. Заполнить форму.
19. Создать заявку.
20. Проверить success-state.

### Разрешения

Проверить минимум:

- 1536×1024;
- 1536×864;
- 1440×900;
- 1366×768.

## Оставить

- CanvasSlot bridge;
- Three.js contract doc;
- StatusBadge;
- constructorStorage fallback;
- normalizeConstructorProject;
- SectionMap semantic structure;
- Summary with edge/hardware;
- checkout structured flow;
- autosave + clear confirmation.

## Исправлять только после скриншотов

- плотность правой панели;
- мелкие кнопки сценариев в SectionMap;
- длину checkout;
- визуальную временность CSS wardrobe mockup;
- разнос CSS по компонентам.

## Откатывать сейчас

Ничего не откатывать до визуальной проверки. Явных разрушительных изменений в коде не выявлено.
