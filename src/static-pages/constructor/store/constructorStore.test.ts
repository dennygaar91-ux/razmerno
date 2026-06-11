import {
  constructorInitialState,
  useConstructorStore,
} from "./constructorStore";

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

useConstructorStore.getState().reset();

test("constructor store: dimensions are clamped", () => {
  useConstructorStore.getState().setWidth(-100);
  useConstructorStore.getState().setHeight(-50);
  useConstructorStore.getState().setDepth(-10);
  const state = useConstructorStore.getState();
  assert(state.width === 0, "width should be clamped to 0");
  assert(state.height === 0, "height should be clamped to 0");
  assert(state.depth === 0, "depth should be clamped to 0");
});

test("constructor store: sections and compartments are clamped", () => {
  useConstructorStore.getState().setSections(-3);
  useConstructorStore.getState().setCompartments(0);
  let state = useConstructorStore.getState();
  assert(state.sections === 1, "sections should be clamped to 1");
  assert(state.compartments === 1, "compartments should be clamped to 1");

  useConstructorStore.getState().setWidth(1800);
  useConstructorStore.getState().setSections(27);
  useConstructorStore.getState().setCompartments(12);
  state = useConstructorStore.getState();
  assert(state.sections === 6, "sections should be clamped to 6");
  assert(state.compartments === 5, "compartments should be clamped to 5");

  useConstructorStore.getState().setWidth(700);
  useConstructorStore.getState().setSections(6);
  state = useConstructorStore.getState();
  assert(
    state.sections === 3,
    "sections should respect 200 mm minimum section width",
  );
});

test("constructor store: reset restores configuration without changing active step", () => {
  useConstructorStore.getState().setStep("checkout");
  useConstructorStore.getState().setMaterial("ldsp-egger-u961-chernyy-grafit-st7");
  useConstructorStore.getState().setContact({ name: "Анна", phone: "+7 999 000-00-00", email: "anna@example.ru", company: "" });
  useConstructorStore.getState().reset();
  const state = useConstructorStore.getState();
  assert(state.step === "checkout", "step should stay on the current route/step");
  assert(
    state.material === constructorInitialState.material,
    "material should reset",
  );
  assert(state.contact.email === "anna@example.ru", "contact should stay untouched");
});

test("constructor store: project materials and validation are derived centrally", () => {
  useConstructorStore.getState().reset();
  useConstructorStore
    .getState()
    .setMaterial("ldsp-egger-u961-chernyy-grafit-st7");
  useConstructorStore
    .getState()
    .setFacadeMaterial("mdf-egger-r010-seryy-grafitovyy-ms");
  const state = useConstructorStore.getState();

  assert(
    state.projectMaterials.bodyMaterialId ===
      "ldsp-egger-u961-chernyy-grafit-st7",
    "Expected LDSP body material",
  );
  assert(
    state.projectMaterials.facadeMaterialId ===
      "mdf-egger-r010-seryy-grafitovyy-ms",
    "Expected MDF facade material",
  );
  assert(
    state.projectMaterials.facadeMaterialKind === "mdf",
    "Expected MDF facade kind",
  );
  assert(
    state.projectMaterials.backPanelMaterialId === "hdf-kronospan-k190-chernyy",
    "Expected automatic HDF back panel",
  );
  assert(
    state.validation.status === "valid",
    "Expected valid material configuration",
  );
});

test("constructor store: furniture change applies safe defaults and removes rods from non-wardrobe", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setFurniture("dresser");
  let state = useConstructorStore.getState();
  assert(state.width === 900, "Expected dresser default width");
  assert(state.drawersCount === 3, "Expected dresser default drawers");

  useConstructorStore.getState().setRodsCount(1);
  state = useConstructorStore.getState();
  assert(state.rodsCount === 0, "Non-wardrobe furniture should not keep rods");
  assert(
    state.fill !== "rod",
    "Non-wardrobe furniture should not keep rod fill",
  );
});

test("constructor store: section widths can be edited manually without changing total width", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setSections(3);
  useConstructorStore.getState().setSectionWidth("section-1", 800);
  const state = useConstructorStore.getState();
  const totalWidth = state.sectionLayout.reduce(
    (sum, section) => sum + section.widthMm,
    0,
  );

  assert(state.sectionLayout.length === 3, "Expected 3 section layout items");
  assert(
    totalWidth === state.width,
    "Section widths should equal total furniture width",
  );
  assert(
    state.sectionLayout[0].widthMm === 800,
    "First section should keep manual width",
  );
  assert(
    state.sectionLayout.every((section) => section.widthMm >= 200),
    "Every section should respect minimum width",
  );
});

test("constructor store: equalizeSections restores even widths", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setSections(3);
  useConstructorStore.getState().setSectionWidth("section-1", 800);
  useConstructorStore.getState().equalizeSections();
  const state = useConstructorStore.getState();

  assert(
    state.sectionLayout.every((section) => section.widthMm === 600),
    "Expected 3 equal 600 mm sections for 1800 mm width",
  );
});


test("constructor store: compartment heights can be edited manually without changing total height", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setCompartments(3);
  const before = useConstructorStore.getState();
  const sectionId = before.selectedSectionId ?? "section-1";
  const compartmentId = before.compartmentLayout[sectionId]?.[0]?.id;
  assert(compartmentId, "Expected a selected compartment");

  useConstructorStore
    .getState()
    .setCompartmentHeight(sectionId, compartmentId, 1000);
  const state = useConstructorStore.getState();
  const heights = state.compartmentLayout[sectionId] ?? [];
  const totalHeight = heights.reduce(
    (sum, compartment) => sum + compartment.heightMm,
    0,
  );

  assert(totalHeight === state.height, "Compartment heights should equal total furniture height");
  assert(heights[0].heightMm === 1000, "First compartment should keep manual height");
  assert(
    heights.every((compartment) => compartment.heightMm >= 300),
    "Every compartment should respect minimum height",
  );
});

test("constructor store: equalizeCompartments restores even heights", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setCompartments(3);
  const sectionId = useConstructorStore.getState().selectedSectionId ?? "section-1";
  const compartmentId = useConstructorStore.getState().compartmentLayout[sectionId]?.[0]?.id;
  assert(compartmentId, "Expected a compartment to edit");

  useConstructorStore
    .getState()
    .setCompartmentHeight(sectionId, compartmentId, 1000);
  useConstructorStore.getState().equalizeCompartments(sectionId);
  const state = useConstructorStore.getState();

  assert(
    (state.compartmentLayout[sectionId] ?? []).every(
      (compartment) => compartment.heightMm === 800,
    ),
    "Expected 3 equal 800 mm compartments for 2400 mm height",
  );
});

test("constructor store: filling is applied to selected compartment and totals stay derived", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setSections(2);
  useConstructorStore.getState().setCompartments(2);
  const before = useConstructorStore.getState();
  const sectionId = before.sectionLayout[1]?.id ?? before.selectedSectionId ?? "section-1";
  const compartmentId = before.compartmentLayout[sectionId]?.[1]?.id;
  assert(compartmentId, "Expected second compartment");

  useConstructorStore.getState().selectCompartment(sectionId, compartmentId);
  useConstructorStore.getState().setCompartmentFilling(sectionId, compartmentId, {
    shelvesCount: 2,
    drawersCount: 1,
  });

  const state = useConstructorStore.getState();
  const filling = state.fillingLayout[sectionId]?.[compartmentId];
  assert(filling?.shelvesCount === 2, "Selected compartment should store shelves");
  assert(filling?.drawersCount === 1, "Selected compartment should store drawers");
  assert(state.shelvesCount === 2, "Global shelves total should be derived from filling layout");
  assert(state.drawersCount === 1, "Global drawers total should be derived from filling layout");
  assert(state.selectedSectionId === sectionId, "Selected section should follow edited filling");
  assert(state.selectedCompartmentId === compartmentId, "Selected compartment should follow edited filling");
});

test("constructor store: non-wardrobe filling layout blocks rods", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setFurniture("dresser");
  const state = useConstructorStore.getState();
  const sectionId = state.selectedSectionId ?? "section-1";
  const compartmentId = state.selectedCompartmentId ?? state.compartmentLayout[sectionId]?.[0]?.id;
  assert(compartmentId, "Expected dresser compartment");

  useConstructorStore.getState().setCompartmentFilling(sectionId, compartmentId, {
    rodsCount: 1,
  });

  const updated = useConstructorStore.getState();
  assert(updated.rodsCount === 0, "Dresser should not keep rods in totals");
  assert(
    updated.fillingLayout[sectionId]?.[compartmentId]?.rodsCount === 0,
    "Dresser compartment filling should not keep rods",
  );
});

test("constructor store: filling validation targets selected compartment", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setFurniture("wardrobe");
  useConstructorStore.getState().setHeight(1200);
  useConstructorStore.getState().setCompartments(2);
  const state = useConstructorStore.getState();
  const sectionId = state.selectedSectionId ?? "section-1";
  const compartmentId = state.compartmentLayout[sectionId]?.[0]?.id;
  assert(compartmentId, "Expected compartment");

  useConstructorStore.getState().selectCompartment(sectionId, compartmentId);
  useConstructorStore.getState().setCompartmentFilling(sectionId, compartmentId, {
    shelvesCount: 2,
  });

  const updated = useConstructorStore.getState();
  assert(updated.validation.status === "error", "Expected filling validation error");
  assert(
    updated.validation.issues.some(
      (issue) => issue.targetId === compartmentId && issue.id.endsWith("shelves-gap"),
    ),
    "Expected shelf issue to target selected compartment",
  );
});

test("constructor store: facade modes are action based and follow section layout", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setSections(2);
  useConstructorStore.getState().setAllSectionFacadeMode("open");
  let state = useConstructorStore.getState();
  assert(
    state.sectionLayout.every((section) => state.facadeLayout[section.id] === "open"),
    "All sections should become open",
  );

  useConstructorStore.getState().setSectionFacadeMode("section-1", "hinged");
  state = useConstructorStore.getState();
  assert(state.facadeLayout["section-1"] === "hinged", "Section 1 should be hinged");
  assert(state.facadeLayout["section-2"] === "open", "Section 2 should stay open");
});

test("constructor store: scene view and render modes are stored centrally", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setSceneRenderMode("svg");
  useConstructorStore.getState().setSceneViewMode("front");
  let state = useConstructorStore.getState();
  assert(state.sceneRenderMode === "svg", "Expected 2D/SVG render mode in store");
  assert(state.sceneViewMode === "front", "Expected front view mode in store");

  useConstructorStore.getState().setSceneRenderMode("three");
  useConstructorStore.getState().setSceneViewMode("top");
  state = useConstructorStore.getState();
  assert(state.sceneRenderMode === "three", "Expected 3D render mode in store");
  assert(state.sceneViewMode === "top", "Expected top view mode in store");
});

test("constructor store: production snapshot lifecycle is centralized and PII-free", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setProductionSnapshotLoading();
  let state = useConstructorStore.getState();
  assert(state.productionSnapshot.status === "loading", "Production snapshot should enter loading state");
  assert(state.productionSnapshot.error === "", "Loading state should clear previous error");

  useConstructorStore.getState().setProductionSnapshotReady({
    validationStatus: "ready-for-review",
    requiresTechnologistCheck: true,
    summary: {
      panels: 12,
      hardware: 8,
      drilling: 16,
      edgeBandingLengthMm: 4200,
      basisSteps: 12,
      warnings: 1,
      errors: 0,
    },
    project: {
      productType: "wardrobe",
      dimensions: { width: 1800, height: 2400, depth: 600 },
      sections: 2,
      materialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
      facadeStyleId: "regular",
    },
    servicesDecision: {
      schema: "razmerno.production-services-pricing-decision.v1",
      status: "audit-only",
      recommendedSourceOfTruth: "catalog",
      catalogBaseline: 12000,
      productionServicesEstimate: 11000,
      productionServicesWithBuffer: 11880,
      delta: -120,
      deltaPercent: -1,
      absoluteDeltaLevel: "low",
      reasons: ["production-norms-required"],
      managerSummary: "audit",
      clientSummary: "audit",
      nextAction: "keep catalog",
    },
  });

  state = useConstructorStore.getState();
  assert(state.productionSnapshot.status === "ready", "Production snapshot should become ready");
  assert(state.productionSnapshot.summary?.panels === 12, "Production snapshot should store summary");
  assert(state.productionSnapshot.project?.sections === 2, "Production snapshot should store non-PII project metadata");
  assert(state.productionSnapshot.servicesDecision?.status === "audit-only", "Production snapshot should store services decision");
  assert(
    JSON.stringify(state.productionSnapshot).includes("preview@razmerno.local") === false,
    "Production snapshot state should not store preview customer email",
  );

  useConstructorStore.getState().setProductionSnapshotError("boom");
  state = useConstructorStore.getState();
  assert(state.productionSnapshot.status === "error", "Production snapshot should store error status");
  assert(state.productionSnapshot.error === "boom", "Production snapshot should store error text");

  useConstructorStore.getState().clearProductionSnapshot();
  state = useConstructorStore.getState();
  assert(state.productionSnapshot.status === "idle", "Production snapshot should clear to idle");
  assert(state.productionSnapshot.summary === null, "Production snapshot summary should clear");
});
