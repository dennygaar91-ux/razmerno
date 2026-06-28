import assert from "node:assert/strict";
import test from "node:test";
import type { OrderRequest } from "../../../api/_shared/order-types.js";
import type { ProductionExportPackage } from "./types.js";
import { buildProductionExportFromPayload } from "./orderExportPackage.js";

const GOLDEN_ACCEPTED_AT = "2026-06-23T18:00:00.000Z";

function makePayload(overrides: Partial<OrderRequest> = {}): OrderRequest {
  return {
    orderId: "RZ-20260623-9001",
    productType: "wardrobe",
    dimensions: { width: 1800, height: 2400, depth: 600 },
    sections: 2,
    filling: { shelves: 3, drawers: 1, hangingRod: true },
    layout: { sections: [] },
    materials: {
      bodyId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
      facadeId: "mdf-egger-r010-seryy-grafitovyy-ms",
      facadeKind: "mdf",
      backPanelId: "white-matt",
      backPanelKind: "hdf",
    },
    style: {
      facadeStyleId: "regular",
      hardwareId: "base",
    },
    priceBreakdown: {
      body: 10000,
      facades: 10000,
      filling: 10000,
      hardware: 10000,
      production: 10000,
      materials: 10000,
      edgeBanding: 10000,
      services: 10000,
      delivery: 0,
      assembly: 0,
    },
    totalPrice: 90000,
    customer: {
      name: "Иван",
      phone: "+7 999 111-22-33",
      email: "client@example.com",
    },
    delivery: { enabled: false, address: "", price: 0 },
    assembly: { enabled: false, price: 0, rate: 0, basePrice: 0 },
    consent: {
      personalData: true,
      privacyVersion: "2026-05-24",
      acceptedAt: GOLDEN_ACCEPTED_AT,
    },
    source: "constructor-store-adapter",
    honeypot: "",
    ...overrides,
  };
}

type ProductionV3GoldenSnapshot = {
  panels: number;
  hardware: number;
  drilling: number;
  edgeBanding: number;
  warnings: number;
  basisSteps: number;
  review: ProductionExportPackage["review"]["status"];
  validation: ProductionExportPackage["validation"]["status"];
  totals: ProductionExportPackage["productionModel"]["totals"];
  hardwareTypes: string[];
  facadeThickness: number;
  bodyMaterial: string;
  facadeMaterial: string;
  sections: number;
  shelves: number;
  drawers: number;
  hangingRod: boolean;
  facadeMode?: ProductionExportPackage["project"]["structure"]["facadeMode"];
};

function normalizeMaterialAreaM2(
  materialAreaM2: ProductionExportPackage["productionModel"]["totals"]["materialAreaM2"],
) {
  return Object.fromEntries(
    Object.entries(materialAreaM2 ?? {}).filter(([, value]) => value != null),
  ) as ProductionExportPackage["productionModel"]["totals"]["materialAreaM2"];
}

const IMPORTANT_PANEL_ROLES = [
  "side-left",
  "top",
  "back-panel",
  "facade-door",
  "drawer-front",
  "drawer-bottom",
  "shelf",
] as const;

function countBy<T>(items: T[], key: (item: T) => string) {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const bucket = key(item);
    counts[bucket] = (counts[bucket] ?? 0) + 1;
  }

  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function extractPanelEdgeSignature(
  panel: ProductionExportPackage["productionModel"]["panels"][number],
) {
  return Object.fromEntries(
    Object.entries(panel.edgeBanding ?? {}).map(([side, meta]) => [side, meta?.thicknessMm ?? null]),
  );
}

function extractPanelSample(
  panel: ProductionExportPackage["productionModel"]["panels"][number] | undefined,
) {
  if (!panel) return null;

  return {
    id: panel.id,
    role: panel.role,
    materialType: panel.materialType,
    materialId: panel.materialId,
    thicknessMm: panel.thicknessMm,
    widthMm: panel.widthMm,
    heightMm: panel.heightMm,
    faceSide: panel.faceSide,
    edge: extractPanelEdgeSignature(panel),
  };
}

function extractHardwareSample(
  item: ProductionExportPackage["productionModel"]["hardware"][number] | undefined,
) {
  if (!item) return null;

  return {
    id: item.id,
    type: item.type,
    linkedPanelIds: item.linkedPanelIds,
    drillingRefs: item.drillingRefs,
    visibleInViewer: item.visibleInViewer,
    includeInDocs: item.includeInDocs,
  };
}

function extractDrillingSample(
  item: ProductionExportPackage["productionModel"]["drilling"][number] | undefined,
) {
  if (!item) return null;

  return {
    id: item.id,
    panelId: item.panelId,
    purpose: item.purpose,
    diameterMm: item.diameterMm,
    depthMm: item.depthMm,
    side: item.side,
    through: item.through,
    requiresTechnologistCheck: item.requiresTechnologistCheck,
  };
}

function extractProductionV3CanonicalSnapshot(productionExport: ProductionExportPackage) {
  const panelSamples = Object.fromEntries(
    IMPORTANT_PANEL_ROLES.map((role) => [
      role,
      extractPanelSample(
        productionExport.productionModel.panels.find((panel) => panel.role === role),
      ),
    ]).filter(([, sample]) => sample !== null),
  );

  const hardwareTypes = [...new Set(productionExport.productionModel.hardware.map((item) => item.type))].sort();
  const drillingPurposes = [...new Set(productionExport.productionModel.drilling.map((item) => item.purpose))].sort();

  return {
    project: {
      bodyMaterialId: productionExport.project.material.bodyMaterialId,
      facadeMaterialId: productionExport.project.material.facadeMaterialId,
      facadeThicknessMm: productionExport.project.material.facadeThicknessMm,
      sectionCount: productionExport.project.structure.sectionCount,
      shelves: productionExport.project.structure.shelves,
      drawers: productionExport.project.structure.drawers,
      hangingRod: productionExport.project.structure.hangingRod,
      openingMode: productionExport.project.structure.openingMode,
      hardwareMode: productionExport.project.structure.hardwareMode,
    },
    panels: {
      countByRole: countBy(productionExport.productionModel.panels, (item) => item.role),
      countByMaterialType: countBy(productionExport.productionModel.panels, (item) => item.materialType),
      important: panelSamples,
    },
    edgeBanding: {
      count: productionExport.productionModel.edgeBanding.length,
      countByThickness: countBy(productionExport.productionModel.edgeBanding, (item) => String(item.thicknessMm)),
      sample: productionExport.productionModel.edgeBanding.slice(0, 4).map((item) => ({
        panelId: item.panelId,
        side: item.side,
        materialId: item.materialId,
        thicknessMm: item.thicknessMm,
        lengthMm: item.lengthMm,
      })),
    },
    hardware: {
      countByType: countBy(productionExport.productionModel.hardware, (item) => item.type),
      sampleByType: Object.fromEntries(
        hardwareTypes.map((type) => [
          type,
          extractHardwareSample(
            productionExport.productionModel.hardware.find((item) => item.type === type),
          ),
        ]),
      ),
    },
    drilling: {
      countByPurpose: countBy(productionExport.productionModel.drilling, (item) => item.purpose),
      sampleByPurpose: Object.fromEntries(
        drillingPurposes.map((purpose) => [
          purpose,
          extractDrillingSample(
            productionExport.productionModel.drilling.find((item) => item.purpose === purpose),
          ),
        ]),
      ),
    },
    warnings: productionExport.productionModel.warnings.map((item) => ({
      code: item.code,
      severity: item.severity,
      panelId: item.panelId ?? null,
    })),
    validation: {
      status: productionExport.validation.status,
      errorCount: productionExport.validation.errors.length,
      warningCount: productionExport.validation.warnings.length,
      summary: productionExport.validation.summary,
    },
    review: productionExport.review,
    basis: {
      status: productionExport.basis.status,
      actionCounts: countBy(productionExport.basis.plan, (item) => item.action),
      firstStep: {
        action: productionExport.basis.plan[0]?.action,
        targetId: productionExport.basis.plan[0]?.targetId,
        status: productionExport.basis.plan[0]?.status,
        note: productionExport.basis.plan[0]?.note,
      },
      lastStep: {
        action: productionExport.basis.plan.at(-1)?.action,
        targetId: productionExport.basis.plan.at(-1)?.targetId,
        status: productionExport.basis.plan.at(-1)?.status,
        note: productionExport.basis.plan.at(-1)?.note,
      },
    },
  };
}

const REQUIRED_V3_CANONICAL_SNAPSHOTS = {
  "base wardrobe payload": {
    project: {
      bodyMaterialId: "white-matt",
      facadeMaterialId: "white-matt",
      facadeThicknessMm: 16,
      sectionCount: 2,
      shelves: 2,
      drawers: 0,
      hangingRod: false,
      openingMode: "handle-soft-close",
      hardwareMode: "base",
    },
    panels: {
      countByRole: {
        "back-panel": 1,
        bottom: 1,
        "facade-door": 4,
        plinth: 1,
        shelf: 2,
        "side-left": 1,
        "side-right": 1,
        top: 1,
        "vertical-partition": 1,
      },
      countByMaterialType: { hdf: 1, ldsp: 12 },
      important: {
        "side-left": { id: "side-0001", role: "side-left", materialType: "ldsp", materialId: "white-matt", thicknessMm: 16, widthMm: 600, heightMm: 2300, faceSide: "right", edge: { front: 1, back: 1, left: 1, right: 1 } },
        top: { id: "top-0004", role: "top", materialType: "ldsp", materialId: "white-matt", thicknessMm: 16, widthMm: 1768, heightMm: 600, faceSide: "top", edge: { front: 1, back: 1, left: 1, right: 1 } },
        "back-panel": { id: "back-0001", role: "back-panel", materialType: "hdf", materialId: "white-matt", thicknessMm: 3, widthMm: 1796, heightMm: 2296, faceSide: "back", edge: {} },
        "facade-door": { id: "door-0001", role: "facade-door", materialType: "ldsp", materialId: "white-matt", thicknessMm: 16, widthMm: 433.5, heightMm: 2294, faceSide: "front", edge: { front: 2, back: 2, left: 2, right: 2 } },
        shelf: { id: "shel-0007", role: "shelf", materialType: "ldsp", materialId: "white-matt", thicknessMm: 16, widthMm: 876, heightMm: 580, faceSide: "top", edge: { front: 1, back: 1, left: 1, right: 1 } },
      },
    },
    edgeBanding: {
      count: 48,
      countByThickness: { 1: 32, 2: 16 },
      sample: [
        { panelId: "side-0001", side: "front", materialId: "white-matt", thicknessMm: 1, lengthMm: 600 },
        { panelId: "side-0001", side: "back", materialId: "white-matt", thicknessMm: 1, lengthMm: 600 },
        { panelId: "side-0001", side: "left", materialId: "white-matt", thicknessMm: 1, lengthMm: 2300 },
        { panelId: "side-0001", side: "right", materialId: "white-matt", thicknessMm: 1, lengthMm: 2300 },
      ],
    },
    hardware: {
      countByType: { confirmat: 4, handle: 4, hinge: 20, "shelf-support": 4 },
      sampleByType: {
        confirmat: { id: "conf-0001", type: "confirmat", linkedPanelIds: ["side-0001", "bott-0003"], drillingRefs: ["drill-0001"], visibleInViewer: false, includeInDocs: true },
        handle: { id: "hnd-000a", type: "handle", linkedPanelIds: ["door-0001"], drillingRefs: ["drill-000a"], visibleInViewer: true, includeInDocs: true },
        hinge: { id: "hin-0005", type: "hinge", linkedPanelIds: ["door-0001"], drillingRefs: ["drill-0005"], visibleInViewer: false, includeInDocs: true },
        "shelf-support": { id: "ss-000t", type: "shelf-support", linkedPanelIds: ["side-0001", "shel-0007"], drillingRefs: ["drill-0001"], visibleInViewer: false, includeInDocs: true },
      },
    },
    drilling: {
      countByPurpose: { confirmat: 4, handle: 4, "hinge-cup": 20, "shelf-support": 4 },
      sampleByPurpose: {
        confirmat: { id: "drill-0001", panelId: "side-0001", purpose: "confirmat", diameterMm: 7, depthMm: 50, side: "right", through: false, requiresTechnologistCheck: true },
        handle: { id: "drill-000a", panelId: "door-0001", purpose: "handle", diameterMm: 5, depthMm: 18, side: "front", through: true, requiresTechnologistCheck: true },
        "hinge-cup": { id: "drill-0005", panelId: "door-0001", purpose: "hinge-cup", diameterMm: 35, depthMm: 13, side: "back", through: false, requiresTechnologistCheck: true },
        "shelf-support": { id: "drill-0001", panelId: "side-0001", purpose: "shelf-support", diameterMm: 5, depthMm: 12, side: "right", through: false, requiresTechnologistCheck: true },
      },
    },
    warnings: [
      { code: "tall-facade", severity: "warn", panelId: null },
      { code: "tall-facade", severity: "warn", panelId: null },
      { code: "many-hinges", severity: "warn", panelId: "door-0001" },
      { code: "many-hinges", severity: "warn", panelId: "door-0002" },
      { code: "many-hinges", severity: "warn", panelId: "door-0003" },
      { code: "many-hinges", severity: "warn", panelId: "door-0004" },
    ],
    validation: { status: "ready-for-review", errorCount: 0, warningCount: 24, summary: { panels: 13, hardware: 32, drilling: 32, edgeBandingLengthMm: 58252, basisSteps: 179 } },
    review: { status: "requires-review", manualChangesAllowed: true, visibleToClient: false },
    basis: {
      status: "manual-json-ready",
      actionCounts: { "add-user-property": 26, "create-drilling": 32, "create-panel": 13, "group-object": 2, "place-hardware": 32, "set-edge": 48, "set-face-side": 13, "set-material": 13 },
      firstStep: { action: "group-object", targetId: "root", status: "ready", note: "Корневой объект изделия. Технолог вручную создаёт 3D-документ в БАЗИС (manual JSON plan, не automatic .b3d)." },
      lastStep: { action: "group-object", targetId: "root", status: "ready", note: "Сгруппировать всё в изделие и подготовить спецификацию (ручной шаг технолога в БАЗИС)." },
    },
  },
  "handleless wardrobe payload": {
    project: {
      bodyMaterialId: "white-matt",
      facadeMaterialId: "white-matt",
      facadeThicknessMm: 16,
      sectionCount: 2,
      shelves: 2,
      drawers: 0,
      hangingRod: false,
      openingMode: "push-to-open",
      hardwareMode: "comfort",
    },
    panels: {
      countByRole: {
        "back-panel": 1,
        bottom: 1,
        "facade-door": 4,
        plinth: 1,
        shelf: 2,
        "side-left": 1,
        "side-right": 1,
        top: 1,
        "vertical-partition": 1,
      },
      countByMaterialType: { hdf: 1, ldsp: 12 },
      important: {
        "side-left": { id: "side-0001", role: "side-left", materialType: "ldsp", materialId: "white-matt", thicknessMm: 16, widthMm: 600, heightMm: 2300, faceSide: "right", edge: { front: 1, back: 1, left: 1, right: 1 } },
        top: { id: "top-0004", role: "top", materialType: "ldsp", materialId: "white-matt", thicknessMm: 16, widthMm: 1768, heightMm: 600, faceSide: "top", edge: { front: 1, back: 1, left: 1, right: 1 } },
        "back-panel": { id: "back-0001", role: "back-panel", materialType: "hdf", materialId: "white-matt", thicknessMm: 3, widthMm: 1796, heightMm: 2296, faceSide: "back", edge: {} },
        "facade-door": { id: "door-0001", role: "facade-door", materialType: "ldsp", materialId: "white-matt", thicknessMm: 16, widthMm: 433.5, heightMm: 2294, faceSide: "front", edge: { front: 2, back: 2, left: 2, right: 2 } },
        shelf: { id: "shel-0007", role: "shelf", materialType: "ldsp", materialId: "white-matt", thicknessMm: 16, widthMm: 876, heightMm: 580, faceSide: "top", edge: { front: 1, back: 1, left: 1, right: 1 } },
      },
    },
    edgeBanding: {
      count: 48,
      countByThickness: { 1: 32, 2: 16 },
      sample: [
        { panelId: "side-0001", side: "front", materialId: "white-matt", thicknessMm: 1, lengthMm: 600 },
        { panelId: "side-0001", side: "back", materialId: "white-matt", thicknessMm: 1, lengthMm: 600 },
        { panelId: "side-0001", side: "left", materialId: "white-matt", thicknessMm: 1, lengthMm: 2300 },
        { panelId: "side-0001", side: "right", materialId: "white-matt", thicknessMm: 1, lengthMm: 2300 },
      ],
    },
    hardware: {
      countByType: { confirmat: 4, hinge: 20, "push-to-open": 4, "shelf-support": 4 },
      sampleByType: {
        confirmat: { id: "conf-0001", type: "confirmat", linkedPanelIds: ["side-0001", "bott-0003"], drillingRefs: ["drill-0001"], visibleInViewer: false, includeInDocs: true },
        hinge: { id: "hin-0005", type: "hinge", linkedPanelIds: ["door-0001"], drillingRefs: ["drill-0005"], visibleInViewer: false, includeInDocs: true },
        "push-to-open": { id: "p2o-000a", type: "push-to-open", linkedPanelIds: ["door-0001"], drillingRefs: [], visibleInViewer: false, includeInDocs: true },
        "shelf-support": { id: "ss-000t", type: "shelf-support", linkedPanelIds: ["side-0001", "shel-0007"], drillingRefs: ["drill-0001"], visibleInViewer: false, includeInDocs: true },
      },
    },
    drilling: {
      countByPurpose: { confirmat: 4, "hinge-cup": 20, "shelf-support": 4 },
      sampleByPurpose: {
        confirmat: { id: "drill-0001", panelId: "side-0001", purpose: "confirmat", diameterMm: 7, depthMm: 50, side: "right", through: false, requiresTechnologistCheck: true },
        "hinge-cup": { id: "drill-0005", panelId: "door-0001", purpose: "hinge-cup", diameterMm: 35, depthMm: 13, side: "back", through: false, requiresTechnologistCheck: true },
        "shelf-support": { id: "drill-0001", panelId: "side-0001", purpose: "shelf-support", diameterMm: 5, depthMm: 12, side: "right", through: false, requiresTechnologistCheck: true },
      },
    },
    warnings: [
      { code: "tall-facade", severity: "warn", panelId: null },
      { code: "tall-facade", severity: "warn", panelId: null },
      { code: "many-hinges", severity: "warn", panelId: "door-0001" },
      { code: "many-hinges", severity: "warn", panelId: "door-0002" },
      { code: "many-hinges", severity: "warn", panelId: "door-0003" },
      { code: "many-hinges", severity: "warn", panelId: "door-0004" },
    ],
    validation: { status: "ready-for-review", errorCount: 0, warningCount: 24, summary: { panels: 13, hardware: 32, drilling: 28, edgeBandingLengthMm: 58252, basisSteps: 175 } },
    review: { status: "requires-review", manualChangesAllowed: true, visibleToClient: false },
    basis: {
      status: "manual-json-ready",
      actionCounts: { "add-user-property": 26, "create-drilling": 28, "create-panel": 13, "group-object": 2, "place-hardware": 32, "set-edge": 48, "set-face-side": 13, "set-material": 13 },
      firstStep: { action: "group-object", targetId: "root", status: "ready", note: "Корневой объект изделия. Технолог вручную создаёт 3D-документ в БАЗИС (manual JSON plan, не automatic .b3d)." },
      lastStep: { action: "group-object", targetId: "root", status: "ready", note: "Сгруппировать всё в изделие и подготовить спецификацию (ручной шаг технолога в БАЗИС)." },
    },
  },
  "drawers + rods + shelves payload": {
    project: {
      bodyMaterialId: "white-matt",
      facadeMaterialId: "white-matt",
      facadeThicknessMm: 16,
      sectionCount: 2,
      shelves: 4,
      drawers: 2,
      hangingRod: true,
      openingMode: "handle-soft-close",
      hardwareMode: "base",
    },
    panels: {
      countByRole: {
        "back-panel": 1,
        bottom: 1,
        "drawer-back": 2,
        "drawer-bottom": 2,
        "drawer-front": 2,
        "drawer-side": 4,
        "facade-door": 4,
        plinth: 1,
        shelf: 4,
        "side-left": 1,
        "side-right": 1,
        top: 1,
        "vertical-partition": 1,
      },
      countByMaterialType: { hdf: 3, ldsp: 22 },
      important: {
        "side-left": { id: "side-0001", role: "side-left", materialType: "ldsp", materialId: "white-matt", thicknessMm: 16, widthMm: 600, heightMm: 2300, faceSide: "right", edge: { front: 1, back: 1, left: 1, right: 1 } },
        top: { id: "top-0004", role: "top", materialType: "ldsp", materialId: "white-matt", thicknessMm: 16, widthMm: 1768, heightMm: 600, faceSide: "top", edge: { front: 1, back: 1, left: 1, right: 1 } },
        "back-panel": { id: "back-0001", role: "back-panel", materialType: "hdf", materialId: "white-matt", thicknessMm: 3, widthMm: 1796, heightMm: 2296, faceSide: "back", edge: {} },
        "facade-door": { id: "door-0001", role: "facade-door", materialType: "ldsp", materialId: "white-matt", thicknessMm: 16, widthMm: 433.5, heightMm: 1878, faceSide: "front", edge: { front: 2, back: 2, left: 2, right: 2 } },
        "drawer-front": { id: "dwf-0001", role: "drawer-front", materialType: "ldsp", materialId: "white-matt", thicknessMm: 16, widthMm: 870, heightMm: 394, faceSide: "front", edge: { front: 2, back: 2, left: 2, right: 2 } },
        "drawer-bottom": { id: "dwbt-0005", role: "drawer-bottom", materialType: "hdf", materialId: "white-matt", thicknessMm: 3, widthMm: 842, heightMm: 562, faceSide: "top", edge: {} },
        shelf: { id: "shel-0007", role: "shelf", materialType: "ldsp", materialId: "white-matt", thicknessMm: 16, widthMm: 876, heightMm: 580, faceSide: "top", edge: { front: 1, back: 1, left: 1, right: 1 } },
      },
    },
    edgeBanding: {
      count: 88,
      countByThickness: { 1: 64, 2: 24 },
      sample: [
        { panelId: "side-0001", side: "front", materialId: "white-matt", thicknessMm: 1, lengthMm: 600 },
        { panelId: "side-0001", side: "back", materialId: "white-matt", thicknessMm: 1, lengthMm: 600 },
        { panelId: "side-0001", side: "left", materialId: "white-matt", thicknessMm: 1, lengthMm: 2300 },
        { panelId: "side-0001", side: "right", materialId: "white-matt", thicknessMm: 1, lengthMm: 2300 },
      ],
    },
    hardware: {
      countByType: { confirmat: 4, "drawer-slide": 2, handle: 6, hinge: 18, rod: 1, "rod-holder": 2, "shelf-support": 8 },
      sampleByType: {
        confirmat: { id: "conf-0001", type: "confirmat", linkedPanelIds: ["side-0001", "bott-0003"], drillingRefs: ["drill-0001"], visibleInViewer: false, includeInDocs: true },
        "drawer-slide": { id: "slide-000r", type: "drawer-slide", linkedPanelIds: ["side-0001", "side-0002", "dwf-0001"], drillingRefs: ["drill-0001", "drill-0001"], visibleInViewer: false, includeInDocs: true },
        handle: { id: "hnd-0009", type: "handle", linkedPanelIds: ["door-0001"], drillingRefs: ["drill-0009"], visibleInViewer: true, includeInDocs: true },
        hinge: { id: "hin-0005", type: "hinge", linkedPanelIds: ["door-0001"], drillingRefs: ["drill-0005"], visibleInViewer: false, includeInDocs: true },
        rod: { id: "rod-000v", type: "rod", linkedPanelIds: [], drillingRefs: [], visibleInViewer: true, includeInDocs: true },
        "rod-holder": { id: "rh-000w", type: "rod-holder", linkedPanelIds: ["side-0001"], drillingRefs: ["drill-000t"], visibleInViewer: false, includeInDocs: true },
        "shelf-support": { id: "ss-000y", type: "shelf-support", linkedPanelIds: ["side-0001", "shel-0007"], drillingRefs: ["drill-0001"], visibleInViewer: false, includeInDocs: true },
      },
    },
    drilling: {
      countByPurpose: { confirmat: 4, "drawer-slide": 4, handle: 6, "hinge-cup": 18, "rod-holder": 2, "shelf-support": 8 },
      sampleByPurpose: {
        confirmat: { id: "drill-0001", panelId: "side-0001", purpose: "confirmat", diameterMm: 7, depthMm: 50, side: "right", through: false, requiresTechnologistCheck: true },
        "drawer-slide": { id: "drill-0001", panelId: "side-0001", purpose: "drawer-slide", diameterMm: 4, depthMm: 12, side: "right", through: false, requiresTechnologistCheck: true },
        handle: { id: "drill-0009", panelId: "door-0001", purpose: "handle", diameterMm: 5, depthMm: 18, side: "front", through: true, requiresTechnologistCheck: true },
        "hinge-cup": { id: "drill-0005", panelId: "door-0001", purpose: "hinge-cup", diameterMm: 35, depthMm: 13, side: "back", through: false, requiresTechnologistCheck: true },
        "rod-holder": { id: "drill-000t", panelId: "side-0001", purpose: "rod-holder", diameterMm: 4, depthMm: 12, side: "right", through: false, requiresTechnologistCheck: true },
        "shelf-support": { id: "drill-0001", panelId: "side-0001", purpose: "shelf-support", diameterMm: 5, depthMm: 12, side: "right", through: false, requiresTechnologistCheck: true },
      },
    },
    warnings: [
      { code: "tall-facade", severity: "warn", panelId: null },
      { code: "many-hinges", severity: "warn", panelId: "door-0003" },
      { code: "many-hinges", severity: "warn", panelId: "door-0004" },
    ],
    validation: { status: "blocked", errorCount: 2, warningCount: 25, summary: { panels: 25, hardware: 41, drilling: 42, edgeBandingLengthMm: 79740, basisSteps: 308 } },
    review: { status: "blocked", manualChangesAllowed: true, visibleToClient: false },
    basis: {
      status: "manual-json-ready",
      actionCounts: { "add-user-property": 60, "create-drilling": 42, "create-panel": 25, "group-object": 2, "place-hardware": 41, "set-edge": 88, "set-face-side": 25, "set-material": 25 },
      firstStep: { action: "group-object", targetId: "root", status: "ready", note: "Корневой объект изделия. Технолог вручную создаёт 3D-документ в БАЗИС (manual JSON plan, не automatic .b3d)." },
      lastStep: { action: "group-object", targetId: "root", status: "ready", note: "Сгруппировать всё в изделие и подготовить спецификацию (ручной шаг технолога в БАЗИС)." },
    },
  },
  "material-aware body/facade payload": {
    project: {
      bodyMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
      facadeMaterialId: "mdf-egger-r010-seryy-grafitovyy-ms",
      facadeThicknessMm: 18,
      sectionCount: 2,
      shelves: 2,
      drawers: 0,
      hangingRod: false,
      openingMode: "handle-soft-close",
      hardwareMode: "base",
    },
    panels: {
      countByRole: {
        "back-panel": 1,
        bottom: 1,
        "facade-door": 4,
        plinth: 1,
        shelf: 2,
        "side-left": 1,
        "side-right": 1,
        top: 1,
        "vertical-partition": 1,
      },
      countByMaterialType: { hdf: 1, ldsp: 8, mdf: 4 },
      important: {
        "side-left": { id: "side-0001", role: "side-left", materialType: "ldsp", materialId: "ldsp-egger-w960-belyy-klassicheskiy-sm", thicknessMm: 16, widthMm: 600, heightMm: 2300, faceSide: "right", edge: { front: 1, back: 1, left: 1, right: 1 } },
        top: { id: "top-0004", role: "top", materialType: "ldsp", materialId: "ldsp-egger-w960-belyy-klassicheskiy-sm", thicknessMm: 16, widthMm: 1768, heightMm: 600, faceSide: "top", edge: { front: 1, back: 1, left: 1, right: 1 } },
        "back-panel": { id: "back-0001", role: "back-panel", materialType: "hdf", materialId: "white-matt", thicknessMm: 3, widthMm: 1796, heightMm: 2296, faceSide: "back", edge: {} },
        "facade-door": { id: "door-0001", role: "facade-door", materialType: "mdf", materialId: "mdf-egger-r010-seryy-grafitovyy-ms", thicknessMm: 18, widthMm: 433.5, heightMm: 2294, faceSide: "front", edge: { front: 2, back: 2, left: 2, right: 2 } },
        shelf: { id: "shel-0007", role: "shelf", materialType: "ldsp", materialId: "ldsp-egger-w960-belyy-klassicheskiy-sm", thicknessMm: 16, widthMm: 876, heightMm: 580, faceSide: "top", edge: { front: 1, back: 1, left: 1, right: 1 } },
      },
    },
    edgeBanding: {
      count: 48,
      countByThickness: { 1: 32, 2: 16 },
      sample: [
        { panelId: "side-0001", side: "front", materialId: "ldsp-egger-w960-belyy-klassicheskiy-sm", thicknessMm: 1, lengthMm: 600 },
        { panelId: "side-0001", side: "back", materialId: "ldsp-egger-w960-belyy-klassicheskiy-sm", thicknessMm: 1, lengthMm: 600 },
        { panelId: "side-0001", side: "left", materialId: "ldsp-egger-w960-belyy-klassicheskiy-sm", thicknessMm: 1, lengthMm: 2300 },
        { panelId: "side-0001", side: "right", materialId: "ldsp-egger-w960-belyy-klassicheskiy-sm", thicknessMm: 1, lengthMm: 2300 },
      ],
    },
    hardware: {
      countByType: { confirmat: 4, handle: 4, hinge: 20, "shelf-support": 4 },
      sampleByType: {
        confirmat: { id: "conf-0001", type: "confirmat", linkedPanelIds: ["side-0001", "bott-0003"], drillingRefs: ["drill-0001"], visibleInViewer: false, includeInDocs: true },
        handle: { id: "hnd-000a", type: "handle", linkedPanelIds: ["door-0001"], drillingRefs: ["drill-000a"], visibleInViewer: true, includeInDocs: true },
        hinge: { id: "hin-0005", type: "hinge", linkedPanelIds: ["door-0001"], drillingRefs: ["drill-0005"], visibleInViewer: false, includeInDocs: true },
        "shelf-support": { id: "ss-000t", type: "shelf-support", linkedPanelIds: ["side-0001", "shel-0007"], drillingRefs: ["drill-0001"], visibleInViewer: false, includeInDocs: true },
      },
    },
    drilling: {
      countByPurpose: { confirmat: 4, handle: 4, "hinge-cup": 20, "shelf-support": 4 },
      sampleByPurpose: {
        confirmat: { id: "drill-0001", panelId: "side-0001", purpose: "confirmat", diameterMm: 7, depthMm: 50, side: "right", through: false, requiresTechnologistCheck: true },
        handle: { id: "drill-000a", panelId: "door-0001", purpose: "handle", diameterMm: 5, depthMm: 18, side: "front", through: true, requiresTechnologistCheck: true },
        "hinge-cup": { id: "drill-0005", panelId: "door-0001", purpose: "hinge-cup", diameterMm: 35, depthMm: 13, side: "back", through: false, requiresTechnologistCheck: true },
        "shelf-support": { id: "drill-0001", panelId: "side-0001", purpose: "shelf-support", diameterMm: 5, depthMm: 12, side: "right", through: false, requiresTechnologistCheck: true },
      },
    },
    warnings: [
      { code: "tall-facade", severity: "warn", panelId: null },
      { code: "tall-facade", severity: "warn", panelId: null },
      { code: "many-hinges", severity: "warn", panelId: "door-0001" },
      { code: "many-hinges", severity: "warn", panelId: "door-0002" },
      { code: "many-hinges", severity: "warn", panelId: "door-0003" },
      { code: "many-hinges", severity: "warn", panelId: "door-0004" },
    ],
    validation: { status: "ready-for-review", errorCount: 0, warningCount: 24, summary: { panels: 13, hardware: 32, drilling: 32, edgeBandingLengthMm: 58252, basisSteps: 179 } },
    review: { status: "requires-review", manualChangesAllowed: true, visibleToClient: false },
    basis: {
      status: "manual-json-ready",
      actionCounts: { "add-user-property": 26, "create-drilling": 32, "create-panel": 13, "group-object": 2, "place-hardware": 32, "set-edge": 48, "set-face-side": 13, "set-material": 13 },
      firstStep: { action: "group-object", targetId: "root", status: "ready", note: "Корневой объект изделия. Технолог вручную создаёт 3D-документ в БАЗИС (manual JSON plan, не automatic .b3d)." },
      lastStep: { action: "group-object", targetId: "root", status: "ready", note: "Сгруппировать всё в изделие и подготовить спецификацию (ручной шаг технолога в БАЗИС)." },
    },
  },
} as const;

function assertRequiredProductionV3CanonicalSnapshot(
  label: keyof typeof REQUIRED_V3_CANONICAL_SNAPSHOTS,
  productionExport: ProductionExportPackage,
) {
  assert.deepEqual(
    extractProductionV3CanonicalSnapshot(productionExport),
    REQUIRED_V3_CANONICAL_SNAPSHOTS[label],
  );
}

function extractProductionV3GoldenSnapshot(
  productionExport: ProductionExportPackage,
): ProductionV3GoldenSnapshot {
  const totals = productionExport.productionModel.totals;

  return {
    panels: productionExport.productionModel.panels.length,
    hardware: productionExport.productionModel.hardware.length,
    drilling: productionExport.productionModel.drilling.length,
    edgeBanding: productionExport.productionModel.edgeBanding.length,
    warnings: productionExport.productionModel.warnings.length,
    basisSteps: productionExport.basis.plan.length,
    review: productionExport.review.status,
    validation: productionExport.validation.status,
    totals: {
      ...totals,
      materialAreaM2: normalizeMaterialAreaM2(totals.materialAreaM2),
    },
    hardwareTypes: [...new Set(productionExport.productionModel.hardware.map((item) => item.type))].sort(),
    facadeThickness: productionExport.project.material.facadeThicknessMm,
    bodyMaterial: productionExport.project.material.bodyMaterialId,
    facadeMaterial: productionExport.project.material.facadeMaterialId,
    sections: productionExport.project.structure.sectionCount,
    shelves: productionExport.project.structure.shelves,
    drawers: productionExport.project.structure.drawers,
    hangingRod: productionExport.project.structure.hangingRod,
    facadeMode: productionExport.project.structure.facadeMode,
  };
}

function assertProductionV3GoldenInvariants(productionExport: ProductionExportPackage) {
  const { productionModel, basis, review, validation, revisions } = productionExport;

  assert.equal(productionExport.schema, "razmerno.production-export.v1");
  assert.equal(productionExport.project.meta.schemaVersion, 3);
  assert.equal(productionExport.source, "api-order");
  assert.ok(productionModel.panels.length > 0, "expected panels in production v3 export");
  assert.ok(
    productionModel.panels.every((panel) => panel.edgeBanding != null),
    "expected per-panel edgeBanding metadata",
  );
  assert.ok(productionModel.edgeBanding.length > 0, "expected edge banding totals");
  assert.ok(productionModel.hardware.length > 0, "expected hardware items");
  assert.ok(productionModel.drilling.length > 0, "expected drilling operations");
  assert.ok(Array.isArray(productionModel.warnings), "expected warnings block");
  assert.ok(basis.plan.length > 0, "expected Basis export plan steps");
  assert.equal(basis.status, "manual-json-ready");
  assert.ok(review.status, "expected review status");
  assert.equal(review.manualChangesAllowed, true);
  assert.equal(validation.schema, "razmerno.production-validation.v1");
  assert.ok(validation.summary.panels > 0);
  assert.ok(validation.summary.hardware > 0);
  assert.ok(validation.summary.drilling > 0);
  assert.ok(validation.summary.edgeBandingLengthMm > 0);
  assert.ok(validation.summary.basisSteps > 0);
  assert.equal(revisions.length, 1);
  assert.equal(review.visibleToClient, false);
  assert.equal(typeof productionExport.manufacturing.requiresTechnologistCheck, "boolean");
  assertProductionV3HdfThickness(productionExport);
  assertProductionV3EdgeBandingPolicy(productionExport);
  assertProductionV3BasisBoundary(productionExport);
}

const FORBIDDEN_BASIS_AUTO_B3D_CLAIMS = [
  "document:create-b3d",
  '"documentType":"b3d"',
  "'documentType': 'b3d'",
  "автоматической генерации .b3d",
  "автоматической генерации",
] as const;

function assertProductionV3BasisBoundary(productionExport: ProductionExportPackage) {
  assert.equal(productionExport.basis.status, "manual-json-ready");
  const serialized = JSON.stringify(productionExport);
  for (const forbidden of FORBIDDEN_BASIS_AUTO_B3D_CLAIMS) {
    assert.ok(
      !serialized.includes(forbidden),
      `production export must not claim auto .b3d: "${forbidden}"`,
    );
  }
  assert.ok(!serialized.includes("create-b3d"), "production export must not reference create-b3d");
  for (const step of productionExport.basis.plan) {
    const stepSerialized = JSON.stringify(step);
    assert.ok(!stepSerialized.includes("create-b3d"), "basis plan step must not reference create-b3d");
    assert.ok(
      !stepSerialized.includes("автоматической генерации"),
      "basis plan step must not claim automatic .b3d generation",
    );
  }
}

const EDGE_SIDES = ["front", "back", "left", "right"] as const;
const BODY_EDGE_ROLES = new Set([
  "side-left",
  "side-right",
  "top",
  "bottom",
  "vertical-partition",
  "shelf",
  "plinth",
  "drawer-side",
  "drawer-back",
]);
const FACADE_EDGE_ROLES = new Set(["facade-door", "drawer-front"]);
const NO_EDGE_ROLES = new Set(["back-panel", "drawer-bottom"]);

function assertProductionV3EdgeBandingPolicy(productionExport: ProductionExportPackage) {
  const panelById = new Map(
    productionExport.productionModel.panels.map((panel) => [panel.id, panel]),
  );

  for (const panel of productionExport.productionModel.panels) {
    const edgeBanding = panel.edgeBanding ?? {};

    if (BODY_EDGE_ROLES.has(panel.role)) {
      for (const side of EDGE_SIDES) {
        assert.ok(edgeBanding[side], `expected ${panel.role} ${panel.id} edge on ${side}`);
        assert.equal(edgeBanding[side]!.thicknessMm, 1, `expected body edge 1 mm on ${panel.role}`);
      }
      continue;
    }

    if (FACADE_EDGE_ROLES.has(panel.role)) {
      for (const side of EDGE_SIDES) {
        assert.ok(edgeBanding[side], `expected ${panel.role} ${panel.id} edge on ${side}`);
        assert.equal(edgeBanding[side]!.thicknessMm, 2, `expected facade edge 2 mm on ${panel.role}`);
      }
      continue;
    }

    if (NO_EDGE_ROLES.has(panel.role)) {
      assert.equal(Object.keys(edgeBanding).length, 0, `expected no edge on ${panel.role}`);
    }
  }

  for (const edge of productionExport.productionModel.edgeBanding) {
    const panel = panelById.get(edge.panelId);
    assert.ok(panel, `edge references missing panel ${edge.panelId}`);
    const expected =
      panel!.role === "facade-door" || panel!.role === "drawer-front" ? 2 : 1;
    if (panel!.role === "back-panel" || panel!.role === "drawer-bottom") {
      continue;
    }
    assert.equal(edge.thicknessMm, expected, `edge total thickness for ${panel!.role}`);
  }
}

function assertProductionV3HdfThickness(productionExport: ProductionExportPackage) {
  const hdfPanels = productionExport.productionModel.panels.filter(
    (panel) => panel.materialType === "hdf",
  );

  assert.ok(hdfPanels.length > 0, "expected HDF panels in production v3 export");

  for (const panel of hdfPanels) {
    assert.equal(panel.thicknessMm, 3, `expected HDF panel ${panel.role} to be 3 mm`);
  }

  for (const panel of productionExport.productionModel.panels.filter((item) => item.role === "back-panel")) {
    assert.equal(panel.thicknessMm, 3, "expected back-panel to be 3 mm");
  }

  for (const panel of productionExport.productionModel.panels.filter((item) => item.role === "drawer-bottom")) {
    assert.equal(panel.thicknessMm, 3, "expected drawer-bottom to be 3 mm");
  }

  assert.equal(productionExport.project.material.backPanelThicknessMm, 3);
}

function assertDeterministicAndPricingIndependent(payload: OrderRequest) {
  const first = buildProductionExportFromPayload(payload);
  const second = buildProductionExportFromPayload(payload);
  const changedPricing = buildProductionExportFromPayload({
    ...payload,
    totalPrice: 1,
    priceBreakdown: {
      body: 1,
      facades: 1,
      filling: 1,
      hardware: 1,
      production: 1,
      materials: 1,
      edgeBanding: 1,
      services: 1,
      delivery: 1,
      assembly: 1,
    },
  });

  assert.deepEqual(first, second);
  assert.deepEqual(first, changedPricing);
  return first;
}

function runGoldenCase(
  label: string,
  payload: OrderRequest,
  expected: ProductionV3GoldenSnapshot,
  extra?: (productionExport: ProductionExportPackage) => void,
) {
  test(`production v3 golden snapshot: ${label}`, () => {
    const productionExport = assertDeterministicAndPricingIndependent(payload);

    assertProductionV3GoldenInvariants(productionExport);
    assert.deepEqual(extractProductionV3GoldenSnapshot(productionExport), expected);
    extra?.(productionExport);
  });
}

const baseWardrobePayload = makePayload({
  orderId: "RZ-20260623-9001",
  filling: { shelves: 2, drawers: 0, hangingRod: false },
  materials: {
    bodyId: "white-matt",
    facadeId: "white-matt",
    facadeKind: "ldsp",
    backPanelId: "white-matt",
    backPanelKind: "hdf",
  },
  style: { facadeStyleId: "regular", hardwareId: "base" },
});

const multiSectionPayload = makePayload({
  orderId: "RZ-20260623-9002",
  dimensions: { width: 2400, height: 2400, depth: 600 },
  sections: 3,
  filling: { shelves: 2, drawers: 0, hangingRod: false },
  materials: {
    bodyId: "white-matt",
    facadeId: "white-matt",
    facadeKind: "ldsp",
    backPanelId: "white-matt",
    backPanelKind: "hdf",
  },
  layout: {
    sections: [
      {
        id: "section-1",
        widthMm: 800,
        compartments: [
          {
            id: "section-1-compartment-1",
            kind: "shelves",
            heightMm: 2400,
            shelves: 2,
            drawers: 0,
            hasRod: false,
          },
        ],
      },
      {
        id: "section-2",
        widthMm: 800,
        compartments: [
          {
            id: "section-2-compartment-1",
            kind: "shelves",
            heightMm: 2400,
            shelves: 2,
            drawers: 0,
            hasRod: false,
          },
        ],
      },
      {
        id: "section-3",
        widthMm: 800,
        compartments: [
          {
            id: "section-3-compartment-1",
            kind: "rod",
            heightMm: 2400,
            shelves: 0,
            drawers: 0,
            hasRod: true,
          },
        ],
      },
    ],
  },
});

const mixedFillingPayload = makePayload({
  orderId: "RZ-20260623-9003",
  filling: { shelves: 4, drawers: 2, hangingRod: true },
  materials: {
    bodyId: "white-matt",
    facadeId: "white-matt",
    facadeKind: "ldsp",
    backPanelId: "white-matt",
    backPanelKind: "hdf",
  },
  layout: {
    sections: [
      {
        id: "section-1",
        widthMm: 900,
        compartments: [
          {
            id: "section-1-compartment-1",
            kind: "drawers",
            heightMm: 800,
            shelves: 0,
            drawers: 2,
            hasRod: false,
          },
          {
            id: "section-1-compartment-2",
            kind: "rod",
            heightMm: 1600,
            shelves: 0,
            drawers: 0,
            hasRod: true,
          },
        ],
      },
      {
        id: "section-2",
        widthMm: 900,
        compartments: [
          {
            id: "section-2-compartment-1",
            kind: "shelves",
            heightMm: 2400,
            shelves: 4,
            drawers: 0,
            hasRod: false,
          },
        ],
      },
    ],
  },
});

const handlelessWardrobePayload = makePayload({
  orderId: "RZ-20260623-9005",
  filling: { shelves: 2, drawers: 0, hangingRod: false },
  materials: {
    bodyId: "white-matt",
    facadeId: "white-matt",
    facadeKind: "ldsp",
    backPanelId: "white-matt",
    backPanelKind: "hdf",
  },
  style: { facadeStyleId: "no-handle", hardwareId: "comfort" },
});

const facadeMaterialPayload = makePayload({
  orderId: "RZ-20260623-9004",
  filling: { shelves: 2, drawers: 0, hangingRod: false },
  materials: {
    bodyId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
    facadeId: "mdf-egger-r010-seryy-grafitovyy-ms",
    facadeKind: "mdf",
    backPanelId: "white-matt",
    backPanelKind: "hdf",
  },
  style: { facadeStyleId: "regular", hardwareId: "base" },
});

runGoldenCase(
  "base wardrobe payload",
  baseWardrobePayload,
  {
    panels: 13,
    hardware: 32,
    drilling: 32,
    edgeBanding: 48,
    warnings: 6,
    basisSteps: 179,
    review: "requires-review",
    validation: "ready-for-review",
    totals: {
      panelCount: 13,
      drillingCount: 32,
      hardwareCount: 32,
      edgeBandingLengthMm: 58252,
      bodyAreaM2: 7.44,
      facadeAreaM2: 3.98,
      backPanelAreaM2: 4.12,
      materialAreaM2: { ldsp: 11.42, hdf: 4.12 },
    },
    hardwareTypes: ["confirmat", "handle", "hinge", "shelf-support"],
    facadeThickness: 16,
    bodyMaterial: "white-matt",
    facadeMaterial: "white-matt",
    sections: 2,
    shelves: 2,
    drawers: 0,
    hangingRod: false,
    facadeMode: "hinged",
  },
  (productionExport) => {
    assertRequiredProductionV3CanonicalSnapshot("base wardrobe payload", productionExport);
  },
);

runGoldenCase(
  "handleless wardrobe payload",
  handlelessWardrobePayload,
  {
    panels: 13,
    hardware: 32,
    drilling: 28,
    edgeBanding: 48,
    warnings: 6,
    basisSteps: 175,
    review: "requires-review",
    validation: "ready-for-review",
    totals: {
      panelCount: 13,
      drillingCount: 28,
      hardwareCount: 32,
      edgeBandingLengthMm: 58252,
      bodyAreaM2: 7.44,
      facadeAreaM2: 3.98,
      backPanelAreaM2: 4.12,
      materialAreaM2: { ldsp: 11.42, hdf: 4.12 },
    },
    hardwareTypes: ["confirmat", "hinge", "push-to-open", "shelf-support"],
    facadeThickness: 16,
    bodyMaterial: "white-matt",
    facadeMaterial: "white-matt",
    sections: 2,
    shelves: 2,
    drawers: 0,
    hangingRod: false,
    facadeMode: "hinged",
  },
  (productionExport) => {
    assertRequiredProductionV3CanonicalSnapshot("handleless wardrobe payload", productionExport);
    assert.equal(productionExport.project.structure.openingMode, "push-to-open");
    assert.equal(productionExport.project.structure.hardwareMode, "comfort");
    assert.ok(productionExport.productionModel.hardware.some((item) => item.type === "push-to-open"));
  },
);

runGoldenCase("multi-section payload", multiSectionPayload, {
  panels: 18,
  hardware: 48,
  drilling: 48,
  edgeBanding: 68,
  warnings: 9,
  basisSteps: 257,
  review: "requires-review",
  validation: "ready-for-review",
  totals: {
    panelCount: 18,
    drillingCount: 48,
    hardwareCount: 48,
    edgeBandingLengthMm: 82959,
    bodyAreaM2: 10.37,
    facadeAreaM2: 5.3,
    backPanelAreaM2: 5.5,
    materialAreaM2: { ldsp: 15.67, hdf: 5.5 },
  },
  hardwareTypes: ["confirmat", "handle", "hinge", "shelf-support"],
  facadeThickness: 16,
  bodyMaterial: "white-matt",
  facadeMaterial: "white-matt",
  sections: 3,
  shelves: 2,
  drawers: 0,
  hangingRod: false,
  facadeMode: "hinged",
});

runGoldenCase(
  "drawers + rods + shelves payload",
  mixedFillingPayload,
  {
    panels: 25,
    hardware: 41,
    drilling: 42,
    edgeBanding: 88,
    warnings: 3,
    basisSteps: 308,
    review: "blocked",
    validation: "blocked",
    totals: {
      panelCount: 25,
      drillingCount: 42,
      hardwareCount: 41,
      edgeBandingLengthMm: 79740,
      bodyAreaM2: 9.9,
      facadeAreaM2: 4.3,
      backPanelAreaM2: 5.07,
      materialAreaM2: { ldsp: 14.21, hdf: 5.07 },
    },
    hardwareTypes: [
      "confirmat",
      "drawer-slide",
      "handle",
      "hinge",
      "rod",
      "rod-holder",
      "shelf-support",
    ],
    facadeThickness: 16,
    bodyMaterial: "white-matt",
    facadeMaterial: "white-matt",
    sections: 2,
    shelves: 4,
    drawers: 2,
    hangingRod: true,
    facadeMode: "hinged",
  },
  (productionExport) => {
    assertRequiredProductionV3CanonicalSnapshot("drawers + rods + shelves payload", productionExport);
    assert.ok(productionExport.productionModel.hardware.some((item) => item.type === "rod"));
    assert.ok(productionExport.productionModel.hardware.some((item) => item.type === "drawer-slide"));
    assert.ok(productionExport.manufacturing.requiresTechnologistCheck);
  },
);

runGoldenCase(
  "material-aware body/facade payload",
  facadeMaterialPayload,
  {
    panels: 13,
    hardware: 32,
    drilling: 32,
    edgeBanding: 48,
    warnings: 6,
    basisSteps: 179,
    review: "requires-review",
    validation: "ready-for-review",
    totals: {
      panelCount: 13,
      drillingCount: 32,
      hardwareCount: 32,
      edgeBandingLengthMm: 58252,
      bodyAreaM2: 7.44,
      facadeAreaM2: 3.98,
      backPanelAreaM2: 4.12,
      materialAreaM2: { ldsp: 7.44, mdf: 3.98, hdf: 4.12 },
    },
    hardwareTypes: ["confirmat", "handle", "hinge", "shelf-support"],
    facadeThickness: 18,
    bodyMaterial: "ldsp-egger-w960-belyy-klassicheskiy-sm",
    facadeMaterial: "mdf-egger-r010-seryy-grafitovyy-ms",
    sections: 2,
    shelves: 2,
    drawers: 0,
    hangingRod: false,
    facadeMode: "hinged",
  },
  (productionExport) => {
    assertRequiredProductionV3CanonicalSnapshot("material-aware body/facade payload", productionExport);
    assert.equal(productionExport.project.structure.openingMode, "handle-soft-close");
    assert.equal(productionExport.project.structure.hardwareMode, "base");
    assert.ok(productionExport.productionModel.hardware.some((item) => item.type === "handle"));
    assert.equal(productionExport.project.material.facadeThicknessMm, 18);
  },
);

const minimalWardrobePayload = makePayload({
  orderId: "RZ-20260623-9101",
  dimensions: { width: 1000, height: 1800, depth: 300 },
  sections: 1,
  filling: { shelves: 0, drawers: 0, hangingRod: false },
  materials: {
    bodyId: "white-matt",
    facadeId: "white-matt",
    facadeKind: "ldsp",
    backPanelId: "white-matt",
    backPanelKind: "hdf",
  },
  style: { facadeStyleId: "regular", hardwareId: "base" },
});

const maximumWardrobePayload = makePayload({
  orderId: "RZ-20260623-9102",
  dimensions: { width: 5400, height: 2700, depth: 900 },
  sections: 6,
  filling: { shelves: 0, drawers: 0, hangingRod: false },
  layout: {
    sections: Array.from({ length: 6 }, (_, index) => ({
      id: `section-${index + 1}`,
      widthMm: 900,
      compartments: [
        {
          id: `section-${index + 1}-compartment-1`,
          kind: "shelves" as const,
          heightMm: 2700,
          shelves: 0,
          drawers: 0,
          hasRod: false,
        },
      ],
    })),
  },
});

const manySectionsPayload = makePayload({
  orderId: "RZ-20260623-9103",
  dimensions: { width: 4500, height: 2400, depth: 600 },
  sections: 5,
  filling: { shelves: 0, drawers: 0, hangingRod: false },
  layout: {
    sections: Array.from({ length: 5 }, (_, index) => ({
      id: `section-${index + 1}`,
      widthMm: 900,
      compartments: [
        {
          id: `section-${index + 1}-compartment-1`,
          kind: "shelves" as const,
          heightMm: 2400,
          shelves: 1,
          drawers: 0,
          hasRod: false,
        },
      ],
    })),
  },
});

const manyShelvesPayload = makePayload({
  orderId: "RZ-20260623-9104",
  filling: { shelves: 12, drawers: 0, hangingRod: false },
  layout: {
    sections: [
      {
        id: "section-1",
        widthMm: 900,
        compartments: [
          {
            id: "section-1-compartment-1",
            kind: "shelves",
            heightMm: 2400,
            shelves: 6,
            drawers: 0,
            hasRod: false,
          },
        ],
      },
      {
        id: "section-2",
        widthMm: 900,
        compartments: [
          {
            id: "section-2-compartment-1",
            kind: "shelves",
            heightMm: 2400,
            shelves: 6,
            drawers: 0,
            hasRod: false,
          },
        ],
      },
    ],
  },
});

const manyDrawersDresserPayload = makePayload({
  orderId: "RZ-20260623-9105",
  productType: "dresser",
  dimensions: { width: 1200, height: 900, depth: 450 },
  sections: 1,
  filling: { shelves: 0, drawers: 4, hangingRod: false },
  layout: {
    sections: [
      {
        id: "section-1",
        widthMm: 1200,
        compartments: [
          {
            id: "section-1-compartment-1",
            kind: "drawers",
            heightMm: 900,
            shelves: 0,
            drawers: 4,
            hasRod: false,
          },
        ],
      },
    ],
  },
});

const drawersFacadeNightstandPayload = makePayload({
  orderId: "RZ-20260623-9106",
  productType: "nightstand",
  dimensions: { width: 500, height: 550, depth: 400 },
  sections: 1,
  filling: { shelves: 0, drawers: 2, hangingRod: false },
  layout: {
    sections: [
      {
        id: "section-1",
        widthMm: 500,
        compartments: [
          {
            id: "section-1-compartment-1",
            kind: "drawers",
            heightMm: 550,
            shelves: 0,
            drawers: 2,
            hasRod: false,
          },
        ],
      },
    ],
  },
});

runGoldenCase("minimal wardrobe payload", minimalWardrobePayload, {
  panels: 8,
  hardware: 14,
  drilling: 14,
  edgeBanding: 28,
  warnings: 0,
  basisSteps: 97,
  review: "requires-review",
  validation: "ready-for-review",
  totals: {
    panelCount: 8,
    drillingCount: 14,
    hardwareCount: 14,
    edgeBandingLengthMm: 23966,
    bodyAreaM2: 1.7,
    facadeAreaM2: 1.62,
    backPanelAreaM2: 1.69,
    materialAreaM2: { ldsp: 3.33, hdf: 1.69 },
  },
  hardwareTypes: ["confirmat", "handle", "hinge"],
  facadeThickness: 16,
  bodyMaterial: "white-matt",
  facadeMaterial: "white-matt",
  sections: 1,
  shelves: 0,
  drawers: 0,
  hangingRod: false,
  facadeMode: "hinged",
});

runGoldenCase("maximum supported wardrobe payload", maximumWardrobePayload, {
  panels: 23,
  hardware: 76,
  drilling: 76,
  edgeBanding: 88,
  warnings: 18,
  basisSteps: 371,
  review: "requires-review",
  validation: "ready-for-review",
  totals: {
    panelCount: 23,
    drillingCount: 76,
    hardwareCount: 76,
    edgeBandingLengthMm: 157476,
    bodyAreaM2: 26.44,
    facadeAreaM2: 13.58,
    backPanelAreaM2: 14.01,
    materialAreaM2: { ldsp: 26.44, mdf: 13.58, hdf: 14.01 },
  },
  hardwareTypes: ["confirmat", "handle", "hinge"],
  facadeThickness: 18,
  bodyMaterial: "ldsp-egger-w960-belyy-klassicheskiy-sm",
  facadeMaterial: "mdf-egger-r010-seryy-grafitovyy-ms",
  sections: 6,
  shelves: 0,
  drawers: 0,
  hangingRod: false,
  facadeMode: "hinged",
});

runGoldenCase("many sections payload", manySectionsPayload, {
  panels: 25,
  hardware: 74,
  drilling: 74,
  edgeBanding: 96,
  warnings: 15,
  basisSteps: 377,
  review: "requires-review",
  validation: "ready-for-review",
  totals: {
    panelCount: 25,
    drillingCount: 74,
    hardwareCount: 74,
    edgeBandingLengthMm: 133222,
    bodyAreaM2: 16.57,
    facadeAreaM2: 10,
    backPanelAreaM2: 10.32,
    materialAreaM2: { ldsp: 16.57, mdf: 10, hdf: 10.32 },
  },
  hardwareTypes: ["confirmat", "handle", "hinge", "shelf-support"],
  facadeThickness: 18,
  bodyMaterial: "ldsp-egger-w960-belyy-klassicheskiy-sm",
  facadeMaterial: "mdf-egger-r010-seryy-grafitovyy-ms",
  sections: 5,
  shelves: 0,
  drawers: 0,
  hangingRod: false,
  facadeMode: "hinged",
});

runGoldenCase("many shelves payload", manyShelvesPayload, {
  panels: 23,
  hardware: 52,
  drilling: 52,
  edgeBanding: 88,
  warnings: 6,
  basisSteps: 299,
  review: "requires-review",
  validation: "ready-for-review",
  totals: {
    panelCount: 23,
    drillingCount: 52,
    hardwareCount: 52,
    edgeBandingLengthMm: 87372,
    bodyAreaM2: 12.52,
    facadeAreaM2: 3.98,
    backPanelAreaM2: 4.12,
    materialAreaM2: { ldsp: 12.52, mdf: 3.98, hdf: 4.12 },
  },
  hardwareTypes: ["confirmat", "handle", "hinge", "shelf-support"],
  facadeThickness: 18,
  bodyMaterial: "ldsp-egger-w960-belyy-klassicheskiy-sm",
  facadeMaterial: "mdf-egger-r010-seryy-grafitovyy-ms",
  sections: 2,
  shelves: 12,
  drawers: 0,
  hangingRod: false,
  facadeMode: "hinged",
});

runGoldenCase(
  "many drawers dresser payload",
  manyDrawersDresserPayload,
  {
    panels: 25,
    hardware: 12,
    drilling: 16,
    edgeBanding: 80,
    warnings: 0,
    basisSteps: 255,
    review: "blocked",
    validation: "blocked",
    totals: {
      panelCount: 25,
      drillingCount: 16,
      hardwareCount: 12,
      edgeBandingLengthMm: 43200,
      bodyAreaM2: 3.38,
      facadeAreaM2: 1.02,
      backPanelAreaM2: 2.94,
      materialAreaM2: { ldsp: 3.38, mdf: 1.02, hdf: 2.94 },
    },
    hardwareTypes: ["confirmat", "drawer-slide", "handle"],
    facadeThickness: 18,
    bodyMaterial: "ldsp-egger-w960-belyy-klassicheskiy-sm",
    facadeMaterial: "mdf-egger-r010-seryy-grafitovyy-ms",
    sections: 1,
    shelves: 0,
    drawers: 4,
    hangingRod: false,
    facadeMode: "drawers",
  },
  (productionExport) => {
    assert.equal(productionExport.project.structure.facadeMode, "drawers");
    assert.ok(productionExport.productionModel.panels.some((panel) => panel.role === "drawer-front"));
  },
);

runGoldenCase(
  "drawers facade mode nightstand payload",
  drawersFacadeNightstandPayload,
  {
    panels: 15,
    hardware: 8,
    drilling: 10,
    edgeBanding: 48,
    warnings: 0,
    basisSteps: 151,
    review: "requires-review",
    validation: "ready-for-review",
    totals: {
      panelCount: 15,
      drillingCount: 10,
      hardwareCount: 8,
      edgeBandingLengthMm: 17736,
      bodyAreaM2: 1.38,
      facadeAreaM2: 0.25,
      backPanelAreaM2: 0.59,
      materialAreaM2: { ldsp: 1.38, mdf: 0.25, hdf: 0.59 },
    },
    hardwareTypes: ["confirmat", "drawer-slide", "handle"],
    facadeThickness: 18,
    bodyMaterial: "ldsp-egger-w960-belyy-klassicheskiy-sm",
    facadeMaterial: "mdf-egger-r010-seryy-grafitovyy-ms",
    sections: 1,
    shelves: 0,
    drawers: 2,
    hangingRod: false,
    facadeMode: "drawers",
  },
  (productionExport) => {
    assert.equal(productionExport.project.productType, "nightstand");
    assert.equal(productionExport.project.structure.facadeMode, "drawers");
  },
);
