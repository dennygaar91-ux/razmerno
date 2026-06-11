import type { WebGLDiagnostics } from "../three/useWebGLAvailable";

function getStatusLabel(diagnostics: WebGLDiagnostics, threeFailed: boolean) {
  if (threeFailed) return "3D не запустилось";
  if (diagnostics.status === "checking") return "Проверяем 3D";
  if (diagnostics.status === "available") return diagnostics.renderer === "webgl2" ? "3D готово" : "3D доступно";
  return "3D недоступно";
}

function getStatusDetails(diagnostics: WebGLDiagnostics, threeFailed: boolean) {
  if (threeFailed) return "Сцена переключена в 2D. Конфигурация и заявка работают.";
  if (diagnostics.status === "checking") return "Проверяем WebGL-контекст браузера.";
  if (diagnostics.status === "available") {
    const gpu = diagnostics.rendererInfo ? ` · ${diagnostics.rendererInfo}` : "";
    return `${diagnostics.renderer?.toUpperCase() ?? "WEBGL"}${gpu}`;
  }
  if (diagnostics.reason === "context-null") {
    return "Браузер не создал WebGL-контекст. Открыт основной 2D-чертёж.";
  }
  return `Открыт основной 2D-чертёж. Причина: ${diagnostics.reason}`;
}

export function ConstructorSceneWebGLStatus({
  diagnostics,
  threeFailed,
}: {
  diagnostics: WebGLDiagnostics;
  threeFailed: boolean;
}) {
  const state = threeFailed
    ? "error"
    : diagnostics.status === "available"
      ? "ready"
      : diagnostics.status === "checking"
        ? "checking"
        : "disabled";

  return (
    <span
      className={`rzm-scene-webgl-status rzm-scene-webgl-status--${state}`}
      title={getStatusDetails(diagnostics, threeFailed)}
      aria-label={getStatusDetails(diagnostics, threeFailed)}
    >
      <i aria-hidden="true" />
      <span>{getStatusLabel(diagnostics, threeFailed)}</span>
    </span>
  );
}
