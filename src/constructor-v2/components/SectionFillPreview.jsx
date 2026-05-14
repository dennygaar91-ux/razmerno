function getItemCount(section, type) {
  return section?.items?.find((item) => item.type === type)?.count || 0;
}

export default function SectionFillPreview({ section }) {
  const shelves = getItemCount(section, "shelf");
  const drawers = getItemCount(section, "drawer");
  const rails = getItemCount(section, "hanger_rail");

  return (
    <div className="rv2-section-fill-preview" aria-hidden="true">
      {rails ? <i className="rv2-rail-line" /> : null}

      {Array.from({ length: Math.min(shelves, 6) }).map((_, index) => (
        <i className="rv2-shelf-line" key={`shelf-${index}`} />
      ))}

      {drawers ? (
        <div className="rv2-drawer-stack">
          {Array.from({ length: Math.min(drawers, 4) }).map((_, index) => (
            <i key={`drawer-${index}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
