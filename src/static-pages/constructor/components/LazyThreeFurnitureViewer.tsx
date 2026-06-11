import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import type { ThreeFurnitureInput, ThreeSceneQuality, ThreeSceneViewMode } from "../three/threeTypes";
import type { ThreeSelectionPayload } from "../three/ThreeSelectionLayer";
import { ThreeSceneBoundary } from "./ThreeSceneBoundary";

const THREE_VIEWER_LOAD_TIMEOUT_MS = 8_000;

const ThreeFurnitureViewer = lazy(() =>
  import("../three/ThreeFurnitureViewer").then((module) => ({ default: module.ThreeFurnitureViewer })),
);

export type ThreeRuntimeFailureReason =
  | "three-boundary-error"
  | "three-load-timeout"
  | "three-context-lost";

export function LazyThreeFurnitureViewer({
  input,
  viewMode,
  quality,
  fallback,
  onError,
  onReady,
  onSelectTarget,
  onOpenAddMenu,
}: {
  input: ThreeFurnitureInput;
  viewMode: ThreeSceneViewMode;
  quality: ThreeSceneQuality;
  fallback: ReactNode;
  onError: (reason?: ThreeRuntimeFailureReason) => void;
  onReady?: () => void;
  onSelectTarget?: (target: ThreeSelectionPayload) => void;
  onOpenAddMenu?: (target: ThreeSelectionPayload) => void;
}) {
  const [timedOut, setTimedOut] = useState(false);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    setTimedOut(false);
    const timeout = window.setTimeout(() => {
      setTimedOut(true);
      onErrorRef.current("three-load-timeout");
    }, THREE_VIEWER_LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timeout);
  }, [input, viewMode, quality]);

  if (timedOut) return fallback;

  return (
    <ThreeSceneBoundary
      fallback={fallback}
      onError={() => onError("three-boundary-error")}
      resetKey={`${viewMode}:${quality}:${input.widthMm}:${input.heightMm}:${input.depthMm}:${input.sections}`}
    >
      <Suspense fallback={<ThreeViewerLoading />}>
        <ThreeFurnitureViewer
          input={input}
          viewMode={viewMode}
          quality={quality}
          onReady={onReady}
          onContextLost={() => onError("three-context-lost")}
          onSelectTarget={onSelectTarget}
          onOpenAddMenu={onOpenAddMenu}
        />
      </Suspense>
    </ThreeSceneBoundary>
  );
}

function ThreeViewerLoading() {
  return (
    <div className="rzm-three-loading" role="status" aria-live="polite">
      <span />
      <strong>Загружаем 3D</strong>
      <small>Если WebGL недоступен, откроется резервный режим.</small>
    </div>
  );
}
