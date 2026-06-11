# CSS Migration Plan — Размерно

Дата: 2026-06-11

## Цель

Подготовить CSS-слой к долгосрочной разработке без изменения текущего внешнего вида.

## Запрещено на первом шаге

- Удалять большие блоки CSS без visual QA.
- Делать автоматический purge.
- Переименовывать классы массово.
- Смешивать active 3D styles и legacy constructor styles.
- Менять порядок runtime imports без проверки.

## Целевая структура

```text
src/styles/
  index.css
  constructor3d.css                 # temporary barrel/import entry
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
    constructor.css                 # only after legacy quarantine is complete
```

## Этапы миграции

### Этап CSS-1. Инвентаризация

Статус: выполнено.

Результаты:

- создан `docs/css-class-inventory.json`;
- создан `docs/css-architecture-audit.md`;
- создан `docs/css-migration-plan.md`;
- добавлен guard `npm run check:css-architecture`.

### Этап CSS-2. Visual baseline

Перед любым split нужно получить screenshots:

- `/constructor` — Размеры;
- `/constructor` — Наполнение с выбранной зоной;
- `/constructor` — Материалы;
- `/constructor` — Заявка;
- 2D fallback;
- reset dialog;
- validation warning/error.

### Этап CSS-3. Split without deletion

Разделить `constructor3d.css` на feature files, но не удалять selectors.

Порядок:

1. shell/layout;
2. scene/viewport;
3. drawer/footer;
4. step panels;
5. validation/accessibility;
6. materials/checkout.

### Этап CSS-4. Legacy quarantine

После миграции tests с `src/configurator/**`:

1. проверить active imports `constructor.css`;
2. перенести legacy-only styles в `src/styles/legacy/constructor.css`;
3. удалить dead selectors только после visual QA.

### Этап CSS-5. Token consolidation

После split:

- вынести повторяющиеся размеры/радиусы/цвета;
- проверить `rzm-ui-*` primitives;
- убрать stage-specific modifiers, которые больше не несут смысла.

## Guard rules

`npm run check:css-architecture` должен:

- генерировать `docs/css-class-inventory.json`;
- проверять наличие CSS-документации;
- не допускать неконтролируемый рост CSS-монолитов сверх текущих guard limits.

## Риски

| Риск | Степень | Комментарий |
|---|---|---|
| Автоматический purge сломает внешний вид | Высокая | Dynamic classes и legacy routes |
| Split поменяет cascade order | Средняя | Нужно сохранять порядок импортов |
| Удаление `constructor.css` сломает legacy tests | Высокая | Сначала test migration |
| Stage-specific классы могут быть ещё нужны | Средняя | Проверять visual smoke |

## Решение

Следующий CSS-шаг — только visual baseline и split без удаления. Purge разрешён только после подтверждения, что selector не используется runtime, tests, docs, snapshots и legacy routes.

## Status update — CSS split completed

`constructor3d.css` has been converted into an import entrypoint and split into ordered modules under `src/styles/constructor3d/`. The split preserves rule order and does not remove selectors. The next phase is visual baseline plus selective cleanup, not automatic purge.
