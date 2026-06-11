import assert from "node:assert/strict";
import {
  createEvenCompartmentLayout,
  splitCompartmentWithShelf,
  removeCompartmentShelfDivider,
} from "./projectRules";
import type { ConstructorFillingLayout } from "../types";

const sectionId = "section-1";
const initial = createEvenCompartmentLayout(sectionId, 1, 2400);
const filling: ConstructorFillingLayout = {
  [sectionId]: {
    [initial[0].id]: { shelvesCount: 0, drawersCount: 1, rodsCount: 0 },
  },
};

const split = splitCompartmentWithShelf({
  heightMm: 2400,
  compartmentLayout: { [sectionId]: initial },
  fillingLayout: filling,
  sectionId,
  compartmentId: initial[0].id,
  shelfHeightFromZoneBottomMm: 900,
  furniture: "wardrobe",
});

assert.equal(split.compartmentLayout[sectionId].length, 2);
assert.equal(split.compartmentLayout[sectionId][0].heightMm, 900);
assert.equal(split.compartmentLayout[sectionId][1].heightMm, 1500);
assert.equal(split.fillingLayout[sectionId][split.compartmentLayout[sectionId][0].id].drawersCount, 1);
assert.equal(split.fillingLayout[sectionId][split.compartmentLayout[sectionId][1].id].drawersCount, 0);

const merged = removeCompartmentShelfDivider({
  heightMm: 2400,
  compartmentLayout: split.compartmentLayout,
  fillingLayout: split.fillingLayout,
  sectionId,
  lowerCompartmentId: split.compartmentLayout[sectionId][0].id,
  furniture: "wardrobe",
});

assert.equal(merged.compartmentLayout[sectionId].length, 1);
assert.equal(merged.compartmentLayout[sectionId][0].heightMm, 2400);
assert.equal(merged.fillingLayout[sectionId][merged.compartmentLayout[sectionId][0].id].drawersCount, 1);

console.log("zoneFilling.test passed");
