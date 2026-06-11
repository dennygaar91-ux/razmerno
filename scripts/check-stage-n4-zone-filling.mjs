import fs from "node:fs";

const required = [
  ["src/static-pages/Constructor3DPage.tsx", "data-stage=\"N4\""],
  ["src/static-pages/Constructor3DPage.tsx", "rzm-3d-add-menu"],
  ["src/static-pages/Constructor3DPage.tsx", "onAddShelfToCompartment"],
  ["src/static-pages/constructor/rules/projectRules.ts", "splitCompartmentWithShelf"],
  ["src/static-pages/constructor/rules/projectRules.ts", "removeCompartmentShelfDivider"],
  ["src/static-pages/constructor/store/constructorStore.ts", "addShelfToCompartment"],
  ["src/static-pages/constructor/three/ThreeSelectionLayer.tsx", "onOpenAddMenu"],
  ["src/styles/constructor3d.css", "Stage N4"],
];

const missing = required.filter(([file, needle]) => !fs.readFileSync(file, "utf8").includes(needle));
if (missing.length) {
  console.error("Stage N4 guard failed:");
  for (const [file, needle] of missing) console.error(`- ${file}: ${needle}`);
  process.exit(1);
}
console.log("Stage N4 guard passed");
