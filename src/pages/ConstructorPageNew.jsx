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
import { DIMENSION_LIMITS, FILL_PRESETS } from "../constructor/config/constructorUiConfig";
import {
  clearConstructorDraft,
  hasConstructorDraft,
  loadConstructorDraft,
  saveConstructorDraft,
} from "../constructor/utils/constructorDraftStorage";
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
import "../styles/constructor-priority-layout.css";
import "../styles/constructor-left-panel-wizard.css";
import "../styles/constructor-summary-compact.css";
import "../styles/constructor-viewer-premium.css";
import "../styles/constructor-actions-toast.css";
import "../styles/constructor-progress-wizard.css";
import "../styles/constructor-material-drawer-premium.css";
import "../styles/constructor-mobile-polish.css";
import "../styles/constructor-final-ui-cleanup.css";
import "../styles/constructor-step-intro-polish.css";
import "../styles/constructor-fill-preset-visuals.css";
import "../styles/constructor-section-minimap.css";
import "../styles/constructor-summary-client.css";
import "../styles/constructor-client-panels.css";
import "../styles/constructor-advanced-client.css";
import "../styles/constructor-material-textures.css";
import "../styles/constructor-target-layout.css";
import "../styles/constructor-target-components.css";
import "../styles/constructor-fill-controls-premium.css";

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
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

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
    hydrateConfig,
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
    setHasSavedDraft(hasConstructorDraft());
  }, []);

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

  function showNotice(message) {
    setNotice(message);
  }

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
    showNotice(`Готово: ${safeCount} секц.`);
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
    showNotice(`Применили: ${preset.label}`);
  }

  function addShelfToActiveSection() {
    if (!activeSection) return;
    setSectionShelves(activeSection.id, Math.min(12, getItemCount(activeSection, "shelf") + 1));
    showNotice("Полка добавлена");
  }

  function addDrawerToActiveSection() {
    if (!activeSection) return;
    setSectionDrawers(activeSection.id, Math.min(6, getItemCount(activeSection, "drawer") + 1));
    showNotice("Ящик добавлен");
  }

  function toggleRailInActiveSection() {
    if (!activeSection) return;
    const next = getItemCount(activeSection, "hanger_rail") > 0 ? 0 : 1;
    setSectionHangerRails(activeSection.id, next);
    showNotice(next ? "Штанга добавлена" : "Штанга убрана");
  }

  function clearActiveSection() {
    if (!activeSection) return;
    setSectionShelves(activeSection.id, 0);
    setSectionDrawers(activeSection.id, 0);
    setSectionHangerRails(activeSection.id, 0);
    showNotice("Секция очищена");
  }

  function resetViewerView() {
    setViewType("front");
    setViewMode("3D");
    setZoom(1);
  }

  function saveDraft() {
    const saved = saveConstructorDraft({ config, price });
    if (saved) setHasSavedDraft(true);
    showNotice(saved ? "Проект сохранён" : "Не удалось сохранить");
  }

  function loadSavedDraft() {
    const savedDraft = loadConstructorDraft();

    if (!savedDraft?.config) {
      setHasSavedDraft(false);
      showNotice("Сохранённых проектов нет");
      return;
    }

    hydrateConfig(savedDraft.config);
    setActiveStep("size");
    setActiveSectionId(savedDraft.config.sections?.[0]?.id || null);
    setHasSavedDraft(true);
    showNotice("Проект загружен");
  }

  function clearSavedDraft() {
    const cleared = clearConstructorDraft();
    setHasSavedDraft(false);
    showNotice(cleared ? "Черновик удалён" : "Не удалось удалить");
  }

  return (
    <>
      <Header />
      <main className="cp-page">
        <section className="cp-hero">
          <div>
            <span className="cp-eyebrow">Онлайн-конструктор</span>
            <h1>Соберите шкаф под свой размер</h1>
            <p>Задайте размеры, выберите наполнение и материалы — модель и стоимость обновятся сразу.</p>
          </div>
          <div className="cp-hero-actions" aria-label="Действия с проектом">
            <button type="button" onClick={loadSavedDraft} disabled={!hasSavedDraft}>Загрузить</button>
            <button type="button" className="danger" onClick={clearSavedDraft} disabled={!hasSavedDraft}>Очистить</button>
            <button type="button" onClick={saveDraft}>Сохранить</button>
            <button type="button" className="primary" onClick={() => navigate("/account/order")}>В корзину</button>
          </div>
        </section>

        {notice ? (
          <div className="cp-toast" role="status" aria-live="polite">
            <span>Готово</span>
            <strong>{notice}</strong>
          </div>
        ) : null}

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
                <span>Модель</span>
                <strong>Кликайте по секциям и добавляйте наполнение снизу</strong>
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
                  const shelves = getItemCount(section, "shelf");
                  const drawers = getItemCount(section, "drawer");
                  const rails = getItemCount(section, "hanger_rail");
                  const isEmpty = shelves + drawers + rails === 0;
                  const sectionLabel = isEmpty
                    ? "Пусто"
                    : [shelves ? `${shelves}П` : "", drawers ? `${drawers}Я` : "", rails ? "Ш" : ""].filter(Boolean).join(" · ");

                  return (
                    <button
                      key={section.id}
                      type="button"
                      className={`${isActive ? "active" : ""} ${isEmpty ? "empty" : ""} ${shelves ? "has-shelves" : ""} ${drawers ? "has-drawers" : ""} ${rails ? "has-rail" : ""}`}
                      onClick={() => selectSection(section.id)}
                      aria-label={`Секция ${index + 1}: ${sectionLabel}`}
                    >
                      <span>{index + 1}</span>
                      <em>{sectionLabel}</em>
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
            onExport={() => showNotice("Чертежи появятся после финальной проверки проекта")}
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
