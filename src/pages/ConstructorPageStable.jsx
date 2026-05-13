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
  height: { label: "Высота", min: 200, max: 2800 },
  width: { label: "Ширина", min: 200, max: 3600 },
  depth: { label: "Глубина", min: 200, max: 900 },
};

const FILL_PRESETS = [
  { id: "shelves", label: "Полки", description: "4 полки для хранения", shelves: 4, drawers: 0, rails: 0 },
  { id: "wardrobe", label: "Гардероб", description: "полка и штанга", shelves: 1, drawers: 0, rails: 1 },
  { id: "drawers", label: "Ящики снизу", description: "3 ящика + 2 полки", shelves: 2, drawers: 3, rails: 0 },
  { id: "mixed", label: "Комбо", description: "полки, ящики и штанга", shelves: 2, drawers: 2, rails: 1 },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getSectionItemCount(section, type) {
  return section?.items?.find((item) => item.type === type)?.count || 0;
}

export default function ConstructorPageStable() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("3D");
  const [viewType, setViewType] = useState("front");
  const [panelTab, setPanelTab] = useState("params");
  const [zoom, setZoom] = useState(1);
  const [humanHeight, setHumanHeight] = useState(1750);
  const [materialDrawerOpen, setMaterialDrawerOpen] = useState(null);
  const [notice, setNotice] = useState("");
  const [activeSectionId, setActiveSectionId] = useState(null);
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

  const [dimensionDraft, setDimensionDraft] = useState(() => ({
    height: String(config.dimensions.height),
    width: String(config.dimensions.width),
    depth: String(config.dimensions.depth),
  }));

  const sectionCount = config.sections.length;
  const price = result.price?.total ?? 0;
  const savings = Math.max(0, Math.round(price * 0.12));

  const activeSection =
    config.sections.find((section) => section.id === activeSectionId) || config.sections[0];

  const bodyMaterial = bodyMaterialOptions.find((item) => item.id === config.materials.bodyMaterialId);
  const facadeMaterial = facadeMaterialOptions.find((item) => item.id === config.materials.facadeMaterialId);
  const bodyMaterialName = bodyMaterial?.name || "ЛДСП";
  const facadeMaterialName = facadeMaterial?.name || "МДФ";
  const showHandles = config.facade.enabled && config.facade.openingType === "with_handles";

  useEffect(() => {
    if (!activeSectionId && config.sections[0]?.id) {
      setActiveSectionId(config.sections[0].id);
    }
  }, [activeSectionId, config.sections]);

  useEffect(() => {
    setDimensionDraft({
      height: String(config.dimensions.height),
      width: String(config.dimensions.width),
      depth: String(config.dimensions.depth),
    });
  }, [config.dimensions.height, config.dimensions.width, config.dimensions.depth]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsViewerReady(true), 350);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setPricePulse(true);
    const timer = window.setTimeout(() => setPricePulse(false), 450);
    return () => window.clearTimeout(timer);
  }, [price]);

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

  const hasEmptyActiveSection =
    activeSection &&
    getSectionItemCount(activeSection, "shelf") === 0 &&
    getSectionItemCount(activeSection, "drawer") === 0 &&
    getSectionItemCount(activeSection, "hanger_rail") === 0;

  function commitDimension(key, rawValue) {
    const limits = DIMENSION_LIMITS[key];
    const numericValue = Number(rawValue);
    const safeValue = Number.isFinite(numericValue)
      ? clamp(Math.round(numericValue), limits.min, limits.max)
      : limits.min;

    updateDimensions(key, safeValue);
    setDimensionDraft((prev) => ({ ...prev, [key]: String(safeValue) }));
  }

  function updateDimensionByStep(key, delta) {
    const limits = DIMENSION_LIMITS[key];
    const nextValue = clamp((Number(config.dimensions[key]) || limits.min) + delta, limits.min, limits.max);
    updateDimensions(key, nextValue);
    setDimensionDraft((prev) => ({ ...prev, [key]: String(nextValue) }));
  }

  function setSectionCount(nextCount) {
    const safeCount = clamp(nextCount, 1, 6);
    if (safeCount === sectionCount) return;

    if (safeCount > sectionCount) {
      for (let index = sectionCount; index < safeCount; index += 1) addSection();
    } else {
      config.sections.slice(safeCount).forEach((section) => removeSection(section.id));
      const activeWillRemain = config.sections.slice(0, safeCount).some((section) => section.id === activeSectionId);
      if (!activeWillRemain) setActiveSectionId(config.sections[0]?.id || null);
    }

    autoDistributeSections();
    setNotice(`Количество секций: ${safeCount}`);
  }

  function selectSection(sectionId) {
    setActiveSectionId(sectionId);
    setPanelTab("fill");
  }

  function updateZoom(delta) {
    setZoom((prev) => clamp(Number((prev + delta).toFixed(2)), 0.7, 1.5));
  }

  function updateHumanHeight(delta) {
    setHumanHeight((prev) => clamp(prev + delta, 1000, 2150));
  }

  function applyFillPreset(preset) {
    if (!activeSection) return;
    setSectionShelves(activeSection.id, preset.shelves);
    setSectionDrawers(activeSection.id, preset.drawers);
    setSectionHangerRails(activeSection.id, preset.rails);
    setNotice(`Пресет «${preset.label}» применён`);
  }

  function addShelfToActiveSection() {
    if (!activeSection) return;
    setSectionShelves(activeSection.id, Math.min(12, getSectionItemCount(activeSection, "shelf") + 1));
    setNotice("Полка добавлена");
  }

  function addDrawerToActiveSection() {
    if (!activeSection) return;
    setSectionDrawers(activeSection.id, Math.min(6, getSectionItemCount(activeSection, "drawer") + 1));
    setNotice("Ящик добавлен");
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
    setNotice("Секция очищена");
  }

  function resetConstructor() {
    resetConfig();
    setActiveSectionId(null);
    setPanelTab("params");
    setViewMode("3D");
    setViewType("front");
    setZoom(1);
    setNotice("Конструктор сброшен");
  }

  function saveDraft() {
    window.localStorage.setItem(
      "razmerno_constructor_draft",
      JSON.stringify({ config, price, updatedAt: new Date().toISOString() })
    );
    setNotice("Проект сохранён");
  }

  function createOrder() {
    saveDraft();
    navigate("/account/order");
  }

  function renderDimensionControl(key) {
    const limits = DIMENSION_LIMITS[key];
    return (
      <div key={key} className="cst-dimension-control">
        <div className="cst-dimension-label">
          <span className="cst-dimension-label-title">{limits.label}, мм</span>
          <span className="cst-dimension-label-range">{limits.min}–{limits.max}</span>
        </div>

        <div className="cst-inline-counter">
          <button type="button" className="cst-counter-button" onClick={() => updateDimensionByStep(key, -1)}>−</button>
          <input
            type="number"
            inputMode="numeric"
            min={limits.min}
            max={limits.max}
            step={1}
            value={dimensionDraft[key]}
            onChange={(event) => setDimensionDraft((prev) => ({ ...prev, [key]: event.target.value }))}
            onBlur={(event) => commitDimension(key, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
          />
          <button type="button" className="cst-counter-button" onClick={() => updateDimensionByStep(key, 1)}>+</button>
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
              {[
                { id: "params", label: "Параметры" },
                { id: "fill", label: "Наполнение" },
                { id: "materials", label: "Материалы" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`cst-tab-btn ${panelTab === tab.id ? "active" : ""}`}
                  onClick={() => setPanelTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {panelTab === "params" && (
              <div className="cst-card cst-panel-card">
                <div className="cst-panel-head">
                  <div className="cst-small-label">Параметры</div>
                  <h2 className="cst-panel-title">Размеры и секции</h2>
                </div>

                <div className="cst-dimensions-grid">
                  {renderDimensionControl("height")}
                  {renderDimensionControl("width")}
                  {renderDimensionControl("depth")}
                </div>

                <div className="cst-card-section cst-card-section--compact">
                  <div className="cst-card-head">Секции</div>
                  <div className="cst-counter-block cst-counter-block--wide">
                    <span>Количество секций</span>
                    <div className="cst-counter cst-counter--large">
                      <button type="button" className="cst-counter-button" onClick={() => setSectionCount(sectionCount - 1)}>−</button>
                      <span className="cst-counter-value cst-counter-value--large">{sectionCount}</span>
                      <button type="button" className="cst-counter-button" onClick={() => setSectionCount(sectionCount + 1)}>+</button>
                    </div>
                  </div>
                </div>

                <div className="cst-panel-actions">
                  <button type="button" className="cst-secondary-action" onClick={() => setPanelTab("fill")}>Перейти к наполнению</button>
                  <button type="button" className="cst-ghost-action" onClick={resetConstructor}>Сбросить</button>
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
                      className={`cst-mini-section-chip ${activeSection.id === section.id ? "active" : ""}`}
                      onClick={() => setActiveSectionId(section.id)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                {hasEmptyActiveSection ? (
                  <div className="cst-empty-state">
                    <strong>Секция пока пустая</strong>
                    <span>Выберите пресет или добавьте элементы вручную.</span>
                  </div>
                ) : null}

                <div className="cst-preset-grid" aria-label="Быстрые пресеты наполнения">
                  {FILL_PRESETS.map((preset) => (
                    <button key={preset.id} type="button" className="cst-preset-card" onClick={() => applyFillPreset(preset)}>
                      <span className="cst-preset-icon" aria-hidden="true" />
                      <span className="cst-preset-text">
                        <strong>{preset.label}</strong>
                        <small>{preset.description}</small>
                      </span>
                    </button>
                  ))}
                </div>

                <div className="cst-control-row">
                  <CounterBlock label="Полки" value={getSectionItemCount(activeSection, "shelf")} onMinus={() => setSectionShelves(activeSection.id, Math.max(0, getSectionItemCount(activeSection, "shelf") - 1))} onPlus={addShelfToActiveSection} />
                  <CounterBlock label="Ящики" value={getSectionItemCount(activeSection, "drawer")} onMinus={() => setSectionDrawers(activeSection.id, Math.max(0, getSectionItemCount(activeSection, "drawer") - 1))} onPlus={addDrawerToActiveSection} />
                </div>

                <div className="cst-control-row">
                  <CounterBlock label="Штанга" value={getSectionItemCount(activeSection, "hanger_rail")} onMinus={() => setSectionHangerRails(activeSection.id, Math.max(0, getSectionItemCount(activeSection, "hanger_rail") - 1))} onPlus={toggleRailInActiveSection} />
                  <div className="cst-toggle-group">
                    <button type="button" className={`cst-toggle-btn ${config.options.hasLegs ? "active" : ""}`} onClick={() => toggleLegs(!config.options.hasLegs)}>Ножки</button>
                    <button type="button" className={`cst-toggle-btn ${showHandles ? "active" : ""}`} onClick={() => toggleHandles(!showHandles)}>Ручки</button>
                  </div>
                </div>

                <div className={`cst-card-section ${!showHandles ? "is-disabled" : ""}`}>
                  <div className="cst-card-head">Вариант ручки</div>
                  <div className="cst-section-controls">
                    {handleOptions.map((option) => (
                      <button key={option.id} type="button" disabled={!showHandles} className={`cst-option-card ${config.facade.handleVariant === option.id ? "active" : ""}`} onClick={() => setHandleVariant(option.id)}>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="cst-panel-actions">
                  <button type="button" className="cst-secondary-action" onClick={() => setPanelTab("materials")}>Выбрать материалы</button>
                  <button type="button" className="cst-ghost-action" onClick={clearActiveSection}>Очистить секцию</button>
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
                  <MaterialBlock title={bodyMaterialName} subtitle="Корпус · ЛДСП 16 мм" color={bodyMaterial?.color} onClick={() => setMaterialDrawerOpen("body")} />
                  <MaterialBlock title={facadeMaterialName} subtitle="Фасады · МДФ / ЛДСП" color={facadeMaterial?.color} onClick={() => setMaterialDrawerOpen("facade")} />
                  <MaterialBlock title={config.options.hardwareBrand || "Hettich"} subtitle="петли и направляющие" onClick={() => setMaterialDrawerOpen("hardware")} />
                </div>

                <div className="cst-panel-actions">
                  <button type="button" className="cst-secondary-action" onClick={saveDraft}>Сохранить проект</button>
                  <button type="button" className="cst-ghost-action" onClick={() => setPanelTab("params")}>К размерам</button>
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
                    <button key={option.id} type="button" className={`cst-view-pill ${viewType === option.id ? "active" : ""}`} onClick={() => setViewType(option.id)}>
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="cst-view-actions">
                  <button type="button" className={`cst-view-mode-btn ${viewMode === "3D" ? "active" : ""}`} onClick={() => setViewMode("3D")}>3D</button>
                  <button type="button" className={`cst-view-mode-btn ${viewMode === "2D" ? "active" : ""}`} onClick={() => setViewMode("2D")}>2D</button>
                </div>
              </div>

              <div className="cst-view-stage">
                {!isViewerReady ? <div className="cst-view-skeleton" aria-hidden="true" /> : null}
                <div className="cst-floating-hint">
                  <strong>{viewMode === "2D" ? "Blueprint режим" : "Интерактивная секция"}</strong>
                  <span>{viewMode === "2D" ? "Упрощенный чертежный вид" : "Нажмите на секцию, чтобы настроить наполнение"}</span>
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
                  <button type="button" className="cst-counter-button" onClick={() => updateZoom(0.1)}><Icon name="plus" size={16} /></button>
                </div>
              </div>
            </div>
          </main>

          <aside className="cst-right-panel">
            <div className={`cst-card cst-summary-card ${pricePulse ? "is-price-updated" : ""}`}>
              <div className="cst-summary-label">Итого</div>
              <div className="cst-summary-price">{price.toLocaleString("ru-RU")} ₽</div>
              <div className="cst-summary-save">Экономия до {savings.toLocaleString("ru-RU")} ₽</div>
              <div className="cst-summary-meta"><Icon name="clock" size={16} /><span>Срок изготовления 10–14 дней</span></div>
              <div className="cst-summary-breakdown">
                <div className="cst-summary-line"><span>Размеры</span><strong>{config.dimensions.width}×{config.dimensions.height}×{config.dimensions.depth}</strong></div>
                <div className="cst-summary-line"><span>Корпус: {bodyMaterialName}</span><strong>{config.sections.length} секц.</strong></div>
                <div className="cst-summary-line"><span>Фасад: {facadeMaterialName}</span><strong>{config.options.hardwareBrand}</strong></div>
                <div className="cst-summary-line"><span>Ящики</span><strong>{totals.drawerCount}</strong></div>
                <div className="cst-summary-line"><span>Полки</span><strong>{totals.shelfCount}</strong></div>
                <div className="cst-summary-line"><span>Рейлинги</span><strong>{totals.hangerCount}</strong></div>
              </div>
              {notice ? <div className="cst-notice">{notice}</div> : null}
              <button className="cst-button-primary" type="button" onClick={createOrder}>В корзину</button>
              <button className="cst-summary-link" type="button" onClick={saveDraft}>Сохранить проект</button>
              <button className="cst-summary-link" type="button" onClick={() => setNotice("Скачивание чертежей подключим после стабилизации расчёта деталей")}>Скачать чертежи</button>
            </div>
          </aside>
        </div>
      </div>

      {materialDrawerOpen ? (
        <MaterialDrawer
          type={materialDrawerOpen}
          config={config}
          onClose={() => setMaterialDrawerOpen(null)}
          onBody={setBodyMaterial}
          onFacade={setFacadeMaterial}
          onHardware={setHardwareBrand}
        />
      ) : null}
    </>
  );
}

function CounterBlock({ label, value, onMinus, onPlus }) {
  return (
    <div className="cst-counter-block">
      <span>{label}</span>
      <div className="cst-counter">
        <button type="button" className="cst-counter-button" onClick={onMinus}>−</button>
        <span className="cst-counter-value">{value}</span>
        <button type="button" className="cst-counter-button" onClick={onPlus}>+</button>
      </div>
    </div>
  );
}

function MaterialBlock({ title, subtitle, color, onClick }) {
  return (
    <div className="cst-material-block">
      <div className="cst-material-block-head">
        {color ? <span className="cst-material-swatch cst-material-swatch-small" style={{ background: color }} /> : null}
        <div className="cst-material-block-text">
          <div className="cst-material-block-title">{title}</div>
          <div className="cst-material-block-sub">{subtitle}</div>
        </div>
      </div>
      <button type="button" className="cst-material-change-btn" onClick={onClick}>Изменить</button>
    </div>
  );
}

function MaterialDrawer({ type, config, onClose, onBody, onFacade, onHardware }) {
  const title = type === "body" ? "Материал корпуса" : type === "facade" ? "Материал фасадов" : "Фурнитура";
  const options = type === "body" ? bodyMaterialOptions : type === "facade" ? facadeMaterialOptions : hardwareBrandOptions;

  function isActive(option) {
    if (type === "body") return config.materials.bodyMaterialId === option.id;
    if (type === "facade") return config.materials.facadeMaterialId === option.id;
    return config.options.hardwareBrand === option.id;
  }

  function selectOption(option) {
    if (type === "body") onBody(option.id);
    if (type === "facade") onFacade(option.id);
    if (type === "hardware") onHardware(option.id);
    onClose();
  }

  return (
    <>
      <div className="cst-drawer-overlay" onClick={onClose} />
      <div className="cst-material-drawer">
        <div className="cst-drawer-header">
          <h3>{title}</h3>
          <button type="button" className="cst-drawer-close" onClick={onClose}>✕</button>
        </div>
        <div className="cst-drawer-content">
          <div className={`cst-drawer-grid ${type === "hardware" ? "cst-drawer-grid--hardware" : ""}`}>
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`${type === "hardware" ? "cst-hardware-option" : "cst-material-option"} ${isActive(option) ? "active" : ""}`}
                onClick={() => selectOption(option)}
              >
                {type !== "hardware" ? <span className="cst-material-swatch" style={{ background: option.color }} /> : null}
                <div>
                  <div className={type === "hardware" ? "cst-hardware-name" : "cst-material-name"}>{option.name || option.label}</div>
                  <div className={type === "hardware" ? "cst-hardware-desc" : "cst-material-sub"}>{option.subtitle || "петли и направляющие"}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
