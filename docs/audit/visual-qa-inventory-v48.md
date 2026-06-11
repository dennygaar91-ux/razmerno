# Размерно — visual QA inventory v48

## Что сделано

Начат этап visual QA/design fixes: добавлен безопасный inventory-script, который фиксирует потенциальные визуальные риски без автоматического изменения кода.

## Новый файл

- `scripts/visual-qa-inventory.mjs`

## Новый npm script

```bash
npm run report:visual-qa
```

## Новый отчёт

- `docs/audit/visual-qa-inventory-report.md`

## Что анализирует script

- TSX-файлы;
- CSS-файлы;
- использование ключевых классов дизайн-системы;
- CTA usage;
- header/footer ownership;
- inline styles;
- raw color values;
- подозрительные тексты вроде placeholder/TODO/fake/Отзывы/Кейсы.

## Текущий результат

```text
Visual QA inventory complete
TSX files scanned: 110
CSS files scanned: 5
Inline style findings: 20
Raw color findings: 165
Suspicious text findings: 18
```

## Важное ограничение

Script ничего не меняет. Это не cleanup, а карта для ручной визуальной проверки и точечных правок.

## Что не трогалось

- CSS values;
- React visual components;
- backend/API;
- pricing engine;
- order flow;
- production preview adapter;
- Zustand-store implementation.

## QA

Пройдены проверки:

- `npm run report:visual-qa`
- `npm run release:check`

## Следующий этап

Разобрать `visual-qa-inventory-report.md` и начать с самого безопасного: убрать/заменить suspicious text findings, если они относятся к runtime UI, а не к test/docs.
