import FillCounter from "./FillCounter";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function ViewerFooter({
  zoom,
  userHeight,
  onZoomChange,
  onUserHeightChange,
}) {
  return (
    <div className="cp-viewer-footer">
      <FillCounter
        label="Рост"
        value={`${Math.round(userHeight / 10)} см`}
        onMinus={() => onUserHeightChange(clamp(userHeight - 10, 1000, 2150))}
        onPlus={() => onUserHeightChange(clamp(userHeight + 10, 1000, 2150))}
      />

      <FillCounter
        label="Масштаб"
        value={`${Math.round(zoom * 100)}%`}
        onMinus={() => onZoomChange(clamp(Number((zoom - 0.1).toFixed(2)), 0.7, 1.5))}
        onPlus={() => onZoomChange(clamp(Number((zoom + 0.1).toFixed(2)), 0.7, 1.5))}
      />
    </div>
  );
}
