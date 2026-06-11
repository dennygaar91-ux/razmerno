import { ConstructorRealisticSvgModel } from "./ConstructorRealisticSvgModel";
import { getModelMetrics } from "./ConstructorSceneModel";
import type { ThreeRuntimeFailureReason } from "./LazyThreeFurnitureViewer";
import type {
  ConstructorCompartmentFilling,
  ConstructorCompartmentLayout,
  ConstructorSceneViewMode,
  ConstructorSection,
  ConstructorValidationState,
  FillKey,
  FurnitureKey,
  MaterialToken,
} from "../types";

export function SceneRuntimeStatus({
  webglStatus,
  canRenderThree,
  threeFailed,
  failureReason,
  renderMode,
  quality,
  quoteStatus,
  priceStatusLabel,
}: {
  webglStatus: string;
  canRenderThree: boolean;
  threeFailed: boolean;
  failureReason: ThreeRuntimeFailureReason | null;
  renderMode: "three" | "blueprint";
  quality: string;
  quoteStatus: "idle" | "calculating" | "ready" | "error";
  priceStatusLabel: string;
}) {
  const sceneStatus =
    renderMode === "blueprint"
      ? "2D fallback работает"
      : threeFailed
        ? getThreeFailureLabel(failureReason)
        : canRenderThree
          ? quality === "reduced"
            ? "3D работает в упрощённом режиме"
            : "3D работает"
          : webglStatus === "checking"
            ? "Проверяем 3D"
            : "3D недоступно";
  return (
    <div className="rzm-3d-runtime-status" role="status" aria-live="polite">
      <span>{sceneStatus}</span>
      <span>{priceStatusLabel}</span>
      {quoteStatus === "calculating" ? (
        <em aria-hidden="true">Пересчёт...</em>
      ) : null}
    </div>
  );
}

export function getThreeFailureLabel(reason: ThreeRuntimeFailureReason | null) {
  if (reason === "three-load-timeout") return "3D загружалось слишком долго";
  if (reason === "three-context-lost") return "3D-контекст потерян";
  return "3D не запустилось";
}

export function ThreeSceneLoading({ quality }: { quality: string }) {
  return (
    <div className="rzm-3d-loading" role="status">
      <div className="rzm-3d-loading-skeleton" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <strong>Загружаем 3D-модель</strong>
      <span>Собираем корпус, фасады, текстуры и фурнитуру.</span>
      <small>
        {quality === "reduced"
          ? "Упрощённый режим для стабильной работы"
          : "Стандартное качество сцены"}
      </small>
    </div>
  );
}

export function TwoDFallbackScene({
  metrics,
  input,
  viewMode,
  validation,
  diagnosticsStatus,
  reason,
  failureReason,
  onUseReducedModel,
  onRetry3D,
}: {
  metrics: ReturnType<typeof getModelMetrics>;
  input: {
    furniture: FurnitureKey;
    widthMm: number;
    heightMm: number;
    depthMm: number;
    sections: number;
    sectionLayout: ConstructorSection[];
    compartmentLayout: ConstructorCompartmentLayout;
    fillingLayout: Record<
      string,
      Record<string, ConstructorCompartmentFilling>
    >;
    facadeLayout: Record<string, "open" | "hinged">;
    material: string;
    facadeMaterial: string;
    handleless: boolean;
    selectedSectionId: string | null;
    selectedCompartmentId: string | null;
    compartments: number;
    fill: FillKey;
  };
  viewMode: ConstructorSceneViewMode;
  validation: ConstructorValidationState;
  diagnosticsStatus: string;
  reason?: string;
  failureReason: ThreeRuntimeFailureReason | null;
  onUseReducedModel: () => void;
  onRetry3D: () => void;
}) {
  return (
    <div
      className="rzm-3d-blueprint-fallback"
      role="region"
      aria-label="Рабочий 2D fallback конструктора"
    >
      <div className="rzm-3d-blueprint-status" role="status" aria-live="polite">
        <span>2D fallback активен</span>
        <strong>Конфигурацию можно продолжить без 3D</strong>
        <small>
          {diagnosticsStatus}
          {reason ? ` · ${reason}` : ""}
          {failureReason ? ` · ${getThreeFailureLabel(failureReason)}` : ""}
        </small>
      </div>
      <ConstructorRealisticSvgModel
        metrics={metrics}
        depthOffset={metrics.depthOffset}
        fill={input.fill}
        compartments={input.compartments}
        sections={input.sections}
        sectionLayout={input.sectionLayout}
        selectedSectionId={input.selectedSectionId}
        compartmentLayout={input.compartmentLayout}
        fillingLayout={input.fillingLayout}
        facadeLayout={input.facadeLayout}
        selectedCompartmentId={input.selectedCompartmentId}
        validation={validation}
        material={input.material as MaterialToken}
        facadeMaterial={input.facadeMaterial as MaterialToken}
        furniture={input.furniture}
        handleless={input.handleless}
        viewMode={viewMode}
        widthMm={input.widthMm}
        heightMm={input.heightMm}
        depthMm={input.depthMm}
      />
      <div className="rzm-3d-fallback-actions rzm-3d-blueprint-actions">
        <button
          type="button"
          className="rzm-ui-btn rzm-ui-btn--primary"
          onClick={onUseReducedModel}
        >
          Запустить упрощённое 3D
        </button>
        <button
          type="button"
          className="rzm-ui-btn rzm-ui-btn--ghost"
          onClick={onRetry3D}
        >
          Повторить 3D
        </button>
      </div>
    </div>
  );
}
