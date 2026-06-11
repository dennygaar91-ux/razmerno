import { useEffect, useState } from "react";

export type WebGLStatus = "checking" | "available" | "unavailable";

export type WebGLDiagnostics = {
  status: WebGLStatus;
  renderer: "webgl2" | "webgl" | null;
  reason: string;
  vendor?: string;
  rendererInfo?: string;
};

const probeAttributes: WebGLContextAttributes = {
  alpha: true,
  antialias: false,
  depth: true,
  failIfMajorPerformanceCaveat: false,
  powerPreference: "default",
  preserveDrawingBuffer: false,
  stencil: false,
};

function getRendererInfo(context: WebGLRenderingContext | WebGL2RenderingContext) {
  try {
    const debugInfo = context.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return {};

    return {
      vendor: String(context.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) ?? ""),
      rendererInfo: String(context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? ""),
    };
  } catch {
    return {};
  }
}

function disposeProbeContext(context: WebGLRenderingContext | WebGL2RenderingContext | null) {
  if (!context) return;
  try {
    const extension = context.getExtension("WEBGL_lose_context");
    window.setTimeout(() => extension?.loseContext(), 0);
  } catch {
    // Diagnostics must never break the constructor UI.
  }
}

export function detectWebGL(): WebGLDiagnostics {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return { status: "checking", renderer: null, reason: "ssr" };
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;

    const webgl2 = canvas.getContext("webgl2", probeAttributes) as WebGL2RenderingContext | null;
    if (webgl2) {
      const info = getRendererInfo(webgl2);
      disposeProbeContext(webgl2);
      return { status: "available", renderer: "webgl2", reason: "ok", ...info };
    }

    const webgl = (canvas.getContext("webgl", probeAttributes) ||
      canvas.getContext("experimental-webgl", probeAttributes)) as WebGLRenderingContext | null;

    if (webgl) {
      const info = getRendererInfo(webgl);
      disposeProbeContext(webgl);
      return { status: "available", renderer: "webgl", reason: "ok", ...info };
    }

    return { status: "unavailable", renderer: null, reason: "context-null" };
  } catch (error) {
    return {
      status: "unavailable",
      renderer: null,
      reason: error instanceof Error ? error.message : "unknown-error",
    };
  }
}

export function useWebGLDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<WebGLDiagnostics>({
    status: "checking",
    renderer: null,
    reason: "checking",
  });

  useEffect(() => {
    setDiagnostics(detectWebGL());
  }, []);

  return diagnostics;
}

export function useWebGLAvailable() {
  return useWebGLDiagnostics().status === "available";
}
