import assert from "node:assert/strict";
import { getProjectMaterialLayers, getTextureRepeatForMaterial } from "./materialPresentation";

const layers = getProjectMaterialLayers({
  bodyMaterialId: "ldsp-egger-h3395-dub-korbridzh-naturalnyy-st12",
  facadeMaterialId: "mdf-egger-r010-seryy-grafitovyy-ms",
});

assert.equal(layers.length, 3);
assert.equal(layers[0]?.key, "body");
assert.equal(layers[0]?.material.kind, "ldsp");
assert.equal(layers[0]?.thicknessLabel, "LDSP 16 мм");
assert.equal(layers[1]?.key, "facade");
assert.equal(layers[1]?.material.kind, "mdf");
assert.equal(layers[1]?.thicknessLabel, "MDF 18 мм");
assert.equal(layers[2]?.key, "backPanel");
assert.equal(layers[2]?.material.kind, "hdf");
assert.equal(layers[2]?.material.id, "hdf-kronospan-k535-dub-barokko-zolotoy");
assert.equal(layers[2]?.thicknessLabel, "HDF 3 мм");

const woodRepeat = getTextureRepeatForMaterial(layers[0]!.material);
const hdfRepeat = getTextureRepeatForMaterial(layers[2]!.material);
assert.ok(woodRepeat[1] > woodRepeat[0]);
assert.deepEqual(hdfRepeat, [2.2, 2.2]);

console.log("materialPresentation tests passed");
