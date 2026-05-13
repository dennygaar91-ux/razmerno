import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import PremiumCabinetViewer from "../constructor/PremiumCabinetViewer";
import { useCabinetStore } from "../store/cabinetStore";
import {
  bodyMaterialOptions,
  facadeMaterialOptions,
  hardwareBrandOptions,
  handleOptions,
} from "../data/constructorOptions";
import "../styles/constructor-premium.css";

const DIMENSION_LIMITS = {
  height: { label: "Высота", min: 200, max: 2800 },
  width: { label: "Ширина", min: 200, max: 3600 },
  depth: { label: "Глубина", min: 200, max: 900 },
};

const FILL_PRESETS = [
  { id: "shelves", label: "Полки", desc: "4 полки", shelves: 4, drawers: 0, rails: 0 },
  { id: "wardrobe", label: "Гардероб", desc: "полка + штанга", shelves: 1, drawers: 0, rails: 1 },
  { id: "drawers", label: "Ящики снизу", desc: "3 ящика + 2 полки", shelves: 2, drawers: 3, rails: 0 },
  { id: "mixed", label: "Комбо", desc: "полки, ящики, штанга", shelves: 2, drawers: 2, rails: 1 },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getItemCount(section, type) {
  return section?.items?.find((item) => item.type === type)?.count || 0;
}

export default function ConstructorPageNew() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState("size");
  const [viewMode, setViewMode] = useState("3D");
  const [viewType, setViewType] = useState("front");
  const [zoom, setZoom] = useState(1);
  const [humanHeight, setHumanHeight] = useState(1750);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [drawerType, setDrawerType] = useState(null);
  const [notice, setNotice] = useState("");

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

  const [draft, setDraft] = useState(() => ({
    height: String(config.dimensions.height),
    width: String(config.dimensions.width),
    depth: String(config.dimensions.depth),
  }));

  const sectionCount = config.sections.length;
  const autoSectionWidth = sectionCount > 0 ? Math.round(config.dimensions.width / sectionCount) : config.dimensions.width;
  const activeSection = config.sections.find((section) => section.id === activeSectionId) || config.sections[0];
  const price = result.price?.total ?? 0;

  const bodyMaterial = bodyMaterialOptions.find((item) => item.id === config.materials.bodyMaterialId);
  const facadeMaterial = facadeMaterialOptions.find((item) => item.id === config.materials.facadeMaterialId);
  const bodyName = bodyMaterial?.name || "ЛДСП";
  const facadeName = facadeMaterial?.name || "МДФ";
  const showHandles = config.facade.enabled && config.facade.openingType === "with_handles";

  useEffect(() => {
    if (!activeSectionId && config.sections[0]?.id) setActiveSectionId(config.sections[0].id);
  }, [activeSectionId, config.sections]);

  useEffect(() => {
    setDraft({
      height: String(config.dimensions.height),
      width: String(config.dimensions.width),
      depth: String(config.dimensions.depth),
    });
  }, [config.dimensions.height, config.dimensions.width, config.dimensions.depth]);

  const totals = useMemo(() => {
    return config.sections.reduce(
      (acc, section) => {
        acc.shelves += getItemCount(section, "shelf");
        acc.drawers += getItemCount(section, "drawer");
        acc.rails += getItemCount(section, "hanger_rail");
        return acc;
      },
      { shelves: 0, drawers: 0, rails: 0 }
    );
  }, [config.sections]);

  const activeSectionIsEmpty =
    activeSection &&
    getItemCount(activeSection, "shelf") === 0 &&
    getItemCount(activeSection, "drawer") === 0 &&
    getItemCount(activeSection, "hanger_rail") === 0;

  function commitDimension(key, value) {
    const limits = DIMENSION_LIMITS[key];
    const numeric = Number(value);
    const next = Number.isFinite(numeric) ? clamp(Math.round(numeric), limits.min, limits.max) : limits.min;
    updateDimensions(key, next);
    setDraft((prev) => ({ ...prev, [key]: String(next) }));
  }

  function stepDimension(key, delta) {
    const limits = DIMENSION_LIMITS[key];
    const next = clamp(Number(config.dimensions[key]) + delta, limits.min, limits.max);
    updateDimensions(key, next);
    setDraft((prev) => ({ ...prev, [key]: String(next) }));
  }

  function setSectionCount(nextCount) {
    const safeCount = clamp(nextCount, 1, 6);
    if (safeCount === sectionCount) return;

    if (safeCount > sectionCount) {
      for (let index = sectionCount; index < safeCount; index += 1) addSection();
    } else {
      config.sections.slice(safeCount).forEach((section) => removeSection(section.id));
    }

    autoDistributeSections();
    setNotice(`Секции перераспределены: ${safeCount}`);
  }

  function selectSection(sectionId) {
    setActiveSectionId(sectionId);
    setActiveStep("fill");
  }

  function applyPreset(preset) {
    if (!activeSection) return;
    setSectionShelves(activeSection.id, preset.shelves);
    setSectionDrawers(activeSection.id, preset.drawers);
    setSectionHangerRails(activeSection.id, preset.rails);
    setNotice(`Пресет «${preset.label}» применён`);
  }

  function addShelfToActiveSection() {
    if (!activeSection) return;
    setSectionShelves(activeSection.id, Math.min(12, getItemCount(activeSection, "shelf") + 1));
    setNotice("Полка добавлена в активную секцию");
  }

  function addDrawerToActiveSection() {
    if (!activeSection) return;
    setSectionDrawers(activeSection.id, Math.min(6, getItemCount(activeSection, "drawer") + 1));
    setNotice("Ящик добавлен в активную секцию");
  }

  function toggleRailInActiveSection() {
    if (!activeSection) return;
    const next = getItemCount(activeSection, "hanger_rail") > 0 ? 0 : 1;
    setSectionHangerRails(activeSection.id, next);
    setNotice(next ? "Штанга добавлена" : "Штанга убрана");
  }

  function clearActiveSection() {
    if (!activeSection) return;
    setSectionShelves(activeSection.id, 0);
    setSectionDrawers(activeSection.id, 0);
    setSectionHangerRails(activeSection.id, 0);
    setNotice("Активная секция очищена");
  }

  function saveDraft() {
    window.localStorage.setItem(
      "razmerno_constructor_draft",
      JSON.stringify({ config, price, updatedAt: new Date().toISOString() })
    );
    setNotice("Проект сохранён");
  }

  return (
    <>
      <Header />
      <main className="cp-page">
        <section className="cp-hero">
          <div>
            <span className="cp-eyebrow">Новый конструктор</span>
            <h1>Соберите шкаф под свой размер</h1>
            <p>Задайте габариты, выберите секции, наполнение и материалы. Цена и визуализация обновляются сразу.</p>
          </div>
          <div className="cp-hero-actions">
            <button type="button" onClick={saveDraft}>Сохранить</button>
            <button type="button" className="primary" onClick={() => navigate("/account/order")}>В корзину</button>
          </div>
        </section>

        <section className="cp-workspace">
          <aside className="cp-config">
            <div className="cp-steps">
              {[
                ["size", "Размеры"],
                ["fill", "Наполнение"],
                ["materials", "Материалы"],
              ].map(([id, label]) => (
                <button key={id} type="button" className={activeStep === id ? "active" : ""} onClick={() => setActiveStep(id)}>
                  {label}
                </button>
              ))}
            </div>

            {activeStep === "size" && (
              <div className="cp-card">
                <div className="cp-card-head">
                  <span>01</span>
                  <h2>Размеры и секции</h2>
                </div>

                <div className="cp-dimensions">
                  {Object.keys(DIMENSION_LIMITS).map((key) => {
                    const item = DIMENSION_LIMITS[key];
                    return (
                      <div className="cp-dimension" key={key}>
                        <div>
                          <strong>{item.label}, мм</strong>
                          <small>{item.min}–{item.max}</small>
                        </div>
                        <div className="cp-counter">
                          <button type="button" onClick={() => stepDimension(key, -1)}>−</button>
                          <input
                            type="number"
                            value={draft[key]}
                            onChange={(event) => setDraft((prev) => ({ ...prev, [key]: event.target.value }))}
                            onBlur={(event) => commitDimension(key, event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") event.currentTarget.blur();
                            }}
                          />
                          <button type="button" onClick={() => stepDimension(key, 1)}>+</button>
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
                    <button type="button" onClick={() => setSectionCount(sectionCount - 1)}>−</button>
                    <span>{sectionCount}</span>
                    <button type="button" onClick={() => setSectionCount(sectionCount + 1)}>+</button>
                  </div>
                </div>

                <div className="cp-section-widths">
                  <div className="cp-section-widths-head">
                    <strong>Секции шкафа</strong>
                    <small>сейчас ширина распределяется автоматически</small>
                  </div>
                  <div className="cp-section-width-grid" style={{ gridTemplateColumns: `repeat(${sectionCount}, minmax(44px, 1fr))` }}>
                    {config.sections.map((section, index) => {
                      const isActive = section.id === activeSection?.id;
                      return (
                        <button key={section.id} type="button" className={isActive ? "active" : ""} onClick={() => selectSection(section.id)}>
                          <span>{index + 1}</span>
                          <b>{autoSectionWidth} мм</b>
                          <i />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeStep === "fill" && activeSection && (
              <div className="cp-card">
                <div className="cp-card-head">
                  <span>02</span>
                  <h2>Наполнение секции</h2>
                </div>

                <div className="cp-section-tabs">
                  {config.sections.map((section, index) => (
                    <button key={section.id} type="button" className={section.id === activeSection.id ? "active" : ""} onClick={() => setActiveSectionId(section.id)}>
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
                  {FILL_PRESETS.map((preset) => (
                    <button type="button" key={preset.id} onClick={() => applyPreset(preset)}>
                      <strong>{preset.label}</strong>
                      <small>{preset.desc}</small>
                    </button>
                  ))}
                </div>

                <div className="cp-fill-grid">
                  <FillCounter label="Полки" value={getItemCount(activeSection, "shelf")} onMinus={() => setSectionShelves(activeSection.id, Math.max(0, getItemCount(activeSection, "shelf") - 1))} onPlus={addShelfToActiveSection} />
                  <FillCounter label="Ящики" value={getItemCount(activeSection, "drawer")} onMinus={() => setSectionDrawers(activeSection.id, Math.max(0, getItemCount(activeSection, "drawer") - 1))} onPlus={addDrawerToActiveSection} />
                  <FillCounter label="Штанга" value={getItemCount(activeSection, "hanger_rail")} onMinus={() => setSectionHangerRails(activeSection.id, 0)} onPlus={toggleRailInActiveSection} />
                </div>

                <div className="cp-toggles">
                  <button type="button" className={config.options.hasLegs ? "active" : ""} onClick={() => toggleLegs(!config.options.hasLegs)}>Ножки</button>
                  <button type="button" className={showHandles ? "active" : ""} onClick={() => toggleHandles(!showHandles)}>Ручки</button>
                </div>

                {showHandles ? (
                  <div className="cp-handle-options">
                    {handleOptions.map((option) => (
                      <button key={option.id} type="button" className={config.facade.handleVariant === option.id ? "active" : ""} onClick={() => setHandleVariant(option.id)}>
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {activeStep === "materials" && (
              <div className="cp-card">
                <div className="cp-card-head">
                  <span>03</span>
                  <h2>Материалы</h2>
                </div>

                <MaterialSelect title="Корпус" name={bodyName} color={bodyMaterial?.color} onClick={() => setDrawerType("body")} />
                <MaterialSelect title="Фасады" name={facadeName} color={facadeMaterial?.color} onClick={() => setDrawerType("facade")} />
                <MaterialSelect title="Фурнитура" name={config.options.hardwareBrand || "Hettich"} onClick={() => setDrawerType("hardware")} />
              </div>
            )}
          </aside>

          <section className="cp-viewer-card">
            <div className="cp-viewer-toolbar">
              <div>
                {["front", "side", "top", "free"].map((item) => (
                  <button key={item} type="button" className={viewType === item ? "active" : ""} onClick={() => setViewType(item)}>
                    {item === "front" ? "Спереди" : item === "side" ? "Сбоку" : item === "top" ? "Сверху" : "Свободно"}
                  </button>
                ))}
              </div>
              <div>
                <button type="button" className={viewMode === "3D" ? "active" : ""} onClick={() => setViewMode("3D")}>3D</button>
                <button type="button" className={viewMode === "2D" ? "active" : ""} onClick={() => setViewMode("2D")}>2D</button>
              </div>
            </div>

            <div className="cp-viewer-stage">
              <PremiumCabinetViewer
                config={config}
                viewMode={viewMode}
                viewType={viewType}
                zoom={zoom}
                userHeight={humanHeight}
                activeSectionId={activeSection?.id}
                onSectionSelect={selectSection}
              />
            </div>

            <div className="cp-viewer-tools">
              <div className="cp-quick-actions">
                <button type="button" onClick={addShelfToActiveSection}>+ полка</button>
                <button type="button" onClick={addDrawerToActiveSection}>+ ящик</button>
                <button type="button" onClick={toggleRailInActiveSection}>штанга</button>
                <button type="button" onClick={clearActiveSection}>очистить</button>
              </div>
              <div className="cp-mini-map" style={{ gridTemplateColumns: `repeat(${sectionCount}, minmax(34px, 1fr))` }}>
                {config.sections.map((section, index) => {
                  const isActive = section.id === activeSection?.id;
                  const isEmpty = getItemCount(section, "shelf") + getItemCount(section, "drawer") + getItemCount(section, "hanger_rail") === 0;
                  return (
                    <button key={section.id} type="button" className={`${isActive ? "active" : ""} ${isEmpty ? "empty" : ""}`} onClick={() => selectSection(section.id)}>
                      <span>{index + 1}</span>
                      <i />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="cp-viewer-footer">
              <FillCounter label="Рост" value={`${Math.round(humanHeight / 10)} см`} onMinus={() => setHumanHeight(clamp(humanHeight - 10, 1000, 2150))} onPlus={() => setHumanHeight(clamp(humanHeight + 10, 1000, 2150))} />
              <FillCounter label="Масштаб" value={`${Math.round(zoom * 100)}%`} onMinus={() => setZoom(clamp(Number((zoom - 0.1).toFixed(2)), 0.7, 1.5))} onPlus={() => setZoom(clamp(Number((zoom + 0.1).toFixed(2)), 0.7, 1.5))} />
            </div>
          </section>

          <aside className="cp-summary">
            <span className="cp-eyebrow">Итого</span>
            <strong>{price.toLocaleString("ru-RU")} ₽</strong>
            <small>Ориентировочная стоимость комплекта</small>
            <div className="cp-summary-list">
              <div><span>Размеры</span><b>{config.dimensions.width}×{config.dimensions.height}×{config.dimensions.depth}</b></div>
              <div><span>Секции</span><b>{sectionCount}</b></div>
              <div><span>Полки</span><b>{totals.shelves}</b></div>
              <div><span>Ящики</span><b>{totals.drawers}</b></div>
              <div><span>Штанги</span><b>{totals.rails}</b></div>
            </div>
            {notice ? <p className="cp-notice">{notice}</p> : null}
            <button type="button" className="cp-primary" onClick={() => navigate("/account/order")}>В корзину</button>
            <button type="button" onClick={saveDraft}>Сохранить проект</button>
            <button type="button" onClick={() => setNotice("Экспорт чертежей подключим после стабилизации деталировки")}>Скачать чертежи</button>
          </aside>
        </section>
      </main>

      {drawerType ? (
        <MaterialDrawer
          type={drawerType}
          config={config}
          onClose={() => setDrawerType(null)}
          onBody={setBodyMaterial}
          onFacade={setFacadeMaterial}
          onHardware={setHardwareBrand}
        />
      ) : null}
    </>
  );
}

function FillCounter({ label, value, onMinus, onPlus }) {
  return (
    <div className="cp-fill-counter">
      <span>{label}</span>
      <div>
        <button type="button" onClick={onMinus}>−</button>
        <b>{value}</b>
        <button type="button" onClick={onPlus}>+</button>
      </div>
    </div>
  );
}

function MaterialSelect({ title, name, color, onClick }) {
  return (
    <button type="button" className="cp-material-select" onClick={onClick}>
      {color ? <span style={{ background: color }} /> : <i />}
      <div>
        <small>{title}</small>
        <strong>{name}</strong>
      </div>
      <em>Изменить</em>
    </button>
  );
}

function MaterialDrawer({ type, config, onClose, onBody, onFacade, onHardware }) {
  const title = type === "body" ? "Материал корпуса" : type === "facade" ? "Материал фасадов" : "Фурнитура";
  const options = type === "body" ? bodyMaterialOptions : type === "facade" ? facadeMaterialOptions : hardwareBrandOptions;

  function active(option) {
    if (type === "body") return config.materials.bodyMaterialId === option.id;
    if (type === "facade") return config.materials.facadeMaterialId === option.id;
    return config.options.hardwareBrand === option.id;
  }

  function select(option) {
    if (type === "body") onBody(option.id);
    if (type === "facade") onFacade(option.id);
    if (type === "hardware") onHardware(option.id);
    onClose();
  }

  return (
    <>
      <div className="cp-drawer-overlay" onClick={onClose} />
      <div className="cp-drawer">
        <div className="cp-drawer-head">
          <h3>{title}</h3>
          <button type="button" onClick={onClose}>✕</button>
        </div>
        <div className="cp-drawer-grid">
          {options.map((option) => (
            <button key={option.id} type="button" className={active(option) ? "active" : ""} onClick={() => select(option)}>
              {type !== "hardware" ? <span style={{ background: option.color }} /> : null}
              <strong>{option.name || option.label}</strong>
              <small>{option.subtitle || "петли и направляющие"}</small>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
