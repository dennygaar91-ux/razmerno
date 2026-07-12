/**
 * Построение ящиков.
 *
 * Если передан layout — ящики строятся в выбранных отсеках.
 * Если layout нет — используется legacy fallback: все ящики в первой секции.
 */
import type { FurnitureProject, GeometryCompartment, Panel, ProductionModelWarning } from "./types.js";
import { createGeometryBuildContext, type GeometryBuildContext } from "./buildContext.js";
import { bodyEdgeAll, facadeEdgeAll, noEdge } from "./edgeBanding.js";
import { getSectionMetrics } from "./layoutMetrics.js";

const PLINTH_HEIGHT_MM = 100;
const DRAWER_FRONT_MIN_HEIGHT_MM = 200;
const FACADE_GAP_MM = 3;

interface DrawerBuildTarget {
  sectionIndex: number;
  compartmentIndex: number;
  sectionXStart: number;
  sectionInnerW: number;
  yStart: number;
  zoneHeight: number;
  drawers: number;
}

export function buildDrawers(
  p: FurnitureProject,
  buildContext: GeometryBuildContext = createGeometryBuildContext(),
): { panels: Panel[]; warnings: ProductionModelWarning[] } {
  const panels: Panel[] = [];
  const warnings: ProductionModelWarning[] = [];

  if (p.structure.drawers <= 0) return { panels, warnings };

  const W = p.dimensions.widthMm;
  const H = p.dimensions.heightMm;
  const D = p.dimensions.depthMm;
  const T = p.material.bodyThicknessMm;
  const matBody = p.material.bodyMaterialId;
  const matBack = p.material.backPanelMaterialId ?? p.material.bodyMaterialId;
  const matFacade = p.material.facadeMaterialId;
  const facadeT = p.material.facadeThicknessMm;

  const hasPlinth = p.productType === "wardrobe";
  const plinthH = hasPlinth ? PLINTH_HEIGHT_MM : 0;
  const sectionMetrics = getSectionMetrics(p);
  const sectionInnerW = sectionMetrics[0]?.innerWidthMm ?? Math.max(0, W - T * 2);
  const usableInnerH = H - plinthH - T * 2;

  const targets = p.structure.layout?.sections?.length
    ? layoutDrawerTargets(p, plinthH, T)
    : legacyDrawerTargets(p, sectionInnerW, usableInnerH, plinthH, T);

  for (const target of targets) {
    buildDrawerStack({
      target,
      panels,
      warnings,
      buildContext,
      matBody,
      matBack,
      matFacade,
      bodyThicknessMm: T,
      facadeThicknessMm: facadeT,
      depthMm: D,
      hdfThicknessMm: p.material.backPanelThicknessMm,
    });
  }

  return { panels, warnings };
}

function layoutDrawerTargets(
  p: FurnitureProject,
  plinthH: number,
  bodyThicknessMm: number,
): DrawerBuildTarget[] {
  const targets: DrawerBuildTarget[] = [];
  const layout = p.structure.layout;
  if (!layout) return targets;

  const sectionMetrics = getSectionMetrics(p);
  for (let sectionIndex = 0; sectionIndex < layout.sections.length; sectionIndex++) {
    const section = layout.sections[sectionIndex];
    const metric = sectionMetrics[sectionIndex];
    const sectionXStart = metric?.xStartMm ?? bodyThicknessMm;
    const sectionInnerW = metric?.innerWidthMm ?? 0;
    let compartmentY = plinthH + bodyThicknessMm;

    for (let compartmentIndex = 0; compartmentIndex < section.compartments.length; compartmentIndex++) {
      const compartment: GeometryCompartment = section.compartments[compartmentIndex];
      if (compartment.kind === "drawers" && compartment.drawers > 0) {
        targets.push({
          sectionIndex,
          compartmentIndex,
          sectionXStart,
          sectionInnerW,
          yStart: compartmentY,
          zoneHeight: compartment.heightMm,
          drawers: compartment.drawers,
        });
      }
      compartmentY += compartment.heightMm;
    }
  }

  return targets;
}

function legacyDrawerTargets(
  p: FurnitureProject,
  sectionInnerW: number,
  usableInnerH: number,
  plinthH: number,
  bodyThicknessMm: number,
): DrawerBuildTarget[] {
  if (p.structure.drawers <= 0) return [];

  return [
    {
      sectionIndex: 0,
      compartmentIndex: 0,
      sectionXStart: bodyThicknessMm,
      sectionInnerW,
      yStart: plinthH + bodyThicknessMm,
      zoneHeight: Math.min(usableInnerH * 0.55, p.structure.drawers * 200),
      drawers: p.structure.drawers,
    },
  ];
}

function buildDrawerStack({
  target,
  panels,
  warnings,
  buildContext,
  matBody,
  matBack,
  matFacade,
  bodyThicknessMm,
  facadeThicknessMm,
  depthMm,
  hdfThicknessMm,
}: {
  target: DrawerBuildTarget;
  panels: Panel[];
  warnings: ProductionModelWarning[];
  buildContext: GeometryBuildContext;
  matBody: string;
  matBack: string;
  matFacade: string;
  bodyThicknessMm: number;
  facadeThicknessMm: number;
  depthMm: number;
  hdfThicknessMm: number;
}) {
  const drawerH = target.zoneHeight / target.drawers;
  const facadeHeight = drawerH - FACADE_GAP_MM * 2;

  if (facadeHeight < DRAWER_FRONT_MIN_HEIGHT_MM) {
    warnings.push({
      code: "drawer-front-too-low",
      severity: "error",
      message: `Секция ${target.sectionIndex + 1}, отсек ${target.compartmentIndex + 1}: фасад ящика получается ${Math.round(facadeHeight)} мм. Минимум ${DRAWER_FRONT_MIN_HEIGHT_MM} мм.`,
    });
  }

  const drawerBoxWidth = target.sectionInnerW - 26;
  const drawerBoxDepth = depthMm - 30;
  const facadeWidth = target.sectionInnerW - FACADE_GAP_MM * 2;

  for (let i = 0; i < target.drawers; i++) {
    const globalDrawerIndex = `${target.sectionIndex + 1}.${target.compartmentIndex + 1}.${i + 1}`;
    const yBottom = target.yStart + i * drawerH;
    const boxHeight = drawerH - 30;

    panels.push({
      id: buildContext.nextDrawerId("dwf"),
      name: `Фасад ящика ${globalDrawerIndex}`,
      role: "drawer-front",
      materialType: facadeThicknessMm === 18 ? "mdf" : "ldsp",
      materialId: matFacade,
      thicknessMm: facadeThicknessMm,
      widthMm: facadeWidth,
      heightMm: facadeHeight,
      depthMm: facadeThicknessMm,
      position: { xMm: target.sectionXStart + FACADE_GAP_MM, yMm: yBottom + FACADE_GAP_MM, zMm: -facadeThicknessMm },
      rotation: { x: 0, y: 0, z: 0 },
      faceSide: "front",
      edgeBanding: facadeEdgeAll(matFacade, facadeWidth, facadeHeight),
      visible: true,
      selectable: true,
      basis: {
        objectType: "panel",
        name: `Фасад ящика ${globalDrawerIndex}`,
        article: `FA-DRAWER-${globalDrawerIndex}`,
        designation: "drawer-front",
        includeInDocs: true,
        userProperties: {
          facadeMode: "drawers",
          drawerIndex: i + 1,
          sectionIndex: target.sectionIndex + 1,
          compartmentIndex: target.compartmentIndex + 1,
        },
      },
    });

    const sideY = yBottom + 13;
    for (const sideRole of ["L", "R"] as const) {
      const xMm =
        sideRole === "L"
          ? target.sectionXStart + 13
          : target.sectionXStart + 13 + drawerBoxWidth - bodyThicknessMm;
      panels.push({
        id: buildContext.nextDrawerId("dws"),
        name: `Боковина ящика ${globalDrawerIndex} ${sideRole === "L" ? "лев." : "прав."}`,
        role: "drawer-side",
        materialType: "ldsp",
        materialId: matBody,
        thicknessMm: bodyThicknessMm,
        widthMm: drawerBoxDepth,
        heightMm: boxHeight,
        depthMm: bodyThicknessMm,
        position: { xMm, yMm: sideY, zMm: 5 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        faceSide: sideRole === "L" ? "right" : "left",
        edgeBanding: bodyEdgeAll(matBody, drawerBoxDepth, boxHeight),
        visible: false,
        selectable: false,
        basis: {
          objectType: "panel",
          name: `Боковина ящика ${globalDrawerIndex} ${sideRole}`,
          article: `IN-DWSIDE-${globalDrawerIndex}-${sideRole}`,
          designation: "drawer-side",
          includeInDocs: true,
          userProperties: {
            drawerIndex: i + 1,
            sectionIndex: target.sectionIndex + 1,
            compartmentIndex: target.compartmentIndex + 1,
          },
        },
      });
    }

    panels.push({
      id: buildContext.nextDrawerId("dwb"),
      name: `Задняя стенка ящика ${globalDrawerIndex}`,
      role: "drawer-back",
      materialType: "ldsp",
      materialId: matBody,
      thicknessMm: bodyThicknessMm,
      widthMm: drawerBoxWidth - bodyThicknessMm * 2,
      heightMm: boxHeight,
      depthMm: bodyThicknessMm,
      position: { xMm: target.sectionXStart + 13 + bodyThicknessMm, yMm: sideY, zMm: drawerBoxDepth - bodyThicknessMm + 5 },
      rotation: { x: 0, y: 0, z: 0 },
      faceSide: "back",
      edgeBanding: bodyEdgeAll(matBody, drawerBoxWidth - bodyThicknessMm * 2, boxHeight),
      visible: false,
      selectable: false,
      basis: {
        objectType: "panel",
        name: `Задняя стенка ящика ${globalDrawerIndex}`,
        article: `IN-DWBACK-${globalDrawerIndex}`,
        designation: "drawer-back",
        includeInDocs: true,
        userProperties: {
          drawerIndex: i + 1,
          sectionIndex: target.sectionIndex + 1,
          compartmentIndex: target.compartmentIndex + 1,
        },
      },
    });

    panels.push({
      id: buildContext.nextDrawerId("dwbt"),
      name: `Дно ящика ${globalDrawerIndex}`,
      role: "drawer-bottom",
      materialType: "hdf",
      materialId: matBack,
      thicknessMm: hdfThicknessMm,
      widthMm: drawerBoxWidth - 8,
      heightMm: drawerBoxDepth - 8,
      depthMm: hdfThicknessMm,
      position: { xMm: target.sectionXStart + 17, yMm: sideY + 8, zMm: 9 },
      rotation: { x: Math.PI / 2, y: 0, z: 0 },
      faceSide: "top",
      edgeBanding: noEdge(),
      visible: false,
      selectable: false,
      basis: {
        objectType: "panel",
        name: `Дно ящика ${globalDrawerIndex}`,
        article: `IN-DWBOT-${globalDrawerIndex}`,
        designation: "drawer-bottom",
        includeInDocs: true,
        userProperties: {
          drawerIndex: i + 1,
          sectionIndex: target.sectionIndex + 1,
          compartmentIndex: target.compartmentIndex + 1,
        },
      },
    });
  }
}
