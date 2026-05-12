import { useMemo, useState } from "react";
import Icon from "../icons/Icon";
import Header from "../components/Header/Header";
import { useCabinetStore } from "../store/cabinetStore";
import { CabinetViewer } from "../constructor/Viewer";
import {
  bodyMaterialOptions,
  facadeMaterialOptions,
  hardwareBrandOptions,
  handleOptions,
} from "../data/constructorOptions";
import "./ConstructorPage.css";

export default function ConstructorPage() {
  const [viewMode, setViewMode] = useState("3D");
  const [viewType, setViewType] = useState("front");
  const [panelTab, setPanelTab] = useState("params");
  const [zoom, setZoom] = useState(1);
  const [humanHeight, setHumanHeight] = useState(1750);
  const [materialDrawerOpen, setMaterialDrawerOpen] = useState(null);

  const {
    config,
    result,
    updateDimensions,
    addSection,
    removeSection,
    autoDistributeSections,
    setSectionShelves,
    setSectionDrawers,
    setSectionHangerRails,
    setBodyMaterial,
    setFacadeMaterial,
    setHardwareBrand,
    toggleLegs,
    toggleHandles,
    setHandleVariant,
  } = useCabinetStore();

  const sectionCount = config.sections.length;
  const [activeSectionId, setActiveSectionId] = useState(
    config.sections[0]?.id || null
  );

  const activeSection =
    config.sections.find((section) => section.id === activeSectionId) ||
    config.sections[0];

  const showHandles =
    config.facade.enabled && config.facade.openingType === "with_handles";

  const totals = useMemo(() => {
    const drawerCount = config.sections.reduce((sum, section) => {
      const drawer = section.items.find((item) => item.type === "drawer");
      return sum + (drawer?.count || 0);
    }, 0);

    const shelfCount = config.sections.reduce((sum, section) => {
      const shelf = section.items.find((item) => item.type === "shelf");
      return sum + (shelf?.count || 0);
    }, 0);

    const hangerCount = config.sections.reduce((sum, section) => {
      const rail = section.items.find((item) => item.type === "hanger_rail");
      return sum + (rail?.count || 0);
    }, 0);

    return {
      drawerCount,
      shelfCount,
      hangerCount,
    };
  }, [config.sections]);

  const price = result.price?.total ?? 0;
  const savings = Math.max(0, Math.round(price * 0.12));

  const bodyMaterial = bodyMaterialOptions.find(
    (item) => item.id === config.materials.bodyMaterialId
  );

  const facadeMaterial = facadeMaterialOptions.find(
    (item) => item.id === config.materials.facadeMaterialId
  );

  const bodyMaterialName = bodyMaterial?.name || "ЛДСП";
  const facadeMaterialName = facadeMaterial?.name || "МДФ";

  function setSectionCount(count) {
    const safeCount = Math.max(1, Math.min(6, count));

    if (safeCount === sectionCount) return;

    if (safeCount > sectionCount) {
      for (let index = sectionCount; index < safeCount; index += 1) {
        addSection();
      }
    } else {
      const removeIds = config.sections
        .slice(safeCount)
        .map((section) => section.id);

      removeIds.forEach((sectionId) => removeSection(sectionId));

      if (
        activeSectionId &&
        !config.sections.slice(0, safeCount).some((section) => section.id === activeSectionId)
      ) {
        setActiveSectionId(config.sections[0]?.id || null);
      }
    }

    autoDistributeSections();
  }

  function selectSection(sectionId) {
    setActiveSectionId(sectionId);
    setPanelTab("fill");
  }

  function updateZoom(delta) {
    setZoom((prev) => Math.max(0.7, Math.min(1.5, prev + delta)));
  }

  function updateHumanHeight(delta) {
    setHumanHeight((prev) => Math.max(1000, Math.min(2150, prev + delta)));
  }

  function getSectionItemCount(section, type) {
    return section.items.find((item) => item.type === type)?.count || 0;
  }

  return (
    <>
      <Header />

      <div className="cst-page">
        <div className="cst-shell">
          <section className="cst-left-panel">
  <div className="cst-horizontal-tabs">
    <button
      type="button"
      className={`cst-tab-btn ${panelTab === "params" ? "active" : ""}`}
      onClick={() => setPanelTab("params")}
    >
      Параметры
    </button>

    <button
      type="button"
      className={`cst-tab-btn ${panelTab === "fill" ? "active" : ""}`}
      onClick={() => setPanelTab("fill")}
    >
      Наполнение
    </button>

    <button
      type="button"
      className={`cst-tab-btn ${panelTab === "materials" ? "active" : ""}`}
      onClick={() => setPanelTab("materials")}
    >
      Материалы
    </button>
  </div>
            {panelTab === "params" && (
              <div className="cst-card cst-panel-card">
                <div className="cst-panel-head">
                  <div className="cst-small-label">Параметры</div>
                  <h2 className="cst-panel-title">Размеры и секции</h2>
                </div>

                <div className="cst-info-grid">
                  {[
                    { label: "Высота", key: "height" },
                    { label: "Ширина", key: "width" },
                    { label: "Глубина", key: "depth" },
                  ].map((field) => (
                    <label key={field.key} className="cst-field-row">
                      <span>{field.label}, мм</span>
                      <input
                        type="number"
                        min={600}
                        max={2800}
                        value={config.dimensions[field.key]}
                        onChange={(event) =>
                          updateDimensions(field.key, Number(event.target.value))
                        }
                      />
                    </label>
                  ))}
                </div>

                <div className="cst-hint">
                  Размеры задаются в миллиметрах. Изменения сразу применяются к
                  3D-просмотру.
                </div>

                <div className="cst-card-section">
                  <div className="cst-card-head">Секции</div>

                  <div className="cst-counter-block cst-counter-block--wide">
                    <span>Количество секций</span>

                    <div className="cst-counter cst-counter--large">
                      <button
                        type="button"
                        className="cst-counter-button"
                        onClick={() => setSectionCount(sectionCount - 1)}
                      >
                        −
                      </button>

                      <span className="cst-counter-value cst-counter-value--large">
                        {sectionCount}
                      </span>

                      <button
                        type="button"
                        className="cst-counter-button"
                        onClick={() => setSectionCount(sectionCount + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cst-section-list">
                    {config.sections.map((section, index) => (
                      <button
                        key={section.id}
                        type="button"
                        className={`cst-section-item ${
                          activeSection?.id === section.id ? "active" : ""
                        }`}
                        onClick={() => selectSection(section.id)}
                      >
                        <span>Секция {index + 1}</span>
                        <small>
                          {Math.round(config.dimensions.width / sectionCount)} мм
                        </small>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="cst-hint">
                  Начните с одной секции. Нажмите на секцию в модели, чтобы
                  настроить её наполнение.
                </div>
              </div>
            )}

            {panelTab === "fill" && activeSection && (
              <div className="cst-card cst-panel-card">
                <div className="cst-panel-head">
                  <div className="cst-small-label">Наполнение</div>
                  <h2 className="cst-panel-title">
                    {activeSection.name || "Выбранная секция"}
                  </h2>
                </div>

                <div className="cst-hint">
                  Настраивайте не весь шкаф сразу, а выбранную секцию. Нажмите
                  на другую секцию в блоке “Параметры”, чтобы переключиться.
                </div>

                <div className="cst-control-row">
                  <div className="cst-counter-block">
                    <span>Полки</span>
                    <div className="cst-counter">
                      <button
                        type="button"
                        className="cst-counter-button"
                        onClick={() =>
                          setSectionShelves(
                            activeSection.id,
                            Math.max(
                              0,
                              getSectionItemCount(activeSection, "shelf") - 1
                            )
                          )
                        }
                      >
                        −
                      </button>

                      <span className="cst-counter-value">
                        {getSectionItemCount(activeSection, "shelf")}
                      </span>

                      <button
                        type="button"
                        className="cst-counter-button"
                        onClick={() =>
                          setSectionShelves(
                            activeSection.id,
                            Math.min(
                              12,
                              getSectionItemCount(activeSection, "shelf") + 1
                            )
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cst-counter-block">
                    <span>Ящики</span>
                    <div className="cst-counter">
                      <button
                        type="button"
                        className="cst-counter-button"
                        onClick={() =>
                          setSectionDrawers(
                            activeSection.id,
                            Math.max(
                              0,
                              getSectionItemCount(activeSection, "drawer") - 1
                            )
                          )
                        }
                      >
                        −
                      </button>

                      <span className="cst-counter-value">
                        {getSectionItemCount(activeSection, "drawer")}
                      </span>

                      <button
                        type="button"
                        className="cst-counter-button"
                        onClick={() =>
                          setSectionDrawers(
                            activeSection.id,
                            Math.min(
                              6,
                              getSectionItemCount(activeSection, "drawer") + 1
                            )
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="cst-control-row">
                  <div className="cst-counter-block">
                    <span>Штанга</span>
                    <div className="cst-counter">
                      <button
                        type="button"
                        className="cst-counter-button"
                        onClick={() =>
                          setSectionHangerRails(
                            activeSection.id,
                            Math.max(
                              0,
                              getSectionItemCount(
                                activeSection,
                                "hanger_rail"
                              ) - 1
                            )
                          )
                        }
                      >
                        −
                      </button>

                      <span className="cst-counter-value">
                        {getSectionItemCount(activeSection, "hanger_rail")}
                      </span>

                      <button
                        type="button"
                        className="cst-counter-button"
                        onClick={() =>
                          setSectionHangerRails(
                            activeSection.id,
                            Math.min(
                              3,
                              getSectionItemCount(
                                activeSection,
                                "hanger_rail"
                              ) + 1
                            )
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cst-toggle-group">
                    <button
                      type="button"
                      className={`cst-toggle-btn ${
                        config.options.hasLegs ? "active" : ""
                      }`}
                      onClick={() => toggleLegs(!config.options.hasLegs)}
                    >
                      Ножки
                    </button>

                    <button
                      type="button"
                      className={`cst-toggle-btn ${
                        showHandles ? "active" : ""
                      }`}
                      onClick={() => toggleHandles(!showHandles)}
                    >
                      Ручки
                    </button>
                  </div>
                </div>

                <div
                  className={`cst-card-section ${
                    !showHandles ? "is-disabled" : ""
                  }`}
                >
                  <div className="cst-card-head">Вариант ручки</div>

                  <div className="cst-section-controls">
                    {handleOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        disabled={!showHandles}
                        className={`cst-option-card ${
                          config.facade.handleVariant === option.id
                            ? "active"
                            : ""
                        }`}
                        onClick={() => setHandleVariant(option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {panelTab === "materials" && (
              <div className="cst-card cst-panel-card">
                <div className="cst-panel-head">
                  <div className="cst-small-label">Материалы</div>
                  <h2 className="cst-panel-title">Выбранные материалы</h2>
                </div>

                <div className="cst-material-summary">
                  <div className="cst-material-block">
                    <div className="cst-material-block-head">
                      <span
                        className="cst-material-swatch cst-material-swatch-small"
                        style={{ background: bodyMaterial?.color || "#ccc" }}
                      />
                      <div className="cst-material-block-text">
                        <div className="cst-material-block-title">
                          {bodyMaterialName}
                        </div>
                        <div className="cst-material-block-sub">
                          ЛДСП 16 мм
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="cst-material-change-btn"
                      onClick={() => setMaterialDrawerOpen("body")}
                    >
                      Изменить
                    </button>
                  </div>

                  <div className="cst-material-block">
                    <div className="cst-material-block-head">
                      <span
                        className="cst-material-swatch cst-material-swatch-small"
                        style={{ background: facadeMaterial?.color || "#ccc" }}
                      />
                      <div className="cst-material-block-text">
                        <div className="cst-material-block-title">
                          {facadeMaterialName}
                        </div>
                        <div className="cst-material-block-sub">
                          МДФ / ЛДСП
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="cst-material-change-btn"
                      onClick={() => setMaterialDrawerOpen("facade")}
                    >
                      Изменить
                    </button>
                  </div>

                  <div className="cst-material-block">
                    <div className="cst-material-block-head">
                      <div className="cst-material-block-text">
                        <div className="cst-material-block-title">
                          {config.options.hardwareBrand || "Hettich"}
                        </div>
                        <div className="cst-material-block-sub">
                          петли и направляющие
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="cst-material-change-btn"
                      onClick={() => setMaterialDrawerOpen("hardware")}
                    >
                      Изменить
                    </button>
                  </div>
                </div>

                <div className="cst-hint">
                  Нажмите «Изменить», чтобы выбрать другие материалы и
                  фурнитуру.
                </div>
              </div>
            )}
          </section>

          <main className="cst-view-area">
            <div className="cst-card cst-view-card">
              <div className="cst-view-toolbar">
                <div className="cst-view-pill-group">
                  {[
                    { id: "front", label: "СПЕРЕДИ" },
                    { id: "side", label: "СБОКУ" },
                    { id: "top", label: "СВЕРХУ" },
                    { id: "free", label: "Свободно" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`cst-view-pill ${
                        viewType === option.id ? "active" : ""
                      }`}
                      onClick={() => setViewType(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="cst-view-actions">
                  <button
                    type="button"
                    className={`cst-view-mode-btn ${
                      viewMode === "3D" ? "active" : ""
                    }`}
                    onClick={() => setViewMode("3D")}
                  >
                    3D
                  </button>

                  <button
                    type="button"
                    className={`cst-view-mode-btn ${
                      viewMode === "2D" ? "active" : ""
                    }`}
                    onClick={() => setViewMode("2D")}
                  >
                    2D
                  </button>
                </div>
              </div>

              <div className="cst-view-stage">
                <CabinetViewer
                  parts={result.parts}
                  config={config}
                  viewMode={viewMode}
                  viewType={viewType}
                  zoom={zoom}
                  userHeight={humanHeight}
                  activeSectionId={activeSectionId}
                  onSectionSelect={selectSection}
                />
              </div>

              <div className="cst-view-footer">
                <div className="cst-view-hotspot">
                  <span>Рост человека</span>
                  <div className="cst-counter">
                    <button
                      type="button"
                      className="cst-counter-button"
                      onClick={() => updateHumanHeight(-50)}
                    >
                      −
                    </button>

                    <span className="cst-counter-value">
                      {humanHeight} мм
                    </span>

                    <button
                      type="button"
                      className="cst-counter-button"
                      onClick={() => updateHumanHeight(50)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cst-view-zoom">
                  <button
                    type="button"
                    className="cst-counter-button"
                    onClick={() => updateZoom(-0.1)}
                  >
                    −
                  </button>

                  <span className="cst-zoom-value">
                    {Math.round(zoom * 100)}%
                  </span>

                  <button
                    type="button"
                    className="cst-counter-button"
                    onClick={() => updateZoom(0.1)}
                  >
                    <Icon name="plus" size={16} />
                  </button>
                </div>
              </div>
            </div>
          </main>

          <aside className="cst-right-panel">
            <div className="cst-card cst-summary-card">
              <div className="cst-summary-label">Итого</div>

              <div className="cst-summary-price">
                {price.toLocaleString("ru-RU")} ₽
              </div>

              <div className="cst-summary-save">
                Экономия до {savings.toLocaleString("ru-RU")} ₽
              </div>

              <div className="cst-summary-meta">
                <Icon name="clock" size={16} />
                <span>Срок изготовления 10–14 дней</span>
              </div>

              <div className="cst-summary-breakdown">
                <div className="cst-summary-line">
                  <span>Корпус: {bodyMaterialName}</span>
                  <strong>{config.sections.length} секц.</strong>
                </div>

                <div className="cst-summary-line">
                  <span>Фасад: {facadeMaterialName}</span>
                  <strong>{config.options.hardwareBrand}</strong>
                </div>

                <div className="cst-summary-line">
                  <span>Ящики</span>
                  <strong>{totals.drawerCount}</strong>
                </div>

                <div className="cst-summary-line">
                  <span>Полки</span>
                  <strong>{totals.shelfCount}</strong>
                </div>

                <div className="cst-summary-line">
                  <span>Рейлинги</span>
                  <strong>{totals.hangerCount}</strong>
                </div>
              </div>

              <div className="cst-hint">
                В стоимость уже включена доставка, упаковка и НДС.
              </div>

              <button className="cst-button-primary" type="button">
                Создать
              </button>
            </div>
          </aside>
        </div>
      </div>

      {materialDrawerOpen && (
        <>
          <div
            className="cst-drawer-overlay"
            onClick={() => setMaterialDrawerOpen(null)}
          />

          <div className="cst-material-drawer">
            <div className="cst-drawer-header">
              <h3>
                {materialDrawerOpen === "body" && "Материал корпуса"}
                {materialDrawerOpen === "facade" && "Материал фасадов"}
                {materialDrawerOpen === "hardware" && "Фурнитура"}
              </h3>

              <button
                type="button"
                className="cst-drawer-close"
                onClick={() => setMaterialDrawerOpen(null)}
              >
                ✕
              </button>
            </div>

            <div className="cst-drawer-content">
              {materialDrawerOpen === "body" && (
                <div className="cst-drawer-grid">
                  {bodyMaterialOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`cst-material-option ${
                        config.materials.bodyMaterialId === option.id
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        setBodyMaterial(option.id);
                        setMaterialDrawerOpen(null);
                      }}
                    >
                      <span
                        className="cst-material-swatch"
                        style={{ background: option.color }}
                      />
                      <div>
                        <div className="cst-material-name">{option.name}</div>
                        <div className="cst-material-sub">
                          {option.subtitle}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {materialDrawerOpen === "facade" && (
                <div className="cst-drawer-grid">
                  {facadeMaterialOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`cst-material-option ${
                        config.materials.facadeMaterialId === option.id
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        setFacadeMaterial(option.id);
                        setMaterialDrawerOpen(null);
                      }}
                    >
                      <span
                        className="cst-material-swatch"
                        style={{ background: option.color }}
                      />
                      <div>
                        <div className="cst-material-name">{option.name}</div>
                        <div className="cst-material-sub">
                          {option.subtitle}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {materialDrawerOpen === "hardware" && (
                <div className="cst-drawer-grid cst-drawer-grid--hardware">
                  {hardwareBrandOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`cst-hardware-option ${
                        config.options.hardwareBrand === option.id
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        setHardwareBrand(option.id);
                        setMaterialDrawerOpen(null);
                      }}
                    >
                      <div className="cst-hardware-name">{option.label}</div>
                      <div className="cst-hardware-desc">
                        {option.label === "Hettich" &&
                          "Премиальная фурнитура"}
                        {option.label === "Firmax" && "Надёжный стандарт"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}