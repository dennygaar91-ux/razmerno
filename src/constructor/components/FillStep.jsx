import FillCounter from "./FillCounter";

export default function FillStep({
  config,
  activeSection,
  activeSectionIsEmpty,
  fillPresets,
  showHandles,
  handleOptions,
  getItemCount,
  onSelectSection,
  onApplyPreset,
  onSetSectionShelves,
  onSetSectionDrawers,
  onSetSectionHangerRails,
  onAddShelf,
  onAddDrawer,
  onToggleRail,
  onToggleLegs,
  onToggleHandles,
  onSetHandleVariant,
}) {
  if (!activeSection) return null;

  const activeSectionIndex = config.sections.findIndex((section) => section.id === activeSection.id) + 1;

  return (
    <div className="cp-card">
      <div className="cp-card-head">
        <span>02</span>
        <h2>Наполнение секции</h2>
      </div>

      <div className="cp-step-intro cp-step-intro-accent">
        <strong>Секция {activeSectionIndex || 1}</strong>
        <p>Выберите готовый сценарий или настройте полки, ящики и штангу вручную.</p>
      </div>

      <div className="cp-section-tabs">
        {config.sections.map((section, index) => (
          <button
            key={section.id}
            type="button"
            className={section.id === activeSection.id ? "active" : ""}
            onClick={() => onSelectSection(section.id)}
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
        {fillPresets.map((preset) => (
          <button type="button" key={preset.id} onClick={() => onApplyPreset(preset)}>
            <strong>{preset.label}</strong>
            <small>{preset.desc}</small>
          </button>
        ))}
      </div>

      <div className="cp-fill-grid">
        <FillCounter
          label="Полки"
          value={getItemCount(activeSection, "shelf")}
          onMinus={() => onSetSectionShelves(activeSection.id, Math.max(0, getItemCount(activeSection, "shelf") - 1))}
          onPlus={onAddShelf}
        />
        <FillCounter
          label="Ящики"
          value={getItemCount(activeSection, "drawer")}
          onMinus={() => onSetSectionDrawers(activeSection.id, Math.max(0, getItemCount(activeSection, "drawer") - 1))}
          onPlus={onAddDrawer}
        />
        <FillCounter
          label="Штанга"
          value={getItemCount(activeSection, "hanger_rail")}
          onMinus={() => onSetSectionHangerRails(activeSection.id, 0)}
          onPlus={onToggleRail}
        />
      </div>

      <div className="cp-toggles">
        <button
          type="button"
          className={config.options.hasLegs ? "active" : ""}
          onClick={() => onToggleLegs(!config.options.hasLegs)}
        >
          Ножки
        </button>
        <button
          type="button"
          className={showHandles ? "active" : ""}
          onClick={() => onToggleHandles(!showHandles)}
        >
          Ручки
        </button>
      </div>

      {showHandles ? (
        <div className="cp-handle-options">
          {handleOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={config.facade.handleVariant === option.id ? "active" : ""}
              onClick={() => onSetHandleVariant(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
