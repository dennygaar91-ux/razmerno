import { getBasisPanelKindV4 } from "./panelProjection.js";
import type {
  EdgeBandingSideV4,
  EdgeBandingV4,
  EdgePolicyClassV4,
  ExpectedEdgeBandingPolicyV4,
  GrooveConfidenceV4,
  GroovePurposeV4,
  GrooveSemanticProjectionV4,
  GrooveV4,
  PanelRoleV4,
  PanelV4,
  ProductionJsonV4,
  ProductionJsonV4ValidationIssue,
  ValidationIssueV4,
  ValidationResult,
} from "./types.js";

const VALID_EDGE_SIDES = new Set<EdgeBandingSideV4>(["front", "back", "left", "right", "top", "bottom"]);

const HDF_PANEL_ROLES = new Set<PanelRoleV4>(["back-panel", "drawer-bottom"]);

const BODY_EDGE_ROLES = new Set<PanelRoleV4>([
  "side-left",
  "side-right",
  "bottom",
  "top",
  "vertical-partition",
  "shelf",
  "drawer-side-left",
  "drawer-side-right",
  "drawer-back",
  "plinth",
]);

const FACADE_EDGE_ROLES = new Set<PanelRoleV4>(["facade-door", "drawer-front"]);

const KNOWN_GROOVE_PURPOSES = new Set<GroovePurposeV4>(["back-panel-insert", "drawer-bottom-insert"]);

const V3_EDGE_SIDES: EdgeBandingSideV4[] = ["front", "back", "left", "right"];

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

function getOrientationEdgeSides(panel: Pick<PanelV4, "role">): EdgeBandingSideV4[] {
  const kind = getBasisPanelKindV4(panel);
  switch (kind) {
    case "horizontal":
      return ["front", "back", "left", "right"];
    case "vertical":
      return ["front", "back", "top", "bottom"];
    default:
      return ["top", "bottom", "left", "right"];
  }
}

function getAlternateEdgeSides(panel: Pick<PanelV4, "role">): EdgeBandingSideV4[] | undefined {
  const kind = getBasisPanelKindV4(panel);
  if (kind === "vertical" || kind === "frontal") {
    return V3_EDGE_SIDES;
  }
  return undefined;
}

export function classifyEdgePolicyForPanelV4(panel: Pick<PanelV4, "role">): EdgePolicyClassV4 {
  if (HDF_PANEL_ROLES.has(panel.role)) {
    return "no-edge";
  }
  if (FACADE_EDGE_ROLES.has(panel.role)) {
    return "facade-2mm-all-around";
  }
  if (BODY_EDGE_ROLES.has(panel.role)) {
    return "body-1mm-all-around";
  }
  return "no-edge";
}

export function getExpectedEdgeBandingForPanelV4(panel: Pick<PanelV4, "role">): ExpectedEdgeBandingPolicyV4 {
  const policyClass = classifyEdgePolicyForPanelV4(panel);

  if (policyClass === "no-edge") {
    return {
      policyClass,
      coverage: "none",
      expectedThicknessMm: null,
      requiredSides: [],
    };
  }

  return {
    policyClass,
    coverage: "all-around",
    expectedThicknessMm: policyClass === "facade-2mm-all-around" ? 2 : 1,
    requiredSides: getOrientationEdgeSides(panel),
    alternateRequiredSides: getAlternateEdgeSides(panel),
  };
}

function panelSatisfiesAllAround(
  panel: PanelV4,
  edgesByPanel: Map<string, Set<EdgeBandingSideV4>>,
): boolean {
  const policy = getExpectedEdgeBandingForPanelV4(panel);
  if (policy.coverage !== "all-around") {
    return true;
  }

  const present = edgesByPanel.get(panel.id) ?? new Set<EdgeBandingSideV4>();
  const hasPrimary = policy.requiredSides.every((side) => present.has(side));
  if (hasPrimary) {
    return true;
  }

  if (policy.alternateRequiredSides) {
    return policy.alternateRequiredSides.every((side) => present.has(side));
  }

  return false;
}

function getMissingEdgeSides(
  panel: PanelV4,
  edgesByPanel: Map<string, Set<EdgeBandingSideV4>>,
): EdgeBandingSideV4[] {
  const policy = getExpectedEdgeBandingForPanelV4(panel);
  if (policy.coverage !== "all-around") {
    return [];
  }

  const present = edgesByPanel.get(panel.id) ?? new Set<EdgeBandingSideV4>();
  if (panelSatisfiesAllAround(panel, edgesByPanel)) {
    return [];
  }

  const missingPrimary = policy.requiredSides.filter((side) => !present.has(side));
  if (policy.alternateRequiredSides) {
    const missingAlternate = policy.alternateRequiredSides.filter((side) => !present.has(side));
    return missingPrimary.length <= missingAlternate.length ? missingPrimary : missingAlternate;
  }

  return missingPrimary;
}

function buildEdgeSemantics(panel: PanelV4 | undefined): EdgeBandingV4["semantics"] {
  const policyClass = panel ? classifyEdgePolicyForPanelV4(panel) : "no-edge";
  const expected = panel ? getExpectedEdgeBandingForPanelV4(panel) : null;

  return {
    policyClass,
    expectedThicknessMm: expected?.expectedThicknessMm ?? null,
    coverage: expected?.coverage ?? "none",
  };
}

function resolveGrooveConfidence(groove: GrooveV4): GrooveConfidenceV4 {
  return groove.confidence ?? groove.semantics?.confidence ?? "placeholder";
}

function buildGrooveSemantics(groove: GrooveV4): GrooveSemanticProjectionV4 {
  const purpose = KNOWN_GROOVE_PURPOSES.has(groove.purpose) ? groove.purpose : "unknown";

  return {
    purpose,
    confidence: resolveGrooveConfidence(groove),
    dimensionsFinal: false,
    requiresTechnologistCheck: true,
  };
}

export function classifyGroovePurposeV4(groove: Pick<GrooveV4, "purpose">): GroovePurposeV4 | "unknown" {
  return KNOWN_GROOVE_PURPOSES.has(groove.purpose) ? groove.purpose : "unknown";
}

export function validateEdgeBandingPolicyV4(model: ProductionJsonV4): ValidationResult {
  const errors: ProductionJsonV4ValidationIssue[] = [];
  const panelById = new Map(model.panels.map((panel) => [panel.id, panel]));
  const edgesByPanel = new Map<string, Set<EdgeBandingSideV4>>();
  const edgeKeys = new Set<string>();

  for (const edge of model.edgeBanding) {
    if (!VALID_EDGE_SIDES.has(edge.side)) {
      errors.push(
        policyIssue(
          "edgeGroovePolicy.edge.side.unknown",
          `Edge ${edge.id} has unknown side ${edge.side}`,
          `edgeBanding.${edge.id}.side`,
        ),
      );
    }

    const panel = panelById.get(edge.panelId);
    if (!panel) {
      errors.push(
        policyIssue(
          "edgeGroovePolicy.edge.panelId.missing",
          `Edge ${edge.id} references unknown panel ${edge.panelId}`,
          `edgeBanding.${edge.id}.panelId`,
        ),
      );
      continue;
    }

    const edgeKey = `${edge.panelId}:${edge.side}`;
    if (edgeKeys.has(edgeKey)) {
      errors.push(
        policyIssue(
          "edgeGroovePolicy.edge.duplicate",
          `Duplicate edge banding for panel ${edge.panelId} side ${edge.side}`,
          `edgeBanding.${edge.id}`,
        ),
      );
    }
    edgeKeys.add(edgeKey);

    if (!edgesByPanel.has(edge.panelId)) {
      edgesByPanel.set(edge.panelId, new Set());
    }
    edgesByPanel.get(edge.panelId)!.add(edge.side);

    if (HDF_PANEL_ROLES.has(panel.role)) {
      errors.push(
        policyIssue(
          "edgeGroovePolicy.edge.hdf.forbidden",
          `HDF panel ${panel.id} must not have edge banding`,
          `edgeBanding.${edge.id}.panelId`,
        ),
      );
      continue;
    }

    const expected = getExpectedEdgeBandingForPanelV4(panel);
    if (expected.expectedThicknessMm != null && edge.thicknessMm !== expected.expectedThicknessMm) {
      const code =
        expected.policyClass === "facade-2mm-all-around"
          ? "edgeGroovePolicy.edge.facade.thickness.invalid"
          : "edgeGroovePolicy.edge.body.thickness.invalid";
      errors.push(
        policyIssue(
          code,
          `Edge ${edge.id} thickness ${edge.thicknessMm} mm must be ${expected.expectedThicknessMm} mm for panel ${panel.id}`,
          `edgeBanding.${edge.id}.thicknessMm`,
        ),
      );
    }
  }

  for (const panel of model.panels) {
    if (HDF_PANEL_ROLES.has(panel.role)) {
      continue;
    }

    const policy = classifyEdgePolicyForPanelV4(panel);
    if (policy === "no-edge") {
      continue;
    }

    if (!panelSatisfiesAllAround(panel, edgesByPanel)) {
      const missing = getMissingEdgeSides(panel, edgesByPanel);
      errors.push(
        policyIssue(
          "edgeGroovePolicy.edge.side.missing",
          `Panel ${panel.id} is missing edge banding on sides: ${missing.join(", ")}`,
          `panels.${panel.id}.edgeBandingRefs`,
        ),
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function validateGrooveBoundaryV4(model: ProductionJsonV4): ValidationResult {
  const errors: ProductionJsonV4ValidationIssue[] = [];
  const panelIds = new Set(model.panels.map((panel) => panel.id));

  for (const groove of model.grooves) {
    if (!groove.panelId) {
      errors.push(
        policyIssue(
          "edgeGroovePolicy.groove.panelId.missing",
          `Groove ${groove.id} must reference panelId`,
          `grooves.${groove.id}.panelId`,
        ),
      );
    } else if (!panelIds.has(groove.panelId)) {
      errors.push(
        policyIssue(
          "edgeGroovePolicy.groove.panelId.unknown",
          `Groove ${groove.id} references unknown panel ${groove.panelId}`,
          `grooves.${groove.id}.panelId`,
        ),
      );
    }

    if (!groove.purpose) {
      errors.push(
        policyIssue(
          "edgeGroovePolicy.groove.purpose.missing",
          `Groove ${groove.id} must declare purpose`,
          `grooves.${groove.id}.purpose`,
        ),
      );
    } else if (!KNOWN_GROOVE_PURPOSES.has(groove.purpose)) {
      errors.push(
        policyIssue(
          "edgeGroovePolicy.groove.purpose.unknown",
          `Groove ${groove.id} has unknown purpose ${groove.purpose}`,
          `grooves.${groove.id}.purpose`,
        ),
      );
    }

    if (!groove.requiresTechnologistCheck) {
      errors.push(
        policyIssue(
          "edgeGroovePolicy.groove.requiresTechnologistCheck.invalid",
          `Groove ${groove.id} must require technologist check`,
          `grooves.${groove.id}.requiresTechnologistCheck`,
        ),
      );
    }

    const confidence = resolveGrooveConfidence(groove);
    if (confidence === "final" || confidence === "approved") {
      errors.push(
        policyIssue(
          "edgeGroovePolicy.groove.machining.finalForbidden",
          `Groove ${groove.id} must not claim final/approved machining`,
          `grooves.${groove.id}.confidence`,
        ),
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function enrichEdgeGrooveSemanticsV4(model: ProductionJsonV4): ProductionJsonV4 {
  const next = structuredClone(model);
  const warnings: ValidationIssueV4[] = [];
  const panelById = new Map(next.panels.map((panel) => [panel.id, panel]));

  for (const edge of next.edgeBanding) {
    edge.semantics = buildEdgeSemantics(panelById.get(edge.panelId));
  }

  for (const groove of next.grooves) {
    groove.semantics = buildGrooveSemantics(groove);

    if (!groove.confidence) {
      warnings.push(
        policyWarning(
          "edgeGroovePolicy.groove.confidence.defaulted",
          `Groove ${groove.id} confidence defaulted to placeholder`,
          `grooves.${groove.id}.semantics.confidence`,
        ),
      );
    }

    if (classifyGroovePurposeV4(groove) === "unknown") {
      warnings.push(
        policyWarning(
          "edgeGroovePolicy.groove.purpose.unknown",
          `Groove ${groove.id} has unknown purpose ${groove.purpose}`,
          `grooves.${groove.id}.purpose`,
        ),
      );
    }

    warnings.push(
      policyWarning(
        "edgeGroovePolicy.groove.dimensions.notFinal",
        `Groove ${groove.id} dimensions are placeholders until technologist decision`,
        `grooves.${groove.id}`,
      ),
    );
  }

  const edgesByPanel = new Map<string, Set<EdgeBandingSideV4>>();
  for (const edge of next.edgeBanding) {
    if (!edgesByPanel.has(edge.panelId)) {
      edgesByPanel.set(edge.panelId, new Set());
    }
    edgesByPanel.get(edge.panelId)!.add(edge.side);
  }

  for (const panel of next.panels) {
    if (!panelSatisfiesAllAround(panel, edgesByPanel) && classifyEdgePolicyForPanelV4(panel) !== "no-edge") {
      const missing = getMissingEdgeSides(panel, edgesByPanel);
      warnings.push(
        policyWarning(
          "edgeGroovePolicy.edge.side.missing",
          `Panel ${panel.id} is missing edge banding on sides: ${missing.join(", ")}`,
          `panels.${panel.id}.edgeBandingRefs`,
        ),
      );
    }
  }

  if (warnings.length > 0) {
    next.validation = {
      ...next.validation,
      warnings: [...next.validation.warnings, ...warnings],
    };
  }

  return next;
}
