const VIEW_LABELS = {
  front: "Спереди",
  side: "Сбоку",
  top: "Сверху",
  free: "Свободно",
};

export default function ViewerToolbar({ viewType, viewMode, onViewTypeChange, onViewModeChange }) {
  return (
    <div className="cp-viewer-toolbar">
      <div>
        {Object.keys(VIEW_LABELS).map((item) => (
          <button
            key={item}
            type="button"
            className={viewType === item ? "active" : ""}
            onClick={() => onViewTypeChange(item)}
          >
            {VIEW_LABELS[item]}
          </button>
        ))}
      </div>

      <div>
        <button
          type="button"
          className={viewMode === "3D" ? "active" : ""}
          onClick={() => onViewModeChange("3D")}
        >
          3D
        </button>
        <button
          type="button"
          className={viewMode === "2D" ? "active" : ""}
          onClick={() => onViewModeChange("2D")}
        >
          2D
        </button>
      </div>
    </div>
  );
}
