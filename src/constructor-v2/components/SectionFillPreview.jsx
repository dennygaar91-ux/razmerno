function getItemCount(section, type) {
  return section?.items?.find((item) => item.type === type)?.count || 0;
}

function getFacadeType(section) {
  const drawers = getItemCount(section, "drawer");
  const rails = getItemCount(section, "hanger_rail");

  if (drawers >= 3) return "drawers";
  if (rails) return "wardrobe";
  return "shelves";
}

export default function SectionFillPreview({ section }) {
  const shelves = getItemCount(section, "shelf");
  const drawers = getItemCount(section, "drawer");
  const rails = getItemCount(section, "hanger_rail");
  const facadeType = getFacadeType(section);

  return (
    <div className={`rv2-section-fill-preview facade-${facadeType}`} aria-hidden="true">
      {rails ? <i className="rv2-rail-line" /> : null}

      <div className="rv2-shelves-area">
        {Array.from({ length: Math.min(shelves, 6) }).map((_, index) => (
          <i className="rv2-shelf-line" key={`shelf-${index}`} />
        ))}
      </div>

      {drawers ? (
        <div className={`rv2-drawer-stack drawers-${Math.min(drawers, 4)}`}>
          {Array.from({ length: Math.min(drawers, 4) }).map((_, index) => (
            <i key={`drawer-${index}`}>
              <span />
            </i>
          ))}
        </div>
      ) : null}
    </div>
  );
}
