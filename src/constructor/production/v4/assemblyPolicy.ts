import type {
  AssemblyPolicySnapshotV4,
  BodyConstructionV4,
  PanelV4,
  ProductionJsonV4,
  ProductionJsonV4ValidationIssue,
  SupportModeV4,
  SupportV4,
  TopPanelPlacementV4,
  ValidationResult,
} from "./types.js";

export const LOCKED_BODY_CONSTRUCTION: BodyConstructionV4 = "side-panels-on-bottom";
export const LOCKED_TOP_PANEL_PLACEMENT: TopPanelPlacementV4 = "between-sides";
export const LOCKED_SHELF_FRONT_INSET_MM = 30;
export const LOCKED_FACADE_GAP_MM = 1.5;
export const LOCKED_PAIRED_FACADE_CENTER_GAP_MM = 3;

export const LOCKED_SUPPORT_HEIGHT_MM: Record<SupportModeV4, number | null> = {
  "no-support-on-bottom": 0,
  "adjustable-leg-60": 60,
  "adjustable-leg-100": 100,
  "metal-spiked-adjustable-support": null,
};

export interface AssemblyPolicyDefaultsV4 {
  bodyConstruction: BodyConstructionV4;
  topPanelPlacement: TopPanelPlacementV4;
  shelfFrontInsetMm: typeof LOCKED_SHELF_FRONT_INSET_MM;
  facadeGapMm: typeof LOCKED_FACADE_GAP_MM;
  pairedFacadeCenterGapMm: typeof LOCKED_PAIRED_FACADE_CENTER_GAP_MM;
  pairedFacadeSideGapMm: typeof LOCKED_FACADE_GAP_MM;
  heightIncludesSupportMm: true;
}

export interface FacadeOpeningInputV4 {
  openingWidthMm: number;
  openingHeightMm: number;
  facadeGapMm?: number;
  doorCount?: number;
  pairedFacadeCenterGapMm?: number;
}

export interface FacadeOpeningV4 {
  openingWidthMm: number;
  openingHeightMm: number;
  doorWidthMm: number;
  doorHeightMm: number;
  sideGapMm: number;
  centerGapMm: number;
  topGapMm: number;
  bottomGapMm: number;
}

function policyIssue(code: string, message: string, path?: string): ProductionJsonV4ValidationIssue {
  return { code, message, path };
}

export function createAssemblyPolicyDefaults(): AssemblyPolicyDefaultsV4 {
  return {
    bodyConstruction: LOCKED_BODY_CONSTRUCTION,
    topPanelPlacement: LOCKED_TOP_PANEL_PLACEMENT,
    shelfFrontInsetMm: LOCKED_SHELF_FRONT_INSET_MM,
    facadeGapMm: LOCKED_FACADE_GAP_MM,
    pairedFacadeCenterGapMm: LOCKED_PAIRED_FACADE_CENTER_GAP_MM,
    pairedFacadeSideGapMm: LOCKED_FACADE_GAP_MM,
    heightIncludesSupportMm: true,
  };
}

export function calculateCarcassHeight(customerHeightMm: number, supportHeightMm: number): number {
  return customerHeightMm - supportHeightMm;
}

export function calculateShelfInset(): number {
  return LOCKED_SHELF_FRONT_INSET_MM;
}

export function calculateFacadeOpening(input: FacadeOpeningInputV4): FacadeOpeningV4 {
  const sideGapMm = input.facadeGapMm ?? LOCKED_FACADE_GAP_MM;
  const centerGapMm = input.pairedFacadeCenterGapMm ?? LOCKED_PAIRED_FACADE_CENTER_GAP_MM;
  const doorCount = Math.max(1, input.doorCount ?? 1);
  const doorHeightMm = input.openingHeightMm - sideGapMm * 2;

  let doorWidthMm: number;
  if (doorCount <= 1) {
    doorWidthMm = input.openingWidthMm - sideGapMm * 2;
  } else {
    doorWidthMm = (input.openingWidthMm - sideGapMm * 2 - centerGapMm) / doorCount;
  }

  return {
    openingWidthMm: input.openingWidthMm,
    openingHeightMm: input.openingHeightMm,
    doorWidthMm,
    doorHeightMm,
    sideGapMm,
    centerGapMm: doorCount > 1 ? centerGapMm : 0,
    topGapMm: sideGapMm,
    bottomGapMm: sideGapMm,
  };
}

export function resolvePrimarySupport(supports: SupportV4[]): SupportV4 | undefined {
  const geometric = supports.filter((support) => support.affectsBodyGeometry);
  if (geometric.length === 0) {
    return supports[0];
  }

  return geometric.reduce((primary, support) =>
    support.heightMm > primary.heightMm ? support : primary,
  );
}

export function resolveSupportHeightMm(supports: SupportV4[]): { mode: SupportModeV4; heightMm: number } {
  const primary = resolvePrimarySupport(supports);
  if (!primary) {
    return { mode: "no-support-on-bottom", heightMm: 0 };
  }

  return { mode: primary.mode, heightMm: primary.heightMm };
}

function isApproximatelyEqual(left: number, right: number, toleranceMm = 0.1): boolean {
  return Math.abs(left - right) <= toleranceMm;
}

function validateSupportHeight(mode: SupportModeV4, heightMm: number): ProductionJsonV4ValidationIssue | null {
  const lockedHeight = LOCKED_SUPPORT_HEIGHT_MM[mode];
  if (lockedHeight != null) {
    if (!isApproximatelyEqual(heightMm, lockedHeight)) {
      return policyIssue(
        "assemblyPolicy.support.height.invalid",
        `Support mode ${mode} requires height ${lockedHeight} mm, got ${heightMm} mm`,
        "supports",
      );
    }
    return null;
  }

  if (heightMm <= 0) {
    return policyIssue(
      "assemblyPolicy.support.height.invalid",
      `Support mode ${mode} requires positive heightMm`,
      "supports",
    );
  }

  return null;
}

function validateFacadePanelGaps(panel: PanelV4, pairedDoorCount: number): ProductionJsonV4ValidationIssue[] {
  const errors: ProductionJsonV4ValidationIssue[] = [];

  if (!panel.facadeGaps) {
    return errors;
  }

  for (const side of ["topMm", "rightMm", "bottomMm", "leftMm"] as const) {
    if (!isApproximatelyEqual(panel.facadeGaps[side], LOCKED_FACADE_GAP_MM)) {
      errors.push(
        policyIssue(
          "assemblyPolicy.facadeGap.invalid",
          `Facade panel ${panel.id} ${side} must be ${LOCKED_FACADE_GAP_MM} mm`,
          `panels.${panel.id}.facadeGaps.${side}`,
        ),
      );
    }
  }

  if (pairedDoorCount >= 2 && panel.pairedFacadeCenterGapMm != null) {
    if (!isApproximatelyEqual(panel.pairedFacadeCenterGapMm, LOCKED_PAIRED_FACADE_CENTER_GAP_MM)) {
      errors.push(
        policyIssue(
          "assemblyPolicy.pairedFacadeCenterGap.invalid",
          `Facade panel ${panel.id} paired center gap must be ${LOCKED_PAIRED_FACADE_CENTER_GAP_MM} mm`,
          `panels.${panel.id}.pairedFacadeCenterGapMm`,
        ),
      );
    }
  }

  return errors;
}

function validateShelfInsets(panels: PanelV4[]): ProductionJsonV4ValidationIssue[] {
  const errors: ProductionJsonV4ValidationIssue[] = [];

  for (const panel of panels) {
    if (panel.role !== "shelf") {
      continue;
    }
    if (panel.frontInsetMm == null) {
      continue;
    }
    if (!isApproximatelyEqual(panel.frontInsetMm, LOCKED_SHELF_FRONT_INSET_MM)) {
      errors.push(
        policyIssue(
          "assemblyPolicy.shelfInset.invalid",
          `Shelf panel ${panel.id} frontInsetMm must be ${LOCKED_SHELF_FRONT_INSET_MM} mm`,
          `panels.${panel.id}.frontInsetMm`,
        ),
      );
    }
  }

  return errors;
}

function validateBodyAssemblyContacts(model: ProductionJsonV4): ProductionJsonV4ValidationIssue[] {
  const errors: ProductionJsonV4ValidationIssue[] = [];
  const bodyAssembly = model.assemblies.find((assembly) => assembly.role === "body");
  if (!bodyAssembly) {
    return errors;
  }

  const sideLeft = model.panels.find((panel) => panel.role === "side-left")?.id;
  const bottom = model.panels.find((panel) => panel.role === "bottom")?.id;
  const top = model.panels.find((panel) => panel.role === "top")?.id;

  const hasSideOnBottom =
    sideLeft &&
    bottom &&
    bodyAssembly.contacts.some(
      (contact) =>
        contact.panelId === sideLeft &&
        contact.restsOnPanelId === bottom &&
        contact.contactType === "vertical-panel-on-horizontal-panel",
    );

  if (sideLeft && bottom && !hasSideOnBottom) {
    errors.push(
      policyIssue(
        "assemblyPolicy.bodyConstruction.sideOnBottom.missing",
        "Body assembly must include side-panels-on-bottom contact",
        "assemblies.assembly-body.contacts",
      ),
    );
  }

  const hasTopBetweenSides =
    top &&
    sideLeft &&
    bodyAssembly.contacts.some(
      (contact) =>
        contact.panelId === top &&
        contact.restsOnPanelId === sideLeft &&
        contact.fasteningDirection === "from-side",
    );

  if (top && sideLeft && !hasTopBetweenSides) {
    errors.push(
      policyIssue(
        "assemblyPolicy.topPanelPlacement.betweenSides.missing",
        "Body assembly must include top-panel-between-sides contact",
        "assemblies.assembly-body.contacts",
      ),
    );
  }

  return errors;
}

export function buildAssemblyPolicySnapshot(model: ProductionJsonV4): AssemblyPolicySnapshotV4 {
  const { mode, heightMm } = resolveSupportHeightMm(model.supports);
  const customerHeightMm = model.product.heightMm;
  const carcassHeightMm = calculateCarcassHeight(customerHeightMm, heightMm);
  const facadeDoors = model.panels.filter((panel) => panel.role === "facade-door");

  const snapshot: AssemblyPolicySnapshotV4 = {
    bodyConstruction: model.rules.bodyConstruction,
    topPanelPlacement: model.rules.topPanelPlacement,
    supportMode: mode,
    supportHeightMm: heightMm,
    customerHeightMm,
    carcassHeightMm,
    heightIncludesSupportMm: model.product.heightIncludesSupportMm,
    shelfFrontInsetMm: model.rules.shelfFrontInsetMm,
    facadeGapMm: model.rules.facadeGapMm,
    pairedFacadeCenterGapMm: model.rules.pairedFacadePolicy.centerGapMm,
  };

  if (facadeDoors.length > 0) {
    const opening = calculateFacadeOpening({
      openingWidthMm: model.product.widthMm,
      openingHeightMm: carcassHeightMm,
      facadeGapMm: model.rules.facadeGapMm,
      doorCount: facadeDoors.length,
      pairedFacadeCenterGapMm: model.rules.pairedFacadePolicy.centerGapMm,
    });
    snapshot.facadeOpening = {
      openingWidthMm: opening.openingWidthMm,
      openingHeightMm: opening.openingHeightMm,
      doorWidthMm: opening.doorWidthMm,
      doorHeightMm: opening.doorHeightMm,
      sideGapMm: opening.sideGapMm,
      centerGapMm: opening.centerGapMm,
    };
  }

  return snapshot;
}

export function validateAssemblyPolicy(model: ProductionJsonV4): ValidationResult {
  const errors: ProductionJsonV4ValidationIssue[] = [];
  const defaults = createAssemblyPolicyDefaults();
  const { mode, heightMm } = resolveSupportHeightMm(model.supports);
  const carcassHeightMm = calculateCarcassHeight(model.product.heightMm, heightMm);
  const facadeDoors = model.panels.filter((panel) => panel.role === "facade-door");

  if (model.rules.bodyConstruction !== defaults.bodyConstruction) {
    errors.push(
      policyIssue(
        "assemblyPolicy.bodyConstruction.invalid",
        `bodyConstruction must be ${defaults.bodyConstruction}`,
        "rules.bodyConstruction",
      ),
    );
  }

  if (model.rules.topPanelPlacement !== defaults.topPanelPlacement) {
    errors.push(
      policyIssue(
        "assemblyPolicy.topPanelPlacement.invalid",
        `topPanelPlacement must be ${defaults.topPanelPlacement}`,
        "rules.topPanelPlacement",
      ),
    );
  }

  if (!isApproximatelyEqual(model.rules.shelfFrontInsetMm, defaults.shelfFrontInsetMm)) {
    errors.push(
      policyIssue(
        "assemblyPolicy.shelfInset.invalid",
        `shelfFrontInsetMm must be ${defaults.shelfFrontInsetMm} mm`,
        "rules.shelfFrontInsetMm",
      ),
    );
  }

  if (!isApproximatelyEqual(model.rules.facadeGapMm, defaults.facadeGapMm)) {
    errors.push(
      policyIssue(
        "assemblyPolicy.facadeGap.invalid",
        `facadeGapMm must be ${defaults.facadeGapMm} mm`,
        "rules.facadeGapMm",
      ),
    );
  }

  if (!isApproximatelyEqual(model.rules.pairedFacadePolicy.centerGapMm, defaults.pairedFacadeCenterGapMm)) {
    errors.push(
      policyIssue(
        "assemblyPolicy.pairedFacadeCenterGap.invalid",
        `paired facade center gap must be ${defaults.pairedFacadeCenterGapMm} mm`,
        "rules.pairedFacadePolicy.centerGapMm",
      ),
    );
  }

  if (!isApproximatelyEqual(model.rules.pairedFacadePolicy.sideGapMm, defaults.pairedFacadeSideGapMm)) {
    errors.push(
      policyIssue(
        "assemblyPolicy.facadeGap.invalid",
        `paired facade side gap must be ${defaults.pairedFacadeSideGapMm} mm`,
        "rules.pairedFacadePolicy.sideGapMm",
      ),
    );
  }

  if (heightMm > model.product.heightMm) {
    errors.push(
      policyIssue(
        "assemblyPolicy.support.height.exceedsTotal",
        `Support height ${heightMm} mm exceeds customer height ${model.product.heightMm} mm`,
        "supports",
      ),
    );
  }

  const supportHeightError = validateSupportHeight(mode, heightMm);
  if (supportHeightError) {
    errors.push(supportHeightError);
  }

  if (carcassHeightMm < 0) {
    errors.push(
      policyIssue(
        "assemblyPolicy.carcass.height.exceedsTotal",
        `Carcass height exceeds total customer height (${model.product.heightMm} mm - ${heightMm} mm)`,
        "product.heightMm",
      ),
    );
  }

  if (heightMm > 0 && !model.product.heightIncludesSupportMm) {
    errors.push(
      policyIssue(
        "assemblyPolicy.heightIncludesSupport.invalid",
        "Customer height must include support height when support affects geometry",
        "product.heightIncludesSupportMm",
      ),
    );
  }

  const sidePanel = model.panels.find((panel) => panel.role === "side-left");
  if (sidePanel && sidePanel.dimensions.heightMm > carcassHeightMm + 0.1) {
    errors.push(
      policyIssue(
        "assemblyPolicy.carcass.height.exceedsTotal",
        `Side panel height ${sidePanel.dimensions.heightMm} mm exceeds carcass height ${carcassHeightMm} mm`,
        `panels.${sidePanel.id}.dimensions.heightMm`,
      ),
    );
  }

  errors.push(...validateShelfInsets(model.panels));
  errors.push(...validateBodyAssemblyContacts(model));

  for (const panel of facadeDoors) {
    errors.push(...validateFacadePanelGaps(panel, facadeDoors.length));
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
