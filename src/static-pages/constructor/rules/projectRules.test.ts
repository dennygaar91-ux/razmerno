import { getBackPanelMaterialForBody } from "../../../shared/materials/materialMapping";
import {
  buildProjectMaterials,
  CONSTRUCTOR_SECTION_RULES,
  createEvenSectionLayout,
  getFurnitureDefaults,
  createEvenCompartmentLayout,
  setCompartmentHeightInLayout,
  setSectionWidthInLayout,
  validateConstructorProject,
} from "./projectRules";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function test(name: string, run: () => void) {
  try {
    run();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

test("project rules: furniture defaults are typed for wardrobe, nightstand and dresser", () => {
  assert(
    getFurnitureDefaults("wardrobe").height === 2400,
    "Expected wardrobe default height",
  );
  assert(
    getFurnitureDefaults("nightstand").height === 600,
    "Expected nightstand default height",
  );
  assert(
    getFurnitureDefaults("dresser").drawersCount === 3,
    "Expected dresser drawer default",
  );
});

test("project rules: body/facade/back-panel materials are normalized centrally", () => {
  const materials = buildProjectMaterials({
    bodyMaterialId: "mdf-egger-r010-seryy-grafitovyy-ms",
    facadeMaterialId: "mdf-egger-r010-seryy-grafitovyy-ms",
  });

  assert(
    materials.bodyMaterialId.startsWith("ldsp-"),
    "Body must normalize to LDSP",
  );
  assert(
    materials.facadeMaterialId === "mdf-egger-r010-seryy-grafitovyy-ms",
    "Facade can stay MDF",
  );
  assert(materials.facadeMaterialKind === "mdf", "Facade kind should be MDF");
  assert(
    materials.backPanelMaterialId.startsWith("hdf-"),
    "Back panel must normalize to HDF",
  );
});

test("project rules: HDF is selected automatically from body LDSP", () => {
  const materials = buildProjectMaterials({
    bodyMaterialId: "ldsp-egger-u961-chernyy-grafit-st7",
    facadeMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
  });
  const expected = getBackPanelMaterialForBody(
    "ldsp-egger-u961-chernyy-grafit-st7",
  );

  assert(
    materials.backPanelMaterialId === expected.id,
    "Back panel material should follow body material mapping",
  );
});

test("project rules: validation separates production blocking errors", () => {
  const materials = buildProjectMaterials({
    bodyMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
    facadeMaterialId: "mdf-egger-r006-belyy-kremovyy-ms",
  });

  const validation = validateConstructorProject({
    furniture: "wardrobe",
    width: 300,
    height: 2400,
    depth: 600,
    sections: 2,
    compartments: 1,
    fill: "shelves",
    rodsCount: 0,
    material: materials.bodyMaterialId,
    facadeMaterial: materials.facadeMaterialId,
    projectMaterials: materials,
  });

  assert(
    validation.status === "error",
    "Expected an error status for invalid width and section width",
  );
  assert(
    validation.issues.some((issue) => issue.blocksCheckout),
    "Blocking errors should block checkout",
  );
  assert(
    validation.stepStatuses.sizes === "error",
    "Sizes step should be marked as error",
  );
});

test("project rules: rod is blocked for nightstand and dresser", () => {
  const materials = buildProjectMaterials({
    bodyMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
    facadeMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
  });

  const validation = validateConstructorProject({
    furniture: "dresser",
    width: 900,
    height: 900,
    depth: 450,
    sections: 1,
    compartments: 1,
    fill: "rod",
    rodsCount: 1,
    material: materials.bodyMaterialId,
    facadeMaterial: materials.facadeMaterialId,
    projectMaterials: materials,
  });

  assert(validation.status === "error", "Expected rod error for dresser");
  assert(
    validation.issues.some((issue) => issue.id === "rod-only-wardrobe"),
    "Expected rod-only-wardrobe issue",
  );
});

test("project rules: manual section width keeps total width and minimums", () => {
  const layout = createEvenSectionLayout(3, 1800);
  const edited = setSectionWidthInLayout({
    widthMm: 1800,
    sectionLayout: layout,
    sectionId: "section-1",
    nextWidthMm: 850,
  });
  const total = edited.reduce((sum, section) => sum + section.widthMm, 0);

  assert(total === 1800, "manual section layout should preserve total width");
  assert(
    edited[0].widthMm === 850,
    "target section should receive requested width",
  );
  assert(
    edited.every(
      (section) => section.widthMm >= CONSTRUCTOR_SECTION_RULES.minWidthMm,
    ),
    "all sections should respect minimum width",
  );
});


test("project rules: manual compartment height keeps total height and minimums", () => {
  const sectionId = "section-1";
  const layout = {
    [sectionId]: createEvenCompartmentLayout(sectionId, 3, 2400),
  };
  const edited = setCompartmentHeightInLayout({
    heightMm: 2400,
    compartmentLayout: layout,
    sectionId,
    compartmentId: "section-1-compartment-1",
    nextHeightMm: 1100,
  });
  const compartments = edited[sectionId] ?? [];
  const total = compartments.reduce(
    (sum, compartment) => sum + compartment.heightMm,
    0,
  );

  assert(total === 2400, "manual compartment layout should preserve total height");
  assert(
    compartments[0].heightMm === 1100,
    "target compartment should receive requested height",
  );
  assert(
    compartments.every((compartment) => compartment.heightMm >= 300),
    "all compartments should respect minimum height",
  );
});

test("project rules: shelves validate minimum shelf gap per compartment", () => {
  const sectionLayout = createEvenSectionLayout(1, 900);
  const compartmentLayout = {
    "section-1": createEvenCompartmentLayout("section-1", 1, 500),
  };
  const materials = buildProjectMaterials({
    bodyMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
    facadeMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
  });

  const validation = validateConstructorProject({
    furniture: "wardrobe",
    width: 900,
    height: 500,
    depth: 600,
    sections: 1,
    sectionLayout,
    compartments: 1,
    compartmentLayout,
    fillingLayout: {
      "section-1": {
        "section-1-compartment-1": { shelvesCount: 1, drawersCount: 0, rodsCount: 0 },
      },
    },
    fill: "shelves",
    rodsCount: 0,
    material: materials.bodyMaterialId,
    facadeMaterial: materials.facadeMaterialId,
    projectMaterials: materials,
  });

  assert(
    validation.issues.some((issue) => issue.id === "section-1-compartment-1-shelves-gap"),
    "Expected shelf gap issue for short compartment",
  );
});

test("project rules: drawers validate minimum front height per compartment", () => {
  const sectionLayout = createEvenSectionLayout(1, 900);
  const compartmentLayout = {
    "section-1": createEvenCompartmentLayout("section-1", 1, 500),
  };
  const materials = buildProjectMaterials({
    bodyMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
    facadeMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
  });

  const validation = validateConstructorProject({
    furniture: "dresser",
    width: 900,
    height: 500,
    depth: 450,
    sections: 1,
    sectionLayout,
    compartments: 1,
    compartmentLayout,
    fillingLayout: {
      "section-1": {
        "section-1-compartment-1": { shelvesCount: 0, drawersCount: 3, rodsCount: 0 },
      },
    },
    fill: "drawers",
    rodsCount: 0,
    material: materials.bodyMaterialId,
    facadeMaterial: materials.facadeMaterialId,
    projectMaterials: materials,
  });

  assert(
    validation.issues.some((issue) => issue.id === "section-1-compartment-1-drawers-height"),
    "Expected drawer front height issue for short compartment",
  );
});

test("project rules: rod validates recommended compartment height", () => {
  const sectionLayout = createEvenSectionLayout(1, 900);
  const compartmentLayout = {
    "section-1": createEvenCompartmentLayout("section-1", 1, 900),
  };
  const materials = buildProjectMaterials({
    bodyMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
    facadeMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
  });

  const validation = validateConstructorProject({
    furniture: "wardrobe",
    width: 900,
    height: 900,
    depth: 600,
    sections: 1,
    sectionLayout,
    compartments: 1,
    compartmentLayout,
    fillingLayout: {
      "section-1": {
        "section-1-compartment-1": { shelvesCount: 0, drawersCount: 0, rodsCount: 1 },
      },
    },
    fill: "rod",
    rodsCount: 1,
    material: materials.bodyMaterialId,
    facadeMaterial: materials.facadeMaterialId,
    projectMaterials: materials,
  });

  assert(
    validation.issues.some((issue) => issue.id === "section-1-compartment-1-rod-height"),
    "Expected rod height issue for short compartment",
  );
});

test("project rules: facade layout normalizes per section and warns on very wide hinged section", () => {
  const sectionLayout = createEvenSectionLayout(2, 2200);
  const materials = buildProjectMaterials({
    bodyMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
    facadeMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
  });

  const validation = validateConstructorProject({
    furniture: "wardrobe",
    width: 2200,
    height: 2400,
    depth: 600,
    sections: 2,
    sectionLayout,
    facadeLayout: {
      "section-1": "hinged",
      "section-2": "open",
    },
    compartments: 1,
    fill: "shelves",
    rodsCount: 0,
    material: materials.bodyMaterialId,
    facadeMaterial: materials.facadeMaterialId,
    projectMaterials: materials,
  });

  assert(
    validation.issues.some((issue) => issue.id === "facade-section-1-wide-hinged"),
    "Expected wide hinged facade warning for section 1",
  );
  assert(
    !validation.issues.some((issue) => issue.id === "facade-section-2-wide-hinged"),
    "Open section should not receive hinged facade warning",
  );
});
