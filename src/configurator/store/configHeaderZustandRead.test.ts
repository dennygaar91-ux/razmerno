import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("src/configurator/ConfigHeader.tsx", "utf8");

assert.ok(source.includes("useConfigBridge"), "ConfigHeader should use useConfigBridge");
assert.ok(!source.includes("use" + "Config("), "ConfigHeader should not call legacy useConfig");
assert.ok(source.includes("actions.") || source.includes("actions =") || source.includes("actions,"), "ConfigHeader should use typed actions or bridge actions");

console.log("ConfigHeader bridge read migration test passed.");
