import { formatMm } from "./Constructor3DPageMeta";
import { StepIntro } from "./ConstructorDrawerPrimitives";
import type { FillingStepDerivedState } from "./FillingStepTypes";

export function FillingSelectionPanel({
  sections,
  state,
  onSelectSection,
}: {
  sections: number;
  state: FillingStepDerivedState;
  onSelectSection: (sectionId: string) => void;
}) {
  const {
    activeSection,
    sectionNumber,
    activeZone,
    activeZoneIndex,
    hasSelectedZone,
    facadeMode,
  } = state;

  return (
    <>
      <StepIntro
        title="Наполнение"
        text="Выберите секцию или зону на модели. После выбора появятся действия для полок, ящиков, штанги и фасада."
      />

      {!hasSelectedZone ? <FillingEmptyState /> : null}

      <section
        className="rzm-3d-fill-section"
        aria-labelledby="rzm-q5-current-selection-title"
      >
        <header className="rzm-3d-fill-section-header">
          <div>
            <span>Сейчас выбрано</span>
            <h2 id="rzm-q5-current-selection-title">
              {hasSelectedZone && activeZone
                ? `Секция ${sectionNumber} · зона ${activeZoneIndex + 1}`
                : `Секция ${sectionNumber}`}
            </h2>
          </div>
          {activeZone ? <strong>{formatMm(activeZone.heightMm)}</strong> : null}
        </header>
        <div className="rzm-3d-fill-active-meta">
          <span>{`Секция ${sectionNumber}`}</span>
          {activeZone ? (
            <span>{`Зона ${activeZoneIndex + 1}`}</span>
          ) : (
            <span>Зона не выбрана</span>
          )}
          <span>
            {facadeMode === "hinged" ? "Фасады включены" : "Открытая секция"}
          </span>
        </div>
      </section>

      <section
        className="rzm-3d-fill-section"
        aria-labelledby="rzm-q5-section-picker-title"
      >
        <header className="rzm-3d-fill-section-header">
          <div>
            <span>Секции</span>
            <h2 id="rzm-q5-section-picker-title">Выберите секцию</h2>
          </div>
        </header>
        <div className="rzm-3d-section-pills" aria-label="Выбор секции">
          {Array.from({ length: sections }, (_, index) => {
            const id = `section-${index + 1}`;
            return (
              <button
                key={id}
                type="button"
                className={activeSection === id ? "is-active" : ""}
                onClick={() => onSelectSection(id)}
                aria-pressed={activeSection === id}
                aria-label={`Выбрать секцию ${index + 1}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}

function FillingEmptyState() {
  return (
    <section
      className="rzm-3d-fill-empty-state"
      aria-labelledby="rzm-q5-fill-empty-title"
    >
      <span className="rzm-3d-fill-empty-icon" aria-hidden="true">
        +
      </span>
      <div>
        <h2 id="rzm-q5-fill-empty-title">Выберите зону на 3D-модели</h2>
        <p>
          Кликните по секции или зоне шкафа. После выбора на модели появится +,
          а здесь откроются действия.
        </p>
      </div>
      <ul>
        <li>Полка делит выбранную зону на две</li>
        <li>Ящики и штанга добавляются в выбранную зону</li>
        <li>Фасады секции настраиваются ниже</li>
      </ul>
    </section>
  );
}
