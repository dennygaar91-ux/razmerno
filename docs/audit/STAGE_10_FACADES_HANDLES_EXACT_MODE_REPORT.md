# Stage 10 — Facades, handles and exact mode

## Scope
Разделение простого фасадного режима и точной настройки зон, плюс явная логика ручек.

## Done
- Добавлен `data-facade-stage="STAGE10"` и shell class `rzm-3d-shell--stage10`.
- В обычном режиме фасады управляются на уровне секции: «Фасады включены» / «Открытая секция».
- В точной настройке доступен override фасада выбранной зоны: «Как у секции» / «Без фасада».
- Toggle точной настройки использует глобальный `setExactModeEnabled`, то есть включение действует на все шаги.
- Добавлен явный control ручек: «С ручками» / «Без ручек».
- Ручки отключаются, если секция открытая.
- `handleless` теперь передаётся в drawer и меняется из активного `Constructor3DPage`.
- Добавлен guard `npm run check:stage10-facades-handles-exact-mode`.
- Добавлены tests для zone facade exact mode в `constructorCanonicalState.test.ts`.

## Not done intentionally
- Не добавлял новые стили ручек/каталог ручек: это отдельный будущий UX/materials/hardware этап.
- Не менял hardware production formulas.
- Не делал deep facade manufacturing logic на уровне клиента.
