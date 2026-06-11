import { readFileSync } from "node:fs";
function read(path) { return readFileSync(path, "utf8"); }
function assert(condition, message) { if (!condition) throw new Error(message); }

const page = read("src/static-pages/Constructor3DPage.tsx");
const types = read("src/static-pages/constructor/three/threeTypes.ts");
const viewer = read("src/static-pages/constructor/three/ThreeFurnitureViewer.tsx");
const model = read("src/static-pages/constructor/three/ThreeFurnitureModel.tsx");
const panels = read("src/static-pages/constructor/three/ThreeFurniturePanels.tsx");
const adapter = read("src/static-pages/constructor/three/threeSceneAdapter.ts");
const camera = read("src/static-pages/constructor/three/threeCamera.ts");
const css = read("src/styles/constructor3d.css");
const pkg = read("package.json");

assert(page.includes('data-scene-stage="STAGE12"'), "Active constructor must expose Stage 12 scene marker");
assert(page.includes('sceneMode: step'), "Three input must pass step-specific sceneMode");
assert(types.includes('ThreeSceneProductMode') && types.includes('sceneMode?: ThreeSceneProductMode'), "Three types must support product scene modes");
assert(viewer.includes('data-scene-mode={sceneMode}') && viewer.includes('<spotLight'), "Viewer must expose scene mode and upgraded studio lighting");
assert(camera.includes('sceneMode') && camera.includes('materials') && camera.includes('checkout'), "Camera must adapt to scene modes");
assert(model.includes('sceneMode?: ThreeSceneProductMode') && model.includes('sceneMode === "materials"'), "Model must adapt floor/composition to scene mode");
assert(panels.includes('sceneMode?: ThreeSceneProductMode') && panels.includes('isSceneHardwareFocus'), "Panels must receive scene mode and focus hardware in final scene");
assert(adapter.includes('facadeGhost') && adapter.includes('hardwareLight') && adapter.includes('sceneMode === "fill"'), "Adapter must ghost facades in filling mode and use dedicated hardware material");
assert(css.includes('Stage 12') && css.includes('rzm-three-viewer--materials'), "Stage 12 CSS must style commercial scene modes");
assert(pkg.includes('check:stage12-3d-scene-visuals'), "Stage 12 guard script must be registered");
console.log('Stage 12 3D scene visuals guard passed');
