import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const DIMENSION_LIMITS = {
  height: { min: 200, max: 2800, step: 1 },
  width: { min: 200, max: 3600, step: 1 },
  depth: { min: 200, max: 900, step: 1 },
};

const FILL_PRESETS = [
  {
    id: "shelves",
    label: "Полки",
    description: "для коробок, одежды и бытовых вещей",
    shelves: 4,
    drawers: 0,
    rails: 0,
  },
  {
    id: "wardrobe",
    label: "Гардероб",
    description: "штанга и верхняя полка для плечиков",
    shelves: 1,
    drawers: 0,
    rails: 1,
  },
  {
    id: "drawers",
    label: "Ящики снизу",
    description: "ящики + полки над ними",
    shelves: 2,
    drawers: 3,
    rails: 0,
  },
  {
    id: "mixed",
    label: "Комбо",
    description: "полки, ящики и штанга в одной секции",
    shelves: 2,
    drawers: 2,
    rails: 1,
  },
];

export default function ConstructorPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("3D");
  const [viewType, setViewType] = useState("front");
  const [panelTab, setPanelTab] = useState("params");
  const [zoom, setZoom] = useState(1);
  const [humanHeight, setHumanHeight] = useState(1750);
  const [materialDrawerOpen, setMaterialDrawerOpen] = useState(null);
  const [notice, setNotice] = useState("");
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [dragSectionId, setDragSectionId] = useState(null);
  const [isViewerReady, setIsViewerReady] = useState(false);
  const [pricePulse, setPricePulse] = useState(false);

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
    resetConfig,
  } = useCabinetStore();

  const sectionCount = config.sections.length;

  useEffect(() => {
    if (!activeSectionId && config.sections[0]?.id) {
      setActiveSectionId(config.sections[0].id);
    }
  }, [activeSectionId, config.sections]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsViewerReady(true), 480);
    return () => window.clearTimeout(timer);
  }, []);

  const price = result.price?.total ?? 0;

  useEffect(() => {
    setPricePulse(true);
    const timer = window.setTimeout(() => setPricePulse(false), 520);
    return () => window.clearTimeout(timer);
  }, [price]);

  const activeSection =
    config.sections.find((section) => section.id === activeSectionId) || config.sections[0];

  const showHandles =
    config.facade.enabled && config.facade.openingType === "with_handles";

  const totals = useMemo(() => {
    return config.sections.reduce(
      (acc, section) => {
        acc.drawerCount += getSectionItemCount(section, "drawer");
        acc.shelfCount += getSectionItemCount(section, "shelf");
        acc.hangerCount += getSectionItemCount(section, "hanger_rail");
        return acc;
      },
      { drawerCount: 0, shelfCount: 0, hangerCount: 0 }
    );
  }, [config.sections]);

  const savings = Math.max(0, Math.round(price * 0.12));

  const bodyMaterial = bodyMaterialOptions.find(
    (item) => item.id === config.materials.bodyMaterialId
  );

  const facadeMaterial = facadeMaterialOptions.find(
    (item) => item.id === config.materials.facadeMaterialId
  );

  const bodyMaterialName = bodyMaterial?.name || "ЛДСП";
  const facadeMaterialName = facadeMaterial?.name || "МДФ";
  const hasEmptyActiveSection =
    activeSection &&
    getSectionItemCount(activeSection, "shelf") === 0 &&
    getSectionItemCount(activeSection, "drawer") === 0 &&
    getSectionItemCount(activeSection, "hanger_rail") === 0;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function snapToStep(value, step) {
    return Math.round(value / step) * step;
  }

  function getSectionItemCount(section, type) {
    return section?.items?.find((item) => item.type === type)?.count || 0;
  }

  function updateDimensionByStep(key, delta) {
    const limits = DIMENSION_LIMITS[key];
    const nextValue = clamp(config.dimensions[key] + delta, limits.min, limits.max);
    updateDimensions(key, nextValue);
  }

  function setDimensionValue(key, value, shouldSnap = false) {
    const limits = DIMENSION_LIMITS[key];
    const rawValue = Number(value) || limits.min;
    const preparedValue = shouldSnap ? snapToStep(rawValue, limits.step) : rawValue;
    const nextValue = clamp(preparedValue, limits.min, limits.max);
    updateDimensions(key, nextValue);
  }

  function setSectionCount(count) {
    const safeCount = Math.max(1, Math.min(6, count));

    if (safeCount === sectionCount) return;

    if (safeCount > sectionCount) {
      for (let index = sectionCount; index < safeCount; index += 1) {
        addSection();
      }
    } else {
      const removeIds = config.sections.slice(safeCount).map((section) => section.id);
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
    setZoom((prev) => Math.max(0.7, Math.min(1.5, Number((prev + delta).toFixed(2)))));
  }

  function updateHumanHeight(delta) {
    setHumanHeight((prev) => Math.max(1000, Math.min(2150, prev + delta)));
  }

  function applyFillPreset(preset) {
    if (!activeSection) return;

    setSectionShelves(activeSection.id, preset.shelves);
    setSectionDrawers(activeSection.id, preset.drawers);
    setSectionHangerRails(activeSection.id, preset.rails);
    setNotice(`Пресет «${preset.label}» применён к выбранной секции`);
  }

  function addShelfToActiveSection() {
    if (!activeSection) return;
    setSectionShelves(activeSection.id, Math.min(12, getSectionItemCount(activeSection, "shelf") + 1));
    setNotice("Полка добавлена в выбранную секцию");
  }

  function addDrawerToActiveSection() {
    if (!activeSection) return;
    setSectionDrawers(activeSection.id, Math.min(6, getSectionItemCount(activeSection, "drawer") + 1));
    setNotice("Ящик добавлен в выбранную секцию");
  }

  function toggleRailInActiveSection() {
    if (!activeSection) return;
    const nextValue = getSectionItemCount(activeSection, "hanger_rail") > 0 ? 0 : 1;
    setSectionHangerRails(activeSection.id, nextValue);
    setNotice(nextValue ? "Штанга добавлена" : "Штанга убрана");
  }

  function clearActiveSection() {
    if (!activeSection) return;
    setSectionShelves(activeSection.id, 0);
    setSectionDrawers(activeSection.id, 0);
    setSectionHangerRails(activeSection.id, 0);
    setNotice("Выбранная секция очищена");
  }

  function resetConstructor() {
    resetConfig();
    setActiveSectionId(config.sections[0]?.id || null);
    setPanelTab("params");
    setViewMode("3D");
    setViewType("front");
    setZoom(1);
    setNotice("Конструктор сброшен до базовой конфигурации");
  }

  function saveDraft() {
    const draft = {
      config,
      price,
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem("razmerno_constructor_draft", JSON.stringify(draft));
    setNotice("Проект сохранён в этом браузере");
  }

  function createOrder() {
    saveDraft();
    navigate("/account/order");
  }

  function handleMiniMapDrop(sectionId) {
    if (!dragSectionId || dragSectionId === sectionId) return;
    setActiveSectionId(sectionId);
    setNotice("Секция выбрана через мини-карту. Перестановку секций подключим на этапе логики backend.");
    setDragSectionId(null);
  }

  function renderDimensionControl(label, key) {
    const limits = DIMENSION_LIMITS[key];

    return (
      <div key={key} className="cst-dimension-control">
        
        <div className="cst-inline-counter">
          <button
            type="button"
            className="cst-counter-button"
            onClick={() => updateDimensionByStep(key, -1)}
          >
            −
          </button>
          <input
  type="number"
  min={limits.min}
  max={limits.max}
  step={1}
  value={config.dimensions[key]}
  onChange={(event) => setDimensionValue(key, event.target.value)}
/>
          <button
            type="button"
            className="cst-counter-button"
            onClick={() => updateDimensionByStep(key, 1)}
          >
            +
          </button>
        </div>
      </div>
    );
  }

  function renderMiniMap() {
    return (
      <div className="cst-mini-map" aria-label="Мини-карта шкафа">
        <div className="cst-mini-map-head">
          <span>Мини-карта</span>
          <small>{sectionCount} секц.</small>
        </div>
        <div className="cst-mini-map-grid" style={{ gridTemplateColumns: `repeat(${sectionCount}, minmax(22px, 1fr))` }}>
          {config.sections.map((section, index) => {
            const isActive = activeSection?.id === section.id;
            const sectionShelves = getSectionItemCount(section, "shelf");
            const sectionDrawers = getSectionItemCount(section, "drawer");
            const sectionRails = getSectionItemCount(section, "hanger_rail");
            const isEmpty = sectionShelves + sectionDrawers + sectionRails === 0;

            return (
              <button
                key={section.id}
                type="button"
                draggable
                className={`cst-mini-map-section ${isActive ? "active" : ""} ${isEmpty ? "empty" : ""}`}
                onClick={() => selectSection(section.id)}
                onDragStart={() => setDragSectionId(section.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleMiniMapDrop(section.id)}
                title={`Секция ${index + 1}`}
              >
                <span>{index + 1}</span>
                <i />
              </button>
            );
          })}
        </div>
      </div>
    );
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

                <div className="cst-dimensions-grid">
                  {renderDimensionControl("Высота", "height")}
                  {renderDimensionControl("Ширина", "width")}
                  {renderDimensionControl("Глубина", "depth")}
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

                  
                </div>

                <div className="cst-panel-actions">
                  <button type="button" className="cst-secondary-action" onClick={() => setPanelTab("fill")}>
                    Перейти к наполнению
                  </button>
                  <button type="button" className="cst-ghost-action" onClick={resetConstructor}>
                    Сбросить
                  </button>
                </div>
              </div>
            )}

            {panelTab === "fill" && activeSection && (
              <div className="cst-card cst-panel-card">
                <div className="cst-panel-head">
                  <div className="cst-small-label">Наполнение</div>
                  <h2 className="cst-panel-title">{activeSection.name || "Выбранная секция"}</h2>
                </div>

                <div className="cst-section-chip-row">
                  {config.sections.map((section, index) => (
                    <button
                      key={section.id}
                      type="button"
                      draggable
                      className={`cst-mini-section-chip ${activeSection.id === section.id ? "active" : ""}`}
                      onClick={() => setActiveSectionId(section.id)}
                      onDragStart={() => setDragSectionId(section.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleMiniMapDrop(section.id)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                {hasEmptyActiveSection ? (
                  <div className="cst-empty-state">
                    <strong>Секция пока пустая</strong>
                    <span>Выберите пресет ниже или добавьте полку, ящик, штангу быстрыми кнопками.</span>
                  </div>
                ) : null}

                <div className="cst-preset-grid" aria-label="Быстрые пресеты наполнения">
                  {FILL_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className="cst-preset-card"
                      onClick={() => applyFillPreset(preset)}
                    >
                      <span className="cst-preset-icon" aria-hidden="true" />
                      <span className="cst-preset-text">
                        <strong>{preset.label}</strong>
                        <small>{preset.description}</small>
                      </span>
                    </button>
                  ))}
                </div>

                <div className="cst-control-row">
                  <div className="cst-counter-block">
                    <span>Полки</span>
                    <div className="cst-counter">
                      <button
                        type="button"
                        className="cst-counter-button"
                        onClick={() =>
                          setSectionShelves(activeSection.id, Math.max(0, getSectionItemCount(activeSection, "shelf") - 1))
                        }
                      >
                        −
                      </button>
                      <span className="cst-counter-value">{getSectionItemCount(activeSection, "shelf")}</span>
                      <button
                        type="button"
                        className="cst-counter-button"
                        onClick={addShelfToActiveSection}
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
                          setSectionDrawers(activeSection.id, Math.max(0, getSectionItemCount(activeSection, "drawer") - 1))
                        }
                      >
                        −
                      </button>
                      <span className="cst-counter-value">{getSectionItemCount(activeSection, "drawer")}</span>
                      <button
                        type="button"
                        className="cst-counter-button"
                        onClick={addDrawerToActiveSection}
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
                          setSectionHangerRails(activeSection.id, Math.max(0, getSectionItemCount(activeSection, "hanger_rail") - 1))
                        }
                      >
                        −
                      </button>
                      <span className="cst-counter-value">{getSectionItemCount(activeSection, "hanger_rail")}</span>
                      <button
                        type="button"
                        className="cst-counter-button"
                        onClick={toggleRailInActiveSection}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cst-toggle-group">
                    <button
                      type="button"
                      className={`cst-toggle-btn ${config.options.hasLegs ? "active" : ""}`}
                      onClick={() => toggleLegs(!config.options.hasLegs)}
                    >
                      Ножки
                    </button>
                    <button
                      type="button"
                      className={`cst-toggle-btn ${showHandles ? "active" : ""}`}
                      onClick={() => toggleHandles(!showHandles)}
                    >
                      Ручки
                    </button>
                  </div>
                </div>

                <div className={`cst-card-section ${!showHandles ? "is-disabled" : ""}`}>
                  <div className="cst-card-head">Вариант ручки</div>
                  <div className="cst-section-controls">
                    {handleOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        disabled={!showHandles}
                        className={`cst-option-card ${config.facade.handleVariant === option.id ? "active" : ""}`}
                        onClick={() => setHandleVariant(option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="cst-panel-actions">
                  <button type="button" className="cst-secondary-action" onClick={() => setPanelTab("materials")}>
                    Выбрать материалы
                  </button>
                  <button type="button" className="cst-ghost-action" onClick={clearActiveSection}>
                    Очистить секцию
                  </button>
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
                      <span className="cst-material-swatch cst-material-swatch-small" style={{ background: bodyMaterial?.color || "#ccc" }} />
                      <div className="cst-material-block-text">
                        <div className="cst-material-block-title">{bodyMaterialName}</div>
                        <div className="cst-material-block-sub">ЛДСП 16 мм</div>
                      </div>
                    </div>
                    <button type="button" className="cst-material-change-btn" onClick={() => setMaterialDrawerOpen("body")}>
                      Изменить
                    </button>
                  </div>

                  <div className="cst-material-block">
                    <div className="cst-material-block-head">
                      <span className="cst-material-swatch cst-material-swatch-small" style={{ background: facadeMaterial?.color || "#ccc" }} />
                      <div className="cst-material-block-text">
                        <div className="cst-material-block-title">{facadeMaterialName}</div>
                        <div className="cst-material-block-sub">МДФ / ЛДСП</div>
                      </div>
                    </div>
                    <button type="button" className="cst-material-change-btn" onClick={() => setMaterialDrawerOpen("facade")}>
                      Изменить
                    </button>
                  </div>

                  <div className="cst-material-block">
                    <div className="cst-material-block-head">
                      <div className="cst-material-block-text">
                        <div className="cst-material-block-title">{config.options.hardwareBrand || "Hettich"}</div>
                        <div className="cst-material-block-sub">петли и направляющие</div>
                      </div>
                    </div>
                    <button type="button" className="cst-material-change-btn" onClick={() => setMaterialDrawerOpen("hardware")}>
                      Изменить
                    </button>
                  </div>
                </div>

                <div className="cst-panel-actions">
                  <button type="button" className="cst-secondary-action" onClick={saveDraft}>
                    Сохранить проект
                  </button>
                  <button type="button" className="cst-ghost-action" onClick={() => setPanelTab("params")}>
                    К размерам
                  </button>
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
                    { id: "free", label: "СВОБОДНО" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`cst-view-pill ${viewType === option.id ? "active" : ""}`}
                      onClick={() => setViewType(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="cst-view-actions">
                  <button type="button" className={`cst-view-mode-btn ${viewMode === "3D" ? "active" : ""}`} onClick={() => setViewMode("3D")}>
                    3D
                  </button>
                  <button type="button" className={`cst-view-mode-btn ${viewMode === "2D" ? "active" : ""}`} onClick={() => setViewMode("2D")}>
                    2D
                  </button>
                </div>
              </div>

              <div className="cst-view-stage">
                {!isViewerReady ? <div className="cst-view-skeleton" aria-hidden="true" /> : null}
                <div className="cst-floating-hint">
                  <strong>{viewMode === "2D" ? "Blueprint режим" : "Интерактивная секция"}</strong>
                  <span>{viewMode === "2D" ? "Белый фон, сетка и технические контуры" : "Нажмите на секцию, чтобы настроить наполнение"}</span>
                </div>
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
                <div className="cst-section-quick-actions">
                  <button type="button" onClick={addShelfToActiveSection}>+ полка</button>
                  <button type="button" onClick={addDrawerToActiveSection}>+ ящик</button>
                  <button type="button" onClick={toggleRailInActiveSection}>штанга</button>
                  <button type="button" onClick={clearActiveSection}>очистить</button>
                </div>
                {renderMiniMap()}
              </div>

              <div className="cst-view-footer">
                <div className="cst-view-hotspot">
                  <span>Рост человека</span>
                  <div className="cst-counter">
                    <button type="button" className="cst-counter-button" onClick={() => updateHumanHeight(-10)}>−</button>
                    <span className="cst-counter-value">{Math.round(humanHeight / 10)} см</span>
                    <button type="button" className="cst-counter-button" onClick={() => updateHumanHeight(10)}>+</button>
                  </div>
                </div>

                <div className="cst-view-zoom">
                  <button type="button" className="cst-counter-button" onClick={() => updateZoom(-0.1)}>−</button>
                  <span className="cst-zoom-value">{Math.round(zoom * 100)}%</span>
                  <button type="button" className="cst-counter-button" onClick={() => updateZoom(0.1)}>
                    <Icon name="plus" size={16} />
                  </button>
                </div>
              </div>
            </div>
          </main>

          <aside className="cst-right-panel">
            <div className={`cst-card cst-summary-card ${pricePulse ? "is-price-updated" : ""}`}>
              <div className="cst-summary-label">Итого</div>
              <div className="cst-summary-price">{price.toLocaleString("ru-RU")} ₽</div>
              <div className="cst-summary-save">Экономия до {savings.toLocaleString("ru-RU")} ₽</div>
              <div className="cst-summary-meta">
                <Icon name="clock" size={16} />
                <span>Срок изготовления 10–14 дней</span>
              </div>

              <div className="cst-summary-breakdown">
                <div className="cst-summary-line">
                  <span>Размеры</span>
                  <strong>{config.dimensions.width}×{config.dimensions.height}×{config.dimensions.depth}</strong>
                </div>
                <div className="cst-summary-line">
                  <span>Корпус: {bodyMaterialName}</span>
                  <strong>{config.sections.length} секц.</strong>
                </div>
                <div className="cst-summary-line">
                  <span>Фасад: {facadeMaterialName}</span>
                  <strong>{config.options.hardwareBrand}</strong>
                </div>
                <div className="cst-summary-line"><span>Ящики</span><strong>{totals.drawerCount}</strong></div>
                <div className="cst-summary-line"><span>Полки</span><strong>{totals.shelfCount}</strong></div>
                <div className="cst-summary-line"><span>Рейлинги</span><strong>{totals.hangerCount}</strong></div>
              </div>

              {notice ? <div className="cst-notice">{notice}</div> : null}

              <button className="cst-button-primary" type="button" onClick={createOrder}>
                Создать
              </button>
              <button className="cst-summary-link" type="button" onClick={saveDraft}>
                Сохранить проект
              </button>
            </div>
          </aside>
        </div>
      </div>

      {materialDrawerOpen && (
        <>
          <div className="cst-drawer-overlay" onClick={() => setMaterialDrawerOpen(null)} />
          <div className="cst-material-drawer">
            <div className="cst-drawer-header">
              <h3>
                {materialDrawerOpen === "body" && "Материал корпуса"}
                {materialDrawerOpen === "facade" && "Материал фасадов"}
                {materialDrawerOpen === "hardware" && "Фурнитура"}
              </h3>
              <button type="button" className="cst-drawer-close" onClick={() => setMaterialDrawerOpen(null)}>✕</button>
            </div>

            <div className="cst-drawer-content">
              {materialDrawerOpen === "body" && (
                <div className="cst-drawer-grid">
                  {bodyMaterialOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`cst-material-option ${config.materials.bodyMaterialId === option.id ? "active" : ""}`}
                      onClick={() => {
                        setBodyMaterial(option.id);
                        setMaterialDrawerOpen(null);
                      }}
                    >
                      <span className="cst-material-swatch" style={{ background: option.color }} />
                      <div>
                        <div className="cst-material-name">{option.name}</div>
                        <div className="cst-material-sub">{option.subtitle}</div>
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
                      className={`cst-material-option ${config.materials.facadeMaterialId === option.id ? "active" : ""}`}
                      onClick={() => {
                        setFacadeMaterial(option.id);
                        setMaterialDrawerOpen(null);
                      }}
                    >
                      <span className="cst-material-swatch" style={{ background: option.color }} />
                      <div>
                        <div className="cst-material-name">{option.name}</div>
                        <div className="cst-material-sub">{option.subtitle}</div>
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
                      className={`cst-hardware-option ${config.options.hardwareBrand === option.id ? "active" : ""}`}
                      onClick={() => {
                        setHardwareBrand(option.id);
                        setMaterialDrawerOpen(null);
                      }}
                    >
                      <div className="cst-hardware-name">{option.label}</div>
                      <div className="cst-hardware-desc">
                        {option.label === "Hettich" && "Премиальная фурнитура"}
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
