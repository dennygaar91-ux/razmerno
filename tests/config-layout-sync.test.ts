import assert from "node:assert/strict";
import { configReducer, initialState } from "../src/configurator/context";

let state = configReducer(initialState, { type: "SET_TYPE", payload: "wardrobe" });
assert.equal(state.layout.sections.length, state.sections);
assert.deepEqual(state.filling, { shelves: 4, drawers: 0, hangingRod: true });

state = configReducer(state, { type: "SET_SECTIONS", payload: 3 });
assert.equal(state.layout.sections.length, 3);
assert.equal(state.sections, 3);

state = configReducer(state, {
  type: "SET_COMPARTMENT_DRAWERS",
  payload: {
    sectionId: state.layout.sections[0].id,
    compartmentId: state.layout.sections[0].compartments[0].id,
    drawers: 2,
  },
});
assert.equal(state.filling.drawers, 2);

state = configReducer(state, {
  type: "SET_COMPARTMENT_KIND",
  payload: {
    sectionId: state.layout.sections[1].id,
    compartmentId: state.layout.sections[1].compartments[0].id,
    kind: "rod",
  },
});
assert.equal(state.filling.hangingRod, true);

state = configReducer(state, {
  type: "SET_LAYOUT",
  payload: {
    sections: [
      {
        id: "section-1",
        widthMm: 900,
        compartments: [
          { id: "section-1-compartment-1", kind: "shelves", heightMm: 1200, shelves: 3, drawers: 0, hasRod: false },
          { id: "section-1-compartment-2", kind: "drawers", heightMm: 1200, shelves: 0, drawers: 4, hasRod: false },
        ],
      },
    ],
  },
});
assert.deepEqual(state.filling, { shelves: 3, drawers: 4, hangingRod: false });

console.log("Config layout sync test passed.");
