# Stage 09 — Fill step 3D-first logic

## Scope
Пересборка шага «Наполнение» вокруг выбранной 3D-зоны без перехода к материалам/checkout.

## Done
- Добавлен `data-fill-stage="STAGE09"` и shell class `rzm-3d-shell--stage09`.
- Шаг «Наполнение» строится от выбранной секции/зоны, а не от глобальных counters.
- Клик по 3D target вызывает `selectZone(sectionId, compartmentId)`.
- `+` на выбранной зоне открывает локальное add-menu, а не добавляет элемент сразу.
- Локальное меню поддерживает: полка, ящик, штанга, фасад, очистить зону.
- Полка добавляется через `addShelfToCompartment(...)` и делит выбранную зону.
- Ящики/штанга добавляются только в выбранную зону через `setCompartmentFilling(...)`.
- Список элементов зоны поддерживает удаление конкретных полок/ящиков/штанги.
- `Random preset` применяет реальный preset к выбранной секции, а не является заглушкой.
- Добавлен guard `npm run check:stage09-fill-3d-first`.

## Not done intentionally
- Не делал визуальный финальный polish сцены.
- Не переводил весь internal `compartment` naming в `zone` из-за риска сломать geometry/validation/tests.
- Не трогал pricing/order flow.
