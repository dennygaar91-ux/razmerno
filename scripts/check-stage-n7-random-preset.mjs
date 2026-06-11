import { readFileSync } from "node:fs";

const page = readFileSync("src/static-pages/Constructor3DPage.tsx", "utf8");
const store = readFileSync("src/static-pages/constructor/store/constructorStore.ts", "utf8");
const css = readFileSync("src/styles/constructor3d.css", "utf8");

const required = [
  [page, 'data-stage="N7"', "Constructor3DPage uses N7 stage marker"],
  [page, "onClick={() => applyRandomPresetToSection(selectedSectionId)}", "scene random chip applies preset"],
  [page, "rzm-3d-random-drawer-action", "drawer random preset action exists"],
  [store, "applyRandomPresetToSection", "store exposes random preset action"],
  [store, 'nextFill = "combo"', "wardrobe preset switches fill to combo"],
  [css, "Stage N7 — random preset chip", "N7 CSS scope exists"],
];

const missing = required.filter(([source, needle]) => !source.includes(needle));
if (missing.length) {
  console.error("Stage N7 random preset check failed:");
  for (const [, , label] of missing) console.error(`- ${label}`);
  process.exit(1);
}

console.log("Stage N7 random preset check passed");
