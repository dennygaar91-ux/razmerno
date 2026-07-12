import type {
  MaterialKindV4,
  MaterialV4,
  PanelRoleV4,
  PanelV4,
  ProductionJsonV4,
  ProductionJsonV4ValidationIssue,
  TextureDirectionV4,
  ValidationIssueV4,
  ValidationResult,
} from "./types.js";

const BODY_PANEL_ROLES = new Set<PanelRoleV4>([
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

const HDF_PANEL_ROLES = new Set<PanelRoleV4>(["back-panel", "drawer-bottom"]);

const FACADE_CLASS_ROLES = new Set<PanelRoleV4>(["facade-door", "drawer-front"]);

export interface PanelMaterialPolicyV4 {
  role: PanelRoleV4;
  kind: MaterialKindV4;
  thicknessMm: number;
  textureDirection: TextureDirectionV4;
}

export interface PanelSizeInputV4 {
  dimensions: PanelV4["dimensions"];
  materialKind: MaterialKindV4;
  role: PanelRoleV4;
}

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

export function getPanelFaceSize(panel: PanelSizeInputV4): { uMm: number; vMm: number } {
  return {
    uMm: panel.dimensions.widthMm,
    vMm: panel.dimensions.heightMm,
  };
}

export function deriveTextureDirectionFromPanelSize(panel: PanelSizeInputV4): TextureDirectionV4 {
  if (panel.materialKind === "hdf" || HDF_PANEL_ROLES.has(panel.role)) {
    return "none";
  }

  const { uMm, vMm } = getPanelFaceSize(panel);
  if (uMm > vMm) {
    return "horizontal";
  }
  return "vertical";
}

function resolveFacadeClassKind(panel: Pick<PanelV4, "materialKind" | "materialRef">, materials: MaterialV4[]): MaterialKindV4 {
  if (panel.materialKind === "mdf" || panel.materialKind === "ldsp") {
    return panel.materialKind;
  }

  const material = materials.find((entry) => entry.id === panel.materialRef);
  if (material?.kind === "mdf" || material?.kind === "ldsp") {
    return material.kind;
  }

  const ref = panel.materialRef.toLowerCase();
  if (ref.includes("mdf")) {
    return "mdf";
  }
  return "ldsp";
}

function thicknessForKind(kind: MaterialKindV4, role: PanelRoleV4): number {
  if (HDF_PANEL_ROLES.has(role) || kind === "hdf") {
    return 3;
  }
  if (FACADE_CLASS_ROLES.has(role)) {
    return kind === "mdf" ? 18 : 16;
  }
  return 16;
}

export function getExpectedPanelMaterialPolicy(
  panel: PanelV4,
  materials: MaterialV4[] = [],
): PanelMaterialPolicyV4 {
  if (HDF_PANEL_ROLES.has(panel.role)) {
    return {
      role: panel.role,
      kind: "hdf",
      thicknessMm: 3,
      textureDirection: "none",
    };
  }

  if (FACADE_CLASS_ROLES.has(panel.role)) {
    const kind = resolveFacadeClassKind(panel, materials);
    return {
      role: panel.role,
      kind,
      thicknessMm: thicknessForKind(kind, panel.role),
      textureDirection: deriveTextureDirectionFromPanelSize({
        dimensions: panel.dimensions,
        materialKind: kind,
        role: panel.role,
      }),
    };
  }

  return {
    role: panel.role,
    kind: "ldsp",
    thicknessMm: 16,
    textureDirection: deriveTextureDirectionFromPanelSize(panel),
  };
}

function validatePanelMaterialPolicy(
  panel: PanelV4,
  materials: MaterialV4[],
): ProductionJsonV4ValidationIssue[] {
  const errors: ProductionJsonV4ValidationIssue[] = [];
  const policy = getExpectedPanelMaterialPolicy(panel, materials);
  const material = materials.find((entry) => entry.id === panel.materialRef);

  if (BODY_PANEL_ROLES.has(panel.role)) {
    if (panel.materialKind !== "ldsp" || panel.thicknessMm !== 16) {
      errors.push(
        policyIssue("panel.body.material.invalid", `Body panel ${panel.id} must be LDSP 16 mm`, `panels.${panel.id}`),
      );
    }
    if (material && (material.kind !== "ldsp" || material.thicknessMm !== 16)) {
      errors.push(
        policyIssue(
          "panel.body.materialRef.invalid",
          `Body panel ${panel.id} materialRef must be LDSP 16 mm`,
          `panels.${panel.id}.materialRef`,
        ),
      );
    }
  }

  if (panel.role === "facade-door" && panel.materialKind === "ldsp") {
    if (panel.thicknessMm !== 16) {
      errors.push(
        policyIssue(
          "panel.facade.ldsp.thickness.invalid",
          `Facade LDSP panel ${panel.id} must be 16 mm`,
          `panels.${panel.id}.thicknessMm`,
        ),
      );
    }
    if (material && material.thicknessMm !== 16) {
      errors.push(
        policyIssue(
          "panel.facade.ldsp.materialRef.invalid",
          `Facade LDSP panel ${panel.id} materialRef must be 16 mm`,
          `panels.${panel.id}.materialRef`,
        ),
      );
    }
  }

  if ((panel.role === "facade-door" || panel.role === "drawer-front") && panel.materialKind === "mdf") {
    if (panel.thicknessMm !== 18) {
      errors.push(
        policyIssue(
          "panel.facade.mdf.thickness.invalid",
          `Facade MDF panel ${panel.id} must be 18 mm`,
          `panels.${panel.id}.thicknessMm`,
        ),
      );
    }
    if (material && material.thicknessMm !== 18) {
      errors.push(
        policyIssue(
          "panel.facade.mdf.materialRef.invalid",
          `Facade MDF panel ${panel.id} materialRef must be 18 mm`,
          `panels.${panel.id}.materialRef`,
        ),
      );
    }
  }

  if (panel.role === "drawer-front" && panel.materialKind === "ldsp" && panel.thicknessMm !== 16) {
    errors.push(
      policyIssue(
        "panel.drawer-front.thickness.invalid",
        `Drawer front ${panel.id} LDSP must be 16 mm`,
        `panels.${panel.id}.thicknessMm`,
      ),
    );
  }

  if (HDF_PANEL_ROLES.has(panel.role)) {
    if (panel.materialKind !== "hdf" || panel.thicknessMm !== 3) {
      errors.push(policyIssue("panel.hdf.invalid", `HDF panel ${panel.id} must be HDF 3 mm`, `panels.${panel.id}`));
    }
    if (material && (material.kind !== "hdf" || material.thicknessMm !== 3)) {
      errors.push(
        policyIssue(
          "panel.hdf.materialRef.invalid",
          `HDF panel ${panel.id} materialRef must be HDF 3 mm`,
          `panels.${panel.id}.materialRef`,
        ),
      );
    }
    if (panel.textureDirection !== "none") {
      errors.push(
        policyIssue(
          "panel.hdf.textureDirection.invalid",
          `HDF panel ${panel.id} textureDirection must be none`,
          `panels.${panel.id}.textureDirection`,
        ),
      );
    }
  }

  if (panel.materialKind === "hdf" && panel.textureDirection !== "none") {
    errors.push(
      policyIssue(
        "panel.hdf.textureDirection.invalid",
        `HDF material panel ${panel.id} textureDirection must be none`,
        `panels.${panel.id}.textureDirection`,
      ),
    );
  }

  if (panel.materialKind !== policy.kind || panel.thicknessMm !== policy.thicknessMm) {
    if (!errors.some((error) => error.path?.startsWith(`panels.${panel.id}`))) {
      errors.push(
        policyIssue(
          "panel.material.policy.invalid",
          `Panel ${panel.id} must be ${policy.kind.toUpperCase()} ${policy.thicknessMm} mm`,
          `panels.${panel.id}`,
        ),
      );
    }
  }

  if (panel.textureDirection !== policy.textureDirection && !HDF_PANEL_ROLES.has(panel.role)) {
    errors.push(
      policyIssue(
        "panel.textureDirection.invalid",
        `Panel ${panel.id} textureDirection must follow longest side (${policy.textureDirection})`,
        `panels.${panel.id}.textureDirection`,
      ),
    );
  }

  return errors;
}

export function validateMaterialPolicyV4(model: ProductionJsonV4): ValidationResult {
  const errors = model.panels.flatMap((panel) => validatePanelMaterialPolicy(panel, model.materials));
  return {
    ok: errors.length === 0,
    errors,
  };
}

function inferKindFromPanel(panel: PanelV4, materials: MaterialV4[]): MaterialKindV4 | undefined {
  if (HDF_PANEL_ROLES.has(panel.role)) {
    return "hdf";
  }
  if (BODY_PANEL_ROLES.has(panel.role)) {
    return "ldsp";
  }
  if (FACADE_CLASS_ROLES.has(panel.role)) {
    return resolveFacadeClassKind(panel, materials);
  }
  return undefined;
}

function hasMissingTextureDirection(panel: PanelV4): boolean {
  return !panel.textureDirection;
}

export function applyMaterialPolicyDefaultsV4(model: ProductionJsonV4): ProductionJsonV4 {
  const warnings: ValidationIssueV4[] = [];
  const next = structuredClone(model);
  const materialById = new Map(next.materials.map((material) => [material.id, material]));

  for (const panel of next.panels) {
    const inferredKind = inferKindFromPanel(panel, next.materials);
    const refMaterial = materialById.get(panel.materialRef);

    if (inferredKind) {
      const inferredThickness = thicknessForKind(inferredKind, panel.role);
      if (!panel.materialKind) {
        panel.materialKind = inferredKind;
        warnings.push(
          policyWarning(
            "materialPolicy.defaults.materialKind",
            `Filled missing materialKind for panel ${panel.id}`,
            `panels.${panel.id}.materialKind`,
          ),
        );
      } else if (panel.materialKind !== inferredKind && BODY_PANEL_ROLES.has(panel.role)) {
        panel.materialKind = inferredKind;
        panel.thicknessMm = inferredThickness;
        panel.dimensions.thicknessMm = inferredThickness;
        warnings.push(
          policyWarning(
            "materialPolicy.defaults.bodyKind",
            `Normalized body panel ${panel.id} to LDSP 16 mm`,
            `panels.${panel.id}`,
          ),
        );
      }

      if (!panel.thicknessMm) {
        panel.thicknessMm = inferredThickness;
        panel.dimensions.thicknessMm = inferredThickness;
        warnings.push(
          policyWarning(
            "materialPolicy.defaults.thicknessMm",
            `Filled missing thicknessMm for panel ${panel.id}`,
            `panels.${panel.id}.thicknessMm`,
          ),
        );
      }
    } else {
      warnings.push(
        policyWarning(
          "materialPolicy.defaults.kind.unresolved",
          `Could not infer material kind for panel ${panel.id}`,
          `panels.${panel.id}.materialKind`,
        ),
      );
    }

    if (refMaterial) {
      if (refMaterial.kind !== panel.materialKind || refMaterial.thicknessMm !== panel.thicknessMm) {
        refMaterial.kind = panel.materialKind;
        refMaterial.thicknessMm = panel.thicknessMm;
        refMaterial.textureDirection = deriveTextureDirectionFromPanelSize(panel);
      }
    } else if (panel.materialRef) {
      next.materials.push({
        id: panel.materialRef,
        kind: panel.materialKind,
        decorName: panel.materialRef,
        thicknessMm: panel.thicknessMm,
        textureDirection: deriveTextureDirectionFromPanelSize(panel),
        source: "manual",
      });
      materialById.set(panel.materialRef, next.materials[next.materials.length - 1]!);
      warnings.push(
        policyWarning(
          "materialPolicy.defaults.material.snapshot",
          `Created material snapshot for missing materialRef ${panel.materialRef}`,
          `materials.${panel.materialRef}`,
        ),
      );
    }

    if (hasMissingTextureDirection(panel)) {
      panel.textureDirection = deriveTextureDirectionFromPanelSize(panel);
      warnings.push(
        policyWarning(
          "materialPolicy.defaults.textureDirection",
          `Filled missing textureDirection for panel ${panel.id}`,
          `panels.${panel.id}.textureDirection`,
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
