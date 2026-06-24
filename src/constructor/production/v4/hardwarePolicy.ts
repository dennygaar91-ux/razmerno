import type {
  ConcealedSlideSemanticBaselineV4,
  HardwareClassificationV4,
  HardwareSemanticProjectionV4,
  HardwareTypeV4,
  HardwareV4,
  HingeSemanticBaselineV4,
  PanelV4,
  ProductionJsonV4,
  ProductionJsonV4ValidationIssue,
  SupportModeV4,
  ValidationIssueV4,
  ValidationResult,
} from "./types.js";

const KNOWN_HARDWARE_TYPES = new Set<HardwareTypeV4>([
  "hinge",
  "concealed-slide",
  "reinforced-shelf-support",
  "rod-holder",
  "handle",
  "push-to-open",
  "adjustable-leg",
  "metal-spiked-adjustable-support",
  "confirmat",
]);

const HINGE_BASELINE: HingeSemanticBaselineV4 = {
  openingAngleDeg: 105,
  cupDiameterMm: 35,
  minCupDepthMm: 12,
  facadeThicknessRangeMm: { min: 14, max: 24 },
};

const SLIDE_BASELINE: ConcealedSlideSemanticBaselineV4 = {
  mounting: "concealed-full-extension",
  drawerWidthFormula: "SKW = LW - 42",
  standardBoxDepthFormula: "LT = NL + 5",
  maxBoardThicknessMm: 16,
  availableLengthsMm: [250, 300, 350, 400, 450, 500, 550, 600],
};

const DRAWER_BOX_ROLES = new Set<PanelV4["role"]>([
  "drawer-side-left",
  "drawer-side-right",
  "drawer-back",
  "drawer-bottom",
  "drawer-front",
]);

const MOUNTING_REQUIRED_TYPES = new Set<HardwareTypeV4>([
  "hinge",
  "concealed-slide",
  "reinforced-shelf-support",
  "rod-holder",
  "handle",
  "adjustable-leg",
  "metal-spiked-adjustable-support",
]);

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

export function classifyHardwareTypeV4(hardware: Pick<HardwareV4, "type">): HardwareClassificationV4 {
  if (hardware.type === "confirmat") {
    return "fastener-placeholder";
  }
  return hardware.type;
}

function resolveSkuStatus(hardware: HardwareV4, semantics?: HardwareSemanticProjectionV4): HardwareSemanticProjectionV4["skuStatus"] {
  if (semantics?.skuStatus === "final") {
    return "final";
  }
  if (hardware.sku || hardware.article) {
    return "not-final";
  }
  return "not-final";
}

export function getExpectedHardwareSemanticsV4(hardware: HardwareV4): HardwareSemanticProjectionV4 {
  const classification = classifyHardwareTypeV4(hardware);
  const base: HardwareSemanticProjectionV4 = {
    semanticType: hardware.type,
    classification,
    skuStatus: "not-final",
    drillingTemplateStatus: "not-final",
    requiresSkuMapping: false,
    requiresTechnologistCheck: true,
    supplierFamily: hardware.supplier,
    seriesFamily: hardware.series,
  };

  switch (hardware.type) {
    case "hinge":
      return {
        ...base,
        requiresSkuMapping: true,
        supplierFamily: hardware.supplier ?? "Firmax",
        seriesFamily: hardware.series ?? "Smartline",
        hingeBaseline: HINGE_BASELINE,
      };
    case "concealed-slide":
      return {
        ...base,
        requiresSkuMapping: true,
        supplierFamily: hardware.supplier ?? "Firmax",
        slideBaseline: SLIDE_BASELINE,
      };
    case "reinforced-shelf-support":
      return {
        ...base,
        requiresSkuMapping: true,
      };
    case "adjustable-leg":
    case "metal-spiked-adjustable-support":
      return {
        ...base,
        requiresSkuMapping: true,
      };
    case "confirmat":
      return {
        ...base,
        classification: "fastener-placeholder",
        requiresSkuMapping: false,
      };
    default:
      return base;
  }
}

function normalizeHardwareFields(hardware: HardwareV4): void {
  if (hardware.type === "hinge") {
    if (hardware.openingAngleDeg == null) {
      hardware.openingAngleDeg = HINGE_BASELINE.openingAngleDeg;
    }
    if (hardware.cupDiameterMm == null) {
      hardware.cupDiameterMm = HINGE_BASELINE.cupDiameterMm;
    }
    if (hardware.minCupDepthMm == null) {
      hardware.minCupDepthMm = HINGE_BASELINE.minCupDepthMm;
    }
    if (!hardware.supplier) {
      hardware.supplier = "Firmax";
    }
    if (!hardware.series) {
      hardware.series = "Smartline";
    }
  }

  if (hardware.type === "concealed-slide" && !hardware.supplier) {
    hardware.supplier = "Firmax";
  }

  hardware.requiresTechnologistCheck = true;
}

function buildHardwareSemantics(hardware: HardwareV4): {
  semantics: HardwareSemanticProjectionV4;
  warnings: ValidationIssueV4[];
} {
  const warnings: ValidationIssueV4[] = [];
  const expected = getExpectedHardwareSemanticsV4(hardware);
  const skuStatus = resolveSkuStatus(hardware, hardware.semantics);

  if (!KNOWN_HARDWARE_TYPES.has(hardware.type)) {
    warnings.push(
      policyWarning(
        "hardwarePolicy.type.unknown",
        `Hardware ${hardware.id} has unknown semantic type ${hardware.type}`,
        `hardware.${hardware.id}.type`,
      ),
    );
  }

  if (MOUNTING_REQUIRED_TYPES.has(hardware.type) && !hardware.mountingPanelId) {
    warnings.push(
      policyWarning(
        "hardwarePolicy.mountingPanelId.missing",
        `Hardware ${hardware.id} is missing mountingPanelId`,
        `hardware.${hardware.id}.mountingPanelId`,
      ),
    );
  }

  if (expected.requiresSkuMapping) {
    warnings.push(
      policyWarning(
        "hardwarePolicy.sku.notFinal",
        `Hardware ${hardware.id} SKU mapping is not final`,
        `hardware.${hardware.id}.semantics.skuStatus`,
      ),
    );
  }

  warnings.push(
    policyWarning(
      "hardwarePolicy.drillingTemplate.notFinal",
      `Hardware ${hardware.id} drilling template is not final`,
      `hardware.${hardware.id}.semantics.drillingTemplateStatus`,
    ),
  );

  if (hardware.requiresTechnologistCheck) {
    warnings.push(
      policyWarning(
        "hardwarePolicy.technologistCheck.required",
        `Hardware ${hardware.id} requires technologist check`,
        `hardware.${hardware.id}.requiresTechnologistCheck`,
      ),
    );
  }

  return {
    semantics: {
      ...expected,
      skuStatus,
      drillingTemplateStatus: "not-final",
    },
    warnings,
  };
}

function resolvePrimarySupportMode(supports: ProductionJsonV4["supports"]): SupportModeV4 {
  const primary = supports.find((support) => support.affectsBodyGeometry) ?? supports[0];
  return primary?.mode ?? "no-support-on-bottom";
}

function validateSupportHardwareConsistency(
  hardware: HardwareV4[],
  supports: ProductionJsonV4["supports"],
): ProductionJsonV4ValidationIssue[] {
  const errors: ProductionJsonV4ValidationIssue[] = [];
  const supportMode = resolvePrimarySupportMode(supports);
  const legHardware = hardware.filter(
    (item) => item.type === "adjustable-leg" || item.type === "metal-spiked-adjustable-support",
  );

  if (supportMode === "no-support-on-bottom" && legHardware.length > 0) {
    errors.push(
      policyIssue(
        "hardwarePolicy.support.inconsistent",
        "Support hardware must not be present when model uses no-support-on-bottom",
        "hardware",
      ),
    );
  }

  if (
    (supportMode === "adjustable-leg-60" || supportMode === "adjustable-leg-100") &&
    legHardware.some((item) => item.type === "metal-spiked-adjustable-support")
  ) {
    errors.push(
      policyIssue(
        "hardwarePolicy.support.inconsistent",
        "Metal support hardware is inconsistent with adjustable-leg support mode",
        "hardware",
      ),
    );
  }

  if (supportMode === "metal-spiked-adjustable-support" && legHardware.some((item) => item.type === "adjustable-leg")) {
    errors.push(
      policyIssue(
        "hardwarePolicy.support.inconsistent",
        "Adjustable-leg hardware is inconsistent with metal-spiked support mode",
        "hardware",
      ),
    );
  }

  return errors;
}

export function enrichHardwareSemanticsV4(model: ProductionJsonV4): ProductionJsonV4 {
  const next = structuredClone(model);
  const warnings: ValidationIssueV4[] = [];

  for (const hardware of next.hardware) {
    normalizeHardwareFields(hardware);
    const { semantics, warnings: itemWarnings } = buildHardwareSemantics(hardware);
    hardware.semantics = semantics;
    warnings.push(...itemWarnings);
  }

  if (warnings.length > 0) {
    next.validation = {
      ...next.validation,
      warnings: [...next.validation.warnings, ...warnings],
    };
  }

  return next;
}

export function validateHardwarePolicyV4(model: ProductionJsonV4): ValidationResult {
  const errors: ProductionJsonV4ValidationIssue[] = [];
  const panelById = new Map(model.panels.map((panel) => [panel.id, panel]));
  const drawerAssembly = model.assemblies.find((assembly) => assembly.role === "drawer");
  const drawerPanels = model.panels.filter((panel) => DRAWER_BOX_ROLES.has(panel.role));
  const hasDrawerPanels = drawerPanels.length > 0;

  for (const hardware of model.hardware) {
    if (!KNOWN_HARDWARE_TYPES.has(hardware.type)) {
      errors.push(
        policyIssue(
          "hardwarePolicy.type.unknown",
          `Hardware ${hardware.id} has unknown type ${hardware.type}`,
          `hardware.${hardware.id}.type`,
        ),
      );
    }

    if (!hardware.semantics) {
      errors.push(
        policyIssue(
          "hardwarePolicy.semantics.missing",
          `Hardware ${hardware.id} is missing semantic projection`,
          `hardware.${hardware.id}.semantics`,
        ),
      );
      continue;
    }

    if (hardware.semantics.skuStatus === "final" && !hardware.sku && !hardware.article) {
      errors.push(
        policyIssue(
          "hardwarePolicy.sku.finalMissing",
          `Hardware ${hardware.id} has final skuStatus but no sku/article`,
          `hardware.${hardware.id}.sku`,
        ),
      );
    }

    if (hardware.type === "hinge") {
      if (!hardware.facadePanelId || !hardware.mountingPanelId) {
        errors.push(
          policyIssue(
            "hardwarePolicy.hinge.mounting.invalid",
            `Hinge ${hardware.id} must reference facadePanelId and mountingPanelId`,
            `hardware.${hardware.id}`,
          ),
        );
      }

      if (hardware.cupDiameterMm != null && !isApproximatelyEqual(hardware.cupDiameterMm, HINGE_BASELINE.cupDiameterMm)) {
        errors.push(
          policyIssue(
            "hardwarePolicy.hinge.cupDiameter.invalid",
            `Hinge ${hardware.id} cupDiameterMm must be ${HINGE_BASELINE.cupDiameterMm}`,
            `hardware.${hardware.id}.cupDiameterMm`,
          ),
        );
      }

      if (hardware.openingAngleDeg != null && !isApproximatelyEqual(hardware.openingAngleDeg, HINGE_BASELINE.openingAngleDeg)) {
        errors.push(
          policyIssue(
            "hardwarePolicy.hinge.openingAngle.invalid",
            `Hinge ${hardware.id} openingAngleDeg must be ${HINGE_BASELINE.openingAngleDeg}`,
            `hardware.${hardware.id}.openingAngleDeg`,
          ),
        );
      }

      if (hardware.facadePanelId) {
        const facade = panelById.get(hardware.facadePanelId);
        if (facade) {
          const { min, max } = HINGE_BASELINE.facadeThicknessRangeMm;
          if (facade.thicknessMm < min || facade.thicknessMm > max) {
            errors.push(
              policyIssue(
                "hardwarePolicy.hinge.facadeThickness.invalid",
                `Hinge ${hardware.id} linked facade thickness ${facade.thicknessMm} mm is outside ${min}-${max} mm`,
                `hardware.${hardware.id}.facadePanelId`,
              ),
            );
          }
        }
      }
    }

    if (hardware.type === "concealed-slide") {
      if (hasDrawerPanels) {
        if (!hardware.mountingPanelId) {
          errors.push(
            policyIssue(
              "hardwarePolicy.slide.mountingPanelId.missing",
              `Concealed slide ${hardware.id} must reference mountingPanelId when drawer panels exist`,
              `hardware.${hardware.id}.mountingPanelId`,
            ),
          );
        }
        if (!hardware.targetAssemblyId && !drawerAssembly) {
          errors.push(
            policyIssue(
              "hardwarePolicy.slide.targetAssembly.missing",
              `Concealed slide ${hardware.id} must reference drawer assembly when drawer panels exist`,
              `hardware.${hardware.id}.targetAssemblyId`,
            ),
          );
        }
      }

      const drawerSides = drawerPanels.filter((panel) =>
        panel.role === "drawer-side-left" || panel.role === "drawer-side-right",
      );
      if (drawerSides.some((panel) => panel.thicknessMm > SLIDE_BASELINE.maxBoardThicknessMm)) {
        errors.push(
          policyIssue(
            "hardwarePolicy.slide.drawerBoardThickness.invalid",
            `Drawer board thickness exceeds ${SLIDE_BASELINE.maxBoardThicknessMm} mm for concealed slide ${hardware.id}`,
            `hardware.${hardware.id}`,
          ),
        );
      }
    }

    if (hardware.type === "reinforced-shelf-support" && hardware.semantics.semanticType !== "reinforced-shelf-support") {
      errors.push(
        policyIssue(
          "hardwarePolicy.shelfSupport.semantic.invalid",
          `Shelf support ${hardware.id} must use reinforced-shelf-support semantics`,
          `hardware.${hardware.id}.semantics.semanticType`,
        ),
      );
    }
  }

  errors.push(...validateSupportHardwareConsistency(model.hardware, model.supports));

  return {
    ok: errors.length === 0,
    errors,
  };
}
