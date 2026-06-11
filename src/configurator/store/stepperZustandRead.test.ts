import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("src/configurator/HorizontalStepper.tsx", "utf8");

assert.ok(source.includes("useConfigBridge"), "HorizontalStepper should use useConfigBridge");
assert.ok(!source.includes("use" + "Config("), "HorizontalStepper should not call legacy useConfig");
assert.ok(source.includes("actions.") || source.includes("actions =") || source.includes("actions,"), "HorizontalStepper should use typed actions or bridge actions");

console.log("HorizontalStepper bridge read migration test passed.");
