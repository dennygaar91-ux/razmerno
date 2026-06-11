import {
  bodyMaterialOptions,
  facadeMaterialOptions,
  getMaterialById,
  isBodyMaterial,
  isFacadeMaterial,
  resolveMaterialId,
  type MaterialToken,
} from "../../../shared/materials/materialCatalog";
import { getBackPanelMaterialForBody } from "../../../shared/materials/materialMapping";
import type {
  ConstructorFurnitureDefaults,
  FurnitureKey,
  ProjectMaterials,
} from "../types";
import {
  CONSTRUCTOR_FURNITURE_DEFAULTS,
  DEFAULT_BODY_MATERIAL_ID,
  DEFAULT_FACADE_MATERIAL_ID,
} from "./projectRuleConstants";

export function getFurnitureDefaults(
  furniture: FurnitureKey,
): ConstructorFurnitureDefaults {
  return (
    CONSTRUCTOR_FURNITURE_DEFAULTS[furniture] ??
    CONSTRUCTOR_FURNITURE_DEFAULTS.wardrobe
  );
}

function resolveBodyMaterialId(
  value: MaterialToken | string | undefined | null,
): MaterialToken {
  const resolved = resolveMaterialId(value);
  if (isBodyMaterial(resolved)) return resolved as MaterialToken;
  return (bodyMaterialOptions[0]?.materialId ??
    DEFAULT_BODY_MATERIAL_ID) as MaterialToken;
}

function resolveFacadeMaterialId(
  value: MaterialToken | string | undefined | null,
): MaterialToken {
  const resolved = resolveMaterialId(value);
  if (isFacadeMaterial(resolved)) return resolved as MaterialToken;
  return (facadeMaterialOptions[0]?.materialId ??
    DEFAULT_FACADE_MATERIAL_ID) as MaterialToken;
}

export function buildProjectMaterials(input: {
  bodyMaterialId?: MaterialToken | string | null;
  facadeMaterialId?: MaterialToken | string | null;
}): ProjectMaterials {
  const bodyMaterialId = resolveBodyMaterialId(input.bodyMaterialId);
  const facadeMaterialId = resolveFacadeMaterialId(
    input.facadeMaterialId ?? bodyMaterialId,
  );
  const facadeMaterial = getMaterialById(facadeMaterialId);
  const backPanelMaterial = getBackPanelMaterialForBody(bodyMaterialId);

  return {
    bodyMaterialId,
    facadeMaterialKind: facadeMaterial?.kind === "mdf" ? "mdf" : "ldsp",
    facadeMaterialId,
    backPanelMaterialId: backPanelMaterial.id as MaterialToken,
  };
}
