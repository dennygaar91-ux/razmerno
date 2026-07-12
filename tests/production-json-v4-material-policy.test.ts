import assert from "node:assert/strict";
import { test } from "node:test";
import type { OrderRequest } from "../api/_shared/order-types.js";
import { buildProductionExportFromPayload } from "../src/constructor/production/orderExportPackage.js";
import { buildProductionJsonV4FromV3 } from "../src/constructor/production/v4/adapter.js";
import {
  applyMaterialPolicyDefaultsV4,
  deriveTextureDirectionFromPanelSize,
  getExpectedPanelMaterialPolicy,
  validateMaterialPolicyV4,
} from "../src/constructor/production/v4/materialPolicy.js";
import { productionJsonV4Example } from "../src/constructor/production/v4/example.js";
import type { PanelV4 } from "../src/constructor/production/v4/types.js";

function makePanel(overrides: Partial<PanelV4> & Pick<PanelV4, "id" | "role">): PanelV4 {
  const base: PanelV4 = {
    id: overrides.id,
    objectType: "panel",
    basisObjectType: "panel",
    role: overrides.role,
    name: overrides.name ?? overrides.id,
    materialRef: overrides.materialRef ?? "mat-body-white-ldsp-16",
    materialKind: overrides.materialKind ?? "ldsp",
    thicknessMm: overrides.thicknessMm ?? 16,
    dimensions: overrides.dimensions ?? { widthMm: 800, heightMm: 400, thicknessMm: overrides.thicknessMm ?? 16 },
    orientation: overrides.orientation ?? { basisPanelKind: "horizontal", plane: "XZ" },
    textureDirection: overrides.textureDirection ?? "horizontal",
    includeInDocumentation: true,
  };
  return { ...base, ...overrides };
}

function makePolicyModel(panels: PanelV4[]) {
  return {
    ...productionJsonV4Example,
    panels,
    materials: productionJsonV4Example.materials,
  };
}

test("deriveTextureDirectionFromPanelSize: u > v → horizontal", () => {
  const panel = makePanel({ id: "p-h", role: "shelf" });
  assert.equal(
    deriveTextureDirectionFromPanelSize({
      dimensions: { widthMm: 900, heightMm: 400, thicknessMm: 16 },
      materialKind: panel.materialKind,
      role: panel.role,
    }),
    "horizontal",
  );
});

test("deriveTextureDirectionFromPanelSize: v > u → vertical", () => {
  assert.equal(
    deriveTextureDirectionFromPanelSize({
      dimensions: { widthMm: 400, heightMm: 900, thicknessMm: 16 },
      materialKind: "ldsp",
      role: "side-left",
    }),
    "vertical",
  );
});

test("deriveTextureDirectionFromPanelSize: equal sides default to vertical", () => {
  assert.equal(
    deriveTextureDirectionFromPanelSize({
      dimensions: { widthMm: 500, heightMm: 500, thicknessMm: 16 },
      materialKind: "ldsp",
      role: "shelf",
    }),
    "vertical",
  );
});

test("deriveTextureDirectionFromPanelSize: HDF/back-panel → none", () => {
  assert.equal(
    deriveTextureDirectionFromPanelSize({
      dimensions: { widthMm: 900, heightMm: 400, thicknessMm: 3 },
      materialKind: "hdf",
      role: "back-panel",
    }),
    "none",
  );
});

test("body panel wrong thickness fails material policy", () => {
  const model = makePolicyModel([
    makePanel({
      id: "panel-side-left",
      role: "side-left",
      materialKind: "ldsp",
      thicknessMm: 18,
      dimensions: { widthMm: 600, heightMm: 2300, thicknessMm: 18 },
      textureDirection: "vertical",
    }),
  ]);

  const result = validateMaterialPolicyV4(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "panel.body.material.invalid"));
});

test("facade LDSP 16 passes material policy", () => {
  const panel = makePanel({
    id: "panel-facade-ldsp",
    role: "facade-door",
    materialRef: "mat-facade-ldsp-16",
    materialKind: "ldsp",
    thicknessMm: 16,
    dimensions: { widthMm: 400, heightMm: 900, thicknessMm: 16 },
    textureDirection: "vertical",
  });

  const policy = getExpectedPanelMaterialPolicy(panel, []);
  assert.equal(policy.kind, "ldsp");
  assert.equal(policy.thicknessMm, 16);

  const result = validateMaterialPolicyV4(
    makePolicyModel([
      panel,
    ]),
  );
  assert.equal(result.ok, true);
});

test("facade MDF 18 passes material policy", () => {
  const panel = makePanel({
    id: "panel-facade-mdf",
    role: "facade-door",
    materialRef: "mat-facade-mdf-18",
    materialKind: "mdf",
    thicknessMm: 18,
    dimensions: { widthMm: 400, heightMm: 900, thicknessMm: 18 },
    textureDirection: "vertical",
  });

  const result = validateMaterialPolicyV4(makePolicyModel([panel]));
  assert.equal(result.ok, true);
});

test("facade MDF 16 fails material policy", () => {
  const panel = makePanel({
    id: "panel-facade-mdf-bad",
    role: "facade-door",
    materialKind: "mdf",
    thicknessMm: 16,
    dimensions: { widthMm: 400, heightMm: 900, thicknessMm: 16 },
    textureDirection: "vertical",
  });

  const result = validateMaterialPolicyV4(makePolicyModel([panel]));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "panel.facade.mdf.thickness.invalid"));
});

test("drawer-front uses facade class policy", () => {
  const ldspFront = makePanel({
    id: "drawer-front-ldsp",
    role: "drawer-front",
    materialRef: "mat-body-white-ldsp-16",
    materialKind: "ldsp",
    thicknessMm: 16,
    dimensions: { widthMm: 500, heightMm: 200, thicknessMm: 16 },
    textureDirection: "horizontal",
  });
  const mdfFront = makePanel({
    id: "drawer-front-mdf",
    role: "drawer-front",
    materialRef: "mat-facade-mdf-18",
    materialKind: "mdf",
    thicknessMm: 18,
    dimensions: { widthMm: 500, heightMm: 200, thicknessMm: 18 },
    textureDirection: "horizontal",
  });

  assert.equal(getExpectedPanelMaterialPolicy(ldspFront).thicknessMm, 16);
  assert.equal(getExpectedPanelMaterialPolicy(mdfFront).thicknessMm, 18);
  assert.equal(validateMaterialPolicyV4(makePolicyModel([ldspFront, mdfFront])).ok, true);
});

test("drawer-bottom HDF 3 passes material policy", () => {
  const panel = makePanel({
    id: "drawer-bottom-1",
    role: "drawer-bottom",
    materialRef: "mat-hdf-white-3",
    materialKind: "hdf",
    thicknessMm: 3,
    dimensions: { widthMm: 400, heightMm: 500, thicknessMm: 3 },
    textureDirection: "none",
  });

  const result = validateMaterialPolicyV4(makePolicyModel([panel]));
  assert.equal(result.ok, true);
});

test("drawer-bottom LDSP fails material policy", () => {
  const panel = makePanel({
    id: "drawer-bottom-bad",
    role: "drawer-bottom",
    materialKind: "ldsp",
    thicknessMm: 16,
    dimensions: { widthMm: 400, heightMm: 500, thicknessMm: 16 },
    textureDirection: "none",
  });

  const result = validateMaterialPolicyV4(makePolicyModel([panel]));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "panel.hdf.invalid"));
});

test("applyMaterialPolicyDefaultsV4 does not mutate input", () => {
  const model = structuredClone(productionJsonV4Example);
  const panel = model.panels[0]!;
  (panel as { textureDirection?: string }).textureDirection = undefined;
  const before = structuredClone(model);

  const applied = applyMaterialPolicyDefaultsV4(model);

  assert.notEqual(applied.panels[0]?.textureDirection, undefined);
  assert.equal((before.panels[0] as { textureDirection?: string }).textureDirection, undefined);
  assert.deepEqual(model, before);
});

test("adapter output passes material policy validation", () => {
  const payload: OrderRequest = {
    orderId: "RZ-20260623-9001",
    productType: "wardrobe",
    dimensions: { width: 1800, height: 2400, depth: 600 },
    sections: 2,
    filling: { shelves: 3, drawers: 1, hangingRod: true },
    layout: { sections: [] },
    materials: {
      bodyId: "ldsp-body",
      facadeId: "mdf-facade",
      facadeKind: "mdf",
    },
    consent: {
      personalData: true,
      privacyVersion: "2026-05-24",
      acceptedAt: "2026-06-23T18:00:00.000Z",
    },
  };

  const v4 = buildProductionJsonV4FromV3(buildProductionExportFromPayload(payload));
  const result = validateMaterialPolicyV4(v4);
  assert.equal(result.ok, true, result.errors.map((error) => error.message).join("; "));
});
