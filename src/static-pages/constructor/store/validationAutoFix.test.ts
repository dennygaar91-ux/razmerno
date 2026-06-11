import assert from "node:assert/strict";
import { useConstructorStore } from "./constructorStore";

function resetStore() {
  useConstructorStore.getState().reset();
}

resetStore();
const store = useConstructorStore.getState();
store.selectSection("section-1");
store.selectCompartment("section-1", "section-1-compartment-1");
store.addShelfToCompartment("section-1", "section-1-compartment-1", 320);
useConstructorStore.getState().setCompartmentFilling("section-1", "section-1-compartment-1", { drawersCount: 5 });
const drawerIssue = useConstructorStore.getState().validation.issues.find((issue) => issue.id.includes("drawers-height"));
assert.ok(drawerIssue, "expected drawer height validation issue");
useConstructorStore.getState().applyAutoFixForIssue(drawerIssue.id);
const fixedState = useConstructorStore.getState();
assert.equal(fixedState.validation.issues.some((issue) => issue.id === drawerIssue.id), false, "drawer auto-fix should remove issue");

resetStore();
useConstructorStore.getState().setSections(1);
useConstructorStore.getState().setSectionFacadeMode("section-1", "hinged");
const facadeIssue = useConstructorStore.getState().validation.issues.find((issue) => issue.id.includes("wide-hinged"));
assert.ok(facadeIssue, "expected wide facade warning");
useConstructorStore.getState().applyAutoFixForIssue(facadeIssue.id);
assert.equal(useConstructorStore.getState().facadeLayout["section-1"], "open", "facade warning auto-fix should open section");

resetStore();
useConstructorStore.getState().selectSection("section-1");
useConstructorStore.getState().selectCompartment("section-1", "section-1-compartment-1");
useConstructorStore.getState().setCompartmentFilling("section-1", "section-1-compartment-1", { rodsCount: 1 });
useConstructorStore.getState().addShelfToCompartment("section-1", "section-1-compartment-1", 500);
const rodIssue = useConstructorStore.getState().validation.issues.find((issue) => issue.id.includes("rod-height"));
assert.ok(rodIssue, "expected rod height issue after splitting zone");
useConstructorStore.getState().applyAutoFixForIssue(rodIssue.id);
assert.equal(useConstructorStore.getState().validation.issues.some((issue) => issue.id === rodIssue.id), false, "rod auto-fix should remove rod issue");

console.log("validation auto-fix smoke passed");
