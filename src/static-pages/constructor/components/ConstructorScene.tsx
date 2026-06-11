import { useState } from "react";
import type { ConstructorProductionPreview } from "../adapters/productionPreviewAdapter";
import type {
  ConstructorCompartmentLayout,
  ConstructorFillingLayout,
  ConstructorSection,
  ConstructorSceneRenderMode,
  ConstructorSceneViewMode,
  ConstructorProductionSnapshotState,
  ConstructorSectionFacadeLayout,
  ConstructorValidationState,
  FillKey,
  FurnitureOption,
  MaterialToken,
  QuoteState,
  StepKey,
} from "../types";
import { ProductionDebugPreview } from "./ConstructorSceneProductionDebug";
import {
  getModelMetrics,
  getModelSections,
  getProportionLabel,
} from "./ConstructorSceneModel";
import { ConstructorSceneCanvas } from "./ConstructorSceneCanvas"; // <FillPreview composed inside. <ClientValidationCard hidden in Stage70 simplified UI.
import { ConstructorSceneRenderSwitch } from "./ConstructorSceneRenderSwitch";
import { ConstructorStepper } from "./ConstructorStepper";
import { ConstructorSceneViewSwitch } from "./ConstructorSceneViewSwitch";
import { ConstructorSceneStatusBar } from "./ConstructorSceneStatusBar";
import { ConstructorSceneWebGLStatus } from "./ConstructorSceneWebGLStatus";
import { useThreeSceneQuality } from "../three/useThreeSceneQuality";
import { useWebGLDiagnostics } from "../three/useWebGLAvailable";

function useDebugMode() {
  if (typeof window === "undefined") return false;

  try {
    const params = new URLSearchParams(window.location.search);
    return (
      params.get("debug") === "1" ||
      window.localStorage.getItem("rzmDebug") === "1"
    );
  } catch {
    return false;
  }
}

export function ConstructorScene({
  step,
  onStepChange,
  advancedEnabled,
  onAdvancedEnabledChange,
  width,
  height,
  depth,
  sections,
  sectionLayout,
  selectedSectionId,
  compartmentLayout,
  fillingLayout,
  facadeLayout,
  selectedCompartmentId,
  compartments,
  fill,
  material,
  facadeMaterial,
  selectedFurniture,
  handleless,
  shelvesCount,
  drawersCount,
  rodsCount,
  validation,
  quote,
  quoteError,
  formatPrice,
  productionPreview,
  productionSnapshot,
  isProductionPreviewLoading,
  productionPreviewError,
  sceneRenderMode,
  sceneViewMode,
  onSceneRenderModeChange,
  onSceneViewModeChange,
}: {
  step: StepKey;
  onStepChange: (step: StepKey) => void;
  advancedEnabled: boolean;
  onAdvancedEnabledChange: (enabled: boolean) => void;
  width: number;
  height: number;
  depth: number;
  sections: number;
  sectionLayout: ConstructorSection[];
  selectedSectionId: string | null;
  compartmentLayout: ConstructorCompartmentLayout;
  fillingLayout: ConstructorFillingLayout;
  facadeLayout: ConstructorSectionFacadeLayout;
  selectedCompartmentId: string | null;
  compartments: number;
  fill: FillKey;
  material: MaterialToken;
  facadeMaterial: MaterialToken;
  selectedFurniture: FurnitureOption;
  handleless: boolean;
  shelvesCount: number;
  drawersCount: number;
  rodsCount: number;
  validation: ConstructorValidationState;
  quote: QuoteState | null;
  quoteError: string;
  formatPrice: (value: number) => string;
  productionPreview: ConstructorProductionPreview | null;
  productionSnapshot: ConstructorProductionSnapshotState;
  isProductionPreviewLoading: boolean;
  productionPreviewError: string;
  sceneRenderMode: ConstructorSceneRenderMode;
  sceneViewMode: ConstructorSceneViewMode;
  onSceneRenderModeChange: (mode: ConstructorSceneRenderMode) => void;
  onSceneViewModeChange: (mode: ConstructorSceneViewMode) => void;
}) {
  const [threeFailed, setThreeFailed] = useState(false);
  const webglDiagnostics = useWebGLDiagnostics();
  const webglAvailable = webglDiagnostics.status === "available";
  const threeQuality = useThreeSceneQuality();
  const isDebugMode = useDebugMode();
  const metrics = getModelMetrics(width, height, depth);
  const model = getModelSections(sections, metrics, sectionLayout, width);
  const useThreeScene =
    sceneRenderMode === "three" && webglAvailable && !threeFailed;
  const priceState = quoteError ? "error" : quote ? (quote.pricingNotice?.level ?? "exact") : "pending";
  const priceTitle = quoteError || quote?.pricingNotice?.clientMessage || (quote ? undefined : "Стоимость рассчитывается по текущей конфигурации");
  const priceLabel = quoteError ? "Ошибка расчёта" : quote ? formatPrice(quote.total) : "Считаем";

  return (
    <section className="rzm-constructor-scene rzm-constructor-scene--simple rzm-scene-r23-runtime">
      <div className="rzm-scene-workbar rzm-scene-workbar--r27">
        <ConstructorStepper value={step} onChange={onStepChange} stepStatuses={validation.stepStatuses} />

        <div className="rzm-r27-scene-toolbar" aria-label="Управление сценой">
          <div className="rzm-r27-toolbar-group rzm-r27-toolbar-group--mode">
            <label className="rzm-scene-advanced-toggle">
              <span>{advancedEnabled ? "Точная настройка" : "Обычный режим"}</span>
              <span
                className="rzm-constructor-toggle"
                aria-label="Точная настройка"
              >
                <input
                  className="rzm-constructor-toggle-input"
                  type="checkbox"
                  checked={advancedEnabled}
                  onChange={(event) =>
                    onAdvancedEnabledChange(event.target.checked)
                  }
                />
                <span className="rzm-constructor-toggle-track">
                  <span className="rzm-constructor-toggle-thumb" />
                </span>
              </span>
            </label>
          </div>

          <div className="rzm-r27-toolbar-group rzm-r27-toolbar-group--view">
            <ConstructorSceneRenderSwitch
              value={useThreeScene ? "three" : "svg"}
              webglAvailable={webglAvailable && !threeFailed}
              onChange={(value) => {
                onSceneRenderModeChange(value);
                if (value === "three") setThreeFailed(false);
              }}
            />
            <ConstructorSceneViewSwitch value={sceneViewMode} onChange={onSceneViewModeChange} />
          </div>

          <div className="rzm-r27-toolbar-group rzm-r27-toolbar-group--result">
            <ConstructorSceneWebGLStatus diagnostics={webglDiagnostics} threeFailed={threeFailed} />
            <div className={`rzm-constructor-price-chip rzm-constructor-price-chip--${priceState}`} title={priceTitle}>
              <span>Стоимость</span>
              <strong>{priceLabel}</strong>
            </div>
          </div>
        </div>
      </div>

      <ConstructorSceneCanvas
        width={width}
        height={height}
        depth={depth}
        sections={sections}
        sectionLayout={sectionLayout}
        selectedSectionId={selectedSectionId}
        compartmentLayout={compartmentLayout}
        fillingLayout={fillingLayout}
        facadeLayout={facadeLayout}
        selectedCompartmentId={selectedCompartmentId}
        compartments={compartments}
        fill={fill}
        material={material}
        facadeMaterial={facadeMaterial}
        furniture={selectedFurniture.key}
        handleless={handleless}
        shelvesCount={shelvesCount}
        drawersCount={drawersCount}
        rodsCount={rodsCount}
        validation={validation}
        viewMode={sceneViewMode}
        threeQuality={threeQuality}
        useThreeScene={useThreeScene}
        metrics={metrics}
        model={model}
        onThreeError={() => {
          setThreeFailed(true);
          onSceneRenderModeChange("svg");
        }}
      />

      <ConstructorSceneStatusBar
        width={width}
        height={height}
        depth={depth}
        sectionLayout={sectionLayout}
        selectedSectionId={selectedSectionId}
        compartmentLayout={compartmentLayout}
        selectedCompartmentId={selectedCompartmentId}
        material={material}
        facadeMaterial={facadeMaterial}
        validation={validation}
      />

      {isDebugMode && (
        <>
          <div hidden>{getProportionLabel(width, height, depth)}</div>
          <ProductionDebugPreview
            productionPreview={productionPreview}
            productionSnapshot={productionSnapshot}
            pricingNotice={quote?.pricingNotice ?? null}
            isLoading={isProductionPreviewLoading}
            error={productionPreviewError}
          />
        </>
      )}
    </section>
  );
}
