import type {
  ConstructorCompartmentLayout,
  ConstructorFillingLayout,
  ConstructorSection,
  ConstructorSectionFacadeLayout,
  ConstructorZoneFacadeLayout,
  FillKey,
  FurnitureKey,
  MaterialToken,
} from "../types";
import { normalizeConstructorProject } from "../rules/projectRules";
import type { ConstructorStoreState } from "./constructorStoreTypes";
import { ensureSelectedCompartment } from "./constructorStoreUtils";

export function createDerivedProjectState(input: {
  furniture: FurnitureKey;
  width: number;
  height: number;
  depth: number;
  fill: FillKey;
  sections: number;
  sectionLayout?: ConstructorSection[];
  compartmentLayout?: ConstructorCompartmentLayout;
  fillingLayout?: ConstructorFillingLayout;
  facadeLayout?: ConstructorSectionFacadeLayout;
  zoneFacadeLayout?: ConstructorZoneFacadeLayout;
  compartments: number;
  material: MaterialToken;
  facadeMaterial: MaterialToken;
  shelvesCount: number;
  drawersCount: number;
  rodsCount: number;
}) {
  const normalized = normalizeConstructorProject(input);
  const selectedSectionId = normalized.sectionLayout[0]?.id ?? null;
  return {
    fill: normalized.fill,
    sections: normalized.sections,
    sectionLayout: normalized.sectionLayout,
    compartmentLayout: normalized.compartmentLayout,
    fillingLayout: normalized.fillingLayout,
    facadeLayout: normalized.facadeLayout,
    zoneFacadeLayout: normalized.zoneFacadeLayout,
    compartments: normalized.compartments,
    selectedSectionId,
    selectedCompartmentId: ensureSelectedCompartment(
      selectedSectionId,
      null,
      normalized.compartmentLayout,
    ),
    rodsCount: normalized.rodsCount,
    material: normalized.material,
    facadeMaterial: normalized.facadeMaterial,
    backPanelMaterial: normalized.backPanelMaterial,
    projectMaterials: normalized.projectMaterials,
    validation: normalized.validation,
  };
}

export function deriveFromState(
  state: Pick<
    ConstructorStoreState,
    | "furniture"
    | "width"
    | "height"
    | "depth"
    | "fill"
    | "sections"
    | "sectionLayout"
    | "compartmentLayout"
    | "fillingLayout"
    | "facadeLayout"
    | "zoneFacadeLayout"
    | "compartments"
    | "material"
    | "facadeMaterial"
    | "shelvesCount"
    | "drawersCount"
    | "rodsCount"
  >,
) {
  return createDerivedProjectState(state);
}
