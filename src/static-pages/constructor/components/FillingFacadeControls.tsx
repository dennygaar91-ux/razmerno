import type { FillingStepActions, FillingStepDerivedState } from "./FillingStepTypes";

export function FillingFacadeControls({
  state,
  advancedFill,
  handleless,
  actions,
}: {
  state: FillingStepDerivedState;
  advancedFill: boolean;
  handleless: boolean;
  actions: Pick<
    FillingStepActions,
    | "onSetSectionFacadeMode"
    | "onSetZoneFacadeMode"
    | "onHandlelessChange"
    | "onAdvancedFillChange"
  >;
}) {
  const {
    activeSection,
    activeZoneId,
    activeZoneIndex,
    facadeMode,
    zoneFacadeMode,
    zoneFacadeLabel,
  } = state;

  return (
    <section
      className="rzm-3d-fill-section rzm-3d-facade-panel"
      aria-labelledby="rzm-q5-facade-title"
    >
      <header className="rzm-3d-fill-section-header">
        <div>
          <span>Фасады</span>
          <h2 id="rzm-q5-facade-title">
            {facadeMode === "hinged" ? "Секция закрыта фасадами" : "Секция открытая"}
          </h2>
        </div>
      </header>
      <div className="rzm-3d-facade-buttons" aria-label="Фасады секции">
        <button
          type="button"
          className={facadeMode === "hinged" ? "is-active" : ""}
          onClick={() => actions.onSetSectionFacadeMode(activeSection, "hinged")}
        >
          Фасады включены
        </button>
        <button
          type="button"
          className={facadeMode === "open" ? "is-active" : ""}
          onClick={() => actions.onSetSectionFacadeMode(activeSection, "open")}
        >
          Открытая секция
        </button>
      </div>
      <div className="rzm-3d-handle-control" aria-label="Ручки фасадов">
        <div>
          <span>Ручки</span>
          <strong>{handleless ? "Без ручек" : "С ручками"}</strong>
          <small>Фурнитура выбирается автоматически по правилам.</small>
        </div>
        <div className="rzm-3d-facade-buttons" aria-label="Режим ручек">
          <button
            type="button"
            className={!handleless ? "is-active" : ""}
            disabled={facadeMode === "open"}
            onClick={() => actions.onHandlelessChange(false)}
          >
            С ручками
          </button>
          <button
            type="button"
            className={handleless ? "is-active" : ""}
            disabled={facadeMode === "open"}
            onClick={() => actions.onHandlelessChange(true)}
          >
            Без ручек
          </button>
        </div>
        {facadeMode === "open" ? (
          <p className="rzm-3d-fill-hint">Ручки появятся после включения фасадов секции.</p>
        ) : null}
      </div>
      <label className="rzm-3d-advanced-toggle rzm-3d-advanced-toggle--q5">
        <input
          type="checkbox"
          checked={advancedFill}
          onChange={(event) => actions.onAdvancedFillChange(event.target.checked)}
        />
        <span>Точная настройка зон</span>
      </label>
      {advancedFill && activeZoneId ? (
        <div className="rzm-3d-zone-facade-override">
          <div>
            <span>Фасад зоны {activeZoneIndex + 1}</span>
            <strong>{zoneFacadeLabel}</strong>
          </div>
          <div className="rzm-3d-facade-buttons" aria-label="Фасад выбранной зоны">
            <button
              type="button"
              className={zoneFacadeMode === "inherit" ? "is-active" : ""}
              onClick={() => actions.onSetZoneFacadeMode(activeSection, activeZoneId, "inherit")}
            >
              Как у секции
            </button>
            <button
              type="button"
              className={zoneFacadeMode === "open" ? "is-active" : ""}
              onClick={() => actions.onSetZoneFacadeMode(activeSection, activeZoneId, "open")}
            >
              Без фасада
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
