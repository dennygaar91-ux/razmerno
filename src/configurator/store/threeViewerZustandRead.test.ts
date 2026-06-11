import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("src/configurator/three/ThreeViewer.tsx", "utf8");

assert.ok(source.includes("useConfigStateSelector"), "ThreeViewer should read state via selector");
assert.ok(source.includes("useConfigValidationSelector"), "ThreeViewer should read validation via selector");
assert.ok(!source.includes("use" + "Config("), "ThreeViewer should not call legacy useConfig");
assert.ok(source.includes("useDeferredValue(state)"), "ThreeViewer should keep deferred state");
assert.ok(source.includes("fromConfigState(deferredState"), "ThreeViewer should keep geometry adapter");

console.log("ThreeViewer selector read test passed.");
