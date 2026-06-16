import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const exists = (file) => fs.existsSync(path.join(ROOT, file));

const failures = [];
const requireFile = (file) => {
  if (!exists(file)) failures.push(`Missing required file: ${file}`);
};
const requireIncludes = (name, content, fragment) => {
  if (!content.includes(fragment)) failures.push(`${name} missing fragment: ${fragment}`);
};
const forbidIncludes = (name, content, fragment) => {
  if (content.includes(fragment)) failures.push(`${name} contains forbidden fragment: ${fragment}`);
};

const specFile = "tests/browser/material-texture-parity.spec.ts";
const guardFile = "scripts/check-p1-13-material-texture-parity.mjs";
const packageFile = "package.json";
const workflowFile = ".github/workflows/qa.yml";
const materialsPanelFile = "src/static-pages/constructor/components/MaterialsStepPanel.tsx";
const threeViewerFile = "src/static-pages/constructor/three/ThreeFurnitureViewer.tsx";
const fallbackFile = "src/static-pages/constructor/components/SceneRuntimePanels.tsx";
const svgPreviewFile = "src/static-pages/constructor/components/ConstructorRealisticSvgModel.tsx";
const materialCatalogFile = "src/shared/materials/materialCatalog.ts";

[
  specFile,
  guardFile,
  packageFile,
  workflowFile,
  materialsPanelFile,
  threeViewerFile,
  fallbackFile,
  svgPreviewFile,
  materialCatalogFile,
].forEach(requireFile);

if (failures.length === 0) {
  const spec = read(specFile);
  const pkg = read(packageFile);
  const workflow = read(workflowFile);
  const materialsPanel = read(materialsPanelFile);
  const threeViewer = read(threeViewerFile);
  const fallback = read(fallbackFile);
  const svgPreview = read(svgPreviewFile);
  const catalog = read(materialCatalogFile);

  requireIncludes(specFile, spec, "/configurator-3d");
  requireIncludes(specFile, spec, "constructor-3d-preview");
  requireIncludes(specFile, spec, "webgl-fallback-preview");
  requireIncludes(specFile, spec, "material-swatch-");
  requireIncludes(specFile, spec, "data-rendered-material");
  requireIncludes(specFile, spec, "BODY_MATERIAL_A");
  requireIncludes(specFile, spec, "BODY_MATERIAL_B");
  requireIncludes(specFile, spec, "materials?.bodyId");

  const specWithoutActiveRoute = spec.replaceAll("/configurator-3d", "");
  forbidIncludes(specFile, specWithoutActiveRoute, "/configurator");
  forbidIncludes(specFile, spec, ".rzm-r19-workspace");
  forbidIncludes(specFile, spec, "payload.contact");
  forbidIncludes(specFile, spec, "deliveryEnabled");

  const materialIds = new Set(spec.match(/(?:ldsp|mdf)-egger-[a-z0-9-]+/g) ?? []);
  if (materialIds.size < 2) {
    failures.push(`${specFile} must check at least two distinct canonical material ids; found ${materialIds.size}`);
  }

  for (const materialId of materialIds) {
    requireIncludes(materialCatalogFile, catalog, materialId);
  }

  requireIncludes(materialsPanelFile, materialsPanel, "data-testid=\"materials-step-panel\"");
  requireIncludes(materialsPanelFile, materialsPanel, "data-testid={`material-picker-${variant}`}");
  requireIncludes(materialsPanelFile, materialsPanel, "data-testid={`material-swatch-${option.materialId}`}");
  requireIncludes(materialsPanelFile, materialsPanel, "data-selected-material");
  requireIncludes(materialsPanelFile, materialsPanel, "data-texture-id");

  requireIncludes(threeViewerFile, threeViewer, "data-testid=\"constructor-3d-preview\"");
  requireIncludes(threeViewerFile, threeViewer, "data-rendered-material={input.material}");
  requireIncludes(threeViewerFile, threeViewer, "data-rendered-facade-material={input.facadeMaterial}");
  requireIncludes(threeViewerFile, threeViewer, "data-material-id={input.material}");

  requireIncludes(fallbackFile, fallback, "data-testid=\"webgl-fallback-preview\"");
  requireIncludes(fallbackFile, fallback, "material={input.material as MaterialToken}");
  requireIncludes(fallbackFile, fallback, "facadeMaterial={input.facadeMaterial as MaterialToken}");
  requireIncludes(svgPreviewFile, svgPreview, "data-material={material}");
  requireIncludes(svgPreviewFile, svgPreview, "data-facade-material={facadeMaterial}");

  requireIncludes(packageFile, pkg, "\"check:material-texture-parity\"");
  requireIncludes(packageFile, pkg, "\"test:material-texture-parity\"");
  requireIncludes(packageFile, pkg, "check-p1-13-material-texture-parity.mjs");
  requireIncludes(packageFile, pkg, "tests/browser/material-texture-parity.spec.ts");
  requireIncludes(packageFile, pkg, "\"check:constructor-submit-e2e\"");
  requireIncludes(packageFile, pkg, "\"test:constructor-submit-e2e\"");
  requireIncludes(packageFile, pkg, "\"check:webgl-fallback-e2e\"");
  requireIncludes(packageFile, pkg, "\"test:webgl-fallback-e2e\"");

  requireIncludes(workflowFile, workflow, "P1-13 Material / Texture parity guard");
  requireIncludes(workflowFile, workflow, "P1-13 Material / Texture parity E2E");
  requireIncludes(workflowFile, workflow, "npm run check:material-texture-parity");
  requireIncludes(workflowFile, workflow, "npm run test:material-texture-parity");
}

if (failures.length > 0) {
  console.error("P1-13 Material / Texture parity guard failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("P1-13 Material / Texture parity guard passed.");
