import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { ThreeFurnitureInput, ThreeSceneQuality, ThreeSceneViewMode } from "../three/threeTypes";
import type { ThreeSelectionPayload } from "../three/ThreeSelectionLayer";
import { ThreeSceneBoundary } from "./ThreeSceneBoundary";

export const THREE_VIEWER_LOAD_TIMEOUT_MS = 8_000;

const ThreeFurnitureViewer = lazy(() =>
  import("../three/ThreeFurnitureViewer").then((module) => ({ default: module.ThreeFurnitureViewer })),
);

export type ThreeRuntimeFailureReason =
  | "three-boundary-error"
  | "three-load-timeout"
  | "three-context-lost";

export function buildThreeRuntimeResetKey(params: {
  recoveryKey: number;
  viewMode: ThreeSceneViewMode;
  quality: ThreeSceneQuality;
  input: Pick<ThreeFurnitureInput, "widthMm" | "heightMm" | "depthMm" | "sections">;
}): string {
  const { recoveryKey, viewMode, quality, input } = params;
  return [
    recoveryKey,
    viewMode,
    quality,
    input.widthMm,
    input.heightMm,
    input.depthMm,
    input.sections,
  ].join(":");
}

export function LazyThreeFurnitureViewer({
  input,
  viewMode,
  quality,
  recoveryKey = 0,
  fallback,
  onError,
  onReady,
  onSelectTarget,
  onOpenAddMenu,
}: {
  input: ThreeFurnitureInput;
  viewMode: ThreeSceneViewMode;
  quality: ThreeSceneQuality;
  recoveryKey?: number;
  fallback: ReactNode;
  onError: (reason?: ThreeRuntimeFailureReason) => void;
  onReady?: () => void;
  onSelectTarget?: (target: ThreeSelectionPayload) => void;
  onOpenAddMenu?: (target: ThreeSelectionPayload) => void;
}) {
  const [timedOut, setTimedOut] = useState(false);
  const onErrorRef = useRef(onError);
  const onReadyRef = useRef(onReady);
  const timeoutRef = useRef<number | null>(null);
  const runtimeResetKey = buildThreeRuntimeResetKey({ recoveryKey, viewMode, quality, input });

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    setTimedOut(false);
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    timeoutRef.current = window.setTimeout(() => {
      setTimedOut(true);
      onErrorRef.current("three-load-timeout");
    }, THREE_VIEWER_LOAD_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [runtimeResetKey]);

  const handleReady = useCallback(() => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setTimedOut(false);
    onReadyRef.current?.();
  }, []);

  const handleBoundaryError = useCallback(() => {
    onError("three-boundary-error");
  }, [onError]);

  const handleContextLost = useCallback(() => {
    onError("three-context-lost");
  }, [onError]);

  if (timedOut) return fallback;

  return (
    <ThreeSceneBoundary
      fallback={fallback}
      onError={handleBoundaryError}
      resetKey={runtimeResetKey}
    >
      <Suspense fallback={<ThreeViewerLoading />}>
        <ThreeFurnitureViewer
          key={runtimeResetKey}
          input={input}
          viewMode={viewMode}
          quality={quality}
          onReady={handleReady}
          onContextLost={handleContextLost}
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
