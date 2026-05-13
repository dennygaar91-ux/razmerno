import { useState } from "react";
import "../styles/premium-cabinet-viewer.css";
import "../styles/premium-viewer-camera.css";
import "../styles/premium-viewer-realism.css";
import "../styles/premium-viewer-materials.css";
import "../styles/premium-viewer-resize.css";
import "../styles/premium-viewer-adaptive-sections.css";
import "../styles/premium-viewer-semantic-facades.css";
import "../styles/premium-viewer-facade-topology.css";
import "../styles/premium-viewer-cabinet-anatomy.css";
import "../styles/premium-viewer-depth-upgrade.css";
import "../styles/premium-viewer-side-anatomy.css";
import "../styles/premium-viewer-pseudo-cad.css";
import "../styles/premium-viewer-orbit.css";

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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getProportionalViewerStyle({ width, height, depth, zoom, orbitX = 0, orbitY = 0 }) {
  const widthRatio = clamp(width / 2400, 0.56, 1.18);
  const heightRatio = clamp(height / 2200, 0.58, 1.16);
  const depthRatio = clamp(depth / 600, 0.72, 1.28);
  const visualWidth = clamp(widthRatio * 760, 430, 860);
  const visualHeight = clamp(heightRatio * 460, 300, 540);
  const depthOffset = clamp(depthRatio * 34, 24, 48);

  return {
    "--pv-zoom": zoom,
    "--pv-visual-width": `${Math.round(visualWidth)}px`,
    "--pv-visual-height": `${Math.round(visualHeight)}px`,
    "--pv-depth-offset": `${Math.round(depthOffset)}px`,
    "--pv-depth-scale": depthRatio.toFixed(2),
    "--pv-orbit-x": `${orbitX.toFixed(2)}deg`,
    "--pv-orbit-y": `${orbitY.toFixed(2)}deg`,
    "--pv-parallax-x": `${(orbitY * 1.2).toFixed(2)}px`,
    "--pv-parallax-y": `${(orbitX * -0.9).toFixed(2)}px`,
  };
}

function getSectionGridTemplate(sections) {
  if (!sections.length) return "1fr";

  return sections
    .map((section) => `${Math.max(80, Math.round(Number(section.width) || 0))}fr`)
    .join(" ");
}

function getSectionSizeClass(width) {
  if (width < 420) return "is-narrow";
  if (width > 850) return "is-wide";
  return "is-medium";
}

function getSectionSemanticClass({ shelfCount, drawerCount, railCount, sectionWidth }) {
  const classes = [];

  if (drawerCount > 0) classes.push("has-drawers");
  if (shelfCount > 0) classes.push("has-shelves");
  if (railCount > 0) classes.push("has-rail");
  if (drawerCount > 1) classes.push("has-drawer-stack");
  if (drawerCount === 0 && railCount > 0 && sectionWidth > 720) classes.push("is-wardrobe-zone");
  if (sectionWidth > 850) classes.push("has-double-facade");

  return classes.join(" ");
}

function getResizeHandlePosition(sections, index) {
  const totalWidth = sections.reduce((sum, section) => sum + (Number(section.width) || 0), 0);
  const widthBeforeHandle = sections
    .slice(0, index + 1)
    .reduce((sum, section) => sum + (Number(section.width) || 0), 0);

  if (!totalWidth) return 0;
  return (widthBeforeHandle / totalWidth) * 100;
}

function formatWidth(value) {
  return `${Math.round(Number(value) || 0)} мм`;
}

export default function PremiumCabinetViewer({
  config,
  viewMode,
  viewType,
  zoom = 1,
  userHeight = 1750,
  activeSectionId,
  onSectionSelect,
  onResizeSectionPair,
}) {
  const [resizePreview, setResizePreview] = useState(null);
  const [orbit, setOrbit] = useState({ x: 0, y: 0 });
  const width = config.dimensions.width;
  const height = config.dimensions.height;
  const depth = config.dimensions.depth;
  const sections = config.sections || [];
  const sectionCount = Math.max(1, sections.length);
  const averageSectionWidth = Math.round(width / sectionCount);
  const bodyColor = getMaterialColor(config.materials.bodyMaterialId);
  const facadeColor = getMaterialColor(config.materials.facadeMaterialId || config.materials.bodyMaterialId);
  const showHandles = config.facade?.enabled && config.facade?.openingType === "with_handles";
  const humanPercent = Math.max(38, Math.min(100, Math.round((userHeight / Math.max(height, 1)) * 86)));
  const viewerStyle = getProportionalViewerStyle({
    width,
    height,
    depth,
    zoom,
    orbitX: orbit.x,
    orbitY: orbit.y,
  });
  const sectionGridTemplate = getSectionGridTemplate(sections);

  function handleSceneMove(event) {
    if (resizePreview || viewMode === "2D") return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    setOrbit({
      x: clamp(y * -2.8, -4, 4),
      y: clamp(x * 4.2, -6, 6),
    });
  }

  function resetSceneMove() {
    setOrbit({ x: 0, y: 0 });
  }

  function startResize(event, leftSection, rightSection, handleLeft) {
    if (!onResizeSectionPair || !leftSection || !rightSection) return;

    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startLeftWidth = Number(leftSection.width) || 0;
    const startRightWidth = Number(rightSection.width) || 0;
    let lastDelta = 0;

    setResizePreview({
      left: handleLeft,
      leftWidth: startLeftWidth,
      rightWidth: startRightWidth,
    });

    function handlePointerMove(moveEvent) {
      const pixelDelta = moveEvent.clientX - startX;
      const millimeterDelta = Math.round(pixelDelta * 4);
      const nextDelta = millimeterDelta - lastDelta;

      if (Math.abs(nextDelta) < 4) return;

      lastDelta += nextDelta;
      onResizeSectionPair(leftSection.id, rightSection.id, nextDelta);
      setResizePreview({
        left: handleLeft,
        leftWidth: startLeftWidth + lastDelta,
        rightWidth: startRightWidth - lastDelta,
      });
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.classList.remove("pv-is-resizing-section");
      setResizePreview(null);
    }

    document.body.classList.add("pv-is-resizing-section");
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  }

  return (
    <div
      className={`pv-root pv-${viewMode?.toLowerCase()} pv-view-${viewType} ${resizePreview ? "is-resizing" : ""}`}
      style={viewerStyle}
      onPointerMove={handleSceneMove}
      onPointerLeave={resetSceneMove}
    >
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

            <div className="pv-sections" style={{ gridTemplateColumns: sectionGridTemplate }}>
              {sections.map((section, index) => {
                const isActive = activeSectionId === section.id;
                const shelfCount = getItemCount(section, "shelf");
                const drawerCount = getItemCount(section, "drawer");
                const railCount = getItemCount(section, "hanger_rail");
                const isEmpty = shelfCount + drawerCount + railCount === 0;
                const sectionWidth = Number(section.width) || averageSectionWidth;
                const sizeClass = getSectionSizeClass(sectionWidth);
                const semanticClass = getSectionSemanticClass({ shelfCount, drawerCount, railCount, sectionWidth });

                return (
                  <button
                    type="button"
                    key={section.id}
                    className={`pv-section ${sizeClass} ${semanticClass} ${isActive ? "active" : ""} ${isEmpty ? "empty" : ""}`}
                    style={{ "--pv-section-width": sectionWidth }}
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

            {sections.length > 1 ? (
              <div className="pv-resize-handles" aria-hidden="true">
                {sections.slice(0, -1).map((section, index) => {
                  const nextSection = sections[index + 1];
                  const left = getResizeHandlePosition(sections, index);

                  return (
                    <button
                      type="button"
                      key={`${section.id}-${nextSection.id}`}
                      className="pv-resize-handle"
                      style={{ left: `${left}%` }}
                      onPointerDown={(event) => startResize(event, section, nextSection, left)}
                      title="Изменить ширину секций"
                    >
                      <span />
                    </button>
                  );
                })}
              </div>
            ) : null}

            {resizePreview ? (
              <div className="pv-resize-preview" style={{ left: `${resizePreview.left}%` }}>
                <span>{formatWidth(resizePreview.leftWidth)}</span>
                <b>|</b>
                <span>{formatWidth(resizePreview.rightWidth)}</span>
              </div>
            ) : null}
          </div>

          <div className="pv-dimension pv-dimension-width">{width} мм</div>
          <div className="pv-dimension pv-dimension-height">{height} мм</div>
          <div className="pv-dimension pv-dimension-depth">{depth} мм</div>
        </div>
      </div>

      <div className="pv-status">
        <span>{viewMode === "2D" ? "Blueprint 2D" : "Premium 3D preview"}</span>
        <b>{sectionCount} секц. · средняя {averageSectionWidth} мм</b>
      </div>
    </div>
  );
}
