import { InlineIssue, ValidationAssist } from "./ConstructorDrawerPrimitives";
import type {
  FillingLayout,
  FillingStepActions,
  FillingStepDerivedState,
  FillingValidationProps,
  ZoneFacadeLayout,
} from "./FillingStepTypes";

export function FillingZoneSummary({ state }: { state: FillingStepDerivedState }) {
  const { hasSelectedZone, activeFilling, dividerShelfCount, zoneElementCount } = state;

  if (!hasSelectedZone) return null;

  return (
    <section
      className="rzm-3d-fill-section"
      aria-labelledby="rzm-q5-zone-summary-title"
    >
      <header className="rzm-3d-fill-section-header">
        <div>
          <span>Элементы зоны</span>
          <h2 id="rzm-q5-zone-summary-title">Что уже добавлено</h2>
        </div>
      </header>
      <div
        className="rzm-3d-fill-counters"
        aria-label="Счётчики наполнения выбранной зоны"
      >
        <span>Полки × {activeFilling.shelvesCount}</span>
        <span>Ящики × {activeFilling.drawersCount}</span>
        <span>Штанга × {activeFilling.rodsCount}</span>
        <span>Разделители × {dividerShelfCount}</span>
      </div>
      {zoneElementCount === 0 && dividerShelfCount === 0 ? (
        <p className="rzm-3d-fill-empty-copy">В зоне пока нет наполнения.</p>
      ) : null}
    </section>
  );
}

export function FillingRandomPresetAction({
  activeSection,
  onApplyRandomPreset,
}: {
  activeSection: string;
  onApplyRandomPreset: (sectionId?: string | null) => void;
}) {
  return (
    <button
      type="button"
      className="rzm-3d-random-drawer-action"
      onClick={() => onApplyRandomPreset(activeSection)}
    >
      <strong>Рандомно</strong>
      <span>Быстро собрать рабочий вариант для выбранной секции</span>
    </button>
  );
}

export function FillingZoneList({
  state,
  fillingLayout,
  zoneFacadeLayout,
  onSelectCompartment,
}: {
  state: FillingStepDerivedState;
  fillingLayout: FillingLayout;
  zoneFacadeLayout: ZoneFacadeLayout;
  onSelectCompartment: FillingStepActions["onSelectCompartment"];
}) {
  const { activeSection, activeZoneId, sectionZones } = state;

  return (
    <section
      className="rzm-3d-fill-section rzm-3d-zone-list"
      aria-labelledby="rzm-q5-zone-list-title"
    >
      <h2 id="rzm-q5-zone-list-title">Зоны секции</h2>
      {sectionZones.map((zone, index) => {
        const filling = fillingLayout[activeSection]?.[zone.id] ?? {
          shelvesCount: 0,
          drawersCount: 0,
          rodsCount: 0,
        };
        const zoneTotal = filling.drawersCount + filling.rodsCount + filling.shelvesCount;
        return (
          <button
            key={zone.id}
            type="button"
            className={zone.id === activeZoneId ? "is-active" : ""}
            onClick={() => onSelectCompartment(activeSection, zone.id)}
            aria-pressed={zone.id === activeZoneId}
          >
            <strong>Зона {index + 1}</strong>
            <span>{zone.heightMm.toLocaleString("ru-RU")} мм</span>
            <small>
              {`${zoneTotal ? `элементов × ${zoneTotal}` : "свободно"}${
                zoneFacadeLayout[activeSection]?.[zone.id] === "open" ? " · без фасада" : ""
              }`}
            </small>
          </button>
        );
      })}
    </section>
  );
}

export function FillingElementsList({
  state,
  onRemoveShelfDivider,
  onRemoveCompartmentElement,
}: {
  state: FillingStepDerivedState;
  onRemoveShelfDivider: FillingStepActions["onRemoveShelfDivider"];
  onRemoveCompartmentElement: FillingStepActions["onRemoveCompartmentElement"];
}) {
  const { activeSection, activeZoneId, sectionZones, activeFilling } = state;

  return (
    <section
      className="rzm-3d-fill-section rzm-3d-elements-list"
      aria-labelledby="rzm-q5-elements-title"
    >
      <h2 id="rzm-q5-elements-title">Список элементов</h2>
      {sectionZones.length > 1
        ? sectionZones.slice(0, -1).map((zone, index) => (
            <div key={`divider-${zone.id}`} className="rzm-3d-element-row">
              <div>
                <strong>Полка {index + 1}</strong>
                <span>разделитель после зоны {index + 1}</span>
              </div>
              <button type="button" onClick={() => onRemoveShelfDivider(activeSection, zone.id)}>
                Удалить
              </button>
            </div>
          ))
        : null}
      {activeZoneId && activeFilling.drawersCount > 0
        ? Array.from({ length: activeFilling.drawersCount }, (_, index) => (
            <div key={`drawer-${index}`} className="rzm-3d-element-row">
              <div>
                <strong>Ящик {index + 1}</strong>
                <span>в выбранной зоне</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onRemoveCompartmentElement(activeSection, activeZoneId, "drawersCount")
                }
              >
                Удалить
              </button>
            </div>
          ))
        : null}
      {activeZoneId && activeFilling.rodsCount > 0
        ? Array.from({ length: activeFilling.rodsCount }, (_, index) => (
            <div key={`rod-${index}`} className="rzm-3d-element-row">
              <div>
                <strong>Штанга {index + 1}</strong>
                <span>в выбранной зоне</span>
              </div>
              <button
                type="button"
                onClick={() => onRemoveCompartmentElement(activeSection, activeZoneId, "rodsCount")}
              >
                Удалить
              </button>
            </div>
          ))
        : null}
      {activeZoneId && activeFilling.shelvesCount > 0
        ? Array.from({ length: activeFilling.shelvesCount }, (_, index) => (
            <div key={`inner-shelf-${index}`} className="rzm-3d-element-row">
              <div>
                <strong>Полка внутри зоны {index + 1}</strong>
                <span>в выбранной зоне</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onRemoveCompartmentElement(activeSection, activeZoneId, "shelvesCount")
                }
              >
                Удалить
              </button>
            </div>
          ))
        : null}
      {sectionZones.length <= 1 &&
      activeFilling.drawersCount === 0 &&
      activeFilling.rodsCount === 0 &&
      activeFilling.shelvesCount === 0 ? (
        <p>В зоне пока нет наполнения. Выберите зону на 3D-модели и нажмите +.</p>
      ) : null}
    </section>
  );
}

export function FillingValidationPanel({
  state,
  validation,
  onApplyAutoFixForIssue,
}: { state: FillingStepDerivedState } & FillingValidationProps) {
  return (
    <section
      className="rzm-3d-fill-section rzm-3d-fill-check"
      aria-labelledby="rzm-q5-validation-title"
    >
      <header className="rzm-3d-fill-section-header">
        <div>
          <span>Проверка</span>
          <h2 id="rzm-q5-validation-title">Состояние выбранной зоны</h2>
        </div>
      </header>
      <InlineIssue issue={state.selectedZoneIssue} onAutoFix={onApplyAutoFixForIssue} />
      <ValidationAssist validation={validation} onAutoFix={onApplyAutoFixForIssue} step="fill" />
    </section>
  );
}
