# Размерно — CSS inventory script v25

## Что сделано

Продолжен приоритет 3: добавлен безопасный CSS inventory/audit script без автоматического удаления CSS.

## Новый файл

- `scripts/css-inventory.mjs`

## Новый npm script

```bash
npm run report:css-inventory
```

## Что делает script

Script анализирует CSS-файлы:

- `src/styles/base.css`
- `src/styles/header.css`
- `src/index.css`
- `src/styles/info-pages.css`
- `src/styles/constructor.css`

И формирует отчёт:

- размер каждого CSS-файла;
- количество строк;
- количество найденных `.rzm-*` классов;
- список потенциальных legacy-селекторов;
- общий размер CSS.

## Выходной отчёт

Script создаёт файл:

- `docs/audit/css-inventory-report.md`

## Важное ограничение

Script ничего не удаляет. Он только создаёт отчёт. Потенциальные legacy-селекторы требуют ручной проверки, потому что static HTML strings и dynamic class names могут давать false positives.

## Что не трогалось

- CSS значения;
- CSS селекторы;
- React-компоненты;
- backend/API;
- pricing engine;
- order flow;
- production preview;
- Zustand-store logic.

## Следующий этап

На основе `css-inventory-report.md` можно вручную разобрать кандидатов в legacy и удалить только подтверждённые, но не массово.
