import assert from "node:assert/strict";
import { test } from "node:test";
import type { OrderRequest } from "../api/_shared/order-types.js";
import { buildProductionExportFromPayload } from "../src/constructor/production/orderExportPackage.js";
import { buildProductionJsonV4FromV3 } from "../src/constructor/production/v4/adapter.js";
import {
  assertProductionJsonV4Invariants,
  validateProductionJsonV4,
} from "../src/constructor/production/v4/guards.js";
import { PRODUCTION_JSON_V4_SCHEMA } from "../src/constructor/production/v4/types.js";

const GOLDEN_ACCEPTED_AT = "2026-06-23T18:00:00.000Z";

const FORBIDDEN_B3D_CLAIMS = [
  "document:create-b3d",
  '"documentType":"b3d"',
  "create-b3d",
  "автоматической генерации .b3d",
] as const;

function makeBasePayload(overrides: Partial<OrderRequest> = {}): OrderRequest {
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
    consent: {
      personalData: true,
      privacyVersion: "2026-05-24",
      acceptedAt: GOLDEN_ACCEPTED_AT,
    },
    source: "constructor-store-adapter",
    ...overrides,
  };
}

function buildV3FromBasePayload(overrides: Partial<OrderRequest> = {}) {
  return buildProductionExportFromPayload(makeBasePayload(overrides));
}

test("adapter builds v4 from current production v3 base payload", () => {
  const v3 = buildV3FromBasePayload();
  const v4 = buildProductionJsonV4FromV3(v3);

  assert.equal(v4.schema, PRODUCTION_JSON_V4_SCHEMA);
  assert.ok(v4.panels.length > 0);
  assert.ok(v4.edgeBanding.length > 0);
  assert.ok(v4.hardware.length > 0);
  assert.ok(v4.drilling.length > 0);
  assert.equal(v4.meta.source, "api-order");
});

test("adapter output passes v4 invariants", () => {
  const v3 = buildV3FromBasePayload();
  const v4 = buildProductionJsonV4FromV3(v3);
  const result = validateProductionJsonV4(v4);

  assert.equal(result.ok, true, result.errors.map((error) => `${error.code}: ${error.message}`).join("; "));
  assert.doesNotThrow(() => assertProductionJsonV4Invariants(v4));
});

test("adapter preserves basis boundary manual-json-ready and no .b3d claims", () => {
  const v3 = buildV3FromBasePayload();
  const v4 = buildProductionJsonV4FromV3(v3);
  const serialized = JSON.stringify(v4);

  assert.equal(v4.basisCompatibility.mode, "manual-json");
  assert.equal(v4.basisCompatibility.status, "manual-json-ready");
  assert.equal(v4.basisCompatibility.doesNotGenerateB3d, true);
  for (const forbidden of FORBIDDEN_B3D_CLAIMS) {
    assert.ok(!serialized.includes(forbidden), `forbidden claim: ${forbidden}`);
  }
});

test("adapter keeps panel/edge/hardware/drilling references valid", () => {
  const v3 = buildV3FromBasePayload();
  const v4 = buildProductionJsonV4FromV3(v3);

  const panelIds = new Set(v4.panels.map((panel) => panel.id));
  const edgeIds = new Set(v4.edgeBanding.map((edge) => edge.id));
  const hardwareIds = new Set(v4.hardware.map((item) => item.id));
  const drillingIds = new Set(v4.drilling.map((drill) => drill.id));

  for (const panel of v4.panels) {
    for (const ref of panel.edgeBandingRefs ?? []) {
      assert.ok(edgeIds.has(ref), `panel ${panel.id} edge ref ${ref}`);
    }
    for (const ref of panel.hardwareRefs ?? []) {
      assert.ok(hardwareIds.has(ref), `panel ${panel.id} hardware ref ${ref}`);
    }
  }

  for (const edge of v4.edgeBanding) {
    assert.ok(panelIds.has(edge.panelId), `edge ${edge.id} panel ${edge.panelId}`);
  }

  for (const item of v4.hardware) {
    if (item.mountingPanelId) {
      assert.ok(panelIds.has(item.mountingPanelId), `hardware ${item.id} mounting panel`);
    }
    for (const ref of item.drillingRefs ?? []) {
      assert.ok(drillingIds.has(ref), `hardware ${item.id} drilling ref ${ref}`);
    }
    assert.equal(item.requiresTechnologistCheck, true);
  }

  for (const drill of v4.drilling) {
    assert.ok(panelIds.has(drill.panelId), `drilling ${drill.id} panel`);
    assert.equal(drill.requiresTechnologistCheck, true);
    assert.equal(drill.coordinateSpace, "world");
    assert.ok(drill.world);
  }
});

test("adapter preserves material policy or emits conservative warnings", () => {
  const v3 = buildV3FromBasePayload();
  const v4 = buildProductionJsonV4FromV3(v3);

  const bodyPanels = v4.panels.filter((panel) =>
    ["side-left", "side-right", "bottom", "top", "shelf"].includes(panel.role),
  );
  assert.ok(bodyPanels.every((panel) => panel.materialKind === "ldsp" && panel.thicknessMm === 16));

  const facadePanels = v4.panels.filter((panel) => panel.role === "facade-door");
  assert.ok(
    facadePanels.every((panel) => panel.materialKind === "mdf" && panel.thicknessMm === 18),
  );

  const hdfPanels = v4.panels.filter((panel) => panel.role === "back-panel");
  assert.ok(hdfPanels.every((panel) => panel.materialKind === "hdf" && panel.thicknessMm === 3));

  assert.equal(v4.rules.pairedFacadePolicy.centerGapMm, 3);
  assert.equal(v4.rules.topPanelPlacement, "between-sides");
  assert.equal(v4.review.visibleToClient, false);

  const hasPlinthWarning = v4.validation.warnings.some((warning) => warning.code === "adapter.support.plinth-panel");
  assert.ok(hasPlinthWarning, "expected plinth support conservative warning");
});

test("adapter does not change v3 export behavior", () => {
  const payload = makeBasePayload();
  const before = buildProductionExportFromPayload(payload);
  buildProductionJsonV4FromV3(before);
  const after = buildProductionExportFromPayload(payload);

  assert.deepEqual(after, before);
});

test("adapter projection is deterministic for same v3 input", () => {
  const v3 = buildV3FromBasePayload();
  const first = buildProductionJsonV4FromV3(v3);
  const second = buildProductionJsonV4FromV3(v3);

  assert.deepEqual(second, first);
});

test("adapter maps dresser and nightstand payloads through v4 invariants", () => {
  for (const productType of ["dresser", "nightstand"] as const) {
    const v3 = buildV3FromBasePayload({
      productType,
      dimensions:
        productType === "dresser"
          ? { width: 1200, height: 900, depth: 500 }
          : { width: 500, height: 600, depth: 450 },
      sections: 1,
      filling:
        productType === "dresser"
          ? { shelves: 0, drawers: 4, hangingRod: false }
          : { shelves: 0, drawers: 2, hangingRod: false },
      materials: {
        bodyId: "ldsp-body",
        facadeId: "ldsp-facade",
        facadeKind: "ldsp",
      },
    });
    const v4 = buildProductionJsonV4FromV3(v3);
    const result = validateProductionJsonV4(v4);
    assert.equal(result.ok, true, `${productType}: ${result.errors.map((error) => error.message).join("; ")}`);
  }
});
