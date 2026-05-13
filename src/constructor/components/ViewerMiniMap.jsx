export default function ViewerMiniMap({
  sections,
  activeSectionId,
  onSelect,
  getItemCount,
}) {
  return (
    <div
      className="cp-mini-map"
      style={{
        gridTemplateColumns: `repeat(${sections.length}, minmax(34px, 1fr))`,
      }}
    >
      {sections.map((section, index) => {
        const isEmpty =
          getItemCount(section, "shelf") +
          getItemCount(section, "drawer") +
          getItemCount(section, "hanger_rail") === 0;

        return (
          <button
            key={section.id}
            type="button"
            className={`${section.id === activeSectionId ? "active" : ""} ${isEmpty ? "empty" : ""}`}
            onClick={() => onSelect(section.id)}
          >
            <span>{index + 1}</span>
            <i />
          </button>
        );
      })}
    </div>
  );
}
