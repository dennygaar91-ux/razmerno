import type { ReactElement } from "react";
import { hasErrors } from "./context";
import { useConfigBridge } from "./store/useConfigBridge";

type HighlightPart = "body" | "sections" | "shelves" | "drawers" | "rod" | "facade" | null;

/**
 * Pseudo-3D визуализация. Светлый премиум-фон.
 * Поддерживает highlight: затемняет всё, кроме целевой группы элементов
 * (используется при наведении/фокусе на контролов в шагах).
 *
 * Reward moments (tone-pass 2026-05-24):
 * Верхний chip показывает assembly-status по шагу — встраивает превью
 * в нарратив сборки.
 */

// Reward-сообщения по шагам — постоянные, встроены в превью, не всплывают
const HIGHLIGHT_LABEL: Record<NonNullable<HighlightPart>, string> = {
  body: "каркас",
  sections: "секции",
  shelves: "полки",
  drawers: "ящики",
  rod: "штанга",
  facade: "фасады",
};

export function Visualization() {
  const { state, bodyMaterial, facadeMaterial, validation } = useConfigBridge();

  if (!state.type) return null;

  const blocked = hasErrors(validation);
  const highlight = state.highlightedPart;

  const chipText = highlight
    ? `Смотрим на ${HIGHLIGHT_LABEL[highlight]}`
    : blocked
    ? "Проверьте размеры"
    : null;

  return (
    <div className="relative w-full h-full min-h-[280px] sm:min-h-[320px] md:min-h-[520px] rounded-[32px] bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.70)_30%,rgba(255,255,255,0)_58%),linear-gradient(180deg,#fffdf8_0%,#f3efe6_100%)] overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.55) 28%, rgba(255,255,255,0) 58%), radial-gradient(circle at 50% 78%, rgba(10,10,10,0.055) 0%, rgba(10,10,10,0) 45%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[7%] bottom-[12%] h-px opacity-60"
        style={{ background: "linear-gradient(90deg, transparent, rgba(10,10,10,0.14), transparent)" }}
      />

      {chipText && (
        <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/88 backdrop-blur-sm shadow-[0_1px_2px_rgba(10,10,10,0.04)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--rzm-text-main)] opacity-60" />
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--rzm-text-muted)]">
            {chipText}
          </span>
        </div>
      )}

      {/* Dimensions chip */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10 inline-flex items-center px-2.5 py-1.5 rounded-full bg-white/82 backdrop-blur-sm font-mono text-[10.5px] tabular-nums text-[var(--rzm-text-muted)] shadow-[0_1px_2px_rgba(10,10,10,0.035)]">
        {state.width} × {state.height} × {state.depth}
      </div>

      <svg viewBox="0 0 700 600" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        <FurnitureScene
          type={state.type}
          width={state.width}
          height={state.height}
          depth={state.depth}
          sections={state.sections}
          shelves={state.filling.shelves}
          drawers={state.filling.drawers}
          hangingRod={state.filling.hangingRod}
          bodyColor={bodyMaterial.faces}
          facadeColor={facadeMaterial.faces}
          facadeStyle={state.facadeStyleId}
          highlight={state.highlightedPart}
        />
      </svg>
    </div>
  );
}


interface SceneProps {
  type: "wardrobe" | "dresser" | "nightstand";
  width: number;
  height: number;
  depth: number;
  sections: number;
  shelves: number;
  drawers: number;
  hangingRod: boolean;
  bodyColor: [string, string, string];
  facadeColor: [string, string, string];
  facadeStyle: string;
  highlight: HighlightPart;
}

function FurnitureScene(p: SceneProps) {
  const maxDim = Math.max(p.width, p.height, p.depth);
  const scale = 380 / maxDim;
  const W = p.width * scale;
  const H = p.height * scale;
  const D = p.depth * scale;

  const cx = 335;
  const cy = 505;

  const iso = (x: number, y: number, z: number) => ({
    x: cx + (x - z) * 0.85,
    y: cy - y + (x + z) * 0.32,
  });

  const panelThk = 2.5;
  const pts = (arr: { x: number; y: number }[]) =>
    arr.map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(" ");

  const Box = ({
    x, y, z, w, h, d, faces, stroke = "rgba(55,48,40,0.08)",
  }: {
    x: number; y: number; z: number; w: number; h: number; d: number;
    faces: [string, string, string]; stroke?: string;
  }) => {
    const A = iso(x, y, z);
    const B = iso(x + w, y, z);
    const C = iso(x + w, y + h, z);
    const Dp = iso(x, y + h, z);
    const F = iso(x + w, y, z + d);
    const G = iso(x + w, y + h, z + d);
    const Hp = iso(x, y + h, z + d);
    return (
      <g>
        <polygon points={pts([Dp, C, G, Hp])} fill={faces[1]} stroke={stroke} strokeWidth="0.45" />
        <polygon points={pts([B, C, G, F])} fill={faces[2]} stroke={stroke} strokeWidth="0.45" />
        <polygon points={pts([A, B, C, Dp])} fill={faces[0]} stroke={stroke} strokeWidth="0.45" />
      </g>
    );
  };

  // ──────────────────────────────────────
  // Группируем элементы по типам, чтобы один <g> на тип
  // → одна opacity-transition на группу
  // ──────────────────────────────────────
  const bodyShell: ReactElement[] = [];
  bodyShell.push(<Box key="bottom" x={0} y={0} z={0} w={W} h={panelThk} d={D} faces={p.bodyColor} />);
  bodyShell.push(<Box key="top" x={0} y={H - panelThk} z={0} w={W} h={panelThk} d={D} faces={p.bodyColor} />);
  bodyShell.push(<Box key="left" x={0} y={panelThk} z={0} w={panelThk} h={H - panelThk * 2} d={D} faces={p.bodyColor} />);
  bodyShell.push(<Box key="right" x={W - panelThk} y={panelThk} z={0} w={panelThk} h={H - panelThk * 2} d={D} faces={p.bodyColor} />);
  bodyShell.push(<Box key="back" x={panelThk} y={panelThk} z={D - panelThk / 2} w={W - panelThk * 2} h={H - panelThk * 2} d={panelThk / 2} faces={shade(p.bodyColor, -14)} />);

  const dividers: ReactElement[] = [];
  const innerW = W - panelThk * 2;
  for (let i = 1; i < p.sections; i++) {
    const x = panelThk + (innerW * i) / p.sections;
    dividers.push(<Box key={`div-${i}`} x={x - panelThk / 2} y={panelThk} z={0} w={panelThk} h={H - panelThk * 2} d={D} faces={p.bodyColor} />);
  }

  const shelves: ReactElement[] = [];
  const drawers: ReactElement[] = [];
  const rods: ReactElement[] = [];
  const sectionW = innerW / p.sections;

  for (let s = 0; s < p.sections; s++) {
    const sx = panelThk + sectionW * s;
    const innerSectionW = sectionW - panelThk;
    const sectionH = H - panelThk * 2;

    if (p.drawers > 0 && s === 0) {
      const drawerZoneH = Math.min(sectionH * 0.6, p.drawers * 40);
      const drawerH = drawerZoneH / p.drawers - 1.5;
      for (let d = 0; d < p.drawers; d++) {
        const y = panelThk + d * (drawerH + 1.5);
        drawers.push(
          <Box
            key={`drawer-${s}-${d}`}
            x={sx + panelThk * 1.5} y={y} z={0}
            w={innerSectionW - panelThk * 2} h={drawerH} d={D * 0.85}
            faces={p.facadeColor}
          />,
        );
      }
      const shelfZoneStart = panelThk + drawerZoneH + 4;
      const shelfCount = Math.max(0, Math.floor(p.shelves / p.sections));
      for (let sh = 0; sh < shelfCount; sh++) {
        const y = shelfZoneStart + ((sh + 1) * (sectionH - drawerZoneH - 4)) / (shelfCount + 1);
        shelves.push(
          <Box
            key={`shelf-${s}-${sh}`}
            x={sx + panelThk} y={y} z={panelThk}
            w={innerSectionW - panelThk} h={panelThk * 0.55} d={D - panelThk * 1.5}
            faces={p.bodyColor}
          />,
        );
      }
    } else {
      const shelfCount = Math.max(0, Math.floor(p.shelves / p.sections));
      for (let sh = 0; sh < shelfCount; sh++) {
        const y = panelThk + ((sh + 1) * sectionH) / (shelfCount + 1);
        shelves.push(
          <Box
            key={`shelf-${s}-${sh}`}
            x={sx + panelThk} y={y} z={panelThk}
            w={innerSectionW - panelThk} h={panelThk * 0.55} d={D - panelThk * 1.5}
            faces={p.bodyColor}
          />,
        );
      }
      if (p.hangingRod && s === p.sections - 1) {
        const rodY = H - panelThk - sectionH * 0.18;
        const a = iso(sx + panelThk + 3, rodY, D * 0.5);
        const b = iso(sx + innerSectionW - 3, rodY, D * 0.5);
        rods.push(
          <line
            key={`rod-${s}`}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke="#8a8480" strokeWidth="1.5" strokeLinecap="round"
          />,
        );
      }
    }
  }

  const facades: ReactElement[] = [];
  const facadeThk = 2;
  if (p.type === "wardrobe") {
    for (let s = 0; s < p.sections; s++) {
      const x = panelThk + sectionW * s;
      facades.push(
        <Box
          key={`fac-${s}`}
          x={x + 1} y={panelThk + 1} z={-facadeThk}
          w={sectionW - 2} h={H - panelThk * 2 - 2} d={facadeThk}
          faces={p.facadeColor}
          stroke="rgba(0,0,0,0.08)"
        />,
      );
      if (p.facadeStyle === "regular") {
        const hx = x + sectionW - 8;
        const hy = H / 2;
        const a = iso(hx, hy - 6, -facadeThk);
        const b = iso(hx, hy + 6, -facadeThk);
        facades.push(<line key={`fh-${s}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(25,22,18,0.34)" strokeWidth="1.15" strokeLinecap="round" />);
      } else if (p.facadeStyle === "hidden-handle") {
        const a = iso(x + 5, H - panelThk - 4, -facadeThk);
        const b = iso(x + sectionW - 5, H - panelThk - 4, -facadeThk);
        facades.push(<line key={`gh-${s}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(25,22,18,0.24)" strokeWidth="0.75" strokeLinecap="round" />);
      }
    }
  }

  const shadowCenter = iso(W / 2, 0, D / 2);
  const floorA = iso(-W * 0.16, 0, -D * 0.18);
  const floorB = iso(W * 1.14, 0, -D * 0.18);
  const floorC = iso(W * 1.14, 0, D * 1.08);
  const floorD = iso(-W * 0.16, 0, D * 1.08);

  // Opacity для подсветки: если есть highlight — затемняем всё, кроме целевой группы.
  // Когда фокус на внутренних элементах (полки/ящики/штанга/секции) — фасады
  // делаются почти прозрачными, чтобы было видно, что внутри.
  const op = (groupPart: HighlightPart): number => {
    if (!p.highlight) return 1;
    if (groupPart === p.highlight) return 1;

    const lookingInside =
      p.highlight === "shelves" ||
      p.highlight === "drawers" ||
      p.highlight === "rod" ||
      p.highlight === "sections";

    // Корпус — всегда виден как контекст
    if (groupPart === "body") return p.highlight === "facade" ? 0.7 : 0.55;

    // Если пользователь смотрит внутрь — почти прячем фасады
    if (groupPart === "facade" && lookingInside) return 0.12;

    return 0.32;
  };
  const transitionStyle = { transition: "opacity 220ms cubic-bezier(0.22,1,0.36,1)" } as const;

  return (
    <>
      <defs>
        <linearGradient id="floor-plane-light" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.62" />
          <stop offset="1" stopColor="#e5e0d5" stopOpacity="0.34" />
        </linearGradient>
        <radialGradient id="floor-shadow-light" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.2" />
          <stop offset="0.55" stopColor="#000" stopOpacity="0.07" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <filter id="blur-light" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id="cabinet-depth-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#3a3328" floodOpacity="0.16" />
        </filter>
      </defs>

      <polygon
        points={pts([floorA, floorB, floorC, floorD])}
        fill="url(#floor-plane-light)"
        stroke="rgba(10,10,10,0.045)"
        strokeWidth="0.8"
      />

      <ellipse
        cx={shadowCenter.x}
        cy={shadowCenter.y + 10}
        rx={W * 0.76}
        ry={D * 0.4}
        fill="url(#floor-shadow-light)"
        filter="url(#blur-light)"
      />

      <g filter="url(#cabinet-depth-shadow)">
      {/* Корпус */}
      <g className="module-in" style={{ ...transitionStyle, opacity: op("body") }}>
        {bodyShell}
      </g>

      {/* Перегородки секций */}
      {dividers.length > 0 && (
        <g style={{ ...transitionStyle, opacity: op("sections") }}>
          {dividers}
        </g>
      )}

      {/* Полки */}
      {shelves.length > 0 && (
        <g className="module-in" style={{ ...transitionStyle, opacity: op("shelves"), animationDelay: "100ms" }}>
          {shelves}
        </g>
      )}

      {/* Ящики */}
      {drawers.length > 0 && (
        <g className="module-in" style={{ ...transitionStyle, opacity: op("drawers"), animationDelay: "120ms" }}>
          {drawers}
        </g>
      )}

      {/* Штанга */}
      {rods.length > 0 && (
        <g className="module-in" style={{ ...transitionStyle, opacity: op("rod"), animationDelay: "140ms" }}>
          {rods}
        </g>
      )}

      {/* Фасады */}
      {facades.length > 0 && (
        <g className="module-in" style={{ ...transitionStyle, opacity: op("facade"), animationDelay: "200ms" }}>
          {facades}
        </g>
      )}
      </g>
    </>
  );
}

function shade(colors: [string, string, string], amount: number): [string, string, string] {
  return colors.map((c) => shadeHex(c, amount)) as [string, string, string];
}
function shadeHex(hex: string, amount: number) {
  const h = hex.replace("#", "");
  const num = parseInt(h, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0xff) + amount;
  let b = (num & 0xff) + amount;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
