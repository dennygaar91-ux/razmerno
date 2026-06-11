/**
 * ThreeViewer — главный Three.js-конструктор мебели.
 *
 * Заменяет SVG `Visualization` (когда включён feature-flag).
 *
 * Что внутри:
 *  - <Canvas> от R3F с PerspectiveCamera по умолчанию + isometric vibe
 *  - light setup: ambient + key directional + fill
 *  - <ContactShadows> для мягкой контактной тени
 *  - <OrbitControls> с ограниченным zoom/pan
 *  - <FurnitureModel> рендерит панели из productionModel
 *  - <DimensionLabels> поверх с подписями W/H/D
 *  - Toolbar поверх (вид, exploded, dimensions, technical)
 *  - Bottom info card с reward-статусом и выбранной деталью
 *
 * Логика подсветки (highlightedPart из ConfigState) пробрасывается в FurnitureModel.
 */
import { useDeferredValue, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Bounds, OrthographicCamera } from "@react-three/drei";

import {
  buildCabinetGeometry,
  fromConfigState,
  type Panel,
  type ProductionModel,
} from "../../constructor/geometry";
import { hasErrors } from "../context";
import { useConfigStateSelector, useConfigValidationSelector } from "../store/useConfigSelectors";
import { ProductionModel2DView } from "./ProductionModel2DView";
import { ViewerToolbar } from "./ViewerToolbar";
import { PanelInfoChip } from "./PanelInfoChip";
import { cameraPositionForView, orthographicZoomForView } from "./cameraUtils";
import { FurnitureModel } from "./FurnitureModel";
import { DimensionLabels } from "./DimensionLabels";
import { ThreeLayoutMarkers } from "./ThreeLayoutMarkers";
import { SelectedCompartmentHighlight } from "./SelectedCompartmentHighlight";
import { AssemblyTimeline } from "./AssemblyTimeline";
import { viewerGlassChipClass, viewerSurfaceClass } from "./visualSystem";
import type { HighlightPart, ViewMode } from "./viewerTypes";

const MM_TO_M = 0.001;

const HIGHLIGHT_LABEL: Record<NonNullable<HighlightPart>, string> = {
  body: "каркас",
  sections: "секции",
  shelves: "полки",
  drawers: "ящики",
  rod: "штанга",
  facade: "фасады",
};

export function ThreeViewer() {
  const state = useConfigStateSelector();
  const validation = useConfigValidationSelector();
  const blocked = hasErrors(validation);
  const deferredState = useDeferredValue(state);

  // Строим модель по отложенному состоянию, чтобы ввод размеров оставался отзывчивым.
  const productionModel: ProductionModel | null = useMemo(() => {
    if (!deferredState.type) return null;
    const project = fromConfigState(deferredState, "rzm.config.v3");
    return buildCabinetGeometry(project);
  }, [deferredState]);

  const [exploded, setExploded] = useState(false);
  const [showDims, setShowDims] = useState(true);
  const showHardware = true;
  const [view, setView] = useState<ViewMode>("iso");
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [hoveredPanelId, setHoveredPanelId] = useState<string | null>(null);
  const shadowsEnabled = typeof window === "undefined" ? true : window.matchMedia("(min-width: 768px)").matches;

  // Подсветка берется из состояния конструктора и не меняет расчетную модель.
  const highlight: HighlightPart = state.highlightedPart;

  const selectedPanel: Panel | null = useMemo(() => {
    if (!productionModel || !selectedPanelId) return null;
    return productionModel.panels.find((p) => p.id === selectedPanelId) ?? null;
  }, [productionModel, selectedPanelId]);

  if (!state.type || !productionModel) return null;

  const orthographicView = view === "front" || view === "side" || view === "top";
  const chipText = blocked
    ? "Проверьте размеры"
    : highlight
    ? `Вы выбрали: ${HIGHLIGHT_LABEL[highlight]}`
    : null;
  const dotColor = blocked ? "#ff5a1f" : "#7cb46a";

  if (view === "twoD") {
    return (
      <div className="relative w-full h-full min-h-[320px] md:min-h-[520px] rounded-[32px] overflow-hidden">
        <ProductionModel2DView
          productionModel={productionModel}
          showDims={showDims}
          selectedPanelId={selectedPanelId}
          onSelectPanel={setSelectedPanelId}
        />
        <ViewerToolbar
          view={view}
          setView={setView}
          exploded={exploded}
          setExploded={setExploded}
          showDims={showDims}
          setShowDims={setShowDims}
          placement="bottom"
        />
      </div>
    );
  }

  return (
    <div className={viewerSurfaceClass}>
      {chipText && (
        <div className={`absolute top-3 left-3 md:top-4 md:left-4 z-10 ${viewerGlassChipClass}`}>
          <span
            className={`w-1.5 h-1.5 rounded-full ${blocked ? "animate-pulse" : ""}`}
            style={{ background: dotColor }}
          />
          <span className="text-[11px] font-medium text-[var(--color-ink-soft)]">
            {chipText}
          </span>
        </div>
      )}

      <ViewerToolbar
        view={view}
        setView={setView}
        exploded={exploded}
        setExploded={setExploded}
        showDims={showDims}
        setShowDims={setShowDims}
        placement="top"
      />

      <AssemblyTimeline activeStep={state.activeStep} blocked={blocked} exploded={exploded} />

      <Canvas
        key={view}
        frameloop="demand"
        shadows={shadowsEnabled}
        camera={{ position: cameraPositionForView(view, productionModel.dimensions), fov: 35 }}
        style={{ width: "100%", height: "100%" }}
        onPointerMissed={() => setSelectedPanelId(null)}
      >
        {orthographicView && (
          <OrthographicCamera
            makeDefault
            position={cameraPositionForView(view, productionModel.dimensions)}
            zoom={orthographicZoomForView(view, productionModel.dimensions)}
            near={0.01}
            far={20}
          />
        )}

        {/* Свет */}
        <ambientLight intensity={0.62} />
        <directionalLight
          position={[1.7, 2.7, 2.1]}
          intensity={1.18}
          castShadow={shadowsEnabled}
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
          shadow-camera-far={10}
          shadow-camera-left={-3}
          shadow-camera-right={3}
          shadow-camera-top={3}
          shadow-camera-bottom={-3}
        />
        <directionalLight position={[-1.6, 1.7, -1.4]} intensity={0.28} />

        {/* Мягкая контактная тень под шкафом */}
        {shadowsEnabled && <ContactShadows
          position={[productionModel.dimensions.widthMm * MM_TO_M * 0.5, 0, productionModel.dimensions.depthMm * MM_TO_M * 0.5]}
          opacity={0.34}
          scale={Math.max(productionModel.dimensions.widthMm, productionModel.dimensions.depthMm) * MM_TO_M * 2.5}
          blur={1.8}
          far={0.6}
          resolution={256}
          color="#000000"
        />}

        {/* Камера аккуратно охватывает модель */}
        <Bounds fit observe margin={1.25}>
          <group position={[0, 0, 0]}>
            <FurnitureModel
              productionModel={productionModel}
              highlight={highlight}
              selectedPanelId={selectedPanelId}
              exploded={exploded}
              showHardware={showHardware}
              showDrilling={false}
              onSelectPanel={(id) => setSelectedPanelId(id)}
              onHoverPanel={(id) => setHoveredPanelId(id)}
            />
          </group>
        </Bounds>

        {/* Размеры */}
        <DimensionLabels
          widthMm={productionModel.dimensions.widthMm}
          heightMm={productionModel.dimensions.heightMm}
          depthMm={productionModel.dimensions.depthMm}
          show={showDims}
        />

        <SelectedCompartmentHighlight />

        <ThreeLayoutMarkers />

        {/* Спокойная плоскость студии */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow={shadowsEnabled}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#f4f1ea" roughness={1} metalness={0} />
        </mesh>

        <OrbitControls
          enablePan={false}
          enableRotate={view === "iso"}
          minDistance={0.8}
          maxDistance={6}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.1}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>

      {/* Информация о выбранной детали */}
      {(selectedPanel || hoveredPanelId) && (
        <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 z-10 max-w-[280px]">
          <PanelInfoChip
            productionModel={productionModel}
            panelId={selectedPanel?.id ?? hoveredPanelId ?? null}
            selected={Boolean(selectedPanel)}
          />
        </div>
      )}

      {view === "iso" && !exploded && (
        <div className="sm:hidden absolute bottom-3 left-3 right-3 z-10 rounded-[18px] bg-white/82 backdrop-blur-sm px-3 py-2 text-[11px] leading-snug text-[var(--rzm-text-muted)] shadow-[0_1px_2px_rgba(10,10,10,0.04)]">
          Поверните модель пальцем. Детали можно раскрыть отдельной кнопкой.
        </div>
      )}

      {/* Короткий повтор размеров */}
      <div className="hidden sm:inline-flex absolute bottom-3 right-3 md:bottom-4 md:right-4 z-10 items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm font-mono text-[11px] tabular-nums text-[var(--color-ink-soft)] shadow-[0_1px_2px_rgba(10,10,10,0.04)]">
        {state.width} × {state.height} × {state.depth} мм
      </div>
    </div>
  );
}
