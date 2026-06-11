import assert from "node:assert/strict";
import { useConstructorStore } from "./constructorStore";

useConstructorStore.getState().reset();
useConstructorStore.getState().setFurniture("wardrobe");
useConstructorStore.getState().setHeight(2400);
useConstructorStore.getState().selectSection("section-1");
useConstructorStore.getState().applyRandomPresetToSection("section-1");

const state = useConstructorStore.getState();
const zones = state.compartmentLayout["section-1"] ?? [];
assert.equal(zones.length, 3);
assert.equal(state.selectedSectionId, "section-1");
assert.equal(state.selectedCompartmentId, zones[0]?.id);
assert.equal(state.fillingLayout["section-1"]?.[zones[0].id]?.drawersCount, 2);
assert.equal(state.fillingLayout["section-1"]?.[zones[1].id]?.rodsCount, 1);
assert.equal(state.drawersCount >= 2, true);
assert.equal(state.rodsCount >= 1, true);

useConstructorStore.getState().setFurniture("dresser");
useConstructorStore.getState().applyRandomPresetToSection("section-1");
const dresser = useConstructorStore.getState();
const dresserZones = dresser.compartmentLayout["section-1"] ?? [];
assert.equal(dresserZones.length, 1);
assert.equal(dresser.fillingLayout["section-1"]?.[dresserZones[0].id]?.drawersCount, 4);
assert.equal(dresser.rodsCount, 0);

console.log("randomPreset.test passed");
