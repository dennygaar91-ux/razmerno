import FillCounter from "./FillCounter";

export default function FillControls({
  sections,
  activeSection,
  activeSectionIsEmpty,
  presets,
  getItemCount,
  showHandles,
  handleOptions,
  handleVariant,
  hasLegs,
  onSectionSelect,
  onPresetApply,
  onShelvesChange,
  onDrawersChange,
  onRailsChange,
  onToggleLegs,
  onToggleHandles,
  onHandleVariant,
}) {
  return (
    <div className="cp-card">
      <div className="cp-card-head">
        <span>02</span>
        <h2>Наполнение секции</h2>
      </div>

      <div className="cp-section-tabs">
        {sections.map((section, index) => (
          <button
            key={section.id}
            type="button"
            className={section.id === activeSection.id ? "active" : ""}
            onClick={() => onSectionSelect(section.id)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {activeSectionIsEmpty ? (
        <div className="cp-empty-state">
          <strong>Секция пока пустая</strong>
          <small>Выберите готовый пресет или добавьте полку, ящик, штангу вручную.</small>
        </div>
      ) : null}

      <div className="cp-presets">
        {presets.map((preset) => (
          <button key={preset.id} type="button" onClick={() => onPresetApply(preset)}>
            <strong>{preset.label}</strong>
            <small>{preset.desc}</small>
          </button>
        ))}
      </div>

      <div className="cp-fill-grid">
        <FillCounter
          label="Полки"
          value={getItemCount(activeSection, "shelf")}
          onMinus={() => onShelvesChange(Math.max(0, getItemCount(activeSection, "shelf") - 1))}
          onPlus={() => onShelvesChange(getItemCount(activeSection, "shelf") + 1)}
        />

        <FillCounter
          label="Ящики"
          value={getItemCount(activeSection, "drawer")}
          onMinus={() => onDrawersChange(Math.max(0, getItemCount(activeSection, "drawer") - 1))}
          onPlus={() => onDrawersChange(getItemCount(activeSection, "drawer") + 1)}
        />

        <FillCounter
          label="Штанга"
          value={getItemCount(activeSection, "hanger_rail")}
          onMinus={() => onRailsChange(0)}
          onPlus={() => onRailsChange(getItemCount(activeSection, "hanger_rail") > 0 ? 0 : 1)}
        />
      </div>

      <div className="cp-toggles">
        <button type="button" className={hasLegs ? "active" : ""} onClick={onToggleLegs}>
          Ножки
        </button>

        <button type="button" className={showHandles ? "active" : ""} onClick={onToggleHandles}>
          Ручки
        </button>
      </div>

      {showHandles ? (
        <div className="cp-handle-options">
          {handleOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={handleVariant === option.id ? "active" : ""}
              onClick={() => onHandleVariant(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
