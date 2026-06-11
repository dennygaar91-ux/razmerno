import { strict as assert } from "node:assert";
import { buildConstructorMaterialPricingContext } from "./materialPricing";

const exact = buildConstructorMaterialPricingContext({
  bodyMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
  facadeMaterialId: "ldsp-egger-h3734-oreh-dizhon-naturalnyy-st9",
});

assert.equal(exact.body.materialKind, "ldsp");
assert.equal(exact.body.thicknessMm, 16);
assert.equal(exact.body.producer, "Egger");
assert.equal(exact.body.article, "W960");
assert.equal(exact.body.source, "exact");
assert.equal(exact.facade.materialKind, "ldsp");
assert.equal(exact.facade.thicknessMm, 16);
assert.equal(exact.facade.article, "H3734");
assert.equal(exact.facade.source, "exact");

const mdf = buildConstructorMaterialPricingContext({
  bodyMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
  facadeMaterialId: "mdf-egger-r006-belyy-kremovyy-ms",
});

assert.equal(mdf.facade.materialKind, "mdf");
assert.equal(mdf.facade.thicknessMm, 18);
assert.equal(mdf.facade.producer, "Egger");
assert.equal(mdf.facade.article, undefined);
assert.equal(mdf.facade.source, "producer-thickness");
assert.ok(mdf.warnings.some((warning) => warning.includes("не найден точный прайс")));

assert.throws(
  () => buildConstructorMaterialPricingContext({
    bodyMaterialId: "hdf-kronospan-k101-belyy-fasadnyy" as never,
    facadeMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
  }),
  /Body pricing requires LDSP/,
);

console.log("materialPricing.test passed");
