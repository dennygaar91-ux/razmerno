import type {
  ConstructorCompartmentLayout,
  ConstructorFillingLayout,
  ConstructorSection,
  ConstructorSectionFacadeLayout,
  ConstructorValidationState,
  FillKey,
  FurnitureKey,
  MaterialToken,
} from "../types";
import { LazyThreeFurnitureViewer } from "./LazyThreeFurnitureViewer";
import { ConstructorRealisticSvgModel } from "./ConstructorRealisticSvgModel";
import type { ModelMetrics } from "./ConstructorSceneModel";
import type { SceneViewMode } from "./ConstructorSceneViewSwitch";
import type { ThreeSceneQuality } from "../three/threeTypes";
import { getProjectMaterialLayers } from "../../../shared/materials/materialPresentation";


function getSelectionSummary({
  sectionLayout,
  selectedSectionId,
  compartmentLayout,
  selectedCompartmentId,
}: {
  sectionLayout: ConstructorSection[];
  selectedSectionId: string | null;
  compartmentLayout: ConstructorCompartmentLayout;
  selectedCompartmentId: string | null;
}) {
  const sectionIndex = Math.max(
    0,
    sectionLayout.findIndex((section) => section.id === selectedSectionId),
  );
  const activeSection = sectionLayout[sectionIndex] ?? sectionLayout[0] ?? null;
  const activeSectionNumber = activeSection ? sectionIndex + 1 : 1;
  const compartments = activeSection ? compartmentLayout[activeSection.id] ?? [] : [];
  const compartmentIndex = Math.max(
    0,
    compartments.findIndex((compartment) => compartment.id === selectedCompartmentId),
  );
  const activeCompartment = compartments[compartmentIndex] ?? compartments[0] ?? null;
  const activeCompartmentNumber = activeCompartment ? compartmentIndex + 1 : 1;

  return {
    sectionLabel: `Секция ${activeSectionNumber}`,
    compartmentLabel: activeCompartment ? `отсек ${activeCompartmentNumber}` : "отсек не выбран",
    sectionWidth: activeSection?.widthMm ?? null,
    compartmentHeight: activeCompartment?.heightMm ?? null,
  };
}

export function ConstructorSceneCanvas({
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
  furniture,
  handleless,
  shelvesCount,
  drawersCount,
  rodsCount,
  validation,
  viewMode,
  threeQuality,
  useThreeScene,
  metrics,
  onThreeError,
}: {
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
  furniture: FurnitureKey;
  handleless: boolean;
  shelvesCount: number;
  drawersCount: number;
  rodsCount: number;
  validation: ConstructorValidationState;
  viewMode: SceneViewMode;
  threeQuality: ThreeSceneQuality;
  useThreeScene: boolean;
  metrics: ModelMetrics;
  model: { safeSections: number };
  onThreeError: () => void;
}) {
  const materialLayers = getProjectMaterialLayers({
    bodyMaterialId: material,
    facadeMaterialId: facadeMaterial,
  });
  const selectionSummary = getSelectionSummary({
    sectionLayout,
    selectedSectionId,
    compartmentLayout,
    selectedCompartmentId,
  });

  const svgFallback = (
    <ConstructorRealisticSvgModel
      metrics={metrics}
      depthOffset={metrics.depthOffset}
      fill={fill}
      compartments={compartments}
      sections={sections}
      sectionLayout={sectionLayout}
      selectedSectionId={selectedSectionId}
      compartmentLayout={compartmentLayout}
      fillingLayout={fillingLayout}
      facadeLayout={facadeLayout}
      selectedCompartmentId={selectedCompartmentId}
      validation={validation}
      material={material}
      facadeMaterial={facadeMaterial}
      furniture={furniture}
      handleless={handleless}
      viewMode={viewMode}
      widthMm={width}
      heightMm={height}
      depthMm={depth}
    />
  );

  return (
    <div
      className={`rzm-constructor-canvas rzm-constructor-canvas--premium rzm-constructor-canvas--clean rzm-constructor-canvas--${viewMode} ${useThreeScene ? "rzm-constructor-canvas--webgl" : "rzm-constructor-canvas--svg-fallback"}`}
      aria-label="Превью мебели"
    >
      <span
        className="rzm-scene-orb rzm-scene-orb--orange"
        aria-hidden="true"
      />
      <span
        className="rzm-scene-orb rzm-scene-orb--yellow"
        aria-hidden="true"
      />
      <span className="rzm-scene-depth-grid" aria-hidden="true" />
      <span className="rzm-scene-floor-shadow" aria-hidden="true" />

      {useThreeScene ? (
        <LazyThreeFurnitureViewer
          input={{
            furniture,
            widthMm: width,
            heightMm: height,
            depthMm: depth,
            sections,
            sectionLayout,
            compartmentLayout,
            fillingLayout,
            facadeLayout,
            compartments,
            shelvesCount,
            drawersCount,
            rodsCount,
            fill,
            material,
            facadeMaterial,
            handleless,
            selectedSectionId,
            selectedCompartmentId,
          }}
          viewMode={viewMode}
          quality={threeQuality}
          onError={onThreeError}
          fallback={svgFallback}
        />
      ) : (
        svgFallback
      )}


      {useThreeScene && (
        <div className="rzm-scene-material-stack" aria-label="Материалы проекта">
          {materialLayers.map((layer) => (
            <span className={`rzm-scene-material-chip rzm-scene-material-chip--${layer.key}`} key={layer.key}>
              <i
                aria-hidden="true"
                style={{
                  backgroundColor: layer.material.fallbackHex,
                  backgroundImage: `url(${layer.material.textureUrl})`,
                }}
              />
              <span>
                <strong>{layer.title}</strong>
                <small>{layer.material.name} · {layer.thicknessLabel}</small>
              </span>
            </span>
          ))}
        </div>
      )}


      {useThreeScene && (
        <div className="rzm-scene-active-target" aria-label="Выбранная область модели">
          <span>Настраивается</span>
          <strong>{selectionSummary.sectionLabel} · {selectionSummary.compartmentLabel}</strong>
          <small>
            {selectionSummary.sectionWidth ? `${selectionSummary.sectionWidth} мм` : "ширина авто"}
            {selectionSummary.compartmentHeight ? ` · ${selectionSummary.compartmentHeight} мм` : ""}
          </small>
        </div>
      )}

      {!useThreeScene && (
        <span className="rzm-scene-model-shadow" aria-hidden="true" />
      )}
    </div>
  );
}
