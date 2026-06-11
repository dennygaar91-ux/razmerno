import type {
  ConstructorCompartmentFilling,
  ConstructorCompartmentLayout,
  ConstructorFillingLayout,
  ConstructorSection,
  ConstructorSectionFacadeLayout,
  ConstructorValidationState,
  ConstructorZoneFacadeLayout,
  ConstructorZoneFacadeMode,
  FillKey,
  FurnitureKey,
  MaterialToken,
  ProjectMaterials,
} from "../types";
import { getCompartmentFilling } from "../rules/projectRules";

export type ConstructorCanonicalDimensions = {
  widthMm: number;
  heightMm: number;
  depthMm: number;
};

export type ConstructorCanonicalZone = {
  id: string;
  sectionId: string;
  index: number;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  filling: ConstructorCompartmentFilling;
  facadeMode: ConstructorZoneFacadeMode;
  selected: boolean;
  validationIssues: ConstructorValidationState["issues"];
};

export type ConstructorCanonicalSection = {
  id: string;
  index: number;
  widthMm: number;
  depthMm: number;
  facadeMode: ConstructorSectionFacadeLayout[string];
  selected: boolean;
  zones: ConstructorCanonicalZone[];
  validationIssues: ConstructorValidationState["issues"];
};

export type ConstructorCanonicalMaterials = {
  bodyMaterialId: MaterialToken;
  facadeMaterialId: MaterialToken;
  backPanelMaterialId: MaterialToken;
  projectMaterials: ProjectMaterials;
};

export type ConstructorCanonicalSelection = {
  selectedSectionId: string | null;
  selectedZoneId: string | null;
};

export type ConstructorCanonicalState = {
  furnitureType: FurnitureKey;
  dimensions: ConstructorCanonicalDimensions;
  sections: ConstructorCanonicalSection[];
  selectedSectionId: string | null;
  selectedZoneId: string | null;
  selection: ConstructorCanonicalSelection;
  fill: FillKey;
  materials: ConstructorCanonicalMaterials;
  exactModeEnabled: boolean;
  validation: ConstructorValidationState;
  pricingDirtyKey: string;
};

export type ConstructorCanonicalStateInput = {
  furniture: FurnitureKey;
  width: number;
  height: number;
  depth: number;
  fill: FillKey;
  sectionLayout: ConstructorSection[];
  compartmentLayout: ConstructorCompartmentLayout;
  fillingLayout: ConstructorFillingLayout;
  facadeLayout: ConstructorSectionFacadeLayout;
  zoneFacadeLayout: ConstructorZoneFacadeLayout;
  selectedSectionId: string | null;
  selectedCompartmentId: string | null;
  material: MaterialToken;
  facadeMaterial: MaterialToken;
  backPanelMaterial: MaterialToken;
  projectMaterials: ProjectMaterials;
  exactModeEnabled: boolean;
  validation: ConstructorValidationState;
};

function getZoneFacadeMode(input: {
  zoneFacadeLayout: ConstructorZoneFacadeLayout;
  sectionId: string;
  zoneId: string;
}): ConstructorZoneFacadeMode {
  return input.zoneFacadeLayout[input.sectionId]?.[input.zoneId] ?? "inherit";
}

function getValidationIssuesForTarget(
  validation: ConstructorValidationState,
  targetIds: Array<string | null | undefined>,
) {
  const ids = new Set(targetIds.filter(Boolean) as string[]);
  return validation.issues.filter(
    (issue) => issue.targetId && ids.has(issue.targetId),
  );
}

export function buildCanonicalConstructorState(
  input: ConstructorCanonicalStateInput,
): ConstructorCanonicalState {
  const selectedSectionId =
    input.selectedSectionId ?? input.sectionLayout[0]?.id ?? null;
  const selectedZoneId = selectedSectionId
    ? (input.selectedCompartmentId ??
      input.compartmentLayout[selectedSectionId]?.[0]?.id ??
      null)
    : null;

  const sections = input.sectionLayout.map<ConstructorCanonicalSection>(
    (section, sectionIndex) => {
      const zones = input.compartmentLayout[section.id] ?? [];
      const sectionIssues = getValidationIssuesForTarget(input.validation, [
        section.id,
      ]);

      return {
        id: section.id,
        index: sectionIndex + 1,
        widthMm: section.widthMm,
        depthMm: input.depth,
        facadeMode: input.facadeLayout[section.id] ?? "hinged",
        selected: section.id === selectedSectionId,
        validationIssues: sectionIssues,
        zones: zones.map<ConstructorCanonicalZone>((zone, zoneIndex) => ({
          id: zone.id,
          sectionId: section.id,
          index: zoneIndex + 1,
          widthMm: section.widthMm,
          heightMm: zone.heightMm,
          depthMm: input.depth,
          filling: getCompartmentFilling({
            fillingLayout: input.fillingLayout,
            sectionId: section.id,
            compartmentId: zone.id,
          }),
          facadeMode: getZoneFacadeMode({
            zoneFacadeLayout: input.zoneFacadeLayout,
            sectionId: section.id,
            zoneId: zone.id,
          }),
          selected:
            section.id === selectedSectionId && zone.id === selectedZoneId,
          validationIssues: getValidationIssuesForTarget(input.validation, [
            zone.id,
          ]),
        })),
      };
    },
  );

  return {
    furnitureType: input.furniture,
    dimensions: {
      widthMm: input.width,
      heightMm: input.height,
      depthMm: input.depth,
    },
    sections,
    selectedSectionId,
    selectedZoneId,
    selection: {
      selectedSectionId,
      selectedZoneId,
    },
    fill: input.fill,
    materials: {
      bodyMaterialId: input.material,
      facadeMaterialId: input.facadeMaterial,
      backPanelMaterialId: input.backPanelMaterial,
      projectMaterials: input.projectMaterials,
    },
    exactModeEnabled: input.exactModeEnabled,
    validation: input.validation,
    pricingDirtyKey: JSON.stringify({
      furniture: input.furniture,
      dimensions: [input.width, input.height, input.depth],
      sections: input.sectionLayout.map((section) => [
        section.id,
        section.widthMm,
      ]),
      zones: sections.map((section) => [
        section.id,
        section.zones.map((zone) => [zone.id, zone.heightMm, zone.filling]),
      ]),
      facades: input.facadeLayout,
      zoneFacades: input.zoneFacadeLayout,
      materials: [
        input.material,
        input.facadeMaterial,
        input.backPanelMaterial,
      ],
    }),
  };
}
