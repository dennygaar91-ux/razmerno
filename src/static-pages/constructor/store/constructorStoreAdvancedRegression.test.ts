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
