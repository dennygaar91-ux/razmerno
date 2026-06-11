# CSS Architecture Audit — Размерно

Дата: 2026-06-11

## Назначение

Документ фиксирует текущее состояние CSS-слоя проекта после инфраструктурных passes. Это не visual redesign и не CSS purge. Цель — снизить риск дальнейшей работы больших LLM-моделей с растущей кодовой базой: понять, какие CSS-файлы являются активными, какие legacy, какие классы потенциально не используются, и какие миграции допустимы без изменения внешнего вида.

## Проверенные файлы

| Файл | Строк | Классов | Потенциально неиспользуемых классов | Роль |
|---|---:|---:|---:|---|
| `src/styles/constructor.css` | 10805 | 762 | 147 | legacy/main constructor CSS monolith |
| `src/styles/constructor3d.css` | 3983 | 205 | 41 | active 3D constructor CSS with staged layers |
| `src/index.css` | 843 | 86 | 13 | global / landing / shared primitives |

Источник машинной инвентаризации: `docs/css-class-inventory.json`.

## Общий вывод

CSS-слой остаётся главным инфраструктурным риском после декомпозиции runtime-кода. `Constructor3DPage.tsx`, `constructorStore.ts`, `projectRules.ts` и `threeSceneAdapter.ts` уже приведены к модульной структуре, но CSS пока сохраняет старую накопленную модель: большие монолиты, stage-specific overrides, legacy selectors и потенциально мёртвые классы.

Удалять CSS сейчас напрямую нельзя: проект уже прошёл много визуальных этапов, и агрессивный purge без visual regression может сломать внешний вид конструктора, лендинга или legacy routes.

## Файл: `src/styles/constructor.css`

### Статус

Legacy/main constructor CSS monolith. Самый большой CSS-файл проекта.

### Риски

- 10805 строк — файл слишком большой для безопасной работы LLM в одном контексте.
- В файле смешаны старые UI-слои, constructor styles, blueprint/fallback styles, checkout styles и исторические selectors.
- 147 классов определены как потенциально неиспользуемые статическим анализом.
- Часть классов может использоваться динамически, поэтому автоматическое удаление запрещено.

### Рекомендация

Не удалять сразу. Перевести в режим quarantine:

1. Сначала определить, какие active routes ещё реально импортируют этот файл.
2. Составить subset классов, которые используются только legacy routes.
3. После удаления/migration `src/configurator/**` перенести файл в legacy CSS или удалить по частям.
4. Любой purge делать только после visual QA.

## Файл: `src/styles/constructor3d.css`

### Статус

Активный CSS текущего 3D-first конструктора.

### Риски

- 3983 строки — большой файл, но уже меньше legacy CSS.
- Внутри накоплены слои Stage/Q/N/Stage03–Stage17.
- Есть потенциально старые selectors вроде `rzm-3d-shell--q5`, `rzm-3d-stagebar--q3`, `rzm-q5-*`.
- Есть 41 потенциально неиспользуемый класс по статическому анализу.
- Файл содержит одновременно layout, scene, drawer, steps, materials, checkout, validation, a11y, fallback.

### Рекомендация

Делить не purge-first, а feature-first:

1. `constructor3d-shell.css` — page, header, stagebar, workspace layout.
2. `constructor3d-scene.css` — scene card, toolbar, viewport, 3D/2D fallback.
3. `constructor3d-drawer.css` — drawer, footer, panels.
4. `constructor3d-steps.css` — sizes, filling, materials, checkout.
5. `constructor3d-validation.css` — info/warning/error/auto-fix.
6. `constructor3d-a11y.css` — focus/disabled/live states if needed.

Разделение делать после visual QA и только с build/typecheck/qa-static.

## Файл: `src/index.css`

### Статус

Global/shared styles.

### Риски

- Меньше по размеру, но содержит общие primitives и landing/material visual classes.
- 13 потенциально неиспользуемых классов.
- Любое удаление может повлиять на landing/home pages.

### Рекомендация

Оставить до отдельного landing/global CSS audit. Не смешивать с constructor CSS cleanup.

## Потенциально неиспользуемые классы

Полный список находится в `docs/css-class-inventory.json`.

Важно: это candidates, а не delete-list. Причины ложных positives:

- динамическая сборка className;
- классы используются в markdown/docs/tests;
- классы используются через generated strings;
- классы нужны legacy routes;
- классы используются в HTML snapshots.

## Правила безопасной CSS-работы дальше

1. Не удалять CSS без visual QA.
2. Не делать массовый rename классов без codemod и тестов.
3. Не объединять active 3D CSS с legacy CSS.
4. Не трогать `constructor.css`, пока legacy routes/test-backed code не мигрированы.
5. Любой CSS split должен сохранять порядок импортов.
6. После каждого CSS pass прогонять:
   - `npm run typecheck`
   - `npm run build`
   - `npm run qa:static`
   - `npm run test:constructor-three`
   - ручной visual smoke.

## Следующее безопасное действие

Не purge. Сначала создать visual snapshots/скриншоты финальной сборки и только затем делить `constructor3d.css` на feature CSS-файлы без удаления selectors.
