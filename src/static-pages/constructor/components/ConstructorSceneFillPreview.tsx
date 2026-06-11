import type {
  ConstructorCompartmentLayout,
  ConstructorFillingLayout,
  ConstructorSection,
  FillKey,
} from "../types";
import {
  clamp,
  getModelSections,
  getShelfLines,
  type ModelMetrics,
} from "./ConstructorSceneModel";

export function FillPreview({
  fill,
  compartments,
  sections,
  metrics,
  sectionLayout,
  compartmentLayout,
  fillingLayout,
  selectedCompartmentId,
}: {
  fill: FillKey;
  compartments: number;
  sections: number;
  metrics: ModelMetrics;
  sectionLayout?: ConstructorSection[];
  compartmentLayout?: ConstructorCompartmentLayout;
  fillingLayout?: ConstructorFillingLayout;
  selectedCompartmentId?: string | null;
}) {
  const model = getModelSections(sections, metrics, sectionLayout);
  const fallbackShelfLines = getShelfLines(compartments, metrics);
  const innerHeight = metrics.innerBottom - metrics.innerTop;

  const compartmentLines = model.innerSections.flatMap((section) => {
    const layout = compartmentLayout?.[section.id];
    if (!layout || layout.length <= 1) return [];
    const total = Math.max(
      1,
      layout.reduce((sum, compartment) => sum + compartment.heightMm, 0),
    );
    let offset = 0;
    return layout.slice(0, -1).map((compartment) => {
      offset += compartment.heightMm;
      return {
        id: `${section.id}-${compartment.id}`,
        x1: section.x,
        x2: section.x + section.w,
        y: metrics.innerTop + (innerHeight * offset) / total,
      };
    });
  });

  const compartmentRects = model.innerSections.flatMap((section) => {
    const layout = compartmentLayout?.[section.id];
    if (!layout || layout.length === 0) return [];
    const total = Math.max(
      1,
      layout.reduce((sum, compartment) => sum + compartment.heightMm, 0),
    );
    let offset = 0;
    return layout.map((compartment) => {
      const y = metrics.innerTop + (innerHeight * offset) / total;
      const h = (innerHeight * compartment.heightMm) / total;
      offset += compartment.heightMm;
      return {
        sectionId: section.id,
        compartmentId: compartment.id,
        x: section.x,
        w: section.w,
        y,
        h,
        filling: fillingLayout?.[section.id]?.[compartment.id],
      };
    });
  });

  const hasExplicitFilling = compartmentRects.some(
    (item) =>
      (item.filling?.shelvesCount ?? 0) > 0 ||
      (item.filling?.drawersCount ?? 0) > 0 ||
      (item.filling?.rodsCount ?? 0) > 0,
  );

  if (hasExplicitFilling) {
    return (
      <>
        {compartmentRects.map((item) => {
          const shelves = Math.max(0, item.filling?.shelvesCount ?? 0);
          const drawers = Math.max(0, item.filling?.drawersCount ?? 0);
          const rods = Math.max(0, item.filling?.rodsCount ?? 0);
          const isSelected = item.compartmentId === selectedCompartmentId;
          return (
            <g
              key={`${item.sectionId}-${item.compartmentId}-filling`}
              className={`rzm-svg-fill-group ${isSelected ? "is-selected" : ""}`}
            >
              {Array.from({ length: shelves }, (_, shelfIndex) => {
                const y = item.y + (item.h / (shelves + 1)) * (shelfIndex + 1);
                return (
                  <line
                    key={`shelf-${shelfIndex}`}
                    className="rzm-svg-shelf"
                    x1={item.x + 8}
                    y1={y}
                    x2={item.x + item.w - 8}
                    y2={y}
                  />
                );
              })}

              {drawers > 0 &&
                Array.from({ length: drawers }, (_, drawerIndex) => {
                  const gap = 5;
                  const drawerHeight = clamp(
                    (item.h - gap * (drawers + 1)) / drawers,
                    18,
                    38,
                  );
                  const y =
                    item.y +
                    item.h -
                    gap -
                    drawerHeight * (drawers - drawerIndex) -
                    gap * (drawers - drawerIndex - 1);
                  return (
                    <rect
                      key={`drawer-${drawerIndex}`}
                      className="rzm-svg-drawer"
                      x={item.x + 8}
                      y={y}
                      width={Math.max(24, item.w - 16)}
                      height={drawerHeight}
                      rx={8}
                    />
                  );
                })}

              {Array.from({ length: rods }, (_, rodIndex) => {
                const y = item.y + item.h * (0.28 + rodIndex * 0.22);
                const center = item.x + item.w / 2;
                return (
                  <g key={`rod-${rodIndex}`}>
                    <line
                      className="rzm-svg-rod"
                      x1={item.x + 12}
                      y1={y}
                      x2={item.x + item.w - 12}
                      y2={y}
                    />
                    <path
                      className="rzm-svg-hanger"
                      d={`M ${center} ${y + 2} L ${center - 12} ${y + 30} L ${center + 12} ${y + 30} Z`}
                    />
                  </g>
                );
              })}
            </g>
          );
        })}
        {compartmentLines.map((line) => (
          <line
            key={line.id}
            className="rzm-svg-line rzm-svg-line--soft rzm-svg-compartment-divider"
            x1={line.x1}
            y1={line.y}
            x2={line.x2}
            y2={line.y}
          />
        ))}
      </>
    );
  }

  if (fill === "drawers") {
    const drawerHeight = clamp(
      (metrics.innerBottom - metrics.innerTop) / 8.2,
      26,
      38,
    );
    const drawerGap = clamp(drawerHeight * 0.22, 7, 10);
    const firstDrawerY =
      metrics.innerBottom - drawerHeight * 3 - drawerGap * 2 - 8;

    return (
      <>
        {model.innerSections.map((section, sectionIndex) => (
          <g key={`drawers-${sectionIndex}`} className="rzm-svg-fill-group">
            {[0, 1, 2].map((drawerIndex) => (
              <rect
                key={`drawer-${sectionIndex}-${drawerIndex}`}
                className="rzm-svg-drawer"
                x={section.x + 6}
                y={firstDrawerY + drawerIndex * (drawerHeight + drawerGap)}
                width={Math.max(28, section.w - 12)}
                height={drawerHeight}
                rx={9}
              />
            ))}
          </g>
        ))}
        {compartmentLines.map((line) => (
          <line
            key={line.id}
            className="rzm-svg-line rzm-svg-line--soft rzm-svg-compartment-divider"
            x1={line.x1}
            y1={line.y}
            x2={line.x2}
            y2={line.y}
          />
        ))}
      </>
    );
  }

  if (fill === "rod") {
    const rodY =
      metrics.innerTop + (metrics.innerBottom - metrics.innerTop) * 0.2;
    const shelfY =
      metrics.innerTop + (metrics.innerBottom - metrics.innerTop) * 0.58;

    return (
      <>
        {model.innerSections.map((section, sectionIndex) => {
          const center = section.x + section.w / 2;

          return (
            <g key={`rod-${sectionIndex}`} className="rzm-svg-fill-group">
              <line
                className="rzm-svg-rod"
                x1={section.x + 12}
                y1={rodY}
                x2={section.x + section.w - 12}
                y2={rodY}
              />
              <path
                className="rzm-svg-hanger"
                d={`M ${center} ${rodY + 2} L ${center - 14} ${rodY + 38} L ${center + 14} ${rodY + 38} Z`}
              />
            </g>
          );
        })}
        <line
          className="rzm-svg-line rzm-svg-line--soft"
          x1={metrics.innerLeft}
          y1={shelfY}
          x2={metrics.innerRight}
          y2={shelfY}
        />
        {compartmentLines.map((line) => (
          <line
            key={line.id}
            className="rzm-svg-line rzm-svg-line--soft rzm-svg-compartment-divider"
            x1={line.x1}
            y1={line.y}
            x2={line.x2}
            y2={line.y}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {(compartmentLines.length
        ? compartmentLines
        : fallbackShelfLines.map((y, index) => ({
            id: `shelf-${index}`,
            x1: metrics.innerLeft,
            x2: metrics.innerRight,
            y,
          }))
      ).map((line) => (
        <line
          key={line.id}
          className="rzm-svg-shelf rzm-svg-compartment-divider"
          x1={line.x1}
          y1={line.y}
          x2={line.x2}
          y2={line.y}
        />
      ))}
      {model.innerSections.map((section, index) => (
        <rect
          key={`box-${index}`}
          className={`rzm-svg-storage-box ${selectedCompartmentId ? "has-selected-compartment" : ""}`}
          x={section.x + 11}
          y={metrics.innerBottom - 58}
          width={Math.max(26, section.w - 22)}
          height={42}
          rx={10}
        />
      ))}
    </>
  );
}
