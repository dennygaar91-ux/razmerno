import { strict as assert } from "node:assert";
import { buildConstructorMaterialPricingContext } from "./materialPricing";
import { buildPricingTransparencyNotice } from "./materialPricingTransparency";

const exact = buildPricingTransparencyNotice(buildConstructorMaterialPricingContext({
  bodyMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
  facadeMaterialId: "ldsp-egger-h3734-oreh-dizhon-naturalnyy-st9",
}));

assert.equal(exact.level, "exact");
assert.match(exact.clientMessage, /выбранным декорам/);
assert.match(exact.debugLabel, /exact/);
assert.match(exact.bodySource, /точный артикул/);
assert.match(exact.facadeSource, /H3734/);

const fallback = buildPricingTransparencyNotice(buildConstructorMaterialPricingContext({
  bodyMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
  facadeMaterialId: "mdf-egger-r006-belyy-kremovyy-ms",
}));

assert.equal(fallback.level, "fallback");
assert.match(fallback.clientLabel, /проверки/);
assert.match(fallback.clientMessage, /ближайшей группе/);
assert.match(fallback.facadeSource, /производитель \+ толщина/);
assert.ok(fallback.warnings.length > 0);

const unknown = buildPricingTransparencyNotice(null);
assert.equal(unknown.level, "unknown");
assert.match(unknown.clientLabel, /рассчитывается/);

console.log("materialPricingTransparency.test passed");
