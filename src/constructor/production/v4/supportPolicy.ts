import {
  calculateCarcassHeight,
  LOCKED_SUPPORT_HEIGHT_MM,
  resolveSupportHeightMm,
} from "./assemblyPolicy.js";
import type {
  ProductionJsonV4,
  ProductionJsonV4ValidationIssue,
  SupportCountResultV4,
  SupportModeV4,
  SupportPlacementRulesV4,
  SupportPositionV4,
  SupportV4,
  ValidationIssueV4,
  ValidationResult,
} from "./types.js";

const KNOWN_SUPPORT_MODES = new Set<SupportModeV4>([
  "no-support-on-bottom",
  "adjustable-leg-60",
  "adjustable-leg-100",
  "metal-spiked-adjustable-support",
]);

const MAX_MATRIX_WIDTH_MM = 3600;
const POSITION_EDGE_MARGIN_MM = 16;

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

export function classifySupportTypeV4(support: Pick<SupportV4, "mode">): SupportModeV4 {
  return support.mode;
}

export function calculateRequiredSupportCountV4(widthMm: number): SupportCountResultV4 {
  if (widthMm > MAX_MATRIX_WIDTH_MM) {
    return {
      requiredCount: 8,
      widthExceedsMatrix: true,
      requiresTechnologistReview: true,
    };
  }
  if (widthMm <= 1200) {
    return {
      requiredCount: 4,
      widthExceedsMatrix: false,
      requiresTechnologistReview: false,
    };
  }
  if (widthMm <= 2400) {
    return {
      requiredCount: 6,
      widthExceedsMatrix: false,
      requiresTechnologistReview: false,
    };
  }
  return {
    requiredCount: 8,
    widthExceedsMatrix: false,
    requiresTechnologistReview: false,
  };
}

export function getSupportPlacementRulesV4(widthMm: number): SupportPlacementRulesV4 {
  const count = calculateRequiredSupportCountV4(widthMm);
  const perLine = count.requiredCount / 2;

  return {
    requiredCount: count.requiredCount,
    frontLineCount: perLine,
    rearLineCount: perLine,
    symmetric: true,
    widthExceedsMatrix: count.widthExceedsMatrix,
    requiresTechnologistReview: count.requiresTechnologistReview,
  };
}

function lineXPositions(widthMm: number, count: number): number[] {
  if (count <= 0) {
    return [];
  }
  if (count === 1) {
    return [widthMm / 2];
  }

  const margin = Math.min(POSITION_EDGE_MARGIN_MM, widthMm / 4);
  const span = widthMm - margin * 2;
  return Array.from({ length: count }, (_, index) => margin + (span * index) / (count - 1));
}

export function calculateSupportPositionsV4(input: {
  widthMm: number;
  depthMm: number;
  requiredCount?: number;
}): SupportPositionV4[] {
  const requiredCount = input.requiredCount ?? calculateRequiredSupportCountV4(input.widthMm).requiredCount;
  const perLine = requiredCount / 2;
  const frontX = lineXPositions(input.widthMm, perLine);
  const positions: SupportPositionV4[] = [];

  for (const [index, xMm] of frontX.entries()) {
    positions.push({
      line: "front",
      xMm,
      zMm: 0,
      index,
    });
    positions.push({
      line: "rear",
      xMm,
      zMm: input.depthMm,
      index,
    });
  }

  return positions;
}

function countActiveLegSupports(supports: SupportV4[]): number {
  return supports.filter(
    (support) =>
      support.hardwareRequired &&
      support.affectsBodyGeometry &&
      support.mode !== "no-support-on-bottom",
  ).length;
}

function validateSupportHeight(mode: SupportModeV4, heightMm: number): ProductionJsonV4ValidationIssue | null {
  const lockedHeight = LOCKED_SUPPORT_HEIGHT_MM[mode];
  if (lockedHeight != null) {
    if (!isApproximatelyEqual(heightMm, lockedHeight)) {
      return policyIssue(
        "supportPolicy.height.invalid",
        `Support mode ${mode} requires height ${lockedHeight} mm, got ${heightMm} mm`,
        "supports",
      );
    }
    return null;
  }

  if (mode === "metal-spiked-adjustable-support" && heightMm <= 0) {
    return policyIssue(
      "supportPolicy.height.invalid",
      `Support mode ${mode} requires positive heightMm`,
      "supports",
    );
  }

  return null;
}

function positionsAreSymmetric(positions: SupportPositionV4[]): boolean {
  const front = positions.filter((position) => position.line === "front").map((position) => position.xMm).sort((a, b) => a - b);
  const rear = positions.filter((position) => position.line === "rear").map((position) => position.xMm).sort((a, b) => a - b);
  if (front.length !== rear.length) {
    return false;
  }
  return front.every((xMm, index) => isApproximatelyEqual(xMm, rear[index]!));
}

function assignSupportPositions(
  supports: SupportV4[],
  positions: SupportPositionV4[],
): Map<string, SupportPositionV4> {
  const legSupports = supports.filter(
    (support) => support.hardwareRequired && support.mode !== "no-support-on-bottom",
  );
  const frontLegs = legSupports
    .filter((support) => support.id.includes("front"))
    .sort((left, right) => left.id.localeCompare(right.id));
  const rearLegs = legSupports
    .filter((support) => support.id.includes("back"))
    .sort((left, right) => left.id.localeCompare(right.id));
  const frontPositions = positions
    .filter((position) => position.line === "front")
    .sort((left, right) => left.xMm - right.xMm);
  const rearPositions = positions
    .filter((position) => position.line === "rear")
    .sort((left, right) => left.xMm - right.xMm);
  const assigned = new Map<string, SupportPositionV4>();

  frontLegs.forEach((support, index) => {
    const position = frontPositions[index];
    if (position) {
      assigned.set(support.id, position);
    }
  });

  rearLegs.forEach((support, index) => {
    const position = rearPositions[index];
    if (position) {
      assigned.set(support.id, position);
    }
  });

  return assigned;
}

export function validateSupportPolicyV4(model: ProductionJsonV4): ValidationResult {
  const errors: ProductionJsonV4ValidationIssue[] = [];
  const { mode, heightMm } = resolveSupportHeightMm(model.supports);
  const placementRules = getSupportPlacementRulesV4(model.product.widthMm);
  const carcassHeightMm = calculateCarcassHeight(model.product.heightMm, heightMm);
  const activeLegCount = countActiveLegSupports(model.supports);
  const expectedPositions = calculateSupportPositionsV4({
    widthMm: model.product.widthMm,
    depthMm: model.product.depthMm,
    requiredCount: placementRules.requiredCount,
  });

  for (const support of model.supports) {
    if (!KNOWN_SUPPORT_MODES.has(support.mode)) {
      errors.push(
        policyIssue(
          "supportPolicy.type.unsupported",
          `Support ${support.id} has unsupported mode ${support.mode}`,
          `supports.${support.id}.mode`,
        ),
      );
    }

    const heightError = validateSupportHeight(support.mode, support.heightMm);
    if (heightError) {
      errors.push({ ...heightError, path: `supports.${support.id}.heightMm` });
    }
  }

  const primaryHeightError = validateSupportHeight(mode, heightMm);
  if (primaryHeightError) {
    errors.push(primaryHeightError);
  }

  if (heightMm > model.product.heightMm) {
    errors.push(
      policyIssue(
        "supportPolicy.height.exceedsTotal",
        `Support height ${heightMm} mm exceeds furniture height ${model.product.heightMm} mm`,
        "supports",
      ),
    );
  }

  if (carcassHeightMm <= 0) {
    errors.push(
      policyIssue(
        "supportPolicy.carcass.height.invalid",
        `Carcass height must be greater than zero, got ${carcassHeightMm} mm`,
        "product.heightMm",
      ),
    );
  }

  if (mode !== "no-support-on-bottom" && activeLegCount > 0 && activeLegCount !== placementRules.requiredCount) {
    errors.push(
      policyIssue(
        "supportPolicy.count.mismatch",
        `Support count ${activeLegCount} does not match required ${placementRules.requiredCount} for width ${model.product.widthMm} mm`,
        "supports",
      ),
    );
  }

  for (const support of model.supports) {
    const position = support.semantics?.position;
    if (position && (position.xMm < 0 || position.xMm > model.product.widthMm)) {
      errors.push(
        policyIssue(
          "supportPolicy.position.outsideWidth",
          `Support ${support.id} position x=${position.xMm} mm is outside furniture width ${model.product.widthMm} mm`,
          `supports.${support.id}.semantics.position`,
        ),
      );
    }
  }

  if (activeLegCount > 0 && !positionsAreSymmetric(expectedPositions)) {
    errors.push(
      policyIssue(
        "supportPolicy.placement.notSymmetric",
        "Support placement must be symmetric across front and rear lines",
        "supports",
      ),
    );
  }

  for (const support of model.supports) {
    if (
      support.hardwareRequired &&
      support.mode !== "no-support-on-bottom" &&
      !support.semantics
    ) {
      errors.push(
        policyIssue(
          "supportPolicy.semantics.missing",
          `Support ${support.id} is missing support semantics`,
          `supports.${support.id}.semantics`,
        ),
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function enrichSupportSemanticsV4(model: ProductionJsonV4): ProductionJsonV4 {
  const next = structuredClone(model);
  const warnings: ValidationIssueV4[] = [];
  const { mode, heightMm } = resolveSupportHeightMm(next.supports);
  const placementRules = getSupportPlacementRulesV4(next.product.widthMm);
  const carcassHeightMm = calculateCarcassHeight(next.product.heightMm, heightMm);
  const positions = calculateSupportPositionsV4({
    widthMm: next.product.widthMm,
    depthMm: next.product.depthMm,
    requiredCount: placementRules.requiredCount,
  });
  const assignedPositions = assignSupportPositions(next.supports, positions);
  const activeLegCount = countActiveLegSupports(next.supports);

  if (placementRules.widthExceedsMatrix) {
    warnings.push(
      policyWarning(
        "supportPolicy.width.exceedsMatrix",
        `Furniture width ${next.product.widthMm} mm exceeds supported placement matrix`,
        "product.widthMm",
      ),
    );
  }

  if (placementRules.requiresTechnologistReview) {
    warnings.push(
      policyWarning(
        "supportPolicy.placement.reviewRequired",
        "Support placement requires technologist review for current furniture width",
        "supports",
      ),
    );
  }

  if (mode !== "no-support-on-bottom" && activeLegCount > 0 && activeLegCount !== placementRules.requiredCount) {
    warnings.push(
      policyWarning(
        "supportPolicy.distribution.reviewRequired",
        `Support distribution ${activeLegCount}/${placementRules.requiredCount} requires technologist review`,
        "supports",
      ),
    );
  }

  for (const support of next.supports) {
    support.semantics = {
      classification: classifySupportTypeV4(support),
      lockedHeightMm: LOCKED_SUPPORT_HEIGHT_MM[support.mode],
      placementRules,
      position: assignedPositions.get(support.id),
      carcassHeightMm,
      requiresTechnologistCheck:
        placementRules.requiresTechnologistReview || support.requiresTechnologistCheck === true,
    };
  }

  if (warnings.length > 0) {
    next.validation = {
      ...next.validation,
      warnings: [...next.validation.warnings, ...warnings],
    };
  }

  return next;
}
