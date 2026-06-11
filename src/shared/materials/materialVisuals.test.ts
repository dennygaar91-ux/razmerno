import assert from "node:assert/strict";
import { getMaterialVisualMapping, getMvpMaterialVisualMappings } from "./materialVisuals";

const mappings = getMvpMaterialVisualMappings();
assert.equal(mappings.body.length, 7, "MVP body materials must expose 7 real texture mappings");
assert.ok(mappings.body.every((material) => material.textureUrl.startsWith("/decors/ldsp/")), "Body mappings must use real LDSP texture URLs");
assert.ok(mappings.facade.some((material) => material.kind === "mdf"), "Facade mappings must include MDF textures");

const white = getMaterialVisualMapping("white");
assert.equal(white.id, "ldsp-egger-w960-belyy-klassicheskiy-sm");
assert.ok(white.swatchStyle.includes("/decors/ldsp/egger-w960-belyy-klassicheskiy-sm.png"));
assert.ok(white.repeat[0] > 0 && white.repeat[1] > 0);

console.log("materialVisuals tests passed");
