/**
 * Главная точка входа geometry-движка.
 *
 *   FurnitureProject → ProductionModel (v3)
 *
 * Внутри последовательно:
 *  1. buildShellAndShelves — каркас, перегородки, полки, цоколь
 *  2. buildBackPanel       — задняя стенка ХДФ
 *  3. buildFacades         — двери для hinged-режима
 *  4. buildDrawers         — ящики (drawer-front, sides, back, bottom)
 *  5. buildHardware        — петли, направляющие, штанга, конфирматы + drilling
 *  6. validation           — проверка целостности
 *  7. basisExportPlan      — план для будущего адаптера в БАЗИС
 */
import type {
  EdgeBandingTotal,
  ProductionModel,
  ProductionModelTotals,
  ProductionModelWarning,
  FurnitureProject,
} from "./types";
import { buildShellAndShelves } from "./buildPanels";
import { buildBackPanel } from "./buildBackPanel";
import { buildFacades } from "./buildFacades";
import { buildDrawers } from "./buildDrawers";
import { buildHardware } from "./buildHardware";
import { validateProductionModel } from "./validation";
import { buildBasisExportPlan } from "./basisExportPlan";
import { createGeometryBuildContext } from "./buildContext";

export function buildCabinetGeometry(project: FurnitureProject): ProductionModel {
  const buildContext = createGeometryBuildContext();

  const warnings: ProductionModelWarning[] = [];

  const shell = buildShellAndShelves(project, buildContext);
  warnings.push(...shell.warnings);

  const back = buildBackPanel(project, buildContext);

  const facades = buildFacades(project, buildContext);
  warnings.push(...facades.warnings);

  const drawers = buildDrawers(project, buildContext);
  warnings.push(...drawers.warnings);

  const allPanels = [...shell.panels, ...back, ...facades.panels, ...drawers.panels];

  const hw = buildHardware({ project, panels: allPanels, buildContext });
  warnings.push(...hw.warnings);

  warnings.push(
    ...validateProductionModel({
      panels: allPanels,
      hardware: hw.hardware,
      drilling: hw.drilling,
    }),
  );

  // EdgeBanding totals — сплющиваем по сторонам
  const edgeBanding: EdgeBandingTotal[] = [];
  for (const panel of allPanels) {
    for (const sideKey of ["front", "back", "left", "right"] as const) {
      const e = panel.edgeBanding[sideKey];
      if (!e) continue;
      edgeBanding.push({
        panelId: panel.id,
        side: e.side,
        materialId: e.materialId,
        thicknessMm: e.thicknessMm,
        widthMm: e.thicknessMm === 2 ? 22 : 19,
        lengthMm: e.lengthMm,
      });
    }
  }

  const totals = computeTotals({
    panels: allPanels,
    hardware: hw.hardware,
    drilling: hw.drilling,
    edgeBanding,
  });

  const basisExportPlan = buildBasisExportPlan({
    panels: allPanels,
    hardware: hw.hardware,
    drilling: hw.drilling,
    productType: project.productType,
  });

  return {
    schema: "razmerno.production-model.v3",
    units: "mm",
    coordinateSystem: {
      origin: "front-bottom-left",
      axes: "right-handed: X=width, Y=height, Z=depth",
    },
    productType: project.productType,
    dimensions: project.dimensions,
    panels: allPanels,
    hardware: hw.hardware,
    drilling: hw.drilling,
    edgeBanding,
    totals,
    basisExportPlan,
    warnings,
    meta: {
      schemaVersion: 3,
      configVersion: project.meta.configVersion,
      builtAt: project.meta.createdAt,
    },
  };
}

function computeTotals(input: {
  panels: ProductionModel["panels"];
  hardware: ProductionModel["hardware"];
  drilling: ProductionModel["drilling"];
  edgeBanding: EdgeBandingTotal[];
}): ProductionModelTotals {
  let body = 0;
  let facade = 0;
  let back = 0;
  const byType: Partial<Record<"ldsp" | "mdf" | "hdf", number>> = {};

  for (const p of input.panels) {
    const areaM2 = (p.widthMm * p.heightMm) / 1_000_000;
    byType[p.materialType] = (byType[p.materialType] ?? 0) + areaM2;
    if (p.role === "facade-door" || p.role === "drawer-front") {
      facade += areaM2;
    } else if (p.role === "back-panel" || p.role === "drawer-bottom") {
      back += areaM2;
    } else {
      body += areaM2;
    }
  }

  const edgeBandingLengthMm = input.edgeBanding.reduce((acc, e) => acc + e.lengthMm, 0);

  // округление до 2 знаков
  const r = (v: number) => Math.round(v * 100) / 100;

  return {
    panelCount: input.panels.length,
    drillingCount: input.drilling.length,
    hardwareCount: input.hardware.length,
    edgeBandingLengthMm: Math.round(edgeBandingLengthMm),
    bodyAreaM2: r(body),
    facadeAreaM2: r(facade),
    backPanelAreaM2: r(back),
    materialAreaM2: {
      ldsp: byType.ldsp !== undefined ? r(byType.ldsp) : undefined,
      mdf: byType.mdf !== undefined ? r(byType.mdf) : undefined,
      hdf: byType.hdf !== undefined ? r(byType.hdf) : undefined,
    },
  };
}
