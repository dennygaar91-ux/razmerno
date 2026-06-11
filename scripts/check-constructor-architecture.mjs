import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "src/static-pages/ConstructorPage.tsx",
  "src/static-pages/constructor/hooks/useConstructorPageState.ts",
  "src/static-pages/constructor/components/ConstructorSidebar.tsx",
  "src/static-pages/constructor/components/ConstructorStepPanel.tsx",
  "src/static-pages/constructor/components/ConstructorDraftRow.tsx",
  "src/static-pages/constructor/components/ConstructorFlowActions.tsx",
  "src/static-pages/constructor/components/ConstructorScene.tsx",
  "src/static-pages/constructor/components/ConstructorSceneModel.tsx",
  "src/static-pages/constructor/components/ConstructorSceneFillPreview.tsx",
  "src/static-pages/constructor/components/ConstructorSceneValidationCard.tsx",
  "src/static-pages/constructor/components/ConstructorSceneProductionDebug.tsx",
];

const errors = [];

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function countLines(text) {
  return text.split(/\r?\n/).length;
}

for (const file of requiredFiles) {
  if (!exists(file)) errors.push(`Missing required constructor architecture file: ${file}`);
}

if (exists("src/static-pages/ConstructorPage.tsx")) {
  const text = read("src/static-pages/ConstructorPage.tsx");
  const requiredSnippets = [
    "useConstructorPageState",
    "<ConstructorSidebar",
    "<ConstructorScene",
    "useConstructorQuote",
    "useConstructorSubmit",
    "useProductionPreview",
  ];

  for (const snippet of requiredSnippets) {
    if (!text.includes(snippet)) errors.push(`ConstructorPage.tsx missing ${snippet}`);
  }

  const forbiddenSnippets = [
    "<SizesStep",
    "<FillStep",
    "<MaterialsStep",
    "<CheckoutStep",
    "<FurnitureTypeSwitch",
    "<ConstructorStepper",
  ];

  for (const snippet of forbiddenSnippets) {
    if (text.includes(snippet)) errors.push(`ConstructorPage.tsx should not render ${snippet} directly`);
  }

  if (countLines(text) > 220) {
    errors.push(`ConstructorPage.tsx should stay below 220 lines, got ${countLines(text)}`);
  }
}

if (exists("src/static-pages/constructor/components/ConstructorSidebar.tsx")) {
  const text = read("src/static-pages/constructor/components/ConstructorSidebar.tsx");
  const requiredSnippets = [
    "<ConstructorStepPanel",
    "<ConstructorDraftRow",
    "<ConstructorFlowActions",
    "<FurnitureTypeSwitch",
    "<ConstructorStepper",
  ];

  for (const snippet of requiredSnippets) {
    if (!text.includes(snippet)) errors.push(`ConstructorSidebar.tsx missing ${snippet}`);
  }

  const forbiddenSnippets = [
    "<SizesStep",
    "<FillStep",
    "<MaterialsStep",
    "<CheckoutStep",
  ];

  for (const snippet of forbiddenSnippets) {
    if (text.includes(snippet)) errors.push(`ConstructorSidebar.tsx should not render ${snippet} directly`);
  }

  if (countLines(text) > 210) {
    errors.push(`ConstructorSidebar.tsx should stay below 210 lines, got ${countLines(text)}`);
  }
}

if (exists("src/static-pages/constructor/components/ConstructorStepPanel.tsx")) {
  const text = read("src/static-pages/constructor/components/ConstructorStepPanel.tsx");
  const requiredSnippets = ["<SizesStep", "<FillStep", "<MaterialsStep", "<CheckoutStep"];
  for (const snippet of requiredSnippets) {
    if (!text.includes(snippet)) errors.push(`ConstructorStepPanel.tsx missing ${snippet}`);
  }
}

if (exists("src/static-pages/constructor/components/ConstructorScene.tsx")) {
  const text = read("src/static-pages/constructor/components/ConstructorScene.tsx");
  const requiredSnippets = [
    "<FillPreview",
    "<ClientValidationCard",
    "<ProductionDebugPreview",
    "getModelMetrics",
    "getProportionLabel",
  ];

  for (const snippet of requiredSnippets) {
    if (!text.includes(snippet)) errors.push(`ConstructorScene.tsx missing ${snippet}`);
  }

  const forbiddenSnippets = [
    "function FillPreview",
    "function formatPreviewStatus",
    "function getModelMetrics",
    "function getProportionLabel",
    "type ModelMetrics",
  ];

  for (const snippet of forbiddenSnippets) {
    if (text.includes(snippet)) errors.push(`ConstructorScene.tsx should not define ${snippet} directly`);
  }

  if (countLines(text) > 150) {
    errors.push(`ConstructorScene.tsx should stay below 150 lines, got ${countLines(text)}`);
  }
}

if (exists("src/static-pages/constructor/components/ConstructorSceneModel.tsx")) {
  const text = read("src/static-pages/constructor/components/ConstructorSceneModel.tsx");
  const requiredSnippets = ["getModelMetrics", "getModelSections", "getShelfLines", "getFillLabel"];
  for (const snippet of requiredSnippets) {
    if (!text.includes(snippet)) errors.push(`ConstructorSceneModel.tsx missing ${snippet}`);
  }
}

if (errors.length) {
  console.error("Constructor architecture check failed:");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log("✓ constructor architecture is decomposed and guarded");
