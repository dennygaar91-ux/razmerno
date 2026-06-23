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
};

function normalizeMaterialAreaM2(
  materialAreaM2: ProductionExportPackage["productionModel"]["totals"]["materialAreaM2"],
) {
  return Object.fromEntries(
    Object.entries(materialAreaM2 ?? {}).filter(([, value]) => value != null),
  ) as ProductionExportPackage["productionModel"]["totals"]["materialAreaM2"];
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
  style: { facadeStyleId: "no-handle", hardwareId: "comfort" },
});

runGoldenCase("base wardrobe payload", baseWardrobePayload, {
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
});

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
  },
  (productionExport) => {
    assert.ok(productionExport.productionModel.hardware.some((item) => item.type === "rod"));
    assert.ok(productionExport.productionModel.hardware.some((item) => item.type === "drawer-slide"));
    assert.ok(productionExport.manufacturing.requiresTechnologistCheck);
  },
);

runGoldenCase(
  "facade/material variation payload",
  facadeMaterialPayload,
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
      materialAreaM2: { ldsp: 7.44, mdf: 3.98, hdf: 4.12 },
    },
    hardwareTypes: ["confirmat", "hinge", "push-to-open", "shelf-support"],
    facadeThickness: 18,
    bodyMaterial: "ldsp-egger-w960-belyy-klassicheskiy-sm",
    facadeMaterial: "mdf-egger-r010-seryy-grafitovyy-ms",
    sections: 2,
    shelves: 2,
    drawers: 0,
    hangingRod: false,
  },
  (productionExport) => {
    assert.equal(productionExport.project.structure.openingMode, "push-to-open");
    assert.equal(productionExport.project.structure.hardwareMode, "comfort");
    assert.ok(productionExport.productionModel.hardware.some((item) => item.type === "push-to-open"));
    assert.equal(productionExport.project.material.facadeThicknessMm, 18);
  },
);
