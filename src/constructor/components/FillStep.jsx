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

  const shelvesCount = getItemCount(activeSection, "shelf");
  const drawersCount = getItemCount(activeSection, "drawer");
  const railCount = getItemCount(activeSection, "hanger_rail");

  function getSectionMode(section) {
    const shelves = getItemCount(section, "shelf");
    const drawers = getItemCount(section, "drawer");
    const rails = getItemCount(section, "hanger_rail");

    if (rails && drawers) return "Комбо";
    if (rails) return "Гардероб";
    if (drawers) return "Ящики";
    if (shelves) return "Полки";
    return "Пусто";
  }

  function getSectionShortLabel(section) {
    const shelves = getItemCount(section, "shelf");
    const drawers = getItemCount(section, "drawer");
    const rails = getItemCount(section, "hanger_rail");

    if (shelves + drawers + rails === 0) return "Добавьте наполнение";

    return [
      shelves ? `${shelves} пол.` : "",
      drawers ? `${drawers} ящ.` : "",
      rails ? "штанга" : "",
    ].filter(Boolean).join(" · ");
  }

  let sectionMode = "Пустая";

  if (railCount && drawersCount) {
    sectionMode = "Комбинированная";
  } else if (railCount) {
    sectionMode = "Гардероб";
  } else if (drawersCount) {
    sectionMode = "Ящики";
  } else if (shelvesCount) {
    sectionMode = "Полки";
  }

  return (
    <div className="cp-card cp-fill-step-card">
      <div className="cp-card-head">
        <span>02</span>
        <h2>Наполнение секции</h2>
      </div>

      <div className="cp-step-intro cp-step-intro-accent cp-active-section-hero">
        <div>
          <strong>Секция {activeSectionIndex || 1}</strong>
          <p>Настройте внутреннее наполнение шкафа: полки, ящики и хранение одежды.</p>
        </div>

        <span className="cp-section-mode-pill">{sectionMode}</span>
      </div>

      <div className="cp-section-tabs cp-section-tabs-premium" aria-label="Выбор секции шкафа">
        {config.sections.map((section, index) => {
          const isActive = section.id === activeSection.id;
          const shelves = getItemCount(section, "shelf");
          const drawers = getItemCount(section, "drawer");
          const rails = getItemCount(section, "hanger_rail");
          const isEmpty = shelves + drawers + rails === 0;

          return (
            <button
              key={section.id}
              type="button"
              className={`${isActive ? "active" : ""} ${isEmpty ? "empty" : ""}`}
              onClick={() => onSelectSection(section.id)}
              aria-label={`Секция ${index + 1}: ${getSectionShortLabel(section)}`}
            >
              <span className="cp-section-tab-number">{index + 1}</span>
              <span className="cp-section-tab-copy">
                <strong>Секция {index + 1}</strong>
                <small>{getSectionShortLabel(section)}</small>
              </span>
              <em>{getSectionMode(section)}</em>
            </button>
          );
        })}
      </div>

      {activeSectionIsEmpty ? (
        <div className="cp-empty-state cp-empty-state-premium">
          <span aria-hidden="true">＋</span>
          <div>
            <strong>Начните с готового сценария</strong>
            <small>Ниже можно выбрать пресет или вручную добавить полки, ящики и штангу.</small>
          </div>
        </div>
      ) : null}

      <div className="cp-presets cp-presets-premium">
        {fillPresets.map((preset) => (
          <button
            type="button"
            key={preset.id}
            className={`cp-preset-card cp-preset-${preset.id}`}
            onClick={() => onApplyPreset(preset)}
          >
            <span className="cp-preset-visual" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <strong>{preset.label}</strong>
            <small>{preset.desc}</small>
          </button>
        ))}
      </div>

      <div className="cp-fill-grid cp-fill-grid-premium">
        <FillCounter
          label="Полки"
          desc="Для одежды, коробок и хранения"
          icon="≡"
          value={shelvesCount}
          onMinus={() => onSetSectionShelves(activeSection.id, Math.max(0, shelvesCount - 1))}
          onPlus={onAddShelf}
        />

        <FillCounter
          label="Ящики"
          desc="Удобное хранение мелких вещей"
          icon="▣"
          value={drawersCount}
          onMinus={() => onSetSectionDrawers(activeSection.id, Math.max(0, drawersCount - 1))}
          onPlus={onAddDrawer}
        />

        <FillCounter
          label="Штанга"
          desc="Для рубашек, курток и платьев"
          icon="⎯"
          value={railCount}
          onMinus={() => onSetSectionHangerRails(activeSection.id, 0)}
          onPlus={onToggleRail}
        />
      </div>

      <div className="cp-options-grid">
        <div className="cp-option-card">
          <span>Основание</span>

          <div className="cp-segmented-control">
            <button
              type="button"
              className={!config.options.hasLegs ? "active" : ""}
              onClick={() => onToggleLegs(false)}
            >
              Цоколь
            </button>

            <button
              type="button"
              className={config.options.hasLegs ? "active" : ""}
              onClick={() => onToggleLegs(true)}
            >
              Ножки
            </button>
          </div>
        </div>

        <div className="cp-option-card">
          <span>Фасады</span>

          <div className="cp-segmented-control">
            <button
              type="button"
              className={showHandles ? "active" : ""}
              onClick={() => onToggleHandles(true)}
            >
              С ручками
            </button>

            <button
              type="button"
              className={!showHandles ? "active" : ""}
              onClick={() => onToggleHandles(false)}
            >
              Push-to-open
            </button>
          </div>
        </div>
      </div>

      {showHandles ? (
        <div className="cp-handle-options cp-handle-options-premium">
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
