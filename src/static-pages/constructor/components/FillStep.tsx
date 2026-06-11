import type {
  ConstructorCompartmentFilling,
  ConstructorCompartmentLayout,
  ConstructorFillingLayout,
  ConstructorFacadeMode,
  ConstructorSection,
  ConstructorSectionFacadeLayout,
  ConstructorValidationIssue,
  ConstructorValidationState,
  FillKey,
} from "../types";
import { MiniControl } from "./shared";

function formatFillingSummary(filling?: ConstructorCompartmentFilling) {
  if (!filling) return "пусто";

  const parts = [
    filling.shelvesCount ? `полки ${filling.shelvesCount}` : "",
    filling.drawersCount ? `ящики ${filling.drawersCount}` : "",
    filling.rodsCount ? `штанга ${filling.rodsCount}` : "",
  ].filter(Boolean);

  return parts.length ? parts.join(" · ") : "пусто";
}

function getIssueForTarget(
  issues: ConstructorValidationIssue[],
  targetId?: string,
) {
  if (!targetId) return null;
  return issues.find((issue) => issue.targetId === targetId) ?? null;
}

function getSectionFillingSummary(
  sectionId: string,
  compartmentLayout: ConstructorCompartmentLayout,
  fillingLayout: ConstructorFillingLayout,
) {
  const compartments = compartmentLayout[sectionId] ?? [];
  const totals = compartments.reduce(
    (acc, compartment) => {
      const filling = fillingLayout[sectionId]?.[compartment.id];
      acc.shelves += filling?.shelvesCount ?? 0;
      acc.drawers += filling?.drawersCount ?? 0;
      acc.rods += filling?.rodsCount ?? 0;
      return acc;
    },
    { shelves: 0, drawers: 0, rods: 0 },
  );

  const parts = [
    totals.shelves ? `полки ${totals.shelves}` : "",
    totals.drawers ? `ящики ${totals.drawers}` : "",
    totals.rods ? `штанга ${totals.rods}` : "",
  ].filter(Boolean);

  return parts.length ? parts.join(" · ") : "пока пусто";
}

export function FillStep({
  sectionLayout,
  selectedSectionId,
  compartmentLayout,
  fillingLayout,
  facadeLayout,
  selectedCompartmentId,
  compartments,
  advancedFill,
  activeCompartmentFilling,
  validation,
  focusedValidationIssue,
  handleless,
  onFillChange,
  onCompartmentsChange,
  onCompartmentHeightChange,
  onEqualizeCompartments,
  onSelectSection,
  onSelectCompartment,
  onCompartmentFillingChange,
  onSectionFacadeModeChange,
  onAllSectionFacadeModeChange,
  onHandlelessChange,
}: {
  sections: number;
  sectionLayout: ConstructorSection[];
  selectedSectionId: string | null;
  compartmentLayout: ConstructorCompartmentLayout;
  fillingLayout: ConstructorFillingLayout;
  facadeLayout: ConstructorSectionFacadeLayout;
  selectedCompartmentId: string | null;
  compartments: number;
  advancedFill: boolean;
  activeCompartmentFilling: ConstructorCompartmentFilling;
  validation: ConstructorValidationState;
  focusedValidationIssue: ConstructorValidationIssue | null;
  handleless: boolean;
  onFillChange: (value: FillKey) => void;
  onCompartmentsChange: (value: number) => void;
  onCompartmentHeightChange: (
    sectionId: string,
    compartmentId: string,
    heightMm: number,
  ) => void;
  onEqualizeCompartments: (sectionId?: string) => void;
  onSelectSection: (sectionId: string) => void;
  onSelectCompartment: (sectionId: string, compartmentId: string) => void;
  onCompartmentFillingChange: (
    sectionId: string,
    compartmentId: string,
    patch: Partial<ConstructorCompartmentFilling>,
  ) => void;
  onSectionFacadeModeChange: (sectionId: string, mode: ConstructorFacadeMode) => void;
  onAllSectionFacadeModeChange: (mode: ConstructorFacadeMode) => void;
  onHandlelessChange: (value: boolean) => void;
}) {
  const activeSectionId = selectedSectionId ?? sectionLayout[0]?.id ?? null;
  const activeSectionIndex = Math.max(
    0,
    sectionLayout.findIndex((section) => section.id === activeSectionId),
  );
  const activeCompartments = activeSectionId
    ? (compartmentLayout[activeSectionId] ?? [])
    : [];
  const targetCompartmentId =
    selectedCompartmentId ?? activeCompartments[0]?.id ?? null;
  const activeCompartmentIndex = Math.max(
    0,
    activeCompartments.findIndex(
      (compartment) => compartment.id === targetCompartmentId,
    ),
  );
  const targetFilling =
    activeSectionId && targetCompartmentId
      ? (fillingLayout[activeSectionId]?.[targetCompartmentId] ??
        activeCompartmentFilling)
      : activeCompartmentFilling;

  const activeShelvesCount = targetFilling.shelvesCount;
  const activeDrawersCount = targetFilling.drawersCount;
  const activeRodsCount = targetFilling.rodsCount;
  const fillIssues = validation.issues.filter((issue) => issue.stepId === "fill");
  const focusedTargetId = focusedValidationIssue?.targetId;

  function updateActiveFilling(patch: Partial<ConstructorCompartmentFilling>) {
    if (!activeSectionId || !targetCompartmentId) return;
    if (targetCompartmentId !== selectedCompartmentId) {
      onSelectCompartment(activeSectionId, targetCompartmentId);
    }
    onCompartmentFillingChange(activeSectionId, targetCompartmentId, patch);
  }

  function updateShelves(value: number) {
    const nextValue = Math.max(0, value);
    updateActiveFilling({ shelvesCount: nextValue });
    if (value > activeShelvesCount) onFillChange("shelves");
  }

  function updateDrawers(value: number) {
    const nextValue = Math.max(0, value);
    updateActiveFilling({ drawersCount: nextValue });
    if (value > activeDrawersCount) onFillChange("drawers");
  }

  function updateRods(value: number) {
    const nextValue = Math.max(0, value);
    updateActiveFilling({ rodsCount: nextValue });
    if (value > activeRodsCount) onFillChange("rod");
  }

  return (
    <div className="rzm-constructor-step-panel is-active">
      <section className="rzm-constructor-card rzm-step-card--single rzm-step-card--quiet rzm-fill-step-card">
        <header className="rzm-fill-step-head rzm-step-mode-head--compact">
          <h2 className="rzm-constructor-card-title">Наполнение</h2>
        </header>

        <div className={`rzm-fill-target-card ${focusedValidationIssue?.stepId === "fill" ? `has-${focusedValidationIssue.severity}` : ""}`} aria-label="Выбранная область">
          <div className="rzm-fill-target-head">
            <span>Выбрано</span>
            <strong>
              Секция {activeSectionIndex + 1} · Отсек {activeCompartmentIndex + 1}
            </strong>
          </div>
          <p>{formatFillingSummary(targetFilling)}</p>
        </div>


        <div className="rzm-fill-target-picker" aria-label="Выбор секции и отсека">
          <div className="rzm-fill-picker-block">
            <span className="rzm-fill-picker-label">Секция</span>
            <div className="rzm-fill-section-list">
              {sectionLayout.map((section, index) => {
                const isActive = section.id === activeSectionId;
                const issue = getIssueForTarget(fillIssues, section.id);
                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`rzm-fill-section-card ${isActive ? "is-active" : ""} ${issue ? `has-${issue.severity}` : ""} ${focusedTargetId === section.id ? "is-focused" : ""}`}
                    onClick={() => onSelectSection(section.id)}
                  >
                    <strong>Секция {index + 1}</strong>
                    <span>{getSectionFillingSummary(section.id, compartmentLayout, fillingLayout)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rzm-fill-picker-block">
            <span className="rzm-fill-picker-label">Отсек</span>
            <div className="rzm-fill-compartment-chips">
              {activeCompartments.map((compartment, index) => {
                const filling = activeSectionId
                  ? fillingLayout[activeSectionId]?.[compartment.id]
                  : undefined;
                const isActive = compartment.id === targetCompartmentId;
                const issue = getIssueForTarget(fillIssues, compartment.id);
                return (
                  <button
                    key={compartment.id}
                    type="button"
                    className={`rzm-fill-compartment-chip ${isActive ? "is-active" : ""} ${issue ? `has-${issue.severity}` : ""} ${focusedTargetId === compartment.id ? "is-focused" : ""}`}
                    onClick={() =>
                      activeSectionId &&
                      onSelectCompartment(activeSectionId, compartment.id)
                    }
                  >
                    <strong>Отсек {index + 1}</strong>
                    <span>{formatFillingSummary(filling)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rzm-fill-action-card" aria-label="Быстрое наполнение">
          <div className="rzm-fill-action-head">
            <strong>Наполнение</strong>
          </div>
          <div className="rzm-fill-counter-list">
            <MiniControl
              label="Полки"
              value={activeShelvesCount}
              onMinus={() => updateShelves(activeShelvesCount - 1)}
              onPlus={() => updateShelves(activeShelvesCount + 1)}
            />
            <MiniControl
              label="Ящики"
              value={activeDrawersCount}
              onMinus={() => updateDrawers(activeDrawersCount - 1)}
              onPlus={() => updateDrawers(activeDrawersCount + 1)}
            />
            <MiniControl
              label="Штанга"
              value={activeRodsCount}
              onMinus={() => updateRods(activeRodsCount - 1)}
              onPlus={() => updateRods(activeRodsCount + 1)}
            />
          </div>
        </div>

        {advancedFill && (
          <div className="rzm-fill-structure-card" aria-label="Структура отсеков">
            <div className="rzm-fill-action-head">
              <strong>Отсеки по высоте</strong>
            </div>
            <MiniControl
              label="Отсеки"
              value={compartments}
              onMinus={() => onCompartmentsChange(Math.max(1, compartments - 1))}
              onPlus={() => onCompartmentsChange(Math.min(5, compartments + 1))}
            />
          </div>
        )}


        <div className="rzm-facade-mode-card" aria-label="Фасады секций">
          <div className="rzm-facade-mode-head">
            <strong>Фасады</strong>
          </div>
          <div className="rzm-facade-mode-actions">
            <button
              type="button"
              className={`rzm-facade-mode-button ${sectionLayout.every((section) => facadeLayout[section.id] === "hinged") ? "is-active" : ""}`}
              onClick={() => onAllSectionFacadeModeChange("hinged")}
            >
              Распашные
            </button>
            <button
              type="button"
              className={`rzm-facade-mode-button ${sectionLayout.every((section) => facadeLayout[section.id] === "open") ? "is-active" : ""}`}
              onClick={() => onAllSectionFacadeModeChange("open")}
            >
              Открытые
            </button>
          </div>
        </div>

        {advancedFill && (
          <div className="rzm-compartment-editor rzm-precision-editor rzm-fill-precision-editor">
            <div className="rzm-compartment-editor-head">
              <div>
                <strong>Точная настройка секции</strong>
              </div>
              <button
                className="rzm-section-width-equalize"
                type="button"
                onClick={() => onEqualizeCompartments(activeSectionId ?? undefined)}
              >
                Выровнять
              </button>
            </div>

            <div className="rzm-precision-section-map" aria-label="Секции для точной настройки">
              {sectionLayout.map((section, index) => {
                const isActive = section.id === activeSectionId;
                const issue = getIssueForTarget(fillIssues, section.id);
                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`rzm-precision-section-card ${isActive ? "is-active" : ""} ${issue ? `has-${issue.severity}` : ""} ${focusedTargetId === section.id ? "is-focused" : ""}`}
                    onClick={() => onSelectSection(section.id)}
                  >
                    <strong>Секция {index + 1}</strong>
                    <span>{section.widthMm} мм</span>
                    <em>{getSectionFillingSummary(section.id, compartmentLayout, fillingLayout)}</em>
                  </button>
                );
              })}
            </div>

            {activeSectionId && (
              <div className="rzm-facade-section-row">
                <span>Фасад выбранной секции</span>
                <div className="rzm-facade-section-actions">
                  <button
                    type="button"
                    className={`rzm-facade-mode-button ${facadeLayout[activeSectionId] === "hinged" ? "is-active" : ""}`}
                    onClick={() => onSectionFacadeModeChange(activeSectionId, "hinged")}
                  >
                    Распашной
                  </button>
                  <button
                    type="button"
                    className={`rzm-facade-mode-button ${facadeLayout[activeSectionId] === "open" ? "is-active" : ""}`}
                    onClick={() => onSectionFacadeModeChange(activeSectionId, "open")}
                  >
                    Открытая
                  </button>
                </div>
              </div>
            )}

            <div className="rzm-compartment-height-list">
              {activeCompartments.map((compartment, index) => {
                const isActive = compartment.id === targetCompartmentId;
                const issue = getIssueForTarget(fillIssues, compartment.id);
                return (
                  <label
                    key={compartment.id}
                    className={`rzm-compartment-height-row ${isActive ? "is-active" : ""} ${issue ? `has-${issue.severity}` : ""} ${focusedTargetId === compartment.id ? "is-focused" : ""}`}
                    onFocus={() =>
                      activeSectionId &&
                      onSelectCompartment(activeSectionId, compartment.id)
                    }
                  >
                    <span className="rzm-section-width-index">
                      Отсек {index + 1}
                    </span>
                    <input
                      className="rzm-section-width-input"
                      value={compartment.heightMm}
                      inputMode="numeric"
                      onFocus={() =>
                        activeSectionId &&
                        onSelectCompartment(activeSectionId, compartment.id)
                      }
                      onChange={(event) =>
                        activeSectionId &&
                        onCompartmentHeightChange(
                          activeSectionId,
                          compartment.id,
                          Number(event.target.value || 0),
                        )
                      }
                    />
                    <span className="rzm-section-width-unit">мм</span>
                    <span className="rzm-compartment-filling-chip">
                      {formatFillingSummary(
                        activeSectionId
                          ? fillingLayout[activeSectionId]?.[compartment.id]
                          : undefined,
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <label className="rzm-handle-toggle-row">
          <span>
            <strong>Ручки</strong>
            <small>
              {handleless ? "без ручек / push-to-open" : "ручки включены"}
            </small>
          </span>
          <span className="rzm-constructor-toggle" aria-label="Ручки">
            <input
              className="rzm-constructor-toggle-input"
              type="checkbox"
              checked={!handleless}
              onChange={(event) => onHandlelessChange(!event.target.checked)}
            />
            <span className="rzm-constructor-toggle-track">
              <span className="rzm-constructor-toggle-thumb" />
            </span>
          </span>
        </label>
      </section>
    </div>
  );
}
