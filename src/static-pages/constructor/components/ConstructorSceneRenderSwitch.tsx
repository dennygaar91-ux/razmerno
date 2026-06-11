import type { ConstructorSceneRenderMode } from "../types";

export type SceneRenderMode = ConstructorSceneRenderMode;

export function ConstructorSceneRenderSwitch({
  value,
  webglAvailable,
  onChange,
}: {
  value: ConstructorSceneRenderMode;
  webglAvailable: boolean;
  onChange: (value: ConstructorSceneRenderMode) => void;
}) {
  return (
    <div className="rzm-scene-render-switch" aria-label="Выбор режима сцены">
      <button
        className={value === "three" ? "is-active" : ""}
        type="button"
        aria-pressed={value === "three"}
        disabled={!webglAvailable}
        title={webglAvailable ? "Открыть 3D-превью" : "3D временно недоступен, открыт 2D-чертёж"}
        onClick={() => onChange("three")}
      >
        3D
      </button>
      <button
        className={value === "svg" ? "is-active" : ""}
        type="button"
        aria-pressed={value === "svg"}
        onClick={() => onChange("svg")}
      >
        2D
      </button>
    </div>
  );
}
