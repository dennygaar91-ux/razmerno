import assert from "node:assert/strict";
import { createConfigActions } from "../src/configurator/store/configActions";

const calls: unknown[] = [];
const actions = createConfigActions((action) => calls.push(action));

const expected = [
  "setType",
  "setDimension",
  "setSections",
  "setFilling",
  "applyFillingPreset",
  "setLayout",
  "setCompartmentKind",
  "setCompartmentShelves",
  "setCompartmentDrawers",
  "addSectionByWidth",
  "addCompartmentByHeight",
  "setBodyMaterial",
  "setFacadeMaterial",
  "setFacadeMaterialKind",
  "setFacadeStyle",
  "setHardware",
  "setAdvancedLayout",
  "setSelectedCompartment",
  "setHighlight",
  "setStep",
  "openCheckout",
  "closeCheckout",
  "clearOrderStatus",
];

for (const key of expected) {
  assert.equal(typeof (actions as Record<string, unknown>)[key], "function", `${key} action is missing`);
}

actions.setDimension("width", 1800);
actions.setFacadeMaterialKind("mdf");
actions.addSectionByWidth();

assert.deepEqual(calls[0], { type: "SET_DIM", payload: { dim: "width", value: 1800 } });
assert.deepEqual(calls[1], { type: "SET_FACADE_MATERIAL_KIND", payload: "mdf" });
assert.deepEqual(calls[2], { type: "ADD_SECTION_BY_WIDTH" });

console.log("Config actions coverage test passed.");
