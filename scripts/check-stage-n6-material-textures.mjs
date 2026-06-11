import fs from 'node:fs';
import path from 'node:path';

const required = [
  ['src/static-pages/Constructor3DPage.tsx', 'data-stage="N6"'],
  ['src/static-pages/Constructor3DPage.tsx', 'getMaterialSwatchStyle'],
  ['src/static-pages/Constructor3DPage.tsx', 'rzm-3d-material-preview'],
  ['src/static-pages/Constructor3DPage.tsx', 'BackPanelMaterialPreview'],
  ['src/static-pages/Constructor3DPage.tsx', 'rzm-3d-material-tabs'],
  ['src/static-pages/constructor/three/threeMaterials.ts', 'TextureLoader'],
  ['src/static-pages/constructor/three/threeMaterials.ts', 'getTextureRepeatForMaterial'],
  ['src/styles/constructor3d.css', 'Stage N6'],
  ['src/styles/constructor3d.css', 'rzm-3d-material-preview'],
  ['src/styles/constructor3d.css', 'rzm-3d-material-swatch'],
];

const missing = required.filter(([file, marker]) => !fs.existsSync(file) || !fs.readFileSync(file, 'utf8').includes(marker));
if (missing.length) {
  console.error('Stage N6 check failed:');
  for (const [file, marker] of missing) console.error(`- ${file}: missing ${marker}`);
  process.exit(1);
}

const catalogText = fs.readFileSync('src/shared/materials/materialCatalog.ts', 'utf8');
const textureUrls = [...catalogText.matchAll(/textureUrl:\s*["']([^"']+)["']/g)].map((match) => match[1]);
const absentTextures = textureUrls.filter((url) => !fs.existsSync(path.join('public', url.replace(/^\//, ''))));
if (absentTextures.length) {
  console.error('Stage N6 texture files are missing:');
  for (const url of absentTextures) console.error(`- ${url}`);
  process.exit(1);
}

console.log(`Stage N6 material textures check passed (${textureUrls.length} texture files verified)`);
