import {
  LOCKED_FACADE_GAP_MM,
  LOCKED_PAIRED_FACADE_CENTER_GAP_MM,
} from "./assemblyPolicy.js";
import type {
  FacadeDoorTypeV4,
  FacadeGapPolicyV4,
  FacadeOpeningModeV4,
  FacadeOpeningSizeInputV4,
  FacadeOpeningTypeV4,
  FacadePanelClassificationV4,
  FacadeSemanticProjectionV4,
  FacadeSizeV4,
  HardwareV4,
  MaterialKindV4,
  MaterialV4,
  PanelV4,
  ProductionJsonV4,
  ProductionJsonV4ValidationIssue,
  ValidationIssueV4,
  ValidationResult,
} from "./types.js";

const FACADE_CLASS_ROLES = new Set<PanelV4["role"]>(["facade-door", "drawer-front"]);

const KNOWN_DOOR_TYPES = new Set<FacadeDoorTypeV4>(["overlay", "half-overlay", "inset"]);

const KNOWN_OPENING_TYPES = new Set<FacadeOpeningTypeV4>([
  "single",
  "paired-left",
  "paired-right",
  "drawer-front",
]);

const KNOWN_OPENING_MODES = new Set<FacadeOpeningModeV4>([
  "regular-handle",
  "no-handle",
  "push-to-open",
  "hidden-handle",
]);

const LOCKED_FACADE_THICKNESS_MM: Record<"ldsp" | "mdf", number> = {
  ldsp: 16,
  mdf: 18,
};

function policyIssue(code: string, message: string, path?: string): ProductionJsonV4ValidationIssue {
  return { code, message, path };
}

function policyWarning(code: string, message: string, path?: string): ValidationIssueV4 {
  return {
    code,
    severity: "warning",
    visibleToClient: false,
    requiresTechnologistCheck: true,
    message,
    path,
  };
}

function isApproximatelyEqual(left: number, right: number, toleranceMm = 0.1): boolean {
  return Math.abs(left - right) <= toleranceMm;
}

export function getFacadeGapPolicyV4(): FacadeGapPolicyV4 {
  return {
    sideGapMm: LOCKED_FACADE_GAP_MM,
    pairedCenterGapMm: LOCKED_PAIRED_FACADE_CENTER_GAP_MM,
    topGapMm: LOCKED_FACADE_GAP_MM,
    bottomGapMm: LOCKED_FACADE_GAP_MM,
    leftGapMm: LOCKED_FACADE_GAP_MM,
    rightGapMm: LOCKED_FACADE_GAP_MM,
  };
}

export function calculateSingleFacadeSizeV4(opening: FacadeOpeningSizeInputV4): FacadeSizeV4 {
  const gap = getFacadeGapPolicyV4();
  return {
    widthMm: opening.widthMm - gap.leftGapMm - gap.rightGapMm,
    heightMm: opening.heightMm - gap.topGapMm - gap.bottomGapMm,
  };
}

export function calculatePairedFacadeSizeV4(opening: FacadeOpeningSizeInputV4): FacadeSizeV4 {
  const gap = getFacadeGapPolicyV4();
  return {
    widthMm: (opening.widthMm - gap.leftGapMm - gap.rightGapMm - gap.pairedCenterGapMm) / 2,
    heightMm: opening.heightMm - gap.topGapMm - gap.bottomGapMm,
  };
}

function resolveFacadeMaterialKind(
  panel: Pick<PanelV4, "materialKind" | "materialRef">,
  materials?: MaterialV4[],
): MaterialKindV4 {
  if (panel.materialKind === "ldsp" || panel.materialKind === "mdf") {
    return panel.materialKind;
  }

  const material = materials?.find((item) => item.id === panel.materialRef);
  if (material?.kind === "ldsp" || material?.kind === "mdf") {
    return material.kind;
  }

  return panel.materialKind;
}

function getExpectedFacadeThickness(materialKind: MaterialKindV4): number | null {
  if (materialKind === "ldsp") {
    return LOCKED_FACADE_THICKNESS_MM.ldsp;
  }
  if (materialKind === "mdf") {
    return LOCKED_FACADE_THICKNESS_MM.mdf;
  }
  return null;
}

export function classifyFacadePanelV4(
  panel: PanelV4,
  materials?: MaterialV4[],
): FacadePanelClassificationV4 | null {
  if (!FACADE_CLASS_ROLES.has(panel.role)) {
    return null;
  }

  const materialKind = resolveFacadeMaterialKind(panel, materials);
  const expectedThicknessMm = getExpectedFacadeThickness(materialKind);
  const materialCompatible =
    expectedThicknessMm != null && isApproximatelyEqual(panel.thicknessMm, expectedThicknessMm);

  return {
    roleClass: panel.role === "drawer-front" ? "drawer-front" : "facade",
    isFacadeClass: true,
    materialKind,
    expectedThicknessMm: expectedThicknessMm ?? panel.thicknessMm,
    materialCompatible,
  };
}

function getHardwareForFacade(panelId: string, hardware: HardwareV4[]): HardwareV4[] {
  return hardware.filter((item) => item.facadePanelId === panelId);
}

function inferDoorType(hardware: HardwareV4[]): FacadeDoorTypeV4 | undefined {
  const hinge = hardware.find((item) => item.type === "hinge" && item.doorType);
  return hinge?.doorType;
}

function inferOpeningMode(hardware: HardwareV4[]): FacadeOpeningModeV4 | undefined {
  if (hardware.some((item) => item.type === "push-to-open")) {
    return "push-to-open";
  }
  if (hardware.some((item) => item.type === "handle")) {
    return "regular-handle";
  }
  if (hardware.some((item) => item.type === "hinge")) {
    return "no-handle";
  }
  return undefined;
}

function inferOpeningType(
  panel: PanelV4,
  facadeDoors: PanelV4[],
): FacadeOpeningTypeV4 | undefined {
  if (panel.role === "drawer-front") {
    return "drawer-front";
  }

  if (facadeDoors.length <= 1) {
    return "single";
  }

  const sorted = [...facadeDoors].sort((left, right) => {
    const leftX = left.position?.xMm ?? 0;
    const rightX = right.position?.xMm ?? 0;
    if (leftX !== rightX) {
      return leftX - rightX;
    }
    return left.id.localeCompare(right.id);
  });

  if (sorted[0]?.id === panel.id) {
    return "paired-left";
  }
  if (sorted[sorted.length - 1]?.id === panel.id) {
    return "paired-right";
  }

  return undefined;
}

function resolveCalculatedSize(
  _panel: PanelV4,
  openingType: FacadeOpeningTypeV4 | undefined,
  model: ProductionJsonV4,
): FacadeSizeV4 | undefined {
  const snapshotOpening = model.assemblyPolicySnapshot?.facadeOpening;
  if (snapshotOpening) {
    if (openingType === "single" || openingType === "drawer-front") {
      return {
        widthMm: snapshotOpening.doorWidthMm,
        heightMm: snapshotOpening.doorHeightMm,
      };
    }
    if (openingType === "paired-left" || openingType === "paired-right") {
      return {
        widthMm: snapshotOpening.doorWidthMm,
        heightMm: snapshotOpening.doorHeightMm,
      };
    }
  }

  if (openingType === "single" || openingType === "drawer-front") {
    return calculateSingleFacadeSizeV4({
      widthMm: model.product.widthMm,
      heightMm: model.product.heightMm,
    });
  }

  if (openingType === "paired-left" || openingType === "paired-right") {
    return calculatePairedFacadeSizeV4({
      widthMm: model.product.widthMm,
      heightMm: model.product.heightMm,
    });
  }

  return undefined;
}

function buildFacadeSemantics(panel: PanelV4, model: ProductionJsonV4): {
  semantics: FacadeSemanticProjectionV4;
  warnings: ValidationIssueV4[];
} {
  const warnings: ValidationIssueV4[] = [];
  const classification = classifyFacadePanelV4(panel, model.materials);
  if (!classification) {
    throw new Error(`Panel ${panel.id} is not facade-class`);
  }

  const gapPolicy = getFacadeGapPolicyV4();
  const facadeDoors = model.panels.filter((item) => item.role === "facade-door");
  const linkedHardware = getHardwareForFacade(panel.id, model.hardware);
  const openingType = inferOpeningType(panel, facadeDoors);
  const doorType = inferDoorType(linkedHardware);
  const openingMode = inferOpeningMode(linkedHardware);
  const calculatedSize = resolveCalculatedSize(panel, openingType, model);

  if (!openingType) {
    warnings.push(
      policyWarning(
        "facadePolicy.openingType.unknown",
        `Facade panel ${panel.id} opening type could not be inferred`,
        `panels.${panel.id}.facadeSemantics.openingType`,
      ),
    );
  }

  if (!doorType && linkedHardware.some((item) => item.type === "hinge")) {
    warnings.push(
      policyWarning(
        "facadePolicy.doorType.unknown",
        `Facade panel ${panel.id} door type could not be inferred from hinge metadata`,
        `panels.${panel.id}.facadeSemantics.doorType`,
      ),
    );
  }

  if (doorType && !KNOWN_DOOR_TYPES.has(doorType)) {
    warnings.push(
      policyWarning(
        "facadePolicy.doorType.unsupported",
        `Facade panel ${panel.id} has unsupported door type ${doorType}`,
        `panels.${panel.id}.facadeSemantics.doorType`,
      ),
    );
  }

  if (!openingMode) {
    warnings.push(
      policyWarning(
        "facadePolicy.openingMode.unknown",
        `Facade panel ${panel.id} opening mode could not be inferred from hardware`,
        `panels.${panel.id}.facadeSemantics.openingMode`,
      ),
    );
  }

  return {
    semantics: {
      roleClass: classification.roleClass,
      gapPolicy,
      openingType,
      doorType,
      openingMode,
      expectedThicknessMm: classification.expectedThicknessMm,
      materialKind: classification.materialKind,
      materialCompatible: classification.materialCompatible,
      calculatedWidthMm: calculatedSize?.widthMm,
      calculatedHeightMm: calculatedSize?.heightMm,
    },
    warnings,
  };
}

function validateFacadePanelGaps(panel: PanelV4, pairedDoorCount: number): ProductionJsonV4ValidationIssue[] {
  const errors: ProductionJsonV4ValidationIssue[] = [];
  const gap = getFacadeGapPolicyV4();

  if (!panel.facadeGaps) {
    errors.push(
      policyIssue(
        "facadePolicy.gaps.missing",
        `Facade panel ${panel.id} must declare facadeGaps`,
        `panels.${panel.id}.facadeGaps`,
      ),
    );
    return errors;
  }

  for (const side of ["topMm", "rightMm", "bottomMm", "leftMm"] as const) {
    if (!isApproximatelyEqual(panel.facadeGaps[side], gap.sideGapMm)) {
      errors.push(
        policyIssue(
          "facadePolicy.gap.invalid",
          `Facade panel ${panel.id} ${side} must be ${gap.sideGapMm} mm`,
          `panels.${panel.id}.facadeGaps.${side}`,
        ),
      );
    }
  }

  if (pairedDoorCount >= 2 && panel.pairedFacadeCenterGapMm != null) {
    if (!isApproximatelyEqual(panel.pairedFacadeCenterGapMm, gap.pairedCenterGapMm)) {
      errors.push(
        policyIssue(
          "facadePolicy.pairedCenterGap.invalid",
          `Facade panel ${panel.id} paired center gap must be ${gap.pairedCenterGapMm} mm`,
          `panels.${panel.id}.pairedFacadeCenterGapMm`,
        ),
      );
    }
  }

  return errors;
}

function hasPushToOpenHardware(panelId: string, hardware: HardwareV4[]): boolean {
  return hardware.some((item) => item.facadePanelId === panelId && item.type === "push-to-open");
}

export function validateFacadePolicyV4(model: ProductionJsonV4): ValidationResult {
  const errors: ProductionJsonV4ValidationIssue[] = [];
  const facadePanels = model.panels.filter((panel) => FACADE_CLASS_ROLES.has(panel.role));
  const facadeDoors = model.panels.filter((panel) => panel.role === "facade-door");

  for (const panel of facadePanels) {
    const classification = classifyFacadePanelV4(panel, model.materials);
    if (!classification?.isFacadeClass) {
      errors.push(
        policyIssue(
          "facadePolicy.panel.notFacadeClass",
          `Panel ${panel.id} must be treated as facade-class`,
          `panels.${panel.id}.role`,
        ),
      );
      continue;
    }

    if (!panel.facadeSemantics) {
      errors.push(
        policyIssue(
          "facadePolicy.semantics.missing",
          `Facade panel ${panel.id} is missing facade semantics`,
          `panels.${panel.id}.facadeSemantics`,
        ),
      );
      continue;
    }

    if (panel.role === "drawer-front" && panel.facadeSemantics.roleClass !== "drawer-front") {
      errors.push(
        policyIssue(
          "facadePolicy.drawerFront.notFacadeClass",
          `Drawer-front panel ${panel.id} must use facade-class semantics`,
          `panels.${panel.id}.facadeSemantics.roleClass`,
        ),
      );
    }

    errors.push(...validateFacadePanelGaps(panel, facadeDoors.length));

    if (classification.materialKind === "ldsp" && !isApproximatelyEqual(panel.thicknessMm, LOCKED_FACADE_THICKNESS_MM.ldsp)) {
      errors.push(
        policyIssue(
          "facadePolicy.thickness.ldsp.invalid",
          `Facade LDSP panel ${panel.id} must be ${LOCKED_FACADE_THICKNESS_MM.ldsp} mm`,
          `panels.${panel.id}.thicknessMm`,
        ),
      );
    }

    if (classification.materialKind === "mdf" && !isApproximatelyEqual(panel.thicknessMm, LOCKED_FACADE_THICKNESS_MM.mdf)) {
      errors.push(
        policyIssue(
          "facadePolicy.thickness.mdf.invalid",
          `Facade MDF panel ${panel.id} must be ${LOCKED_FACADE_THICKNESS_MM.mdf} mm`,
          `panels.${panel.id}.thicknessMm`,
        ),
      );
    }

    const semantics = panel.facadeSemantics;
    if (semantics.openingType && !KNOWN_OPENING_TYPES.has(semantics.openingType)) {
      errors.push(
        policyIssue(
          "facadePolicy.openingType.unsupported",
          `Facade panel ${panel.id} has unsupported opening type ${semantics.openingType}`,
          `panels.${panel.id}.facadeSemantics.openingType`,
        ),
      );
    }

    if (semantics.doorType && !KNOWN_DOOR_TYPES.has(semantics.doorType)) {
      errors.push(
        policyIssue(
          "facadePolicy.doorType.unsupported",
          `Facade panel ${panel.id} has unsupported door type ${semantics.doorType}`,
          `panels.${panel.id}.facadeSemantics.doorType`,
        ),
      );
    }

    if (semantics.openingMode && !KNOWN_OPENING_MODES.has(semantics.openingMode)) {
      errors.push(
        policyIssue(
          "facadePolicy.openingMode.unsupported",
          `Facade panel ${panel.id} has unsupported opening mode ${semantics.openingMode}`,
          `panels.${panel.id}.facadeSemantics.openingMode`,
        ),
      );
    }

    if (semantics.openingMode === "push-to-open" && !hasPushToOpenHardware(panel.id, model.hardware)) {
      errors.push(
        policyIssue(
          "facadePolicy.pushToOpen.hardware.missing",
          `Facade panel ${panel.id} uses push-to-open mode without push-to-open hardware`,
          `panels.${panel.id}.facadeSemantics.openingMode`,
        ),
      );
    }

    const widthMm = semantics.calculatedWidthMm ?? panel.dimensions.widthMm;
    const heightMm = semantics.calculatedHeightMm ?? panel.dimensions.heightMm;
    if (widthMm <= 0 || heightMm <= 0) {
      errors.push(
        policyIssue(
          "facadePolicy.size.invalid",
          `Facade panel ${panel.id} calculated size must be greater than zero`,
          `panels.${panel.id}.facadeSemantics`,
        ),
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function enrichFacadeSemanticsV4(model: ProductionJsonV4): ProductionJsonV4 {
  const next = structuredClone(model);
  const warnings: ValidationIssueV4[] = [];

  for (const panel of next.panels) {
    if (!FACADE_CLASS_ROLES.has(panel.role)) {
      continue;
    }

    const { semantics, warnings: panelWarnings } = buildFacadeSemantics(panel, next);
    panel.facadeSemantics = semantics;
    warnings.push(...panelWarnings);
  }

  if (warnings.length > 0) {
    next.validation = {
      ...next.validation,
      warnings: [...next.validation.warnings, ...warnings],
    };
  }

  return next;
}
