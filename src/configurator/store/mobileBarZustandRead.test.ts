import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("src/configurator/MobileBottomBar.tsx", "utf8");

assert.ok(source.includes("useConfigBridge"), "MobileBottomBar should use useConfigBridge");
assert.ok(!source.includes("use" + "Config("), "MobileBottomBar should not call legacy useConfig");
assert.ok(source.includes("actions.") || source.includes("actions =") || source.includes("actions,"), "MobileBottomBar should use typed actions or bridge actions");

console.log("MobileBottomBar bridge read migration test passed.");
