import { useConstructorStore } from "./constructorStore";
import { selectCanonicalConstructorState } from "./constructorSelectors";

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

test("canonical state: exposes dimensions, sections and zones from one selector", () => {
  useConstructorStore.getState().setWidth(2100);
  useConstructorStore.getState().setSections(3);
  useConstructorStore.getState().setCompartments(2);
  const canonical = selectCanonicalConstructorState(
    useConstructorStore.getState(),
  );

  assert(
    canonical.furnitureType === "wardrobe",
    "Expected wardrobe furniture type",
  );
  assert(canonical.dimensions.widthMm === 2100, "Expected canonical width");
  assert(canonical.sections.length === 3, "Expected 3 canonical sections");
  assert(
    canonical.sections.every((section) => section.zones.length === 2),
    "Expected 2 zones per section",
  );
  assert(Boolean(canonical.pricingDirtyKey), "Expected pricing dirty key");
});

test("canonical state: selectZone updates selectedSectionId and selectedZoneId", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setSections(2);
  useConstructorStore.getState().setCompartments(2);
  const before = useConstructorStore.getState();
  const sectionId = before.sectionLayout[1]?.id;
  assert(sectionId, "Expected second section");
  const zoneId = before.compartmentLayout[sectionId]?.[1]?.id;
  assert(zoneId, "Expected second zone");

  useConstructorStore.getState().selectZone(sectionId, zoneId);
  const state = useConstructorStore.getState();
  const canonical = selectCanonicalConstructorState(state);

  assert(
    state.selectedSectionId === sectionId,
    "Expected selected section alias to update",
  );
  assert(
    state.selectedCompartmentId === zoneId,
    "Expected selected compartment to update",
  );
  assert(
    state.selectedZoneId === zoneId,
    "Expected selected zone alias to update",
  );
  assert(
    canonical.selectedSectionId === sectionId,
    "Expected canonical selected section",
  );
  assert(
    canonical.selectedZoneId === zoneId,
    "Expected canonical selected zone",
  );
  assert(
    canonical.sections[1]?.zones[1]?.selected === true,
    "Expected canonical zone selected flag",
  );
});

test("canonical state: selectSection keeps canonical selected zone inside canonical selected section", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setSections(2);
  useConstructorStore.getState().setCompartments(2);
  const before = useConstructorStore.getState();
  const staleSectionId = before.sectionLayout[1]?.id;
  assert(staleSectionId, "Expected second section");
  const staleZoneId = before.compartmentLayout[staleSectionId]?.[1]?.id;
  assert(staleZoneId, "Expected second zone in second section");

  useConstructorStore.getState().selectZone(staleSectionId, staleZoneId);
  useConstructorStore.getState().selectSection("section-1");
  const state = useConstructorStore.getState();
  const canonical = selectCanonicalConstructorState(state);

  assert(canonical.selectedSectionId === "section-1", "Expected canonical selected section to follow selectSection");
  assert(Boolean(canonical.selectedZoneId), "Expected canonical selected zone after selectSection");
  assert(
    canonical.sections[0]?.zones.some((zone) => zone.id === canonical.selectedZoneId),
    "Canonical selected zone should belong to canonical selected section",
  );
  assert(
    canonical.sections[1]?.zones.some((zone) => zone.selected) !== true,
    "A stale zone from another section must not stay selected canonically",
  );
});

test("canonical state: exact mode is global for sizes and filling", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setExactModeEnabled(true);
  let state = useConstructorStore.getState();
  let canonical = selectCanonicalConstructorState(state);

  assert(state.exactModeEnabled === true, "Expected exact mode enabled");
  assert(
    state.advancedSizes === true,
    "Expected advanced sizes enabled globally",
  );
  assert(
    state.advancedFill === true,
    "Expected advanced fill enabled globally",
  );
  assert(
    canonical.exactModeEnabled === true,
    "Expected canonical exact mode enabled",
  );

  useConstructorStore.getState().setAdvancedFill(false);
  state = useConstructorStore.getState();
  canonical = selectCanonicalConstructorState(state);
  assert(
    state.exactModeEnabled === false,
    "Expected legacy advanced fill setter to update exact mode",
  );
  assert(
    state.advancedSizes === false,
    "Expected global exact mode to disable sizes too",
  );
  assert(
    canonical.exactModeEnabled === false,
    "Expected canonical exact mode disabled",
  );
});

test("canonical state: zone filling and facade data stay attached to selected zone", () => {
  useConstructorStore.getState().reset();
  const stateBefore = useConstructorStore.getState();
  const sectionId =
    stateBefore.selectedSectionId ?? stateBefore.sectionLayout[0]?.id;
  assert(sectionId, "Expected selected section");
  const zoneId =
    stateBefore.selectedCompartmentId ??
    stateBefore.compartmentLayout[sectionId]?.[0]?.id;
  assert(zoneId, "Expected selected zone");

  useConstructorStore.getState().setCompartmentFilling(sectionId, zoneId, {
    shelvesCount: 1,
    drawersCount: 2,
  });
  useConstructorStore.getState().setZoneFacadeMode(sectionId, zoneId, "open");
  const canonical = selectCanonicalConstructorState(
    useConstructorStore.getState(),
  );
  const zone = canonical.sections[0]?.zones[0];

  assert(zone?.filling.shelvesCount === 1, "Expected canonical shelf count");
  assert(zone?.filling.drawersCount === 2, "Expected canonical drawer count");
  assert(
    zone?.facadeMode === "open",
    "Expected canonical zone facade override",
  );
});

test("size step: furniture defaults update canonical dimensions", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setFurniture("dresser");
  const canonical = selectCanonicalConstructorState(
    useConstructorStore.getState(),
  );

  assert(canonical.furnitureType === "dresser", "Expected dresser type");
  assert(
    canonical.dimensions.widthMm === 900,
    "Expected dresser default width in canonical state",
  );
  assert(
    canonical.dimensions.heightMm === 900,
    "Expected dresser default height in canonical state",
  );
  assert(
    canonical.sections.length === useConstructorStore.getState().sections,
    "Expected canonical sections to match store sections",
  );
});

test("size step: section count is clamped by minimum section width", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setWidth(600);
  useConstructorStore.getState().setSections(6);
  const state = useConstructorStore.getState();
  const canonical = selectCanonicalConstructorState(state);

  assert(state.sections === 3, "Expected 600mm width to allow max 3 sections");
  assert(
    canonical.sections.every((section) => section.widthMm >= 200),
    "Expected every canonical section to respect 200mm minimum",
  );
});


test("fill step: shelf splits selected zone and keeps selection on the new upper zone", () => {
  useConstructorStore.getState().reset();
  const before = useConstructorStore.getState();
  const sectionId = before.selectedSectionId ?? before.sectionLayout[0]?.id;
  assert(sectionId, "Expected selected section");
  const safeSectionId = sectionId as string;
  const zoneId = before.selectedZoneId ?? before.compartmentLayout[safeSectionId]?.[0]?.id;
  assert(zoneId, "Expected selected zone");
  const safeZoneId = zoneId as string;

  useConstructorStore.getState().addShelfToCompartment(safeSectionId, safeZoneId, 900);
  const state = useConstructorStore.getState();
  const zones = state.compartmentLayout[safeSectionId] ?? [];

  assert(zones.length === 2, "Expected shelf to split selected zone into two zones");
  assert(state.selectedZoneId === zones[1]?.id, "Expected selected zone to follow the new upper zone after shelf split");
  assert(zones[0]?.heightMm === 900, "Expected shelf height to be measured from selected zone bottom");
});

test("fill step: random preset applies real zone content instead of a placeholder", () => {
  useConstructorStore.getState().reset();
  const sectionId = useConstructorStore.getState().selectedSectionId;
  assert(sectionId, "Expected selected section");
  const safeSectionId = sectionId as string;

  useConstructorStore.getState().applyRandomPresetToSection(safeSectionId);
  const state = useConstructorStore.getState();
  const zoneFillings = Object.values(state.fillingLayout[safeSectionId] ?? {});
  const totalElements = zoneFillings.reduce<number>(
    (total, filling) => total + filling.shelvesCount + filling.drawersCount + filling.rodsCount,
    0,
  );

  assert(totalElements > 0, "Expected random preset to add real filling elements");
  assert((state.compartmentLayout[safeSectionId] ?? []).length >= 1, "Expected random preset to keep zones available");
});

test("facade step: exact mode enables zone-level facade override without changing section facade", () => {
  useConstructorStore.getState().reset();
  const sectionId = useConstructorStore.getState().selectedSectionId;
  assert(sectionId, "Expected selected section");
  const safeSectionId = sectionId as string;
  const zoneId = useConstructorStore.getState().selectedZoneId;
  assert(zoneId, "Expected selected zone");
  const safeZoneId = zoneId as string;

  useConstructorStore.getState().setSectionFacadeMode(safeSectionId, "hinged");
  useConstructorStore.getState().setExactModeEnabled(true);
  useConstructorStore.getState().setZoneFacadeMode(safeSectionId, safeZoneId, "open");
  const state = useConstructorStore.getState();

  assert(state.advancedFill === true, "Expected exact mode to enable advanced fill");
  assert(state.facadeLayout[safeSectionId] === "hinged", "Expected section facade to stay hinged");
  assert(state.zoneFacadeLayout[safeSectionId]?.[safeZoneId] === "open", "Expected selected zone facade override");
});
