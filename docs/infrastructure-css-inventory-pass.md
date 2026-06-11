# Infrastructure CSS Inventory Pass

Дата: 2026-06-11

## Цель

Продолжить инфраструктурную подготовку проекта после декомпозиции runtime-монолитов. Этот pass сфокусирован на CSS-слое: инвентаризация, документация, guard и безопасный план миграции без изменения внешнего вида.

## Важно

В рамках этого pass не выполнялись:

- CSS purge;
- удаление selectors;
- переименование классов;
- изменение import order;
- изменение UX/дизайна;
- изменение runtime-кода конструктора;
- изменение business logic/pricing/checkout/Three.js.

## Что создано

### 1. CSS inventory script

Добавлен файл:

```text
scripts/check-css-architecture.mjs
```

Скрипт:

- анализирует `src/styles/constructor.css`;
- анализирует `src/styles/constructor3d.css`;
- анализирует `src/index.css`;
- считает строки и CSS-классы;
- ищет потенциально неиспользуемые selectors;
- генерирует `docs/css-class-inventory.json`;
- проверяет наличие обязательных CSS-документов;
- ставит guard limits, чтобы CSS-монолиты не росли бесконтрольно.

### 2. Package script

Добавлен script:

```bash
npm run check:css-architecture
```

### 3. CSS class inventory

Создан машинный отчёт:

```text
docs/css-class-inventory.json
```

Текущая сводка:

| Файл | Строк | Классов | Потенциально неиспользуемых |
|---|---:|---:|---:|
| `src/styles/constructor.css` | 10805 | 762 | 147 |
| `src/styles/constructor3d.css` | 3983 | 205 | 39 |
| `src/index.css` | 843 | 86 | 13 |

### 4. CSS architecture audit

Создан документ:

```text
docs/css-architecture-audit.md
```

Документ фиксирует:

- роль каждого CSS-файла;
- риски каждого CSS-монолита;
- почему нельзя делать автоматический purge;
- какие classes являются candidates, а не delete-list;
- правила безопасной CSS-работы дальше.

### 5. CSS migration plan

Создан документ:

```text
docs/css-migration-plan.md
```

Документ фиксирует целевую структуру:

```text
src/styles/
  index.css
  constructor3d.css
  constructor3d/
    shell.css
    scene.css
    drawer.css
    steps.css
    validation.css
    materials.css
    checkout.css
    accessibility.css
  legacy/
    constructor.css
```

## Почему CSS не был очищен сейчас

CSS-подсистема остаётся самым опасным слоем для автоматического изменения без visual QA. Причины:

1. selectors могут использоваться динамически;
2. часть CSS относится к legacy routes;
3. stage-specific classes могут быть нужны guard-тестам;
4. cascade order может измениться при split;
5. нет visual regression baseline.

Поэтому текущий pass — это подготовка, а не purge.

## Проверки

Успешно прошли:

```bash
npm install --no-audit --no-fund
npm run check:css-architecture
npm run typecheck
npm run build
npm run qa:static
npm run validate:config
npm run test:constructor-store
npm run test:constructor-three
npm run test:pricing-final
```

## Следующий безопасный шаг

Следующий CSS-шаг должен быть:

1. получить visual baseline screenshots;
2. разделить `constructor3d.css` на feature CSS-файлы без удаления selectors;
3. сохранить import order;
4. только после этого постепенно удалять confirmed-dead selectors.

## Остаточный риск

| Риск | Степень | Комментарий |
|---|---|---|
| `constructor.css` остаётся legacy-монолитом | Высокая | Удалять только после legacy migration |
| `constructor3d.css` остаётся активным монолитом | Средняя | Нужен split без deletion |
| `index.css` содержит global/shared styles | Средняя | Нужен отдельный global audit |
| CSS purge без visual QA | Высокая | Запрещён |
