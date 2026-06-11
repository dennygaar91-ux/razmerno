import { readFileSync } from "node:fs";

const checks = [
  ["src/static-pages/Constructor3DPage.tsx", "data-stage=\"N3\"", "N3 stage marker"],
  ["src/static-pages/Constructor3DPage.tsx", "handleThreeTargetSelect", "3D selection handler"],
  ["src/static-pages/constructor/three/ThreeSelectionLayer.tsx", "rzm-3d-model-plus", "selected target plus button"],
  ["src/static-pages/constructor/three/ThreeSelectionLayer.tsx", "onSelectTarget", "click selection callback"],
  ["src/static-pages/constructor/three/threeTypes.ts", "ThreeInteractionTarget", "interaction target type"],
  ["src/static-pages/constructor/three/threeSceneAdapter.ts", "createInteractionTargets", "interaction target builder"],
  ["src/static-pages/constructor/three/ThreeFurnitureViewer.tsx", "ThreeSelectionLayer", "selection layer rendered in viewer"],
  ["src/styles/constructor3d.css", "Stage N3", "N3 CSS scope"],
];

let ok = true;
for (const [file, needle, label] of checks) {
  const content = readFileSync(file, "utf8");
  if (!content.includes(needle)) {
    console.error(`${file}: missing ${label}`);
    ok = false;
  }
}

if (!ok) process.exit(1);
console.log("Stage N3 3D selection guard passed");
