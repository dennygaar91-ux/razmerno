import { useConstructorStore } from "./constructorStore";

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

test("constructor store: section and layout normalization keep selected zone aliases synchronized", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setSections(3);
  useConstructorStore.getState().setCompartments(2);
  let state = useConstructorStore.getState();
  const targetSectionId = state.sectionLayout[2]?.id;
  assert(targetSectionId, "Expected third section");
  const targetZoneId = state.compartmentLayout[targetSectionId]?.[1]?.id;
  assert(targetZoneId, "Expected second zone in third section");

  useConstructorStore.getState().selectZone(targetSectionId, targetZoneId);
  useConstructorStore.getState().selectSection("section-1");
  state = useConstructorStore.getState();
  assert(state.selectedSectionId === "section-1", "selectSection should update selectedSectionId");
  assert(Boolean(state.selectedCompartmentId), "selectSection should keep a valid selectedCompartmentId");
  assert(state.selectedCompartmentId === state.selectedZoneId, "selectSection should synchronize selected zone aliases");
  assert(
    (state.compartmentLayout["section-1"] ?? []).some(
      (compartment) => compartment.id === state.selectedZoneId,
    ),
    "selectSection should keep selectedZoneId inside the selected section",
  );

  useConstructorStore.getState().setSections(1);
  state = useConstructorStore.getState();
  assert(state.selectedSectionId === "section-1", "setSections should keep selectedSectionId valid");
  assert(state.selectedCompartmentId === state.selectedZoneId, "setSections should keep zone aliases synchronized");
  assert(
    (state.compartmentLayout["section-1"] ?? []).some(
      (compartment) => compartment.id === state.selectedZoneId,
    ),
    "setSections should not leave selectedZoneId stale",
  );

  useConstructorStore.getState().setSections(3);
  useConstructorStore.getState().selectZone("section-3", useConstructorStore.getState().compartmentLayout["section-3"]?.[1]?.id ?? "");
  useConstructorStore.getState().equalizeSections();
  state = useConstructorStore.getState();
  assert(Boolean(state.selectedSectionId), "equalizeSections should keep a selected section");
  assert(state.selectedCompartmentId === state.selectedZoneId, "equalizeSections should keep zone aliases synchronized");
  assert(
    (state.compartmentLayout[state.selectedSectionId ?? ""] ?? []).some(
      (compartment) => compartment.id === state.selectedZoneId,
    ),
    "equalizeSections should not leave selectedZoneId stale",
  );
});

test("constructor store: compartment layout normalization keeps selected zone aliases synchronized", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setSections(2);
  useConstructorStore.getState().setCompartments(3);
  useConstructorStore.getState().selectZone(
    "section-2",
    useConstructorStore.getState().compartmentLayout["section-2"]?.[2]?.id ?? "",
  );

  useConstructorStore.getState().setCompartments(1);
  let state = useConstructorStore.getState();
  assert(state.selectedCompartmentId === state.selectedZoneId, "setCompartments should keep zone aliases synchronized");
  assert(
    (state.compartmentLayout[state.selectedSectionId ?? ""] ?? []).some(
      (compartment) => compartment.id === state.selectedZoneId,
    ),
    "setCompartments should not leave selectedZoneId stale",
  );

  useConstructorStore.getState().setCompartments(3);
  useConstructorStore.getState().selectZone(
    "section-2",
    useConstructorStore.getState().compartmentLayout["section-2"]?.[0]?.id ?? "",
  );
  useConstructorStore.getState().setCompartmentHeight(
    "section-2",
    useConstructorStore.getState().compartmentLayout["section-2"]?.[0]?.id ?? "",
    1000,
  );
  state = useConstructorStore.getState();
  assert(state.selectedCompartmentId === state.selectedZoneId, "setCompartmentHeight should keep zone aliases synchronized");
  assert(
    (state.compartmentLayout["section-2"] ?? []).some(
      (compartment) => compartment.id === state.selectedZoneId,
    ),
    "setCompartmentHeight should not leave selectedZoneId stale",
  );

  useConstructorStore.getState().equalizeCompartments("section-2");
  state = useConstructorStore.getState();
  assert(state.selectedCompartmentId === state.selectedZoneId, "equalizeCompartments should keep zone aliases synchronized");
  assert(
    (state.compartmentLayout["section-2"] ?? []).some(
      (compartment) => compartment.id === state.selectedZoneId,
    ),
    "equalizeCompartments should not leave selectedZoneId stale",
  );
});
