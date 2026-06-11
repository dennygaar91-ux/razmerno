import type { ConstructorFillingLayout, ConstructorProductionSnapshotState, ContactState, FillKey, FurnitureKey, StepKey } from "../types";
import { ensureSelectedCompartment } from "./constructorStoreUtils";
import {
  buildProjectMaterials,
  createEvenSectionLayout,
  createUniformFacadeLayout,
  normalizeCompartmentLayout,
  normalizeZoneFacadeLayout,
  validateConstructorProject,
} from "../rules/projectRules";

export const initialProductionSnapshot: ConstructorProductionSnapshotState = {
  status: "idle",
  validationStatus: null,
  updatedAt: null,
  error: "",
  requiresTechnologistCheck: false,
  summary: null,
  project: null,
  panelPricing: null,
  hardwarePricing: null,
  hardwareDecision: null,
  servicesPricing: null,
  servicesDecision: null,
};

export const initialMaterials = buildProjectMaterials({
  bodyMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
  facadeMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
});

const initialSectionLayout = createEvenSectionLayout(2, 1800);
const initialFacadeLayout = createUniformFacadeLayout(initialSectionLayout, "hinged");
const initialCompartmentLayout = normalizeCompartmentLayout({
  heightMm: 2400,
  compartments: 1,
  sectionLayout: initialSectionLayout,
});
const initialZoneFacadeLayout = normalizeZoneFacadeLayout({
  compartmentLayout: initialCompartmentLayout,
});
const initialFillingLayout = Object.fromEntries(
  Object.entries(initialCompartmentLayout).map(([sectionId, compartments]) => [
    sectionId,
    Object.fromEntries(
      compartments.map((compartment) => [
        compartment.id,
        { shelvesCount: 0, drawersCount: 0, rodsCount: 0 },
      ]),
    ),
  ]),
) as ConstructorFillingLayout;
const initialSelectedSectionId = initialSectionLayout[0]?.id ?? null;

const initialValidation = validateConstructorProject({
  furniture: "wardrobe",
  width: 1800,
  height: 2400,
  depth: 600,
  sections: initialSectionLayout.length,
  sectionLayout: initialSectionLayout,
  compartmentLayout: initialCompartmentLayout,
  fillingLayout: initialFillingLayout,
  facadeLayout: initialFacadeLayout,
  zoneFacadeLayout: initialZoneFacadeLayout,
  compartments: 1,
  fill: "shelves",
  rodsCount: 0,
  material: initialMaterials.bodyMaterialId,
  facadeMaterial: initialMaterials.facadeMaterialId,
  projectMaterials: initialMaterials,
});

export const constructorInitialState = {
  step: "sizes" as StepKey,
  furniture: "wardrobe" as FurnitureKey,
  width: 1800,
  height: 2400,
  depth: 600,
  fill: "shelves" as FillKey,
  sections: initialSectionLayout.length,
  sectionLayout: initialSectionLayout,
  selectedSectionId: initialSelectedSectionId,
  compartmentLayout: initialCompartmentLayout,
  fillingLayout: initialFillingLayout,
  facadeLayout: initialFacadeLayout,
  zoneFacadeLayout: initialZoneFacadeLayout,
  selectedCompartmentId: ensureSelectedCompartment(
    initialSelectedSectionId,
    null,
    initialCompartmentLayout,
  ),
  selectedZoneId: ensureSelectedCompartment(
    initialSelectedSectionId,
    null,
    initialCompartmentLayout,
  ),
  compartments: 1,
  handleless: false,
  material: initialMaterials.bodyMaterialId,
  facadeMaterial: initialMaterials.facadeMaterialId,
  backPanelMaterial: initialMaterials.backPanelMaterialId,
  projectMaterials: initialMaterials,
  validation: initialValidation,
  shelvesCount: 0,
  drawersCount: 0,
  rodsCount: 0,
  exactModeEnabled: false,
  advancedSizes: false,
  advancedFill: false,
  sceneRenderMode: "three",
  sceneViewMode: "free",
  productionSnapshot: initialProductionSnapshot,
  deliveryEnabled: false,
  assemblyEnabled: false,
  deliveryAddress: "",
  contact: {
    name: "",
    phone: "",
    email: "",
    company: "",
  } satisfies ContactState,
  consent: false,
} as const;
