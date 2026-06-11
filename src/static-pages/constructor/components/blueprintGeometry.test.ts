import assert from "node:assert/strict";
import {
  getBlueprintActiveArea,
  getBlueprintCompartmentGeometry,
} from "./ConstructorRealisticSvgModel";

const compartments = [
  { id: "top", heightMm: 600 },
  { id: "middle", heightMm: 1200 },
  { id: "bottom", heightMm: 600 },
];

const geometry = getBlueprintCompartmentGeometry(compartments, 100, 240, 2400);

assert.equal(geometry.length, 3);
assert.equal(Math.round(geometry[0].h), 60);
assert.equal(Math.round(geometry[1].h), 120);
assert.equal(Math.round(geometry[2].h), 60);
assert.equal(Math.round(geometry[2].y + geometry[2].h), 340);

const active = getBlueprintActiveArea(geometry, "middle", 100, 240);
assert.equal(Math.round(active.y), 165);
assert.equal(Math.round(active.h), 110);

const wholeSection = getBlueprintActiveArea(geometry, null, 100, 240);
assert.equal(wholeSection.y, 105);
assert.equal(wholeSection.h, 230);

console.log("Blueprint geometry tests passed.");
