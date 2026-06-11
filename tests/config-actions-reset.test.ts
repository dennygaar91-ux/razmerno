import assert from "node:assert/strict";
import { createConfigActions } from "../src/configurator/store/configActions";

const calls: unknown[] = [];
const actions = createConfigActions((action) => calls.push(action));
actions.reset();

assert.deepEqual(calls[0], { type: "RESET" });

console.log("Config actions reset test passed.");
