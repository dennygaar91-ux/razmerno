/**
 * FurnitureModel — рендерит всю мебель из ProductionModel.
 *
 * Берёт panels[], hardware[] (видимое), drilling[] (только в debug),
 * и связывает с UI highlight через highlightedPart (body/sections/shelves/...).
 *
 * Selected panel — отдельный state в ThreeViewer, прокидывается сюда.
 */
import type { ProductionModel } from "../../constructor/geometry";
import type { HighlightPart } from "./viewerTypes";
import { PanelMesh } from "./PanelMesh";
import { HardwareMesh } from "./HardwareMesh";

interface FurnitureModelProps {
  productionModel: ProductionModel;
  highlight: HighlightPart;
  selectedPanelId: string | null;
  exploded: boolean;
  showHardware: boolean;
  showDrilling: boolean;
  onSelectPanel: (panelId: string) => void;
  onHoverPanel: (panelId: string | null) => void;
}

export function FurnitureModel({
  productionModel,
  highlight,
  selectedPanelId,
  exploded,
  showHardware,
  showDrilling,
  onSelectPanel,
  onHoverPanel,
}: FurnitureModelProps) {
  const explodedFactor = 0.15; // 15 cm разлёт

  return (
    <group>
      {productionModel.panels.map((panel) => {
        const isHighlighted =
          panel.id === selectedPanelId ||
          isInHighlightGroup(panel.role, highlight);
        const isDimmed = highlight !== null && !isHighlighted;
        return (
          <PanelMesh
            key={panel.id}
            panel={panel}
            highlight={isHighlighted}
            dimmed={isDimmed}
            exploded={exploded}
            explodedFactor={explodedFactor}
            onClick={(id) => onSelectPanel(id)}
            onPointerOver={(id) => onHoverPanel(id)}
            onPointerOut={() => onHoverPanel(null)}
          />
        );
      })}

      {showHardware &&
        productionModel.hardware
          .filter((h) => h.visibleInViewer)
          .map((h) => <HardwareMesh key={h.id} hardware={h} exploded={exploded} explodedFactor={explodedFactor} />)}

      {showDrilling &&
        productionModel.drilling.map((d) => (
          <DrillMark key={d.id} xMm={d.xMm} yMm={d.yMm} zMm={d.zMm} />
        ))}
    </group>
  );
}

function isInHighlightGroup(role: string, highlight: HighlightPart): boolean {
  if (!highlight) return false;
  switch (highlight) {
    case "body":
      return ["side-left", "side-right", "top", "bottom", "plinth"].includes(role);
    case "sections":
      return role === "vertical-partition";
    case "shelves":
      return role === "shelf";
    case "drawers":
      return role === "drawer-front";
    case "rod":
      return false; // штанга это hardware, не panel — подсветим через hardware mesh
    case "facade":
      return role === "facade-door" || role === "drawer-front";
    default:
      return false;
  }
}

interface DrillMarkProps {
  xMm: number;
  yMm: number;
  zMm: number;
}

function DrillMark({ xMm, yMm, zMm }: DrillMarkProps) {
  const MM_TO_M = 0.001;
  return (
    <mesh position={[xMm * MM_TO_M, yMm * MM_TO_M, zMm * MM_TO_M]}>
      <sphereGeometry args={[0.004, 8, 8]} />
      <meshBasicMaterial color="#ff5a1f" />
    </mesh>
  );
}
