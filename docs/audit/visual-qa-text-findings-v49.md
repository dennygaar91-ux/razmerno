# Размерно — visual QA text findings v49

## Что сделано

Разобран первый безопасный блок visual QA: suspicious text findings.

## Изменение

Обновлён script:

- `scripts/visual-qa-inventory.mjs`

## Что изменено в логике отчёта

Раньше `placeholder` и часть слова `отзывчивым` попадали в suspicious text findings, что создавало false positives.

Теперь:

- `placeholder` больше не считается подозрительным сам по себе;
- form placeholder findings вынесены в отдельный раздел;
- `отзывчивым` больше не ловится как `отзыв`;
- suspicious text остался только для реальных маркеров риска:
  - `Unsplash`
  - `Lorem`
  - `TODO`
  - `FIXME`
  - `fake`
  - `placeholder image`
  - `placeholder text`
  - `Отзывы`
  - `Кейсы`
  - `фейк`

## Новый результат

```text
Visual QA inventory complete
TSX files scanned: 110
CSS files scanned: 5
Inline style findings: 20
Raw color findings: 165
Suspicious text findings: 0
```

## Что не трогалось

- runtime UI texts;
- placeholders;
- CSS values;
- React visual components;
- backend/API;
- pricing engine;
- order flow;
- production preview adapter;
- Zustand-store implementation.

## Почему не менялись placeholders

Большинство найденных `placeholder` — нормальные поля форм:

- имя;
- телефон;
- email;
- адрес доставки;
- комментарии.

Их нельзя удалять автоматически, потому что они улучшают UX формы. Поэтому они вынесены в отдельный раздел отчёта для ручной проверки.

## QA

Пройдены проверки:

- `npm run report:visual-qa`
- `npm run release:check`

## Следующий этап

Разобрать следующий безопасный блок visual QA: inline style findings. Нужно отделить нормальные inline CSS variables от нежелательных точечных inline styles.
