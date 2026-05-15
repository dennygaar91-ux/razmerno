import "../styles/constructor-v2-fill-panel.css";

const PRESETS = [
  {
    title: "Полки",
    description: "Для хранения коробок и одежды",
    shelves: 5,
    drawers: 0,
    rails: 0,
  },
  {
    title: "Гардероб",
    description: "Штанга + верхняя полка",
    shelves: 1,
    drawers: 0,
    rails: 1,
  },
  {
    title: "Комод",
    description: "Выдвижные ящики",
    shelves: 0,
    drawers: 4,
    rails: 0,
  },
  {
    title: "Комбо",
    description: "Полки + ящики",
    shelves: 3,
    drawers: 2,
    rails: 0,
  },
];

function getItemCount(section, type) {
  return section?.items?.find((item) => item.type === type)?.count || 0;
}

export default function FillPanel({
  activeSection,
  sections,
  activeSectionId,
  onSelectSection,
  onAddShelf,
  onAddDrawer,
  onToggleRail,
  onClearSection,
  onApplyPreset,
}) {
  const activeIndex = sections.findIndex((section) => section.id === activeSectionId) + 1;
  const shelves = getItemCount(activeSection, "shelf");
  const drawers = getItemCount(activeSection, "drawer");
  const rails = getItemCount(activeSection, "hanger_rail");

  return (
    <aside className="rv2-sidebar">
      <div className="rv2-card rv2-fill-panel">
        <div className="rv2-panel-head">
          <span className="rv2-card-index">2</span>
          <div>
            <h3>Наполнение</h3>
            <p>Выберите секцию и добавьте полки, ящики или штангу. Все изменения сразу видны в модели.</p>
          </div>
        </div>

        <div className="rv2-active-section-card">
          <span>Активная секция</span>
          <strong>Секция {activeIndex || 1}</strong>
          <p>{shelves} полок · {drawers} ящиков · {rails ? "штанга" : "без штанги"}</p>
        </div>

        <div className="rv2-fill-presets">
          <strong>Быстрые сценарии</strong>

          <div className="rv2-fill-presets-grid">
            {PRESETS.map((preset) => (
              <button
                key={preset.title}
                type="button"
                className="rv2-fill-preset-card"
                onClick={() => onApplyPreset(preset)}
              >
                <b>{preset.title}</b>
                <span>{preset.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rv2-fill-actions-grid">
          <button type="button" onClick={onAddShelf}>+ Полка</button>
          <button type="button" onClick={onAddDrawer}>+ Ящик</button>
          <button type="button" onClick={onToggleRail}>Штанга</button>
          <button type="button" className="danger" onClick={onClearSection}>Очистить</button>
        </div>

        <div className="rv2-section-picker">
          <strong>Секции шкафа</strong>
          <div>
            {sections.map((section, index) => (
              <button
                type="button"
                key={section.id}
                className={section.id === activeSectionId ? "active" : ""}
                onClick={() => onSelectSection(section.id)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="rv2-panel-note">Наполнение можно менять в любой момент до оформления заказа</div>
      </div>
    </aside>
  );
}
