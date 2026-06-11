import type { ReactNode } from "react";
import type {
  ConstructorCompartmentLayout,
  ConstructorFillingLayout,
  ConstructorSection,
  ConstructorSectionFacadeLayout,
  ConstructorValidationState,
  FillKey,
  FurnitureKey,
  MaterialToken,
} from "../types";
import type { ModelMetrics } from "./ConstructorSceneModel";
import { getModelSections } from "./ConstructorSceneModel";
import type { SceneViewMode } from "./ConstructorSceneViewSwitch";

type SectionGeometry = { id: string; x: number; w: number };

type BlueprintCompartmentGeometry = {
  id: string;
  y: number;
  h: number;
  heightMm: number;
};

export function getBlueprintCompartmentGeometry(
  compartments: Array<{ id: string; heightMm: number }>,
  innerTop: number,
  innerHeight: number,
  fallbackHeightMm: number,
): BlueprintCompartmentGeometry[] {
  if (!compartments.length) {
    return [{ id: "empty", y: innerTop, h: innerHeight, heightMm: fallbackHeightMm }];
  }

  const totalHeight =
    compartments.reduce((sum, item) => sum + Math.max(0, item.heightMm), 0) ||
    fallbackHeightMm;
  let cursorY = innerTop;

  return compartments.map((compartment, index) => {
    const isLast = index === compartments.length - 1;
    const proportionalHeight =
      innerHeight * (Math.max(0, compartment.heightMm) / Math.max(1, totalHeight));
    const h = isLast ? Math.max(0, innerTop + innerHeight - cursorY) : proportionalHeight;
    const geometry = {
      id: compartment.id,
      y: cursorY,
      h,
      heightMm: compartment.heightMm,
    };
    cursorY += h;
    return geometry;
  });
}

export function getBlueprintActiveArea(
  compartments: BlueprintCompartmentGeometry[],
  selectedCompartmentId: string | null,
  innerTop: number,
  innerHeight: number,
) {
  const activeCompartment =
    compartments.find((compartment) => compartment.id === selectedCompartmentId) ?? null;

  if (!activeCompartment) {
    return { y: innerTop + 5, h: Math.max(12, innerHeight - 10) };
  }

  return {
    y: activeCompartment.y + 5,
    h: Math.max(12, activeCompartment.h - 10),
  };
}

function clampBlueprint(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function BlueprintFrame({
  width,
  height,
  depth,
  label,
  children,
}: {
  width: number;
  height: number;
  depth: number;
  label: string;
  children: ReactNode;
}) {
  return (
    <svg
      className="rzm-constructor-svg-model rzm-blueprint-svg rzm-blueprint-svg--r15 rzm-blueprint-svg--r24"
      viewBox="0 0 760 500"
      role="img"
      aria-label={label}
    >
      <rect className="rzm-blueprint-paper" x="20" y="18" width="720" height="464" rx="22" />
      <g className="rzm-blueprint-grid" aria-hidden="true">
        {Array.from({ length: 19 }).map((_, index) => (
          <line key={`v-${index}`} x1={56 + index * 36} y1="48" x2={56 + index * 36} y2="424" />
        ))}
        {Array.from({ length: 11 }).map((_, index) => (
          <line key={`h-${index}`} x1="56" y1={58 + index * 36} x2="704" y2={58 + index * 36} />
        ))}
      </g>
      {children}
      <g className="rzm-blueprint-sheet-note" aria-hidden="true">
        <text x="56" y="456">Чертёжный 2D-режим</text>
        <text x="704" y="456" textAnchor="end">{width} × {height} × {depth} мм</text>
      </g>
    </svg>
  );
}

function getDrawnSections({
  sectionLayout,
  fallbackSections,
  innerLeft,
  innerWidth,
  width,
}: {
  sectionLayout: ConstructorSection[];
  fallbackSections: SectionGeometry[];
  innerLeft: number;
  innerWidth: number;
  width: number;
}) {
  const normalizedSections =
    sectionLayout.length > 0
      ? sectionLayout
      : fallbackSections.map((section) => ({
          id: section.id,
          widthMm: Math.round(width / Math.max(1, fallbackSections.length || 1)),
        }));
  const totalWidth = normalizedSections.reduce((sum, section) => sum + section.widthMm, 0) || width;
  let cursorX = innerLeft;

  return normalizedSections.map((section, index) => {
    const sectionWidth = innerWidth * ((section.widthMm || width / normalizedSections.length) / Math.max(1, totalWidth));
    const geometry = {
      id: section.id,
      index,
      x: cursorX,
      w: sectionWidth,
      widthMm: section.widthMm || Math.round(width / normalizedSections.length),
    };
    cursorX += sectionWidth;
    return geometry;
  });
}

function FrontBlueprint({
  sections,
  sectionLayout,
  selectedSectionId,
  compartmentLayout,
  fillingLayout,
  facadeLayout,
  selectedCompartmentId,
  validation,
  width,
  height,
  depth,
  handleless,
}: {
  metrics: ModelMetrics;
  sections: SectionGeometry[];
  sectionLayout: ConstructorSection[];
  selectedSectionId: string | null;
  compartmentLayout: ConstructorCompartmentLayout;
  fillingLayout: ConstructorFillingLayout;
  facadeLayout: ConstructorSectionFacadeLayout;
  selectedCompartmentId: string | null;
  validation: ConstructorValidationState;
  width: number;
  height: number;
  depth: number;
  handleless: boolean;
}) {
  const frontHeight = clampBlueprint(342 + ((height - 2200) / 600) * 44, 326, 386);
  const frontWidth = clampBlueprint(frontHeight * (width / Math.max(1, height)), 300, 452);
  const frontX = 112 + (452 - frontWidth) / 2;
  const frontY = 58 + (386 - frontHeight) / 2;
  const innerPaddingX = 18;
  const innerPaddingTop = 28;
  const innerPaddingBottom = 24;
  const innerLeft = frontX + innerPaddingX;
  const innerRight = frontX + frontWidth - innerPaddingX;
  const innerTop = frontY + innerPaddingTop;
  const innerBottom = frontY + frontHeight - innerPaddingBottom;
  const innerWidth = innerRight - innerLeft;
  const innerHeight = innerBottom - innerTop;
  const validationTargetIds = new Set(validation.issues.map((issue) => issue.targetId).filter(Boolean));
  const drawnSections = getDrawnSections({ sectionLayout, fallbackSections: sections, innerLeft, innerWidth, width });
  const activeSection = drawnSections.find((section) => section.id === selectedSectionId) ?? drawnSections[0] ?? null;
  const activeCompartments = activeSection ? compartmentLayout[activeSection.id] ?? [] : [];
  const activeCompartmentArea = getBlueprintActiveArea(
    getBlueprintCompartmentGeometry(activeCompartments, innerTop, innerHeight, height),
    selectedCompartmentId,
    innerTop,
    innerHeight,
  );

  const sideX = 602;
  const sideY = 118;
  const sideW = clampBlueprint(62 + (depth / 900) * 70, 82, 128);
  const sideH = 236;

  return (
    <BlueprintFrame width={width} height={height} depth={depth} label="Чертёж мебели спереди">
      <g className="rzm-blueprint-view-title" aria-hidden="true">
        <text x={frontX + frontWidth / 2} y={frontY - 22} textAnchor="middle">Вид спереди</text>
        <text x={sideX + sideW / 2} y={sideY - 22} textAnchor="middle">Глубина</text>
      </g>

      <g className="rzm-blueprint-model rzm-blueprint-model--front-r24">
        <rect className="rzm-blueprint-corpus" x={frontX} y={frontY} width={frontWidth} height={frontHeight} rx="10" />
        <rect className="rzm-blueprint-inner" x={innerLeft} y={innerTop} width={innerWidth} height={innerHeight} rx="4" />

        {drawnSections.map((section) => {
          const compartments = compartmentLayout[section.id] ?? [];
          const drawnCompartments = getBlueprintCompartmentGeometry(compartments, innerTop, innerHeight, height);
          const sectionIssue = validationTargetIds.has(section.id);
          const isSelectedSection = section.id === selectedSectionId;

          return (
            <g key={section.id} className={`rzm-blueprint-section ${isSelectedSection ? "is-active" : ""} ${sectionIssue ? "has-issue" : ""}`}>
              <rect x={section.x} y={innerTop} width={section.w} height={innerHeight} />
              {drawnCompartments.slice(0, -1).map((compartment) => (
                <line key={`divider-${compartment.id}`} x1={section.x} y1={compartment.y + compartment.h} x2={section.x + section.w} y2={compartment.y + compartment.h} />
              ))}
              {drawnCompartments.map((compartment) => {
                const filling = fillingLayout[section.id]?.[compartment.id];
                const shelves = Math.min(filling?.shelvesCount ?? 0, 9);
                const drawers = Math.min(filling?.drawersCount ?? 0, 8);
                const rods = Math.min(filling?.rodsCount ?? 0, 2);
                const isActiveCompartment = isSelectedSection && compartment.id === selectedCompartmentId;
                const hasIssue = validationTargetIds.has(compartment.id);
                return (
                  <g key={`fill-${compartment.id}`} className={`rzm-blueprint-compartment ${isActiveCompartment ? "is-active" : ""} ${hasIssue ? "has-issue" : ""}`}>
                    {Array.from({ length: shelves }).map((_, index) => (
                      <line
                        key={`shelf-${index}`}
                        className="rzm-blueprint-shelf"
                        x1={section.x + 12}
                        y1={compartment.y + ((index + 1) / (shelves + 1)) * compartment.h}
                        x2={section.x + section.w - 12}
                        y2={compartment.y + ((index + 1) / (shelves + 1)) * compartment.h}
                      />
                    ))}
                    {Array.from({ length: drawers }).map((_, index) => {
                      const drawerHeight = Math.min(17, Math.max(10, compartment.h / Math.max(2, drawers + 2)));
                      return (
                        <rect
                          key={`drawer-${index}`}
                          className="rzm-blueprint-drawer"
                          x={section.x + 12}
                          y={compartment.y + compartment.h - drawerHeight - 9 - index * (drawerHeight + 5)}
                          width={Math.max(10, section.w - 24)}
                          height={drawerHeight}
                          rx="2"
                        />
                      );
                    })}
                    {Array.from({ length: rods }).map((_, index) => (
                      <line
                        key={`rod-${index}`}
                        className="rzm-blueprint-rod"
                        x1={section.x + 14}
                        y1={compartment.y + Math.min(34 + index * 18, compartment.h * 0.45)}
                        x2={section.x + section.w - 14}
                        y2={compartment.y + Math.min(34 + index * 18, compartment.h * 0.45)}
                      />
                    ))}
                    {hasIssue && (
                      <g className="rzm-blueprint-warning-marker" aria-hidden="true">
                        <circle cx={section.x + section.w - 14} cy={compartment.y + 14} r="6" />
                        <text x={section.x + section.w - 14} y={compartment.y + 18} textAnchor="middle">!</text>
                      </g>
                    )}
                  </g>
                );
              })}
              {facadeLayout[section.id] !== "open" && (
                <g className="rzm-blueprint-facade">
                  <rect x={section.x + 5} y={innerTop + 5} width={Math.max(8, section.w - 10)} height={innerHeight - 10} rx="3" />
                  {!handleless && (
                    <line x1={section.x + section.w - 14} y1={innerTop + innerHeight * 0.36} x2={section.x + section.w - 14} y2={innerTop + innerHeight * 0.48} />
                  )}
                </g>
              )}
            </g>
          );
        })}

        {drawnSections.slice(1).map((section) => (
          <line key={`divider-${section.id}`} className="rzm-blueprint-divider" x1={section.x} y1={innerTop - 8} x2={section.x} y2={innerBottom + 8} />
        ))}

        {activeSection && (
          <rect
            className="rzm-blueprint-active-area"
            x={activeSection.x + 6}
            y={activeCompartmentArea.y}
            width={Math.max(12, activeSection.w - 12)}
            height={activeCompartmentArea.h}
            rx="4"
          />
        )}

        {drawnSections.map((section) => (
          <text key={`label-${section.id}`} className="rzm-blueprint-section-label" x={section.x + section.w / 2} y={innerBottom + 25} textAnchor="middle">
            {section.index + 1}: {section.widthMm} мм
          </text>
        ))}
      </g>

      <g className="rzm-blueprint-side-mini" aria-hidden="true">
        <rect className="rzm-blueprint-corpus" x={sideX} y={sideY} width={sideW} height={sideH} rx="8" />
        <rect className="rzm-blueprint-inner" x={sideX + 13} y={sideY + 18} width={sideW - 26} height={sideH - 36} rx="4" />
        <line className="rzm-blueprint-facade-line" x1={sideX + sideW - 10} y1={sideY + 12} x2={sideX + sideW - 10} y2={sideY + sideH - 12} />
        <line className="rzm-blueprint-back-line" x1={sideX + 10} y1={sideY + 12} x2={sideX + 10} y2={sideY + sideH - 12} />
        <line className="rzm-blueprint-depth-line" x1={sideX} y1={sideY + sideH + 28} x2={sideX + sideW} y2={sideY + sideH + 28} />
        <path className="rzm-blueprint-depth-arrow" d={`M${sideX} ${sideY + sideH + 28} l8 -4 v8 z`} />
        <path className="rzm-blueprint-depth-arrow" d={`M${sideX + sideW} ${sideY + sideH + 28} l-8 -4 v8 z`} />
        <text className="rzm-blueprint-view-label" x={sideX + sideW / 2} y={sideY + sideH + 52} textAnchor="middle">{depth} мм</text>
      </g>

      <g className="rzm-blueprint-dimensions" aria-hidden="true">
        <line x1={frontX} y1={frontY + frontHeight + 46} x2={frontX + frontWidth} y2={frontY + frontHeight + 46} />
        <path d={`M${frontX} ${frontY + frontHeight + 46} l10 -5 v10 z`} />
        <path d={`M${frontX + frontWidth} ${frontY + frontHeight + 46} l-10 -5 v10 z`} />
        <text x={frontX + frontWidth / 2} y={frontY + frontHeight + 70} textAnchor="middle">{width} мм</text>
        <line x1={frontX - 40} y1={frontY} x2={frontX - 40} y2={frontY + frontHeight} />
        <path d={`M${frontX - 40} ${frontY} l-5 10 h10 z`} />
        <path d={`M${frontX - 40} ${frontY + frontHeight} l-5 -10 h10 z`} />
        <text x={frontX - 62} y={frontY + frontHeight / 2} textAnchor="middle" transform={`rotate(-90 ${frontX - 62} ${frontY + frontHeight / 2})`}>{height} мм</text>
      </g>
    </BlueprintFrame>
  );
}

function SideBlueprint({ width, height, depth }: { metrics: ModelMetrics; width: number; height: number; depth: number }) {
  const h = clampBlueprint(338 + ((height - 2200) / 600) * 42, 320, 382);
  const w = clampBlueprint(78 + (depth / 900) * 82, 96, 150);
  const x = 322;
  const y = 60 + (382 - h) / 2;
  return (
    <BlueprintFrame width={width} height={height} depth={depth} label="Чертёж мебели сбоку">
      <g className="rzm-blueprint-view-title" aria-hidden="true">
        <text x={x + w / 2} y={y - 24} textAnchor="middle">Вид сбоку</text>
      </g>
      <g className="rzm-blueprint-model rzm-blueprint-model--side-r24">
        <rect className="rzm-blueprint-corpus" x={x} y={y} width={w} height={h} rx="10" />
        <rect className="rzm-blueprint-inner" x={x + 15} y={y + 20} width={w - 30} height={h - 40} rx="5" />
        <line className="rzm-blueprint-facade-line" x1={x + w - 12} y1={y + 14} x2={x + w - 12} y2={y + h - 14} />
        <line className="rzm-blueprint-back-line" x1={x + 12} y1={y + 14} x2={x + 12} y2={y + h - 14} />
        <line className="rzm-blueprint-depth-line" x1={x} y1={y + h + 42} x2={x + w} y2={y + h + 42} />
        <path className="rzm-blueprint-depth-arrow" d={`M${x} ${y + h + 42} l10 -5 v10 z`} />
        <path className="rzm-blueprint-depth-arrow" d={`M${x + w} ${y + h + 42} l-10 -5 v10 z`} />
        <text className="rzm-blueprint-view-label" x={x + w / 2} y={y + h + 68} textAnchor="middle">Глубина {depth} мм</text>
      </g>
      <g className="rzm-blueprint-dimensions" aria-hidden="true">
        <line x1={x - 50} y1={y} x2={x - 50} y2={y + h} />
        <path d={`M${x - 50} ${y} l-5 10 h10 z`} />
        <path d={`M${x - 50} ${y + h} l-5 -10 h10 z`} />
        <text x={x - 72} y={y + h / 2} textAnchor="middle" transform={`rotate(-90 ${x - 72} ${y + h / 2})`}>{height} мм</text>
      </g>
    </BlueprintFrame>
  );
}

function TopBlueprint({
  metrics,
  sections,
  selectedSectionId,
  width,
  height,
  depth,
}: {
  metrics: ModelMetrics;
  sections: SectionGeometry[];
  selectedSectionId: string | null;
  width: number;
  height: number;
  depth: number;
}) {
  const x = 110;
  const y = 156;
  const w = 520;
  const h = clampBlueprint(90 + (depth / 900) * 96, 112, 178);
  const usableLeft = x + 18;
  const usableTop = y + 18;
  const usableW = w - 36;
  const usableH = h - 36;
  const scaleX = usableW / Math.max(1, metrics.innerRight - metrics.innerLeft);
  return (
    <BlueprintFrame width={width} height={height} depth={depth} label="Чертёж мебели сверху">
      <g className="rzm-blueprint-view-title" aria-hidden="true">
        <text x={x + w / 2} y={y - 26} textAnchor="middle">Вид сверху</text>
      </g>
      <g className="rzm-blueprint-model rzm-blueprint-model--top-r24">
        <rect className="rzm-blueprint-corpus" x={x} y={y} width={w} height={h} rx="10" />
        <rect className="rzm-blueprint-inner" x={usableLeft} y={usableTop} width={usableW} height={usableH} rx="4" />
        <line className="rzm-blueprint-facade-line" x1={usableLeft} y1={y + h - 13} x2={usableLeft + usableW} y2={y + h - 13} />
        <line className="rzm-blueprint-back-line" x1={usableLeft} y1={y + 13} x2={usableLeft + usableW} y2={y + 13} />
        {sections.map((section, index) => {
          const sx = usableLeft + (section.x - metrics.innerLeft) * scaleX;
          const sw = section.w * scaleX;
          return (
            <g key={section.id}>
              <rect className={`rzm-blueprint-plan-section ${section.id === selectedSectionId ? "is-active" : ""}`} x={sx} y={usableTop} width={sw} height={usableH} />
              {index > 0 && <line className="rzm-blueprint-divider" x1={sx} y1={usableTop - 8} x2={sx} y2={usableTop + usableH + 8} />}
            </g>
          );
        })}
        <text className="rzm-blueprint-top-label rzm-blueprint-top-label--front" x={x + w / 2} y={y + h + 30} textAnchor="middle">Фасад</text>
        <text className="rzm-blueprint-top-label rzm-blueprint-top-label--back" x={x + w / 2} y={y - 10} textAnchor="middle">Задняя стенка</text>
      </g>
      <g className="rzm-blueprint-dimensions" aria-hidden="true">
        <line x1={x} y1={y + h + 54} x2={x + w} y2={y + h + 54} />
        <path d={`M${x} ${y + h + 54} l10 -5 v10 z`} />
        <path d={`M${x + w} ${y + h + 54} l-10 -5 v10 z`} />
        <text x={x + w / 2} y={y + h + 80} textAnchor="middle">Ширина {width} мм</text>
        <line x1={x + w + 46} y1={y} x2={x + w + 46} y2={y + h} />
        <path d={`M${x + w + 46} ${y} l-5 10 h10 z`} />
        <path d={`M${x + w + 46} ${y + h} l-5 -10 h10 z`} />
        <text x={x + w + 68} y={y + h / 2} textAnchor="middle" transform={`rotate(-90 ${x + w + 68} ${y + h / 2})`}>Глубина {depth} мм</text>
      </g>
    </BlueprintFrame>
  );
}

export function ConstructorRealisticSvgModel({
  metrics,
  fill,
  sections,
  sectionLayout,
  selectedSectionId,
  compartmentLayout,
  fillingLayout,
  facadeLayout,
  selectedCompartmentId,
  validation,
  material,
  facadeMaterial,
  furniture,
  handleless,
  viewMode,
  widthMm,
  heightMm,
  depthMm,
}: {
  metrics: ModelMetrics;
  depthOffset: number;
  fill: FillKey;
  compartments: number;
  sections: number;
  sectionLayout: ConstructorSection[];
  selectedSectionId: string | null;
  compartmentLayout: ConstructorCompartmentLayout;
  fillingLayout: ConstructorFillingLayout;
  facadeLayout: ConstructorSectionFacadeLayout;
  selectedCompartmentId: string | null;
  validation: ConstructorValidationState;
  material: MaterialToken;
  facadeMaterial: MaterialToken;
  furniture: FurnitureKey;
  handleless: boolean;
  viewMode: SceneViewMode;
  widthMm: number;
  heightMm: number;
  depthMm: number;
}) {
  const model = getModelSections(sections, metrics, sectionLayout);
  const width = widthMm;
  const height = heightMm;
  const depth = depthMm;
  const normalizedView = viewMode === "free" ? "front" : viewMode;

  return (
    <div
      className="rzm-constructor-model rzm-constructor-model--svg rzm-constructor-model--blueprint rzm-constructor-model--blueprint-r24"
      data-material={material}
      data-facade-material={facadeMaterial}
      data-fill={fill}
      data-view={normalizedView}
      data-furniture={furniture}
      aria-label="2D-чертёж мебели"
    >
      {normalizedView === "side" ? (
        <SideBlueprint metrics={metrics} width={width} height={height} depth={depth} />
      ) : normalizedView === "top" ? (
        <TopBlueprint metrics={metrics} sections={model.innerSections} selectedSectionId={selectedSectionId} width={width} height={height} depth={depth} />
      ) : (
        <FrontBlueprint
          metrics={metrics}
          sections={model.innerSections}
          sectionLayout={sectionLayout}
          selectedSectionId={selectedSectionId}
          compartmentLayout={compartmentLayout}
          fillingLayout={fillingLayout}
          facadeLayout={facadeLayout}
          selectedCompartmentId={selectedCompartmentId}
          validation={validation}
          width={width}
          height={height}
          depth={depth}
          handleless={handleless}
        />
      )}
    </div>
  );
}
