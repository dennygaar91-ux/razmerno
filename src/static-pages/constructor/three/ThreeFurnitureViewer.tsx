import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import type { ThreeFurnitureInput, ThreeSceneQuality, ThreeSceneViewMode } from "./threeTypes";
import { ThreeSelectionLayer, type ThreeSelectionPayload } from "./ThreeSelectionLayer";
import { buildThreeFurnitureModel } from "./threeSceneAdapter";
import { getCameraPosition, getOrbitTarget } from "./threeCamera";
import { ThreeFurnitureModel } from "./ThreeFurnitureModel";

function formatMm(valueMm: number) {
  return `${Math.round(valueMm).toLocaleString("ru-RU")} мм`;
}

const viewLabels: Record<ThreeSceneViewMode, string> = {
  free: "Свободный вид",
  front: "Фронтально",
  side: "Сбоку",
  top: "Сверху",
};

export function ThreeFurnitureViewer({
  input,
  viewMode,
  quality,
  onReady,
  onContextLost,
  onSelectTarget,
  onOpenAddMenu,
}: {
  input: ThreeFurnitureInput;
  viewMode: ThreeSceneViewMode;
  quality: ThreeSceneQuality;
  onReady?: () => void;
  onContextLost?: () => void;
  onSelectTarget?: (target: ThreeSelectionPayload) => void;
  onOpenAddMenu?: (target: ThreeSelectionPayload) => void;
}) {
  const model = useMemo(() => buildThreeFurnitureModel(input), [input]);
  const sceneMode = input.sceneMode ?? "fill";
  const cameraPosition = getCameraPosition(viewMode, model.dimensions, sceneMode);
  const target = getOrbitTarget(model.dimensions, sceneMode);
  const enableRotate = viewMode === "free";
  const isReduced = quality === "reduced";
  const [width, , depth] = model.dimensions;
  const studioSize = Math.max(width, depth, 2.8);

  return (
    <div
      className={`rzm-three-viewer rzm-three-viewer--product rzm-three-viewer--${sceneMode}`}
      data-testid="constructor-3d-preview"
      data-scene-mode={sceneMode}
      data-rendered-material={input.material}
      data-rendered-facade-material={input.facadeMaterial}
      data-material-id={input.material}
      data-facade-material-id={input.facadeMaterial}
      aria-label="Интерактивная 3D-модель мебели"
    >
      <Canvas
        shadows={!isReduced}
        dpr={isReduced ? [1, 1.15] : [1, 1.65]}
        frameloop="demand"
        camera={{ position: cameraPosition, fov: viewMode === "free" ? 34 : 30, near: 0.1, far: 100 }}
        gl={{ antialias: !isReduced, alpha: true, powerPreference: "high-performance", outputColorSpace: THREE.SRGBColorSpace }}
      >
        <Suspense fallback={null}>
          <ThreeCanvasRuntimeGuard onReady={onReady} onContextLost={onContextLost} />
          <color attach="background" args={[sceneMode === "materials" || sceneMode === "checkout" ? "#f4f0e8" : "#f6f3ee"]} />
          <fog attach="fog" args={[sceneMode === "materials" || sceneMode === "checkout" ? "#f4f0e8" : "#f6f3ee", 7, 13]} />
          <ambientLight intensity={isReduced ? 1.48 : sceneMode === "materials" || sceneMode === "checkout" ? 1.05 : 1.12} />
          <hemisphereLight args={["#ffffff", "#cfc7bb", isReduced ? 0.58 : 0.44]} />
          <directionalLight
            position={[3.8, 5.8, 4.2]}
            intensity={isReduced ? 1.82 : sceneMode === "materials" || sceneMode === "checkout" ? 2.42 : 2.18}
            castShadow={!isReduced}
            shadow-mapSize-width={isReduced ? 256 : 768}
            shadow-mapSize-height={isReduced ? 256 : 768}
            shadow-camera-left={-3.2}
            shadow-camera-right={3.2}
            shadow-camera-top={3.2}
            shadow-camera-bottom={-3.2}
          />
          <directionalLight position={[-3.6, 2.4, -2.8]} intensity={sceneMode === "materials" || sceneMode === "checkout" ? 0.48 : 0.34} />
          <spotLight position={[0.2, 4.2, 3.4]} angle={0.42} penumbra={0.78} intensity={sceneMode === "materials" || sceneMode === "checkout" ? 0.68 : 0.34} castShadow={!isReduced} />
          <ThreeFurnitureModel input={input} sceneMode={sceneMode} />
          <ThreeSelectionLayer targets={model.interactionTargets} onSelectTarget={onSelectTarget} onOpenAddMenu={onOpenAddMenu} />
          {!isReduced && (
            <ContactShadows
              position={[0, -0.072, 0]}
              opacity={0.26}
              scale={Math.max(studioSize * 1.9, 5.2)}
              blur={2.8}
              far={3.5}
              resolution={384}
              color="#1f1f26"
            />
          )}
          <Environment preset="apartment" />
          <OrbitControls
            makeDefault
            target={target}
            enableRotate={enableRotate}
            enablePan={false}
            enableZoom
            minDistance={1.45}
            maxDistance={7.2}
            maxPolarAngle={Math.PI / 2.06}
            minPolarAngle={viewMode === "top" ? 0 : Math.PI / 7}
            dampingFactor={0.08}
            enableDamping
          />
        </Suspense>
      </Canvas>

      <div className="rzm-three-product-hud" aria-label="Размеры 3D-модели">
        <span>{viewLabels[viewMode]} · {sceneMode === "sizes" ? "габариты" : sceneMode === "materials" ? "декоры" : sceneMode === "checkout" ? "итог" : "наполнение"}</span>
        <strong>{formatMm(input.widthMm)} × {formatMm(input.heightMm)} × {formatMm(input.depthMm)}</strong>
      </div>
    </div>
  );
}


function ThreeCanvasRuntimeGuard({
  onReady,
  onContextLost,
}: {
  onReady?: () => void;
  onContextLost?: () => void;
}) {
  const { gl } = useThree();

  useEffect(() => {
    onReady?.();
    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => {
      // preventDefault keeps the browser context restorable, but recovery is explicit
      // via 2D fallback + retryThreeScene — no webglcontextrestored auto-remount.
      event.preventDefault();
      onContextLost?.();
    };
    canvas.addEventListener("webglcontextlost", handleContextLost);
    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
    };
  }, [gl, onContextLost, onReady]);

  return null;
}
