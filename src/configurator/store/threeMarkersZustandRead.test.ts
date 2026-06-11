import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("src/configurator/three/ThreeLayoutMarkers.tsx", "utf8");

assert.ok(source.includes("useConfigBridge"), "ThreeLayoutMarkers should use useConfigBridge");
assert.ok(!source.includes("use" + "Config("), "ThreeLayoutMarkers should not call legacy useConfig");
assert.ok(source.includes("actions.") || source.includes("actions =") || source.includes("actions,"), "ThreeLayoutMarkers should use typed actions or bridge actions");

console.log("ThreeLayoutMarkers bridge read migration test passed.");
