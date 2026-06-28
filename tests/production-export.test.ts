import assert from "node:assert/strict";
import test from "node:test";
import type { OrderRequest } from "../api/_shared/order-types.js";
import { buildManufacturingSpecificationFromProductionExport } from "../src/constructor/production/manufacturingSpecification.js";
import { buildProductionExportFromOrder, buildProductionExportFromPayload } from "../src/constructor/production/orderExportPackage.js";

const FORBIDDEN_BASIS_AUTO_B3D_CLAIMS = [
  "document:create-b3d",
  '"documentType":"b3d"',
  "'documentType': 'b3d'",
  "автоматической генерации .b3d",
  "автоматической генерации",
] as const;

const GOLDEN_ACCEPTED_AT = "2026-06-23T18:00:00.000Z";

function assertBasisManualJsonBoundary(
  serialized: string,
  basisStatus: string,
  label: string,
) {
  assert.equal(basisStatus, "manual-json-ready", `${label}: basis.status`);
  for (const forbidden of FORBIDDEN_BASIS_AUTO_B3D_CLAIMS) {
    assert.ok(!serialized.includes(forbidden), `${label}: forbidden auto-b3d claim "${forbidden}"`);
  }
  assert.ok(!serialized.includes("create-b3d"), `${label}: must not reference create-b3d command id`);
}

function makePayload(overrides: Partial<OrderRequest> = {}): OrderRequest {
  return {
    orderId: "RZ-20260623-9001",
    productType: "wardrobe",
    dimensions: { width: 1800, height: 2400, depth: 600 },
    sections: 2,
    filling: { shelves: 2, drawers: 0, hangingRod: false },
    layout: { sections: [] },
    materials: {
      bodyId: "white-matt",
      facadeId: "white-matt",
      facadeKind: "ldsp",
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

function keyCountMap<T extends string>(items: Array<{ count: number } & Record<string, T>>, property: string) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = String(item[property]);
    counts.set(key, (counts.get(key) ?? 0) + item.count);
  }

  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

function extractManufacturingSpecSnapshot(payload: OrderRequest) {
  const pack = buildProductionExportFromPayload(payload);
  const spec = buildManufacturingSpecificationFromProductionExport(pack);

  return {
    pack,
    spec,
    snapshot: {
      derivedFrom: spec.derivedFrom,
      product: {
        productType: spec.product.productType,
        sectionCount: spec.product.sectionCount,
        facadeMode: spec.product.facadeMode,
        openingMode: spec.product.openingMode,
        hardwareMode: spec.product.hardwareMode,
        materials: spec.product.materials,
      },
      cutList: {
        totalPanels: spec.cutList.totalPanels,
        roleTotals: Object.fromEntries(
          Object.entries(
            spec.cutList.groupedItems.reduce<Record<string, number>>((acc, item) => {
              acc[item.role] = (acc[item.role] ?? 0) + item.quantity;
              return acc;
            }, {}),
          ).sort(([left], [right]) => left.localeCompare(right)),
        ),
      },
      edgeBanding: {
        totalEdges: spec.edgeBanding.totalEdges,
        totalLengthMm: spec.edgeBanding.totalLengthMm,
        byThickness: Object.fromEntries(
          spec.edgeBanding.byThickness.map((item) => [
            String(item.thicknessMm),
            { count: item.count, totalLengthMm: item.totalLengthMm },
          ]),
        ),
      },
      hardware: {
        totalItems: spec.hardware.totalItems,
        byType: keyCountMap(spec.hardware.byType, "type"),
      },
      drilling: {
        totalOperations: spec.drilling.totalOperations,
        requiresTechnologistCheck: spec.drilling.requiresTechnologistCheck,
        byPurpose: keyCountMap(spec.drilling.byPurpose, "purpose"),
      },
      operations: {
        basisManualPlanStepCount: spec.operations.basisManualPlanStepCount,
        byAction: keyCountMap(spec.operations.byAction, "action"),
        byStatus: keyCountMap(spec.operations.byStatus, "status"),
      },
      validation: {
        status: spec.validation.status,
        errorCount: spec.validation.errorCount,
        warningCount: spec.validation.warningCount,
        productionWarningCodes: spec.validation.productionWarningCodes,
        rulesStatus: spec.validation.rulesStatus,
      },
      review: spec.review,
      basisManualJson: spec.basisManualJson,
    },
  };
}

function assertManufacturingSpecificationInvariants(
  payload: OrderRequest,
  label: string,
) {
  const { pack, spec } = extractManufacturingSpecSnapshot(payload);
  const serialized = JSON.stringify(spec);

  assert.equal(spec.schema, "razmerno.manufacturing-spec.v1");
  assert.equal(spec.derivedFrom.productionExportSchema, "razmerno.production-export.v1");
  assert.equal(spec.derivedFrom.productionModelSchema, "razmerno.production-model.v3");
  assert.equal(spec.derivedFrom.basisBoundary, "manual-json");
  assert.equal(spec.basisManualJson.status, "manual-json-ready");
  assert.equal(spec.basisManualJson.doesNotGenerateB3d, true);
  assert.equal(spec.cutList.totalPanels, pack.productionModel.panels.length);
  assert.equal(
    spec.cutList.groupedItems.reduce((sum, item) => sum + item.quantity, 0),
    pack.productionModel.panels.length,
  );
  assert.equal(spec.edgeBanding.totalEdges, pack.productionModel.edgeBanding.length);
  assert.equal(spec.hardware.totalItems, pack.productionModel.hardware.length);
  assert.equal(spec.drilling.totalOperations, pack.productionModel.drilling.length);
  assert.equal(spec.operations.basisManualPlanStepCount, pack.basis.plan.length);
  assert.equal(spec.validation.status, pack.validation.status);
  assert.equal(spec.review.status, pack.review.status);
  assert.equal(spec.review.visibleToClient, false);

  assert.ok(!serialized.includes("client@example.com"), `${label}: spec must exclude customer email`);
  assert.ok(!serialized.includes("+7 999"), `${label}: spec must exclude customer phone`);
  assert.ok(!serialized.includes("Иван"), `${label}: spec must exclude customer name`);
  assert.ok(!serialized.includes("production-rev-"), `${label}: spec must exclude revision ids`);
  assert.ok(!serialized.includes("acceptedAt"), `${label}: spec must exclude acceptedAt`);
  assert.ok(!serialized.includes("createdAt"), `${label}: spec must exclude createdAt`);
  assert.ok(!serialized.includes("RZ-20260623"), `${label}: spec must exclude order ids`);
  assertBasisManualJsonBoundary(serialized, spec.basisManualJson.status, label);
}

test("production export package baseline invariants stay valid", () => {
  const order = {
    productType: "wardrobe" as const,
    dimensions: { width: 1800, height: 2400, depth: 600 },
    sections: 2,
    filling: { shelves: 4, drawers: 0, hangingRod: true },
    layout: {
      sections: [
        {
          id: "section-1",
          widthMm: 900,
          compartments: [{ id: "section-1-compartment-1", kind: "shelves" as const, heightMm: 2400, shelves: 2, drawers: 0, hasRod: false }],
        },
        {
          id: "section-2",
          widthMm: 900,
          compartments: [{ id: "section-2-compartment-1", kind: "rod" as const, heightMm: 2400, shelves: 2, drawers: 0, hasRod: true }],
        },
      ],
    },
    materials: { bodyId: "white-matt", facadeId: "oak-natural" },
    style: { facadeStyleId: "no-handle", hardwareId: "comfort" },
  };

  const pack = buildProductionExportFromOrder(order);

  assert.equal(pack.schema, "razmerno.production-export.v1");
  assert.equal(pack.units, "mm");
  assert.equal(pack.source, "api-order");
  assert.equal(pack.project.productType, "wardrobe");
  assert.ok(pack.productionModel.panels.length > 0);
  assert.ok(pack.productionModel.edgeBanding.length > 0);
  assert.ok(pack.productionModel.basisExportPlan.length > 0);
  assert.equal(pack.basis.status, "manual-json-ready");
  assertBasisManualJsonBoundary(JSON.stringify(pack), pack.basis.status, "production export");
  assert.equal(pack.validation.schema, "razmerno.production-validation.v1");
  assert.ok(pack.validation.summary.panels > 0);
  assert.ok(typeof pack.manufacturing.requiresTechnologistCheck === "boolean");
  assert.equal(pack.review.visibleToClient, false);
  assert.equal(pack.revisions.length, 1);
  assert.ok(pack.productionModel.drilling.every((operation) => operation.panelId));
  assert.ok(
    pack.productionModel.hardware.every((item) =>
      item.drillingRefs.every((ref) => pack.productionModel.drilling.some((drill) => drill.id === ref)),
    ),
  );
});

test("manufacturing specification is independent from payload-only UI metadata, pricing and PII", () => {
  const first = makePayload({
    orderId: "RZ-20260623-9201",
    customer: { name: "Первый", phone: "+7 911 000 00 01", email: "first@example.com" },
    totalPrice: 123456,
    consent: { personalData: true, privacyVersion: "2026-05-24", acceptedAt: "2026-06-20T10:00:00.000Z" },
  });
  const second = makePayload({
    orderId: "RZ-20260623-9202",
    customer: { name: "Второй", phone: "+7 922 000 00 02", email: "second@example.com" },
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
    consent: { personalData: true, privacyVersion: "2026-05-24", acceptedAt: "2026-06-22T22:22:22.000Z" },
  });

  const firstSpec = buildManufacturingSpecificationFromProductionExport(buildProductionExportFromPayload(first));
  const secondSpec = buildManufacturingSpecificationFromProductionExport(buildProductionExportFromPayload(second));

  assert.deepEqual(firstSpec, secondSpec);
});

test("manufacturing specification: baseline wardrobe is stable and manual-json-only", () => {
  const payload = makePayload({
    orderId: "RZ-20260623-9001",
  });
  assertManufacturingSpecificationInvariants(payload, "baseline wardrobe spec");

  const { snapshot } = extractManufacturingSpecSnapshot(payload);
  assert.deepEqual(snapshot, {
    derivedFrom: {
      productionExportSchema: "razmerno.production-export.v1",
      productionModelSchema: "razmerno.production-model.v3",
      basisBoundary: "manual-json",
    },
    product: {
      productType: "wardrobe",
      sectionCount: 2,
      facadeMode: "hinged",
      openingMode: "handle-soft-close",
      hardwareMode: "base",
      materials: {
        bodyMaterialId: "white-matt",
        facadeMaterialId: "white-matt",
        backPanelMaterialId: "white-matt",
        bodyThicknessMm: 16,
        facadeThicknessMm: 16,
        backPanelThicknessMm: 3,
      },
    },
    cutList: {
      totalPanels: 13,
      roleTotals: {
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
    },
    edgeBanding: {
      totalEdges: 48,
      totalLengthMm: 58252,
      byThickness: {
        1: { count: 32, totalLengthMm: 36432 },
        2: { count: 16, totalLengthMm: 21820 },
      },
    },
    hardware: {
      totalItems: 32,
      byType: { confirmat: 4, handle: 4, hinge: 20, "shelf-support": 4 },
    },
    drilling: {
      totalOperations: 32,
      requiresTechnologistCheck: true,
      byPurpose: { confirmat: 4, handle: 4, "hinge-cup": 20, "shelf-support": 4 },
    },
    operations: {
      basisManualPlanStepCount: 179,
      byAction: {
        "add-user-property": 26,
        "create-drilling": 32,
        "create-panel": 13,
        "group-object": 2,
        "place-hardware": 32,
        "set-edge": 48,
        "set-face-side": 13,
        "set-material": 13,
      },
      byStatus: {
        "needs-check": 64,
        ready: 115,
      },
    },
    validation: {
      status: "ready-for-review",
      errorCount: 0,
      warningCount: 24,
      productionWarningCodes: [
        { code: "many-hinges", severity: "warn", count: 4 },
        { code: "tall-facade", severity: "warn", count: 2 },
      ],
      rulesStatus: "ready-for-review",
    },
    review: {
      status: "requires-review",
      requiresTechnologistCheck: true,
      manualChangesAllowed: true,
      visibleToClient: false,
    },
    basisManualJson: {
      status: "manual-json-ready",
      doesNotGenerateB3d: true,
      manualPlanStepCount: 179,
    },
  });
});

test("manufacturing specification: handleless wardrobe preserves push-to-open and stable summaries", () => {
  const payload = makePayload({
    orderId: "RZ-20260623-9005",
    style: { facadeStyleId: "no-handle", hardwareId: "comfort" },
  });
  assertManufacturingSpecificationInvariants(payload, "handleless wardrobe spec");

  const { snapshot } = extractManufacturingSpecSnapshot(payload);
  assert.deepEqual(snapshot, {
    derivedFrom: {
      productionExportSchema: "razmerno.production-export.v1",
      productionModelSchema: "razmerno.production-model.v3",
      basisBoundary: "manual-json",
    },
    product: {
      productType: "wardrobe",
      sectionCount: 2,
      facadeMode: "hinged",
      openingMode: "push-to-open",
      hardwareMode: "comfort",
      materials: {
        bodyMaterialId: "white-matt",
        facadeMaterialId: "white-matt",
        backPanelMaterialId: "white-matt",
        bodyThicknessMm: 16,
        facadeThicknessMm: 16,
        backPanelThicknessMm: 3,
      },
    },
    cutList: {
      totalPanels: 13,
      roleTotals: {
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
    },
    edgeBanding: {
      totalEdges: 48,
      totalLengthMm: 58252,
      byThickness: {
        1: { count: 32, totalLengthMm: 36432 },
        2: { count: 16, totalLengthMm: 21820 },
      },
    },
    hardware: {
      totalItems: 32,
      byType: { confirmat: 4, hinge: 20, "push-to-open": 4, "shelf-support": 4 },
    },
    drilling: {
      totalOperations: 28,
      requiresTechnologistCheck: true,
      byPurpose: { confirmat: 4, "hinge-cup": 20, "shelf-support": 4 },
    },
    operations: {
      basisManualPlanStepCount: 175,
      byAction: {
        "add-user-property": 26,
        "create-drilling": 28,
        "create-panel": 13,
        "group-object": 2,
        "place-hardware": 32,
        "set-edge": 48,
        "set-face-side": 13,
        "set-material": 13,
      },
      byStatus: {
        future: 4,
        "needs-check": 56,
        ready: 115,
      },
    },
    validation: {
      status: "ready-for-review",
      errorCount: 0,
      warningCount: 24,
      productionWarningCodes: [
        { code: "many-hinges", severity: "warn", count: 4 },
        { code: "tall-facade", severity: "warn", count: 2 },
      ],
      rulesStatus: "ready-for-review",
    },
    review: {
      status: "requires-review",
      requiresTechnologistCheck: true,
      manualChangesAllowed: true,
      visibleToClient: false,
    },
    basisManualJson: {
      status: "manual-json-ready",
      doesNotGenerateB3d: true,
      manualPlanStepCount: 175,
    },
  });
});

test("manufacturing specification: mixed drawers shelves rod preserves blocked review state", () => {
  const payload = makePayload({
    orderId: "RZ-20260623-9003",
    filling: { shelves: 4, drawers: 2, hangingRod: true },
    layout: {
      sections: [
        {
          id: "section-1",
          widthMm: 900,
          compartments: [
            {
              id: "section-1-compartment-1",
              kind: "drawers" as const,
              heightMm: 800,
              shelves: 0,
              drawers: 2,
              hasRod: false,
            },
            {
              id: "section-1-compartment-2",
              kind: "rod" as const,
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
              kind: "shelves" as const,
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
  assertManufacturingSpecificationInvariants(payload, "mixed filling spec");

  const { snapshot } = extractManufacturingSpecSnapshot(payload);
  assert.deepEqual(snapshot, {
    derivedFrom: {
      productionExportSchema: "razmerno.production-export.v1",
      productionModelSchema: "razmerno.production-model.v3",
      basisBoundary: "manual-json",
    },
    product: {
      productType: "wardrobe",
      sectionCount: 2,
      facadeMode: "hinged",
      openingMode: "handle-soft-close",
      hardwareMode: "base",
      materials: {
        bodyMaterialId: "white-matt",
        facadeMaterialId: "white-matt",
        backPanelMaterialId: "white-matt",
        bodyThicknessMm: 16,
        facadeThicknessMm: 16,
        backPanelThicknessMm: 3,
      },
    },
    cutList: {
      totalPanels: 25,
      roleTotals: {
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
    },
    edgeBanding: {
      totalEdges: 88,
      totalLengthMm: 79740,
      byThickness: {
        1: { count: 64, totalLengthMm: 54528 },
        2: { count: 24, totalLengthMm: 25212 },
      },
    },
    hardware: {
      totalItems: 41,
      byType: {
        confirmat: 4,
        "drawer-slide": 2,
        handle: 6,
        hinge: 18,
        rod: 1,
        "rod-holder": 2,
        "shelf-support": 8,
      },
    },
    drilling: {
      totalOperations: 42,
      requiresTechnologistCheck: true,
      byPurpose: {
        confirmat: 4,
        "drawer-slide": 4,
        handle: 6,
        "hinge-cup": 18,
        "rod-holder": 2,
        "shelf-support": 8,
      },
    },
    operations: {
      basisManualPlanStepCount: 308,
      byAction: {
        "add-user-property": 60,
        "create-drilling": 42,
        "create-panel": 25,
        "group-object": 2,
        "place-hardware": 41,
        "set-edge": 88,
        "set-face-side": 25,
        "set-material": 25,
      },
      byStatus: {
        future: 1,
        "needs-check": 82,
        ready: 225,
      },
    },
    validation: {
      status: "blocked",
      errorCount: 2,
      warningCount: 25,
      productionWarningCodes: [
        { code: "many-hinges", severity: "warn", count: 2 },
        { code: "tall-facade", severity: "warn", count: 1 },
      ],
      rulesStatus: "blocked",
    },
    review: {
      status: "blocked",
      requiresTechnologistCheck: true,
      manualChangesAllowed: true,
      visibleToClient: false,
    },
    basisManualJson: {
      status: "manual-json-ready",
      doesNotGenerateB3d: true,
      manualPlanStepCount: 308,
    },
  });
});

test("manufacturing specification: material-aware body and facade materials stay stable", () => {
  const payload = makePayload({
    orderId: "RZ-20260623-9004",
    materials: {
      bodyId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
      facadeId: "mdf-egger-r010-seryy-grafitovyy-ms",
      facadeKind: "mdf",
      backPanelId: "white-matt",
      backPanelKind: "hdf",
    },
  });
  assertManufacturingSpecificationInvariants(payload, "material-aware spec");

  const { snapshot } = extractManufacturingSpecSnapshot(payload);
  assert.deepEqual(snapshot, {
    derivedFrom: {
      productionExportSchema: "razmerno.production-export.v1",
      productionModelSchema: "razmerno.production-model.v3",
      basisBoundary: "manual-json",
    },
    product: {
      productType: "wardrobe",
      sectionCount: 2,
      facadeMode: "hinged",
      openingMode: "handle-soft-close",
      hardwareMode: "base",
      materials: {
        bodyMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
        facadeMaterialId: "mdf-egger-r010-seryy-grafitovyy-ms",
        backPanelMaterialId: "white-matt",
        bodyThicknessMm: 16,
        facadeThicknessMm: 18,
        backPanelThicknessMm: 3,
      },
    },
    cutList: {
      totalPanels: 13,
      roleTotals: {
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
    },
    edgeBanding: {
      totalEdges: 48,
      totalLengthMm: 58252,
      byThickness: {
        1: { count: 32, totalLengthMm: 36432 },
        2: { count: 16, totalLengthMm: 21820 },
      },
    },
    hardware: {
      totalItems: 32,
      byType: { confirmat: 4, handle: 4, hinge: 20, "shelf-support": 4 },
    },
    drilling: {
      totalOperations: 32,
      requiresTechnologistCheck: true,
      byPurpose: { confirmat: 4, handle: 4, "hinge-cup": 20, "shelf-support": 4 },
    },
    operations: {
      basisManualPlanStepCount: 179,
      byAction: {
        "add-user-property": 26,
        "create-drilling": 32,
        "create-panel": 13,
        "group-object": 2,
        "place-hardware": 32,
        "set-edge": 48,
        "set-face-side": 13,
        "set-material": 13,
      },
      byStatus: {
        "needs-check": 64,
        ready: 115,
      },
    },
    validation: {
      status: "ready-for-review",
      errorCount: 0,
      warningCount: 24,
      productionWarningCodes: [
        { code: "many-hinges", severity: "warn", count: 4 },
        { code: "tall-facade", severity: "warn", count: 2 },
      ],
      rulesStatus: "ready-for-review",
    },
    review: {
      status: "requires-review",
      requiresTechnologistCheck: true,
      manualChangesAllowed: true,
      visibleToClient: false,
    },
    basisManualJson: {
      status: "manual-json-ready",
      doesNotGenerateB3d: true,
      manualPlanStepCount: 179,
    },
  });
});

console.log("Production export package test passed.");
