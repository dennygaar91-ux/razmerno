import {
  bodyMaterials,
  facadeMaterials,
  hdfMaterials,
  ldspMaterials,
  mdfMaterials,
  materialCatalog,
  resolveMaterialId,
} from "./materialCatalog";
import { backPanelByBodyMaterial, getBackPanelMaterialForBody } from "./materialMapping";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function test(name: string, run: () => void) {
  try {
    run();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

test("materials: catalog contains uploaded LDSP, MDF and HDF decors", () => {
  assert(ldspMaterials.length === 7, "Expected 7 LDSP decors");
  assert(mdfMaterials.length === 6, "Expected 6 MDF decors");
  assert(hdfMaterials.length === 6, "Expected 6 HDF decors");
  assert(materialCatalog.length === 19, "Expected 19 total material records");
});

test("materials: thickness rules are fixed", () => {
  assert(ldspMaterials.every((material) => material.thicknessMm === 16), "LDSP thickness must be 16 mm");
  assert(mdfMaterials.every((material) => material.thicknessMm === 18), "MDF thickness must be 18 mm");
  assert(hdfMaterials.every((material) => material.thicknessMm === 3), "HDF thickness must be 3 mm");
});

test("materials: body is LDSP only and facades are LDSP or MDF", () => {
  assert(bodyMaterials.length === 7, "Body must use only 7 LDSP options");
  assert(bodyMaterials.every((material) => material.kind === "ldsp"), "Body options must be LDSP only");
  assert(facadeMaterials.length === 13, "Facades must include LDSP and MDF options");
  assert(facadeMaterials.every((material) => material.kind === "ldsp" || material.kind === "mdf"), "Facade options must be LDSP or MDF");
});

test("materials: each LDSP body material maps to automatic HDF back panel", () => {
  for (const material of ldspMaterials) {
    const backPanel = getBackPanelMaterialForBody(material.id);
    assert(backPanel.kind === "hdf", `${material.id} should map to HDF`);
    assert(backPanel.thicknessMm === 3, `${material.id} should map to 3 mm HDF`);
  }
});


test("materials: back panel mapping is keyed by LDSP body materials only", () => {
  const ldspIds = new Set(ldspMaterials.map((material) => material.id));
  for (const materialId of Object.keys(backPanelByBodyMaterial)) {
    assert(ldspIds.has(materialId as (typeof ldspMaterials)[number]["id"]), `${materialId} should not be used as body-to-HDF mapping key`);
  }
});

test("materials: legacy constructor tokens resolve to real material ids", () => {
  assert(resolveMaterialId("white") === "ldsp-egger-w960-belyy-klassicheskiy-sm", "white alias should resolve");
  assert(resolveMaterialId("graphite") === "ldsp-egger-u780-seryy-monumentalnyy-st9", "graphite alias should resolve");
});
