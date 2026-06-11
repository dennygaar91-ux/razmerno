import type { MaterialToken } from "../../../shared/materials/materialCatalog";
import type {
  ConstructorCompartmentLayout,
  ConstructorFillingLayout,
  ConstructorSection,
  ConstructorSectionFacadeLayout,
  ConstructorZoneFacadeLayout,
  FillKey,
  FurnitureKey,
} from "../types";
import { normalizeCompartmentLayout } from "./compartmentRules";
import { normalizeFacadeLayout, normalizeZoneFacadeLayout } from "./facadeRules";
import { getFillingTotals, normalizeFillingLayout } from "./fillingRules";
import { buildProjectMaterials } from "./materialRules";
import { normalizeSectionLayout } from "./sectionRules";
import { validateConstructorProject } from "./validationRules";

export function normalizeConstructorProject(input: {
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
  const materials = buildProjectMaterials({
    bodyMaterialId: input.material,
    facadeMaterialId: input.facadeMaterial,
  });

  const sectionLayout = normalizeSectionLayout({
    widthMm: input.width,
    sections: input.sections,
    sectionLayout: input.sectionLayout,
  });
  const safeSections = sectionLayout.length;
  const compartmentLayout = normalizeCompartmentLayout({
    heightMm: input.height,
    compartments: input.compartments,
    sectionLayout,
    compartmentLayout: input.compartmentLayout,
  });
  const safeCompartments = compartmentLayout[sectionLayout[0]?.id ?? ""]?.length ?? input.compartments;
  const fillingLayout = normalizeFillingLayout({
    furniture: input.furniture,
    compartmentLayout,
    fillingLayout: input.fillingLayout,
    fallback:
      input.shelvesCount > 0 || input.drawersCount > 0 || input.rodsCount > 0
        ? {
            shelvesCount: input.shelvesCount,
            drawersCount: input.drawersCount,
            rodsCount: input.rodsCount,
          }
        : undefined,
  });
  const facadeLayout = normalizeFacadeLayout({
    sectionLayout,
    facadeLayout: input.facadeLayout,
  });
  const zoneFacadeLayout = normalizeZoneFacadeLayout({
    compartmentLayout,
    zoneFacadeLayout: input.zoneFacadeLayout,
  });
  const fillingTotals = getFillingTotals(fillingLayout);
  const safeRodsCount =
    input.furniture === "wardrobe" ? fillingTotals.rodsCount : 0;
  const safeFill =
    input.fill === "rod" && input.furniture !== "wardrobe"
      ? "drawers"
      : input.fill;

  return {
    ...input,
    sections: safeSections,
    sectionLayout,
    compartmentLayout,
    compartments: safeCompartments,
    fillingLayout,
    facadeLayout,
    zoneFacadeLayout,
    shelvesCount: fillingTotals.shelvesCount,
    drawersCount: fillingTotals.drawersCount,
    fill: safeFill,
    rodsCount: safeRodsCount,
    material: materials.bodyMaterialId,
    facadeMaterial: materials.facadeMaterialId,
    backPanelMaterial: materials.backPanelMaterialId,
    projectMaterials: materials,
    validation: validateConstructorProject({
      ...input,
      sections: safeSections,
      sectionLayout,
      compartmentLayout,
      fillingLayout,
      facadeLayout,
      zoneFacadeLayout,
      compartments: safeCompartments,
      fill: safeFill,
      rodsCount: safeRodsCount,
      material: materials.bodyMaterialId,
      facadeMaterial: materials.facadeMaterialId,
      projectMaterials: materials,
    }),
  };
}

