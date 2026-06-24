import {
  PRODUCTION_JSON_V4_SCHEMA,
  type DrillingV4,
  type PanelRoleV4,
  type ProductionJsonV4,
  type ProductionJsonV4ValidationIssue,
  type ValidationResult,
} from "./types.js";
import { validateMaterialPolicyV4 } from "./materialPolicy.js";

const FORBIDDEN_B3D_CLAIMS = [
  "document:create-b3d",
  '"documentType":"b3d"',
  "'documentType': 'b3d'",
  "автоматической генерации .b3d",
  "автоматической генерации",
  "generatesB3d",
  "generate-b3d",
  "auto-b3d",
] as const;

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

function issue(code: string, message: string, path?: string): ProductionJsonV4ValidationIssue {
  return { code, message, path };
}

function hasCoordinateDecision(drill: DrillingV4): boolean {
  if (drill.coordinateSpace === "world") {
    return drill.world !== null;
  }
  if (drill.coordinateSpace === "panel-local") {
    return drill.local !== null;
  }
  return drill.world !== null && drill.local !== null;
}

function collectReferenceErrors(model: ProductionJsonV4): ProductionJsonV4ValidationIssue[] {
  const errors: ProductionJsonV4ValidationIssue[] = [];
  const panelIds = new Set(model.panels.map((panel) => panel.id));
  const materialIds = new Set(model.materials.map((material) => material.id));
  const hardwareIds = new Set(model.hardware.map((item) => item.id));
  const edgeIds = new Set(model.edgeBanding.map((edge) => edge.id));
  const grooveIds = new Set(model.grooves.map((groove) => groove.id));
  const drillingIds = new Set(model.drilling.map((drill) => drill.id));
  const assemblyIds = new Set(model.assemblies.map((assembly) => assembly.id));
  const supportIds = new Set(model.supports.map((support) => support.id));

  const childRefIds = new Set<string>([
    ...panelIds,
    ...hardwareIds,
    ...supportIds,
  ]);

  for (const panel of model.panels) {
    if (!materialIds.has(panel.materialRef)) {
      errors.push(issue("panel.materialRef.missing", `Panel ${panel.id} references missing material ${panel.materialRef}`, `panels.${panel.id}.materialRef`));
    }
    for (const ref of panel.edgeBandingRefs ?? []) {
      if (!edgeIds.has(ref)) {
        errors.push(issue("panel.edgeBandingRef.missing", `Panel ${panel.id} references missing edge ${ref}`, `panels.${panel.id}.edgeBandingRefs`));
      }
    }
    for (const ref of panel.grooveRefs ?? []) {
      if (!grooveIds.has(ref)) {
        errors.push(issue("panel.grooveRef.missing", `Panel ${panel.id} references missing groove ${ref}`, `panels.${panel.id}.grooveRefs`));
      }
    }
    for (const ref of panel.hardwareRefs ?? []) {
      if (!hardwareIds.has(ref)) {
        errors.push(issue("panel.hardwareRef.missing", `Panel ${panel.id} references missing hardware ${ref}`, `panels.${panel.id}.hardwareRefs`));
      }
    }
    for (const ref of panel.drillingRefs ?? []) {
      if (!drillingIds.has(ref)) {
        errors.push(issue("panel.drillingRef.missing", `Panel ${panel.id} references missing drilling ${ref}`, `panels.${panel.id}.drillingRefs`));
      }
    }
  }

  for (const edge of model.edgeBanding) {
    if (!panelIds.has(edge.panelId)) {
      errors.push(issue("edgeBanding.panelId.missing", `Edge ${edge.id} references missing panel ${edge.panelId}`, `edgeBanding.${edge.id}.panelId`));
    }
    if (edge.materialRef && !materialIds.has(edge.materialRef)) {
      errors.push(issue("edgeBanding.materialRef.missing", `Edge ${edge.id} references missing material ${edge.materialRef}`, `edgeBanding.${edge.id}.materialRef`));
    }
  }

  for (const groove of model.grooves) {
    if (!panelIds.has(groove.panelId)) {
      errors.push(issue("groove.panelId.missing", `Groove ${groove.id} references missing panel ${groove.panelId}`, `grooves.${groove.id}.panelId`));
    }
  }

  for (const hardware of model.hardware) {
    if (hardware.mountingPanelId && !panelIds.has(hardware.mountingPanelId)) {
      errors.push(issue("hardware.mountingPanelId.missing", `Hardware ${hardware.id} references missing panel ${hardware.mountingPanelId}`, `hardware.${hardware.id}.mountingPanelId`));
    }
    if (hardware.facadePanelId && !panelIds.has(hardware.facadePanelId)) {
      errors.push(issue("hardware.facadePanelId.missing", `Hardware ${hardware.id} references missing panel ${hardware.facadePanelId}`, `hardware.${hardware.id}.facadePanelId`));
    }
    if (hardware.targetAssemblyId && !assemblyIds.has(hardware.targetAssemblyId)) {
      errors.push(issue("hardware.targetAssemblyId.missing", `Hardware ${hardware.id} references missing assembly ${hardware.targetAssemblyId}`, `hardware.${hardware.id}.targetAssemblyId`));
    }
    for (const ref of hardware.drillingRefs ?? []) {
      if (!drillingIds.has(ref)) {
        errors.push(issue("hardware.drillingRef.missing", `Hardware ${hardware.id} references missing drilling ${ref}`, `hardware.${hardware.id}.drillingRefs`));
      }
    }
  }

  for (const drill of model.drilling) {
    if (!panelIds.has(drill.panelId)) {
      errors.push(issue("drilling.panelId.missing", `Drilling ${drill.id} references missing panel ${drill.panelId}`, `drilling.${drill.id}.panelId`));
    }
    if (drill.hardwareRef && !hardwareIds.has(drill.hardwareRef)) {
      errors.push(issue("drilling.hardwareRef.missing", `Drilling ${drill.id} references missing hardware ${drill.hardwareRef}`, `drilling.${drill.id}.hardwareRef`));
    }
  }

  for (const support of model.supports) {
    if (support.mountingPanelId && !panelIds.has(support.mountingPanelId)) {
      errors.push(issue("support.mountingPanelId.missing", `Support ${support.id} references missing panel ${support.mountingPanelId}`, `supports.${support.id}.mountingPanelId`));
    }
  }

  for (const assembly of model.assemblies) {
    for (const childId of assembly.children) {
      if (!childRefIds.has(childId)) {
        errors.push(issue("assembly.child.missing", `Assembly ${assembly.id} references missing child ${childId}`, `assemblies.${assembly.id}.children`));
      }
    }
    for (const contact of assembly.contacts) {
      if (!panelIds.has(contact.panelId)) {
        errors.push(issue("assembly.contact.panelId.missing", `Assembly ${assembly.id} contact references missing panel ${contact.panelId}`, `assemblies.${assembly.id}.contacts`));
      }
      if (!panelIds.has(contact.restsOnPanelId)) {
        errors.push(issue("assembly.contact.restsOnPanelId.missing", `Assembly ${assembly.id} contact references missing panel ${contact.restsOnPanelId}`, `assemblies.${assembly.id}.contacts`));
      }
    }
  }

  return errors;
}

function collectMaterialErrors(model: ProductionJsonV4): ProductionJsonV4ValidationIssue[] {
  return validateMaterialPolicyV4(model).errors;
}

function collectEdgeBandingErrors(model: ProductionJsonV4): ProductionJsonV4ValidationIssue[] {
  const errors: ProductionJsonV4ValidationIssue[] = [];
  const panelById = new Map(model.panels.map((panel) => [panel.id, panel]));

  for (const edge of model.edgeBanding) {
    const panel = panelById.get(edge.panelId);
    if (!panel) {
      continue;
    }
    if (BODY_EDGE_ROLES.has(panel.role) && edge.thicknessMm !== model.rules.edgeBanding.bodyThicknessMm) {
      errors.push(issue("edgeBanding.body.thickness.invalid", `Body edge ${edge.id} must be ${model.rules.edgeBanding.bodyThicknessMm} mm`, `edgeBanding.${edge.id}.thicknessMm`));
    }
    if (FACADE_EDGE_ROLES.has(panel.role) && edge.thicknessMm !== model.rules.edgeBanding.facadeThicknessMm) {
      errors.push(issue("edgeBanding.facade.thickness.invalid", `Facade edge ${edge.id} must be ${model.rules.edgeBanding.facadeThicknessMm} mm`, `edgeBanding.${edge.id}.thicknessMm`));
    }
    if (HDF_PANEL_ROLES.has(panel.role)) {
      errors.push(issue("edgeBanding.hdf.forbidden", `HDF panel ${panel.id} must not have edge banding`, `edgeBanding.${edge.id}.panelId`));
    }
  }

  return errors;
}

function collectDrillingErrors(model: ProductionJsonV4): ProductionJsonV4ValidationIssue[] {
  const errors: ProductionJsonV4ValidationIssue[] = [];

  for (const drill of model.drilling) {
    if (drill.requiresTechnologistCheck) {
      continue;
    }
    if (!hasCoordinateDecision(drill)) {
      errors.push(
        issue(
          "drilling.final.missing-coordinate-decision",
          `Final drilling ${drill.id} must include coordinate decision for coordinateSpace ${drill.coordinateSpace}`,
          `drilling.${drill.id}`,
        ),
      );
    }
  }

  return errors;
}

function collectB3dClaimErrors(serialized: string): ProductionJsonV4ValidationIssue[] {
  const errors: ProductionJsonV4ValidationIssue[] = [];
  for (const forbidden of FORBIDDEN_B3D_CLAIMS) {
    if (serialized.includes(forbidden)) {
      errors.push(issue("basis.auto-b3d.forbidden", `Production JSON must not claim automatic .b3d generation (${forbidden})`));
    }
  }
  if (serialized.includes("create-b3d")) {
    errors.push(issue("basis.create-b3d.forbidden", "Production JSON must not reference create-b3d command id"));
  }
  return errors;
}

function collectLockedRuleErrors(model: ProductionJsonV4): ProductionJsonV4ValidationIssue[] {
  const errors: ProductionJsonV4ValidationIssue[] = [];

  if (model.schema !== PRODUCTION_JSON_V4_SCHEMA) {
    errors.push(issue("schema.invalid", `schema must be ${PRODUCTION_JSON_V4_SCHEMA}`, "schema"));
  }
  if (model.basisCompatibility.doesNotGenerateB3d !== true) {
    errors.push(issue("basis.doesNotGenerateB3d.invalid", "basisCompatibility.doesNotGenerateB3d must be true", "basisCompatibility.doesNotGenerateB3d"));
  }
  if (model.basisCompatibility.status !== "manual-json-ready") {
    errors.push(issue("basis.status.invalid", "basisCompatibility.status must be manual-json-ready", "basisCompatibility.status"));
  }
  if (model.basisCompatibility.mode !== "manual-json") {
    errors.push(issue("basis.mode.invalid", "basisCompatibility.mode must be manual-json", "basisCompatibility.mode"));
  }
  if (model.review.visibleToClient !== false) {
    errors.push(issue("review.visibleToClient.invalid", "review.visibleToClient must be false", "review.visibleToClient"));
  }
  if (model.rules.materials.body.thicknessMm !== 16 || model.rules.materials.body.kind !== "ldsp") {
    errors.push(issue("rules.materials.body.invalid", "rules.materials.body must be LDSP 16 mm", "rules.materials"));
  }
  if (model.rules.materials.facade.ldspThicknessMm !== 16 || model.rules.materials.facade.mdfThicknessMm !== 18) {
    errors.push(issue("rules.materials.facade.invalid", "rules.materials.facade must be LDSP 16 / MDF 18", "rules.materials.facade"));
  }
  if (model.rules.materials.hdf.thicknessMm !== 3) {
    errors.push(issue("rules.materials.hdf.invalid", "rules.materials.hdf must be 3 mm", "rules.materials.hdf"));
  }
  if (model.rules.materials.drawerBottom.kind !== "hdf" || model.rules.materials.drawerBottom.thicknessMm !== 3) {
    errors.push(issue("rules.materials.drawerBottom.invalid", "rules.materials.drawerBottom must be HDF 3 mm", "rules.materials.drawerBottom"));
  }
  if (model.rules.edgeBanding.bodyThicknessMm !== 1 || model.rules.edgeBanding.facadeThicknessMm !== 2) {
    errors.push(issue("rules.edgeBanding.invalid", "edge banding policy must be body 1 mm / facade 2 mm", "rules.edgeBanding"));
  }
  if (model.rules.pairedFacadePolicy.centerGapMm !== 3) {
    errors.push(issue("rules.pairedFacadePolicy.invalid", "paired facade center gap must be 3 mm total", "rules.pairedFacadePolicy.centerGapMm"));
  }
  if (model.rules.topPanelPlacement !== "between-sides") {
    errors.push(issue("rules.topPanelPlacement.invalid", "top panel must be between side panels", "rules.topPanelPlacement"));
  }
  if (model.rules.bodyConstruction !== "side-panels-on-bottom") {
    errors.push(issue("rules.bodyConstruction.invalid", "body construction must be side-panels-on-bottom", "rules.bodyConstruction"));
  }

  for (const groove of model.grooves) {
    if (!groove.requiresTechnologistCheck) {
      errors.push(issue("groove.requiresTechnologistCheck.invalid", `Groove ${groove.id} must require technologist check`, `grooves.${groove.id}`));
    }
  }

  return errors;
}

export function validateProductionJsonV4(model: ProductionJsonV4): ValidationResult {
  const serialized = JSON.stringify(model);
  const errors = [
    ...collectLockedRuleErrors(model),
    ...collectMaterialErrors(model),
    ...collectEdgeBandingErrors(model),
    ...collectReferenceErrors(model),
    ...collectDrillingErrors(model),
    ...collectB3dClaimErrors(serialized),
  ];

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function assertProductionJsonV4Invariants(model: ProductionJsonV4): void {
  const result = validateProductionJsonV4(model);
  if (!result.ok) {
    const summary = result.errors.map((error) => `${error.code}: ${error.message}`).join("; ");
    throw new Error(`Production JSON v4 invariant violation: ${summary}`);
  }
}
