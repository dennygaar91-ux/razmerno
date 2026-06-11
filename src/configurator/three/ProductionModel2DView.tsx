import { useState } from "react";
import { viewerGlassChipClass, viewerSurfaceClass } from "./visualSystem";
import type { ProductionModel, Panel } from "../../constructor/geometry";

interface ProductionModel2DViewProps {
  productionModel: ProductionModel;
  showDims: boolean;
  selectedPanelId: string | null;
  onSelectPanel: (panelId: string) => void;
}

const PADDING = 48;
const VIEW_W = 820;
const VIEW_H = 600;

const VISIBLE_PANEL_ROLES = [
  "side-left",
  "side-right",
  "top",
  "bottom",
  "vertical-partition",
  "shelf",
  "drawer-front",
  "facade-door",
  "plinth",
] as const;

export function ProductionModel2DView({
  productionModel,
  showDims,
  selectedPanelId,
  onSelectPanel,
}: ProductionModel2DViewProps) {
  const [hoveredPanelId, setHoveredPanelId] = useState<string | null>(null);
  const { widthMm, heightMm } = productionModel.dimensions;
  const scale = Math.min((VIEW_W - PADDING * 2) / widthMm, (VIEW_H - PADDING * 2) / heightMm);
  const x0 = (VIEW_W - widthMm * scale) / 2;
  const y0 = (VIEW_H + heightMm * scale) / 2;
  const activePanelId = selectedPanelId ?? hoveredPanelId;
  const activePanel = activePanelId ? productionModel.panels.find((panel) => panel.id === activePanelId) ?? null : null;

  const visiblePanels = productionModel.panels.filter((panel) =>
    VISIBLE_PANEL_ROLES.includes(panel.role as (typeof VISIBLE_PANEL_ROLES)[number]),
  );

  return (
    <div className={viewerSurfaceClass}>
      <div className={`absolute top-3 left-3 md:top-4 md:left-4 z-10 ${viewerGlassChipClass}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-ink)]" />
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--color-ink-soft)]">
          Схема шкафа
        </span>
      </div>

      {activePanel && (
        <div className="absolute left-3 bottom-3 md:left-4 md:bottom-4 z-10 max-w-[260px] rounded-[16px] bg-white/92 backdrop-blur-sm px-3 py-2 shadow-[0_1px_2px_rgba(10,10,10,0.06)]">
          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--color-mute)]">
            {selectedPanelId ? "Выбрана деталь" : "Под курсором"}
          </div>
          <div className="mt-0.5 font-display text-[13px] font-semibold text-[var(--color-ink)]">
            {activePanel.name}
          </div>
          <div className="mt-1 font-mono text-[10px] text-[var(--color-mute)] tabular-nums">
            {activePanel.widthMm} × {activePanel.heightMm} × {activePanel.thicknessMm} мм
          </div>
        </div>
      )}

      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="absolute inset-0 h-full w-full" role="img" aria-label="2D-чертёж мебели">
        <defs>
          <filter id="pm2d-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodOpacity="0.08" />
          </filter>
          <pattern id="pm2d-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(30,28,24,0.035)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#pm2d-grid)" />
        <rect
          x={x0}
          y={y0 - heightMm * scale}
          width={widthMm * scale}
          height={heightMm * scale}
          rx="10"
          fill="rgba(255,255,255,0.50)"
          stroke="rgba(30,28,24,0.16)"
          strokeWidth="1.2"
          filter="url(#pm2d-shadow)"
        />

        {visiblePanels.map((panel) => (
          <PanelRect
            key={panel.id}
            panel={panel}
            scale={scale}
            x0={x0}
            y0={y0}
            selected={panel.id === selectedPanelId}
            hovered={panel.id === hoveredPanelId}
            onSelectPanel={onSelectPanel}
            onHoverPanel={setHoveredPanelId}
          />
        ))}

        {showDims && (
          <>
            <DimensionLine
              x1={x0}
              y1={y0 + 32}
              x2={x0 + widthMm * scale}
              y2={y0 + 32}
              label={`${widthMm} мм`}
            />
            <DimensionLine
              x1={x0 - 32}
              y1={y0}
              x2={x0 - 32}
              y2={y0 - heightMm * scale}
              label={`${heightMm} мм`}
              vertical
            />
            <DimensionTick x={x0} y={y0 + 24} vertical />
            <DimensionTick x={x0 + widthMm * scale} y={y0 + 24} vertical />
            <DimensionTick x={x0 - 24} y={y0} />
            <DimensionTick x={x0 - 24} y={y0 - heightMm * scale} />
          </>
        )}
      </svg>
    </div>
  );
}

function PanelRect({
  panel,
  scale,
  x0,
  y0,
  selected,
  hovered,
  onSelectPanel,
  onHoverPanel,
}: {
  panel: Panel;
  scale: number;
  x0: number;
  y0: number;
  selected: boolean;
  hovered: boolean;
  onSelectPanel: (panelId: string) => void;
  onHoverPanel: (panelId: string | null) => void;
}) {
  const rect = panelRect(panel, scale, x0, y0);
  const facade = panel.role === "facade-door" || panel.role === "drawer-front";
  const structural = panel.role === "side-left" || panel.role === "side-right" || panel.role === "top" || panel.role === "bottom";
  const fill = facade
    ? "rgba(204,160,104,0.76)"
    : structural
    ? "rgba(255,253,248,0.96)"
    : "rgba(246,241,232,0.86)";
  const stroke = selected ? "rgba(20,18,16,0.95)" : hovered ? "rgba(251,110,59,0.85)" : "rgba(45,39,32,0.24)";
  const label = shouldShowLabel(panel, rect) ? shortPanelLabel(panel) : null;

  return (
    <g
      onMouseEnter={() => onHoverPanel(panel.id)}
      onMouseLeave={() => onHoverPanel(null)}
      onClick={() => onSelectPanel(panel.id)}
      className="cursor-pointer"
    >
      <rect
        x={rect.x}
        y={rect.y}
        width={Math.max(rect.w, 1)}
        height={Math.max(rect.h, 1)}
        rx={facade ? 6 : 3}
        fill={fill}
        stroke={stroke}
        strokeWidth={selected ? 2.2 : hovered ? 1.7 : 0.85}
        vectorEffect="non-scaling-stroke"
      />
      {label && (
        <text
          x={rect.x + rect.w / 2}
          y={rect.y + rect.h / 2 + 3}
          textAnchor="middle"
          fontSize="10"
          fontFamily="Montserrat, Arial, sans-serif"
          fontWeight="600"
          fill="rgba(25,22,18,0.58)"
          pointerEvents="none"
        >
          {label}
        </text>
      )}
    </g>
  );
}

function panelRect(panel: Panel, scale: number, x0: number, y0: number) {
  if (panel.role === "side-left" || panel.role === "side-right" || panel.role === "vertical-partition") {
    return {
      x: x0 + panel.position.xMm * scale,
      y: y0 - (panel.position.yMm + panel.heightMm) * scale,
      w: panel.thicknessMm * scale,
      h: panel.heightMm * scale,
    };
  }

  if (panel.role === "top" || panel.role === "bottom" || panel.role === "shelf" || panel.role === "plinth") {
    return {
      x: x0 + panel.position.xMm * scale,
      y: y0 - (panel.position.yMm + panel.thicknessMm) * scale,
      w: panel.widthMm * scale,
      h: panel.thicknessMm * scale,
    };
  }

  return {
    x: x0 + panel.position.xMm * scale,
    y: y0 - (panel.position.yMm + panel.heightMm) * scale,
    w: panel.widthMm * scale,
    h: panel.heightMm * scale,
  };
}

function DimensionLine({
  x1,
  y1,
  x2,
  y2,
  label,
  vertical = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  vertical?: boolean;
}) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(25,22,18,0.48)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <rect
        x={vertical ? midX - 24 : midX - 34}
        y={vertical ? midY - 9 : midY - 20}
        width={vertical ? 48 : 68}
        height="18"
        rx="9"
        fill="rgba(255,255,255,0.86)"
        stroke="rgba(25,22,18,0.08)"
      />
      <text
        x={midX}
        y={vertical ? midY + 4 : midY - 7}
        textAnchor="middle"
        fontSize="11"
        fontFamily="monospace"
        fill="rgba(25,22,18,0.68)"
      >
        {label}
      </text>
    </g>
  );
}

function DimensionTick({ x, y, vertical = false }: { x: number; y: number; vertical?: boolean }) {
  return vertical ? (
    <line x1={x} y1={y} x2={x} y2={y + 16} stroke="rgba(25,22,18,0.48)" strokeWidth="1" />
  ) : (
    <line x1={x - 16} y1={y} x2={x} y2={y} stroke="rgba(25,22,18,0.48)" strokeWidth="1" />
  );
}

function shouldShowLabel(panel: Panel, rect: { w: number; h: number }) {
  if (panel.role === "side-left" || panel.role === "side-right" || panel.role === "vertical-partition") return false;
  if (rect.w < 42 || rect.h < 18) return false;
  return panel.role === "facade-door" || panel.role === "drawer-front" || panel.role === "shelf" || panel.role === "plinth";
}

function shortPanelLabel(panel: Panel): string {
  switch (panel.role) {
    case "facade-door":
      return "Фасад";
    case "drawer-front":
      return "Ящик";
    case "shelf":
      return "Полка";
    case "plinth":
      return "Цоколь";
    default:
      return panel.name;
  }
}
