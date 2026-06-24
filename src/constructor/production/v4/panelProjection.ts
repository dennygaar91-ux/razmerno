import type {
  BasisPanelKindV4,
  PanelPlaneV4,
  PanelRoleClassV4,
  PanelRoleV4,
  PanelSemanticProjectionV4,
  PanelV4,
  PanelWorldBoundingBoxV4,
  ProductionJsonV4,
  ProductionJsonV4ValidationIssue,
  ValidationIssueV4,
  ValidationResult,
} from "./types.js";

const VERTICAL_ROLES = new Set<PanelRoleV4>([
  "side-left",
  "side-right",
  "vertical-partition",
  "drawer-side-left",
  "drawer-side-right",
  "drawer-back",
]);

const HORIZONTAL_ROLES = new Set<PanelRoleV4>([
  "bottom",
  "top",
  "shelf",
  "drawer-bottom",
]);

const DRAWER_BOX_ROLES = new Set<PanelRoleV4>([
  "drawer-side-left",
  "drawer-side-right",
  "drawer-back",
  "drawer-bottom",
  "drawer-front",
]);

const DOCUMENTATION_REQUIRED_ROLES = new Set<PanelRoleV4>(["back-panel", "drawer-bottom"]);

function semanticIssue(code: string, message: string, path?: string): ProductionJsonV4ValidationIssue {
  return { code, message, path };
}

function semanticWarning(code: string, message: string, path?: string): ValidationIssueV4 {
  return {
    code,
    severity: "warning",
    visibleToClient: false,
    requiresTechnologistCheck: true,
    message,
    path,
  };
}

export function classifyPanelRoleV4(panel: Pick<PanelV4, "role">): PanelRoleClassV4 {
  switch (panel.role) {
    case "facade-door":
      return "facade";
    case "drawer-front":
      return "drawer-front";
    case "drawer-side-left":
    case "drawer-side-right":
    case "drawer-back":
      return "drawer-box";
    case "drawer-bottom":
    case "back-panel":
      return "hdf";
    case "plinth":
      return "plinth";
    default:
      return "body";
  }
}

export function getBasisPanelKindV4(panel: Pick<PanelV4, "role">): BasisPanelKindV4 {
  if (VERTICAL_ROLES.has(panel.role)) {
    return "vertical";
  }
  if (HORIZONTAL_ROLES.has(panel.role)) {
    return "horizontal";
  }
  return "frontal";
}

export function getPanelPlaneV4(panel: Pick<PanelV4, "role">): PanelPlaneV4 {
  const kind = getBasisPanelKindV4(panel);
  switch (kind) {
    case "vertical":
      return "YZ";
    case "horizontal":
      return "XZ";
    default:
      return "XY";
  }
}

export function getPanelLocalAxesV4(panel: Pick<PanelV4, "role">): PanelSemanticProjectionV4["localAxes"] {
  const kind = getBasisPanelKindV4(panel);
  const drawerLocalOrientationProvisional =
    panel.role === "drawer-side-left" ||
    panel.role === "drawer-side-right" ||
    panel.role === "drawer-back";

  if (kind === "vertical") {
    return {
      uAxis: "z",
      vAxis: "y",
      thicknessAxis: "x",
      drawerLocalOrientationProvisional,
    };
  }
  if (kind === "horizontal") {
    return {
      uAxis: "x",
      vAxis: "z",
      thicknessAxis: "y",
      drawerLocalOrientationProvisional: panel.role === "drawer-bottom" ? true : undefined,
    };
  }
  return {
    uAxis: "x",
    vAxis: "y",
    thicknessAxis: "z",
    drawerLocalOrientationProvisional: undefined,
  };
}

function hasValidDimensions(panel: PanelV4): boolean {
  const { dimensions } = panel;
  return (
    dimensions != null &&
    Number.isFinite(dimensions.widthMm) &&
    Number.isFinite(dimensions.heightMm) &&
    Number.isFinite(dimensions.thicknessMm) &&
    dimensions.widthMm > 0 &&
    dimensions.heightMm > 0 &&
    dimensions.thicknessMm > 0
  );
}

export function getPanelLocalSizeV4(panel: PanelV4): PanelSemanticProjectionV4["localSize"] | null {
  if (!hasValidDimensions(panel)) {
    return null;
  }

  return {
    uMm: panel.dimensions.widthMm,
    vMm: panel.dimensions.heightMm,
    thicknessMm: panel.dimensions.thicknessMm,
  };
}

export function getPanelWorldBoundingBoxV4(panel: PanelV4): PanelWorldBoundingBoxV4 | null {
  const localSize = getPanelLocalSizeV4(panel);
  if (!localSize) {
    return null;
  }

  const kind = getBasisPanelKindV4(panel);
  const { uMm, vMm, thicknessMm } = localSize;

  if (kind === "vertical") {
    return {
      widthMm: thicknessMm,
      heightMm: vMm,
      depthMm: uMm,
    };
  }
  if (kind === "horizontal") {
    return {
      widthMm: uMm,
      heightMm: thicknessMm,
      depthMm: vMm,
    };
  }

  return {
    widthMm: uMm,
    heightMm: vMm,
    depthMm: thicknessMm,
  };
}

function buildPanelSemanticProjection(panel: PanelV4): {
  semantics: PanelSemanticProjectionV4 | null;
  warnings: ValidationIssueV4[];
} {
  const warnings: ValidationIssueV4[] = [];
  const localSize = getPanelLocalSizeV4(panel);

  if (!localSize) {
    warnings.push(
      semanticWarning(
        "panelSemantics.dimensions.missing",
        `Panel ${panel.id} is missing valid dimensions for semantic projection`,
        `panels.${panel.id}.dimensions`,
      ),
    );
    return { semantics: null, warnings };
  }

  if (panel.faceSide == null) {
    warnings.push(
      semanticWarning(
        "panelSemantics.faceSide.unclear",
        `Panel ${panel.id} has unclear faceSide; final value not invented`,
        `panels.${panel.id}.faceSide`,
      ),
    );
  }

  const localAxes = getPanelLocalAxesV4(panel);
  if (localAxes.drawerLocalOrientationProvisional) {
    warnings.push(
      semanticWarning(
        "panelSemantics.drawerLocalOrientation.provisional",
        `Panel ${panel.id} drawer-local orientation is provisional until P2-07`,
        `panels.${panel.id}.semantics.localAxes`,
      ),
    );
  }

  const worldBoundingBox = getPanelWorldBoundingBoxV4(panel);
  if (!worldBoundingBox) {
    return { semantics: null, warnings };
  }

  return {
    semantics: {
      roleClass: classifyPanelRoleV4(panel),
      basisPanelKind: getBasisPanelKindV4(panel),
      plane: getPanelPlaneV4(panel),
      localAxes,
      localSize,
      worldBoundingBox,
      includeInDocumentation: panel.includeInDocumentation !== false,
      faceSideKnown: panel.faceSide != null,
    },
    warnings,
  };
}

function syncPanelOrientation(panel: PanelV4): void {
  const basisPanelKind = getBasisPanelKindV4(panel);
  const plane = getPanelPlaneV4(panel);
  const normalAxis = plane === "YZ" ? "X" : plane === "XZ" ? "Y" : "Z";

  panel.orientation = {
    ...panel.orientation,
    basisPanelKind,
    plane,
    normalAxis,
  };
}

function collectAssemblySemanticWarnings(model: ProductionJsonV4): ValidationIssueV4[] {
  const warnings: ValidationIssueV4[] = [];
  const bodyAssembly = model.assemblies.find((assembly) => assembly.role === "body");
  const facadeAssembly = model.assemblies.find((assembly) => assembly.role === "facade-block");
  const drawerAssembly = model.assemblies.find((assembly) => assembly.role === "drawer");

  const sideLeft = model.panels.find((panel) => panel.role === "side-left")?.id;
  const bottom = model.panels.find((panel) => panel.role === "bottom")?.id;
  const top = model.panels.find((panel) => panel.role === "top")?.id;
  const facadePanels = model.panels.filter((panel) => panel.role === "facade-door");
  const drawerPanels = model.panels.filter((panel) => DRAWER_BOX_ROLES.has(panel.role));

  if (!bodyAssembly) {
    warnings.push(
      semanticWarning(
        "panelSemantics.assembly.body.missing",
        "Body assembly is missing from semantic projection",
        "assemblies",
      ),
    );
  } else {
    const hasSideOnBottom =
      sideLeft &&
      bottom &&
      bodyAssembly.contacts.some(
        (contact) => contact.panelId === sideLeft && contact.restsOnPanelId === bottom,
      );
    if (sideLeft && bottom && !hasSideOnBottom) {
      warnings.push(
        semanticWarning(
          "panelSemantics.assembly.sideOnBottom.missing",
          "Body assembly is missing side-panels-on-bottom contact",
          `assemblies.${bodyAssembly.id}.contacts`,
        ),
      );
    }

    const hasTopBetweenSides =
      top &&
      sideLeft &&
      bodyAssembly.contacts.some(
        (contact) => contact.panelId === top && contact.restsOnPanelId === sideLeft,
      );
    if (top && sideLeft && !hasTopBetweenSides) {
      warnings.push(
        semanticWarning(
          "panelSemantics.assembly.topBetweenSides.missing",
          "Body assembly is missing top-panel-between-sides contact",
          `assemblies.${bodyAssembly.id}.contacts`,
        ),
      );
    }
  }

  if (facadePanels.length > 0 && !facadeAssembly) {
    warnings.push(
      semanticWarning(
        "panelSemantics.assembly.facadeBlock.missing",
        "Facade panels exist but facade-block assembly is missing",
        "assemblies",
      ),
    );
  }

  if (drawerPanels.length > 0 && !drawerAssembly) {
    warnings.push(
      semanticWarning(
        "panelSemantics.assembly.drawer.missing",
        "Drawer panels exist but drawer assembly is missing",
        "assemblies",
      ),
    );
  }

  return warnings;
}

export function enrichPanelSemanticsV4(model: ProductionJsonV4): ProductionJsonV4 {
  const next = structuredClone(model);
  const warnings: ValidationIssueV4[] = [];

  for (const panel of next.panels) {
    if (panel.includeInDocumentation == null) {
      panel.includeInDocumentation = true;
      warnings.push(
        semanticWarning(
          "panelSemantics.documentation.defaulted",
          `Panel ${panel.id} includeInDocumentation defaulted to true`,
          `panels.${panel.id}.includeInDocumentation`,
        ),
      );
    }

    syncPanelOrientation(panel);

    const { semantics, warnings: panelWarnings } = buildPanelSemanticProjection(panel);
    warnings.push(...panelWarnings);
    if (semantics) {
      panel.semantics = semantics;
    }
  }

  warnings.push(...collectAssemblySemanticWarnings(next));

  if (warnings.length > 0) {
    next.validation = {
      ...next.validation,
      warnings: [...next.validation.warnings, ...warnings],
    };
  }

  return next;
}

export function validatePanelSemanticsV4(model: ProductionJsonV4): ValidationResult {
  const errors: ProductionJsonV4ValidationIssue[] = [];

  for (const panel of model.panels) {
    const expectedKind = getBasisPanelKindV4(panel);
    const expectedPlane = getPanelPlaneV4(panel);

    if (panel.orientation.basisPanelKind !== expectedKind) {
      errors.push(
        semanticIssue(
          "panelSemantics.orientation.kind.invalid",
          `Panel ${panel.id} basisPanelKind must be ${expectedKind}`,
          `panels.${panel.id}.orientation.basisPanelKind`,
        ),
      );
    }

    if (panel.orientation.plane !== expectedPlane) {
      errors.push(
        semanticIssue(
          "panelSemantics.orientation.plane.invalid",
          `Panel ${panel.id} plane must be ${expectedPlane}`,
          `panels.${panel.id}.orientation.plane`,
        ),
      );
    }

    if (!getPanelLocalSizeV4(panel)) {
      errors.push(
        semanticIssue(
          "panelSemantics.dimensions.missing",
          `Panel ${panel.id} is missing valid dimensions`,
          `panels.${panel.id}.dimensions`,
        ),
      );
    }

    if (DOCUMENTATION_REQUIRED_ROLES.has(panel.role) && panel.includeInDocumentation === false) {
      errors.push(
        semanticIssue(
          "panelSemantics.documentation.required",
          `Panel ${panel.id} must remain included in documentation`,
          `panels.${panel.id}.includeInDocumentation`,
        ),
      );
    }

    if ((panel.review as { visibleToClient?: boolean } | undefined)?.visibleToClient === true) {
      errors.push(
        semanticIssue(
          "panelSemantics.review.visibleToClient.invalid",
          `Panel ${panel.id} review must remain hidden from client`,
          `panels.${panel.id}.review.visibleToClient`,
        ),
      );
    }

    if (!panel.semantics) {
      errors.push(
        semanticIssue(
          "panelSemantics.projection.missing",
          `Panel ${panel.id} is missing semantic projection`,
          `panels.${panel.id}.semantics`,
        ),
      );
    } else {
      if (panel.semantics.basisPanelKind !== expectedKind || panel.semantics.plane !== expectedPlane) {
        errors.push(
          semanticIssue(
            "panelSemantics.projection.mismatch",
            `Panel ${panel.id} semantic projection does not match role mapping`,
            `panels.${panel.id}.semantics`,
          ),
        );
      }
    }
  }

  if (model.review.visibleToClient !== false) {
    errors.push(
      semanticIssue(
        "panelSemantics.review.visibleToClient.invalid",
        "Production review must remain hidden from client",
        "review.visibleToClient",
      ),
    );
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
