export default function DimensionControls({
  limits,
  draft,
  sectionCount,
  autoSectionWidth,
  sections,
  activeSectionId,
  onDraftChange,
  onCommitDimension,
  onStepDimension,
  onSectionCountChange,
  onSectionSelect,
}) {
  return (
    <div className="cp-card">
      <div className="cp-card-head">
        <span>01</span>
        <h2>Размеры и секции</h2>
      </div>

      <div className="cp-dimensions">
        {Object.keys(limits).map((key) => {
          const item = limits[key];

          return (
            <div className="cp-dimension" key={key}>
              <div>
                <strong>{item.label}, мм</strong>
                <small>{item.min}–{item.max}</small>
              </div>

              <div className="cp-counter">
                <button type="button" onClick={() => onStepDimension(key, -1)}>−</button>
                <input
                  type="number"
                  value={draft[key]}
                  onChange={(event) => onDraftChange(key, event.target.value)}
                  onBlur={(event) => onCommitDimension(key, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                  }}
                />
                <button type="button" onClick={() => onStepDimension(key, 1)}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="cp-section-count">
        <div>
          <strong>Количество секций</strong>
          <small>от 1 до 6, ширина распределяется автоматически</small>
        </div>

        <div className="cp-counter compact">
          <button type="button" onClick={() => onSectionCountChange(sectionCount - 1)}>−</button>
          <span>{sectionCount}</span>
          <button type="button" onClick={() => onSectionCountChange(sectionCount + 1)}>+</button>
        </div>
      </div>

      <div className="cp-section-widths">
        <div className="cp-section-widths-head">
          <strong>Секции шкафа</strong>
          <small>сейчас ширина распределяется автоматически</small>
        </div>

        <div
          className="cp-section-width-grid"
          style={{ gridTemplateColumns: `repeat(${sectionCount}, minmax(44px, 1fr))` }}
        >
          {sections.map((section, index) => (
            <button
              key={section.id}
              type="button"
              className={section.id === activeSectionId ? "active" : ""}
              onClick={() => onSectionSelect(section.id)}
            >
              <span>{index + 1}</span>
              <b>{autoSectionWidth} мм</b>
              <i />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
