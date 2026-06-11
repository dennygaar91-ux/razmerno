import type { FillingStepActions, FillingStepDerivedState } from "./FillingStepTypes";

export function FillingAddMenu({
  state,
  advancedFill,
  actions,
}: {
  state: FillingStepDerivedState;
  advancedFill: boolean;
  actions: Pick<
    FillingStepActions,
    | "onAddShelfToCompartment"
    | "onSetCompartmentFilling"
    | "onSetSectionFacadeMode"
    | "onSetZoneFacadeMode"
    | "onCloseAddMenu"
  >;
}) {
  const {
    activeSection,
    activeZone,
    activeZoneId,
    activeFilling,
    facadeMode,
    showAddMenu,
  } = state;

  if (!activeZoneId) return null;

  return (
    <section
      className="rzm-3d-fill-section rzm-3d-fill-actions"
      aria-labelledby="rzm-q5-zone-actions-title"
    >
      <header className="rzm-3d-fill-section-header">
        <div>
          <span>Действия</span>
          <h2 id="rzm-q5-zone-actions-title">Добавить в выбранную зону</h2>
        </div>
        <small>{showAddMenu ? "+ открыт" : "+ на модели"}</small>
      </header>

      {showAddMenu ? (
        <div
          className="rzm-3d-add-menu rzm-3d-add-menu--q5"
          role="menu"
          aria-label="Добавить в выбранную зону"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              actions.onAddShelfToCompartment(
                activeSection,
                activeZoneId,
                Math.min(
                  900,
                  Math.max(250, Math.floor((activeZone?.heightMm ?? 900) / 2)),
                ),
              );
              actions.onCloseAddMenu();
            }}
          >
            <strong>Полка</strong>
            <small>Разделит зону на две</small>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              actions.onSetCompartmentFilling(activeSection, activeZoneId, {
                drawersCount: Math.min(6, activeFilling.drawersCount + 1),
              });
              actions.onCloseAddMenu();
            }}
          >
            <strong>Ящик</strong>
            <small>{`Сейчас × ${activeFilling.drawersCount}`}</small>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              actions.onSetCompartmentFilling(activeSection, activeZoneId, {
                rodsCount: Math.min(2, activeFilling.rodsCount + 1),
              });
              actions.onCloseAddMenu();
            }}
          >
            <strong>Штанга</strong>
            <small>{`Сейчас × ${activeFilling.rodsCount}`}</small>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              actions.onSetSectionFacadeMode(
                activeSection,
                facadeMode === "hinged" ? "open" : "hinged",
              );
              actions.onCloseAddMenu();
            }}
          >
            <strong>Фасад</strong>
            <small>
              {facadeMode === "hinged" ? "Открыть секцию" : "Закрыть фасадами"}
            </small>
          </button>
          <button
            type="button"
            role="menuitem"
            className="rzm-3d-add-menu-clear"
            onClick={() => {
              actions.onSetCompartmentFilling(activeSection, activeZoneId, {
                shelvesCount: 0,
                drawersCount: 0,
                rodsCount: 0,
              });
              if (advancedFill) {
                actions.onSetZoneFacadeMode(activeSection, activeZoneId, "inherit");
              }
              actions.onCloseAddMenu();
            }}
          >
            <strong>Очистить</strong>
            <small>Убрать наполнение зоны</small>
          </button>
        </div>
      ) : (
        <div className="rzm-3d-fill-hint" role="note">
          Нажмите + на выбранной зоне в 3D или используйте список зон ниже.
        </div>
      )}
    </section>
  );
}
