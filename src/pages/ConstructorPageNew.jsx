import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import PremiumCabinetViewer from "../constructor/PremiumCabinetViewer";
import ConstructorProgressPanel from "../constructor/components/ConstructorProgressPanel";
import FillCounter from "../constructor/components/FillCounter";
import FillStep from "../constructor/components/FillStep";
import MaterialDrawer from "../constructor/components/MaterialDrawer";
import MaterialStep from "../constructor/components/MaterialStep";
import SizeStep from "../constructor/components/SizeStep";
import SummaryPanel from "../constructor/components/SummaryPanel";
import { clamp, getItemCount } from "../constructor/utils/constructorUiUtils";
import { useCabinetStore } from "../store/cabinetStore";
import {
  bodyMaterialOptions,
  facadeMaterialOptions,
  handleOptions,
} from "../data/constructorOptions";
import "../styles/constructor-premium.css";
import "../styles/constructor-mobile-action-bar.css";
import "../styles/constructor-desktop-polish.css";
import "../styles/constructor-fill-step-polish.css";
import "../styles/constructor-material-step-polish.css";
import "../styles/constructor-summary-polish.css";

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
  const [pricePulse, setPricePulse] = useState(false);

  const {
    config,
    validation,
    result,
    updateDimensions,
    addSection,
    removeSection,
    autoDistributeSections,
    resizeSectionPair,
    setSectionShelves,
    setSectionDrawers,
    setSectionHangerRails,
    setBodyMaterial,
    setFacadeMaterial,
    setHardwareBrand,
    toggleLegs,
    toggleBackPanel,
    toggleWallMount,
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

  useEffect(() => {
    setPricePulse(true);
    const timer = window.setTimeout(() => setPricePulse(false), 220);
    return () => window.clearTimeout(timer);
  }, [price]);

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

  function updateDraftValue(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
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

  function resetViewerView() {
    setViewType("front");
    setViewMode("3D");
    setZoom(1);
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

        <ConstructorProgressPanel
          activeStep={activeStep}
          onStepChange={setActiveStep}
          config={config}
          totals={totals}
          price={price}
        />

        <section className="cp-workspace">
          <aside className="cp-config">
            {activeStep === "size" && (
              <SizeStep
                dimensionLimits={DIMENSION_LIMITS}
                draft={draft}
                sectionCount={sectionCount}
                autoSectionWidth={autoSectionWidth}
                sections={config.sections}
                activeSectionId={activeSection?.id}
                onDraftChange={updateDraftValue}
                onCommitDimension={commitDimension}
                onStepDimension={stepDimension}
                onSetSectionCount={setSectionCount}
                onSelectSection={selectSection}
              />
            )}

            {activeStep === "fill" && activeSection && (
              <FillStep
                config={config}
                activeSection={activeSection}
                activeSectionIsEmpty={activeSectionIsEmpty}
                fillPresets={FILL_PRESETS}
                showHandles={showHandles}
                handleOptions={handleOptions}
                getItemCount={getItemCount}
                onSelectSection={setActiveSectionId}
                onApplyPreset={applyPreset}
                onSetSectionShelves={setSectionShelves}
                onSetSectionDrawers={setSectionDrawers}
                onSetSectionHangerRails={setSectionHangerRails}
                onAddShelf={addShelfToActiveSection}
                onAddDrawer={addDrawerToActiveSection}
                onToggleRail={toggleRailInActiveSection}
                onToggleLegs={toggleLegs}
                onToggleHandles={toggleHandles}
                onSetHandleVariant={setHandleVariant}
              />
            )}

            {activeStep === "materials" && (
              <MaterialStep
                bodyName={bodyName}
                bodyColor={bodyMaterial?.color}
                facadeName={facadeName}
                facadeColor={facadeMaterial?.color}
                hardwareName={config.options.hardwareBrand || "Hettich"}
                onSelectBody={() => setDrawerType("body")}
                onSelectFacade={() => setDrawerType("facade")}
                onSelectHardware={() => setDrawerType("hardware")}
              />
            )}
          </aside>

          <section className="cp-viewer-card">
            <div className="cp-viewer-toolbar cp-viewer-toolbar-simple">
              <div className="cp-viewer-title">
                <span>Визуализация</span>
                <strong>Смотрите модель сразу после каждого изменения</strong>
              </div>
              <div className="cp-viewer-actions">
                <button type="button" className={viewMode === "3D" ? "active" : ""} onClick={() => setViewMode("3D")}>3D</button>
                <button type="button" className={viewMode === "2D" ? "active" : ""} onClick={() => setViewMode("2D")}>2D</button>
                <button type="button" onClick={resetViewerView}>Авто</button>
                <button type="button" aria-label="Уменьшить масштаб" onClick={() => setZoom(clamp(Number((zoom - 0.1).toFixed(2)), 0.7, 1.5))}>−</button>
                <button type="button" aria-label="Увеличить масштаб" onClick={() => setZoom(clamp(Number((zoom + 0.1).toFixed(2)), 0.7, 1.5))}>+</button>
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
                onResizeSectionPair={resizeSectionPair}
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

          <SummaryPanel
            config={config}
            validation={validation}
            result={result}
            totals={totals}
            price={price}
            sectionCount={sectionCount}
            pricePulse={pricePulse}
            notice={notice}
            onBackPanel={toggleBackPanel}
            onWallMount={toggleWallMount}
            onSaveDraft={saveDraft}
            onOrder={() => navigate("/account/order")}
            onExport={() => setNotice("Экспорт чертежей подключим после стабилизации деталировки")}
          />
        </section>

        <div className={`cp-mobile-bar ${pricePulse ? "is-price-updated" : ""}`}>
          <div className="cp-mobile-bar-price">
            <span>Стоимость</span>
            <strong>{price.toLocaleString("ru-RU")} ₽</strong>
            <small>{config.dimensions.width} × {config.dimensions.height} × {config.dimensions.depth} мм</small>
          </div>

          <div className="cp-mobile-bar-actions">
            <button type="button" onClick={saveDraft} aria-label="Сохранить">♡</button>
            <button type="button" onClick={() => navigate("/account/order")}>В корзину</button>
          </div>
        </div>
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
