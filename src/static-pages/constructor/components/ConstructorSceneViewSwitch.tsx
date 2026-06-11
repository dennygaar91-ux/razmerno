import type { ConstructorSceneViewMode } from "../types";

export type SceneViewMode = ConstructorSceneViewMode;

export const sceneViewOptions: Array<{ key: ConstructorSceneViewMode; label: string }> = [
  { key: "free", label: "Свободно" },
  { key: "front", label: "Спереди" },
  { key: "side", label: "Сбоку" },
  { key: "top", label: "Сверху" },
];

export function ConstructorSceneViewSwitch({
  value,
  onChange,
}: {
  value: ConstructorSceneViewMode;
  onChange: (value: ConstructorSceneViewMode) => void;
}) {
  return (
    <div className="rzm-scene-view-switch" aria-label="Повернуть модель">
      {sceneViewOptions.map((option) => (
        <button
          key={option.key}
          className={value === option.key ? "is-active" : ""}
          type="button"
          aria-pressed={value === option.key}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
