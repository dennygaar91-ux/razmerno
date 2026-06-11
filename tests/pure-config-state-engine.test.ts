import assert from "node:assert/strict";
import { initialConfigState } from "../src/configurator/state/initialConfigState";
import { configReducer } from "../src/configurator/state/configReducer";

const state = configReducer(initialConfigState, { type: "SET_DIM", payload: { dim: "width", value: 1900 } });

assert.equal(state.width, 1900);
assert.equal(state.height, initialConfigState.height);
assert.equal(state.depth, initialConfigState.depth);

const reset = configReducer(state, { type: "RESET" });
assert.equal(reset.width, initialConfigState.width);
assert.equal(reset.sections, initialConfigState.sections);

console.log("Pure config state engine test passed.");
