/**
 * Построение распашных фасадов (двери).
 * MVP-правила:
 *  - режим "drawers" → фасадов на дверях нет, всё в buildDrawers
 *  - режим "hinged" → по одной двери на секцию (или две, если doorSwing=pair и широко)
 *  - режим "open" → фасадов нет
 *  - зазор между фасадами 3 мм
 */
import type { FurnitureProject, Panel, ProductionModelWarning } from "./types";
import { createGeometryBuildContext, type GeometryBuildContext } from "./buildContext";
import { facadeEdgeAll } from "./edgeBanding";
import { getSectionMetrics } from "./layoutMetrics";

const PLINTH_HEIGHT_MM = 100;
const FACADE_GAP_MM = 3;


export function buildFacades(
  p: FurnitureProject,
  buildContext: GeometryBuildContext = createGeometryBuildContext(),
): { panels: Panel[]; warnings: ProductionModelWarning[] } {
  const panels: Panel[] = [];
  const warnings: ProductionModelWarning[] = [];

  if (p.structure.facadeMode === "drawers") return { panels, warnings };

  const hasPerSectionFacades = p.structure.layout?.sections?.some((section) => section.facadeMode === "hinged");
  if (p.structure.facadeMode === "open" && !hasPerSectionFacades) return { panels, warnings };

  const H = p.dimensions.heightMm;
  const T = p.material.bodyThicknessMm;
  const matFacade = p.material.facadeMaterialId;
  const facadeT = p.material.facadeThicknessMm;

  const hasPlinth = p.productType === "wardrobe";
  const plinthH = hasPlinth ? PLINTH_HEIGHT_MM : 0;

  const sectionMetrics = getSectionMetrics(p);

  // Высота фасада: от верха цоколя до низа крышки, минус зазоры
  const facadeFullH = H - plinthH - FACADE_GAP_MM * 2;
  const facadeYBottom = plinthH + FACADE_GAP_MM;

  for (let s = 0; s < sectionMetrics.length; s++) {
    const metric = sectionMetrics[s];
    const sectionInnerW = metric.innerWidthMm;
    const sectionFacadeMode = metric.section?.facadeMode ?? p.structure.facadeMode;
    if (sectionFacadeMode === "open") continue;
    // Для шкафа > 700 мм секций делаем пару створок на секцию
    const doublePerSection = sectionInnerW >= 700;
    // В первой секции мы могли отдать пространство ящикам
    let topOfDrawers = facadeYBottom;
    if (s === 0 && p.structure.drawers > 0) {
      const usableInnerH = H - plinthH - T * 2;
      const drawerZoneH = Math.min(usableInnerH * 0.55, p.structure.drawers * 200);
      topOfDrawers = plinthH + T + drawerZoneH + FACADE_GAP_MM;
    }
    const facadeBottomY = topOfDrawers;
    const facadeTopY = facadeYBottom + facadeFullH;
    const thisFacadeH = facadeTopY - facadeBottomY;

    if (thisFacadeH <= 50) continue; // не имеет смысла

    const sectionXStart = metric.xStartMm + FACADE_GAP_MM;

    if (doublePerSection) {
      const doorW = (sectionInnerW - FACADE_GAP_MM * 3) / 2;
      for (let d = 0; d < 2; d++) {
        const xMm = sectionXStart + d * (doorW + FACADE_GAP_MM);
        panels.push(makeDoor({
          buildContext,
          name: `Фасад ${s + 1}.${d + 1}`,
          article: `FA-DOOR-${s + 1}-${d + 1}`,
          xMm,
          yMm: facadeBottomY,
          widthMm: doorW,
          heightMm: thisFacadeH,
          matFacade,
          thicknessMm: facadeT,
          materialType: p.material.facadeThicknessMm === 18 ? "mdf" : "ldsp",
          sectionId: s,
          facadeIndex: d,
          hingeSide: d === 0 ? "left" : "right",
        }));
      }
    } else {
      const doorW = sectionInnerW - FACADE_GAP_MM * 2;
      panels.push(makeDoor({
        buildContext,
        name: `Фасад ${s + 1}`,
        article: `FA-DOOR-${s + 1}`,
        xMm: sectionXStart,
        yMm: facadeBottomY,
        widthMm: doorW,
        heightMm: thisFacadeH,
        matFacade,
        thicknessMm: facadeT,
        materialType: p.material.facadeThicknessMm === 18 ? "mdf" : "ldsp",
        sectionId: s,
        facadeIndex: 0,
        hingeSide: "left",
      }));
    }

    if (thisFacadeH > 2200) {
      warnings.push({
        code: "tall-facade",
        severity: "warn",
        message: `Высокий фасад в секции ${s + 1} (${Math.round(thisFacadeH)} мм) — добавьте дополнительную петлю.`,
      });
    }
  }

  return { panels, warnings };
}

interface MakeDoorInput {
  buildContext: GeometryBuildContext;
  name: string;
  article: string;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  matFacade: string;
  thicknessMm: number;
  materialType: "ldsp" | "mdf";
  sectionId: number;
  facadeIndex: number;
  hingeSide: "left" | "right";
}

function makeDoor(i: MakeDoorInput): Panel {
  return {
    id: i.buildContext.nextFacadeId("door"),
    name: i.name,
    role: "facade-door",
    materialType: i.materialType,
    materialId: i.matFacade,
    thicknessMm: i.thicknessMm,
    widthMm: i.widthMm,
    heightMm: i.heightMm,
    depthMm: i.thicknessMm,
    position: { xMm: i.xMm, yMm: i.yMm, zMm: -i.thicknessMm },
    rotation: { x: 0, y: 0, z: 0 },
    faceSide: "front",
    edgeBanding: facadeEdgeAll(i.matFacade, i.widthMm, i.heightMm),
    visible: true,
    selectable: true,
    basis: {
      objectType: "panel",
      name: i.name,
      article: i.article,
      designation: "facade-door",
      includeInDocs: true,
      userProperties: {
        sectionId: i.sectionId,
        facadeIndex: i.facadeIndex,
        facadeMode: "hinged",
        hingeSide: i.hingeSide,
      },
    },
  };
}
