import assert from "node:assert/strict";

import { DEFAULT_FACTORY_PROFILE } from "../src/constructor/production/factoryProfile";
import { buildProductionExportFromPayload } from "../src/constructor/production/orderExportPackage";
import { materialCatalog } from "../src/shared/materials/materialCatalog";
import { makeValidOrder } from "./fixtures/order-contract-fixture";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const MVP_HDF_THICKNESS_MM = 3;

function makeDrawerPayload() {
  return makeValidOrder({
    productType: "dresser",
    dimensions: { width: 1200, height: 900, depth: 450 },
    sections: 2,
    filling: { shelves: 0, drawers: 4, hangingRod: false },
    layout: {
      sections: [
        {
          id: "section-1",
          widthMm: 600,
          compartments: [
            {
              id: "section-1-compartment-1",
              kind: "drawers",
              heightMm: 900,
              shelves: 0,
              drawers: 2,
              hasRod: false,
            },
          ],
        },
        {
          id: "section-2",
          widthMm: 600,
          compartments: [
            {
              id: "section-2-compartment-1",
              kind: "drawers",
              heightMm: 900,
              shelves: 0,
              drawers: 2,
              hasRod: false,
            },
          ],
        },
      ],
    },
    consent: {
      personalData: true,
      privacyVersion: "2026-05-24",
      acceptedAt: "2026-06-23T18:00:00.000Z",
    },
  });
}

test("P1-23 factory profile locks HDF back panel to 3 mm for MVP", () => {
  assert.equal(DEFAULT_FACTORY_PROFILE.materials.backPanel.thicknessMm, MVP_HDF_THICKNESS_MM);
  assert.equal(DEFAULT_FACTORY_PROFILE.materials.backPanel.material, "hdf");
});

test("P1-23 production export project and panels use 3 mm HDF for back panel and drawer bottom", () => {
  const exportPack = buildProductionExportFromPayload(makeDrawerPayload());

  assert.equal(exportPack.project.material.backPanelThicknessMm, MVP_HDF_THICKNESS_MM);

  const hdfPanels = exportPack.productionModel.panels.filter((panel) => panel.materialType === "hdf");
  assert.ok(hdfPanels.length > 0, "expected HDF panels in export");

  for (const panel of hdfPanels) {
    assert.equal(
      panel.thicknessMm,
      MVP_HDF_THICKNESS_MM,
      `HDF panel ${panel.role} must be ${MVP_HDF_THICKNESS_MM} mm`,
    );
  }

  const backPanel = exportPack.productionModel.panels.find((panel) => panel.role === "back-panel");
  const drawerBottom = exportPack.productionModel.panels.find((panel) => panel.role === "drawer-bottom");
  assert.ok(backPanel, "expected back-panel");
  assert.ok(drawerBottom, "expected drawer-bottom with drawers enabled");
  assert.equal(backPanel.thicknessMm, MVP_HDF_THICKNESS_MM);
  assert.equal(drawerBottom.thicknessMm, MVP_HDF_THICKNESS_MM);
});

test("P1-23 material catalog HDF entries are 3 mm only", () => {
  const hdfMaterials = materialCatalog.filter((material) => material.kind === "hdf");
  assert.ok(hdfMaterials.length > 0, "expected HDF materials in catalog");
  assert.ok(
    hdfMaterials.every((material) => material.thicknessMm === MVP_HDF_THICKNESS_MM),
    "all catalog HDF materials must be 3 mm for MVP",
  );
});

test("P1-23 export does not emit 4 mm HDF panels", () => {
  const exportPack = buildProductionExportFromPayload(makeDrawerPayload());
  const invalidHdf = exportPack.productionModel.panels.filter(
    (panel) => panel.materialType === "hdf" && panel.thicknessMm !== MVP_HDF_THICKNESS_MM,
  );
  assert.deepEqual(invalidHdf, []);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
