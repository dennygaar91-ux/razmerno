import "../styles/constructor-v2-materials-panel.css";

const BODY_MATERIALS = [
  { id: "egger_w980_16", title: "Egger W980", subtitle: "ЛДСП 16 мм · белый", tone: "light" },
  { id: "kronospan_oak_16", title: "Kronospan Oak", subtitle: "ЛДСП 16 мм · дуб", tone: "oak" },
];

const FACADE_MATERIALS = [
  { id: "mdf_white_18", title: "МДФ белый", subtitle: "18 мм · матовый", tone: "light" },
  { id: "egger_w980_16", title: "Egger W980", subtitle: "ЛДСП 16 мм · белый", tone: "warm" },
];

const HARDWARE = ["Hettich", "Firmax"];

export default function MaterialsPanel({
  config,
  onSetBodyMaterial,
  onSetFacadeMaterial,
  onSetHardwareBrand,
  onToggleHandles,
  onToggleLegs,
}) {
  const showHandles = config.facade.enabled && config.facade.openingType === "with_handles";

  return (
    <aside className="rv2-sidebar">
      <div className="rv2-card rv2-materials-panel">
        <div className="rv2-panel-head">
          <span className="rv2-card-index">3</span>
          <div>
            <h3>Материалы</h3>
            <p>Выберите декор корпуса, фасадов и базовую фурнитуру для расчёта комплекта.</p>
          </div>
        </div>

        <div className="rv2-material-group">
          <strong>Корпус</strong>
          <div className="rv2-material-grid">
            {BODY_MATERIALS.map((material) => (
              <button
                type="button"
                key={material.id}
                className={config.materials.bodyMaterialId === material.id ? "active" : ""}
                onClick={() => onSetBodyMaterial(material.id)}
              >
                <i className={`tone-${material.tone}`} />
                <span>{material.title}</span>
                <small>{material.subtitle}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="rv2-material-group">
          <strong>Фасады</strong>
          <div className="rv2-material-grid">
            {FACADE_MATERIALS.map((material) => (
              <button
                type="button"
                key={material.id}
                className={config.materials.facadeMaterialId === material.id ? "active" : ""}
                onClick={() => onSetFacadeMaterial(material.id)}
              >
                <i className={`tone-${material.tone}`} />
                <span>{material.title}</span>
                <small>{material.subtitle}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="rv2-material-group">
          <strong>Фурнитура</strong>
          <div className="rv2-segmented">
            {HARDWARE.map((brand) => (
              <button
                type="button"
                key={brand}
                className={config.options.hardwareBrand === brand ? "active" : ""}
                onClick={() => onSetHardwareBrand(brand)}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        <div className="rv2-material-switches">
          <button type="button" className={config.options.hasLegs ? "active" : ""} onClick={() => onToggleLegs(!config.options.hasLegs)}>
            {config.options.hasLegs ? "Ножки включены" : "Без ножек"}
          </button>

          <button type="button" className={showHandles ? "active" : ""} onClick={() => onToggleHandles(!showHandles)}>
            {showHandles ? "С ручками" : "Push-to-open"}
          </button>
        </div>

        <div className="rv2-panel-note">Материалы влияют на цену и будущую деталировку.</div>
      </div>
    </aside>
  );
}
