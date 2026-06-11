import { readFileSync, existsSync } from "node:fs";

function read(path) { return readFileSync(path, "utf8"); }
function assert(condition, message) { if (!condition) throw new Error(message); }

const page = read("src/static-pages/Constructor3DPage.tsx");
const css = read("src/styles/constructor3d.css");
const visuals = read("src/shared/materials/materialVisuals.ts");
const catalog = read("src/shared/materials/materialCatalog.ts");
const materials = read("src/static-pages/constructor/three/threeMaterials.ts");
const pkg = read("package.json");

assert(page.includes('data-material-stage="STAGE11"'), "Active constructor must expose Stage 11 material marker");
assert(page.includes('data-material-zoom="STAGE11"'), "Material zoom-preview must be present");
assert(page.includes('rzm-3d-material-zoom-apply'), "Material zoom-preview must include explicit apply action");
assert(css.includes('Stage 11') && css.includes('rzm-3d-material-zoom-preview'), "Stage 11 CSS must style zoom-preview");
assert(visuals.includes('getMaterialVisualMapping') && visuals.includes('textureUrl') && visuals.includes('getMvpMaterialVisualMappings'), "Real material visual mapping helper must exist");
assert(catalog.includes('/decors/ldsp/') && catalog.includes('/decors/mdf/') && catalog.includes('/decors/hdf/'), "Material catalog must use real texture URLs");
assert(materials.includes('TextureLoader') && materials.includes('getTextureRepeatForMaterial'), "Three materials must load real texture maps");
assert(!materials.includes('Math.random'), "Production 3D material path must not use procedural random textures");
assert(pkg.includes('test:material-visuals'), "Material visual test script must be registered");

const requiredTextures = [
  "public/decors/ldsp/egger-w960-belyy-klassicheskiy-sm.png",
  "public/decors/ldsp/egger-h1910-buk-lugovoy-st9.png",
  "public/decors/ldsp/egger-h3395-dub-korbridzh-naturalnyy-st12.png",
  "public/decors/ldsp/egger-u708-svetlo-seryy-st9.png",
  "public/decors/ldsp/egger-u780-seryy-monumentalnyy-st9.png",
  "public/decors/ldsp/egger-u961-chernyy-grafit-st7.png",
  "public/decors/mdf/egger-r010-seryy-grafitovyy-ms.png",
];
for (const texture of requiredTextures) assert(existsSync(texture), `Missing real texture asset: ${texture}`);

console.log('Stage 11 materials/textures guard passed');
