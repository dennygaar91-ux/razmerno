import { facadeMaterialOptions } from "../../../shared/materials/materialCatalog";
import type { MaterialToken } from "../types";
import { buildProjectMaterials, validateConstructorProject } from "../rules/projectRules";
import { deriveFromState } from "./constructorStoreDerivation";
import type { ConstructorStoreState } from "./constructorStoreTypes";

export const createBodyMaterialPatch = (
  state: ConstructorStoreState,
  material: MaterialToken,
): Partial<ConstructorStoreState> => {
  const materials = buildProjectMaterials({
    bodyMaterialId: material,
    facadeMaterialId: state.facadeMaterial,
  });
  const next = {
    ...state,
    material: materials.bodyMaterialId,
    facadeMaterial: materials.facadeMaterialId,
    backPanelMaterial: materials.backPanelMaterialId,
    projectMaterials: materials,
  };
  return { ...next, validation: deriveFromState(next).validation };
};

export const createFacadeMaterialPatch = (
  state: ConstructorStoreState,
  facadeMaterial: MaterialToken,
): Partial<ConstructorStoreState> => {
  const fallbackFacade = (facadeMaterialOptions[0]?.id ??
    state.material) as MaterialToken;
  const materials = buildProjectMaterials({
    bodyMaterialId: state.material,
    facadeMaterialId: facadeMaterial ?? fallbackFacade,
  });
  const next = {
    ...state,
    material: materials.bodyMaterialId,
    facadeMaterial: materials.facadeMaterialId,
    backPanelMaterial: materials.backPanelMaterialId,
    projectMaterials: materials,
  };
  return { ...next, validation: deriveFromState(next).validation };
};

export const createSyncedBackPanelMaterialPatch = (
  state: ConstructorStoreState,
): Partial<ConstructorStoreState> => {
  const materials = buildProjectMaterials({
    bodyMaterialId: state.material,
    facadeMaterialId: state.facadeMaterial,
  });
  return {
    material: materials.bodyMaterialId,
    facadeMaterial: materials.facadeMaterialId,
    backPanelMaterial: materials.backPanelMaterialId,
    projectMaterials: materials,
    validation: validateConstructorProject({
      ...state,
      material: materials.bodyMaterialId,
      facadeMaterial: materials.facadeMaterialId,
      projectMaterials: materials,
    }),
  };
};
