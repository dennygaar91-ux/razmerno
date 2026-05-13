import "../styles/premium-cabinet-viewer.css";
import "../styles/premium-viewer-camera.css";

function getItemCount(section, type) {
  return section?.items?.find((item) => item.type === type)?.count || 0;
}

function getMaterialColor(materialId) {
  const colors = {
    egger_w980_16: "#d8cab7",
    kronospan_oak_16: "#b89a73",
    white_ldsp_16: "#f7f6f3",
    anthracite_ldsp_16: "#4a4a4a",
    mdf_white_18: "#f4f4f2",
    mdf_graphite_18: "#474747",
    mdf_beige_18: "#d8cab7",
    mdf_olive_18: "#8a8d7f",
  };

  return colors[materialId] || "#d8cab7";
}

export default function PremiumCabinetViewer({
  config,
  viewMode,
  viewType,
  zoom = 1,
  userHeight = 1750,
  activeSectionId,
  onSectionSelect,
}) {
  const width = config.dimensions.width;
  const height = config.dimensions.height;
  const depth = config.dimensions.depth;
  const sections = config.sections || [];
  const sectionCount = Math.max(1, sections.length);
  const sectionWidth = Math.round(width / sectionCount);
  const bodyColor = getMaterialColor(config.materials.bodyMaterialId);
  const facadeColor = getMaterialColor(config.materials.facadeMaterialId || config.materials.bodyMaterialId);
  const showHandles = config.facade?.enabled && config.facade?.openingType === "with_handles";
  const humanPercent = Math.max(38, Math.min(100, Math.round((userHeight / Math.max(height, 1)) * 86)));

  return (
    <div className={`pv-root pv-${viewMode?.toLowerCase()} pv-view-${viewType}`} style={{ "--pv-zoom": zoom }}>
      <div className="pv-grid" />

      <div className="pv-canvas">
        <div className="pv-human" style={{ height: `${humanPercent}%` }}>
          <span />
          <i />
          <b />
        </div>

        <div className="pv-cabinet-wrap" style={{ transform: `scale(${zoom})` }}>
          <div className="pv-depth-shadow" />

          <div
            className="pv-cabinet"
            style={{
              "--body-color": bodyColor,
              "--facade-color": facadeColor,
              "--section-count": sectionCount,
            }}
          >
            <div className="pv-top-panel" />
            <div className="pv-bottom-panel" />
            <div className="pv-left-panel" />
            <div className="pv-right-panel" />
            <div className="pv-back-panel" />

            <div className="pv-sections">
              {sections.map((section, index) => {
                const isActive = activeSectionId === section.id;
                const shelfCount = getItemCount(section, "shelf");
                const drawerCount = getItemCount(section, "drawer");
                const railCount = getItemCount(section, "hanger_rail");
                const isEmpty = shelfCount + drawerCount + railCount === 0;

                return (
                  <button
                    type="button"
                    key={section.id}
                    className={`pv-section ${isActive ? "active" : ""} ${isEmpty ? "empty" : ""}`}
                    onClick={() => onSectionSelect?.(section.id)}
                  >
                    <span className="pv-section-label">{index + 1}</span>

                    {railCount > 0 ? <span className="pv-rail" /> : null}

                    <span className="pv-shelves">
                      {Array.from({ length: shelfCount }).map((_, shelfIndex) => (
                        <i key={`shelf-${section.id}-${shelfIndex}`} />
                      ))}
                    </span>

                    <span className="pv-drawers">
                      {Array.from({ length: drawerCount }).map((_, drawerIndex) => (
                        <i key={`drawer-${section.id}-${drawerIndex}`}>
                          {showHandles ? <em /> : null}
                        </i>
                      ))}
                    </span>

                    {config.facade?.enabled ? <span className="pv-facade" /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pv-dimension pv-dimension-width">{width} мм</div>
          <div className="pv-dimension pv-dimension-height">{height} мм</div>
          <div className="pv-dimension pv-dimension-depth">{depth} мм</div>
        </div>
      </div>

      <div className="pv-status">
        <span>{viewMode === "2D" ? "Blueprint 2D" : "Premium 3D preview"}</span>
        <b>{sectionCount} секц. · {sectionWidth} мм</b>
      </div>
    </div>
  );
}
