import type { BasisExportPlanStep, FaceSide, HardwareItem, HardwareType, Panel } from "../../geometry/types.js";
import type { ProductionExportPackage } from "../types.js";
import type {
  AssemblyContactV4,
  AssemblyV4,
  BasisManualPlanStepV4,
  DrillingV4,
  EdgeBandingSideV4,
  EdgeBandingV4,
  HardwareTypeV4,
  HardwareV4,
  MaterialKindV4,
  MaterialV4,
  PanelFaceSideV4,
  PanelRoleV4,
  PanelV4,
  ProductionJsonV4,
  ProductTypeV4,
  ReviewStatusV4,
  SupportModeV4,
  SupportV4,
  TextureDirectionV4,
  ValidationIssueV4,
} from "./types.js";
import { deriveTextureDirectionFromPanelSize } from "./materialPolicy.js";
import { PRODUCTION_JSON_V4_SCHEMA } from "./types.js";
import { buildAssemblyPolicySnapshot } from "./assemblyPolicy.js";
import { enrichPanelSemanticsV4 } from "./panelProjection.js";

const HDF_PANEL_ROLES = new Set<PanelRoleV4>(["back-panel", "drawer-bottom"]);

const FACADE_PANEL_ROLES = new Set<PanelRoleV4>(["facade-door", "drawer-front"]);

const EDGE_SIDES = ["front", "back", "left", "right"] as const;

type AdapterWarning = ValidationIssueV4;

function sanitizeMaterialId(materialId: string): string {
  return materialId.replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 64);
}

function materialSnapshotId(kind: MaterialKindV4, thicknessMm: number, materialId: string): string {
  return `mat-v3-${kind}-${thicknessMm}-${sanitizeMaterialId(materialId)}`;
}

function resolveOrderId(input: ProductionExportPackage): string {
  const revision = input.revisions[0];
  if (revision?.id.startsWith("production-rev-")) {
    const stripped = revision.id.slice("production-rev-".length);
    const match = stripped.match(/^(.+)-\d+$/);
    if (match?.[1]) {
      return match[1];
    }
  }
  return `v3-${input.project.productType}-${input.meta.configVersion}`;
}

function mapProductType(productType: ProductionExportPackage["project"]["productType"]): ProductTypeV4 {
  return productType;
}

function mapPanelRole(panel: Panel): PanelRoleV4 {
  if (panel.role !== "drawer-side") {
    return panel.role as PanelRoleV4;
  }

  const name = panel.name.toLowerCase();
  const article = panel.basis.article.toLowerCase();
  if (name.includes("лев") || article.endsWith("-l")) {
    return "drawer-side-left";
  }
  if (name.includes("прав") || article.endsWith("-r")) {
    return "drawer-side-right";
  }
  return panel.faceSide === "right" ? "drawer-side-left" : "drawer-side-right";
}

function normalizeMaterial(
  panel: Panel,
  mappedRole: PanelRoleV4,
  project: ProductionExportPackage["project"],
  warnings: AdapterWarning[],
): { kind: MaterialKindV4; thicknessMm: number; materialId: string } {
  if (HDF_PANEL_ROLES.has(mappedRole) || panel.materialType === "hdf") {
    if (panel.thicknessMm !== 3 || panel.materialType !== "hdf") {
      warnings.push({
        code: "adapter.material.hdf.normalized",
        severity: "warning",
        visibleToClient: false,
        requiresTechnologistCheck: true,
        message: `Panel ${panel.id} normalized to HDF 3 mm for v4 projection`,
        path: `panels.${panel.id}`,
      });
    }
    return {
      kind: "hdf",
      thicknessMm: 3,
      materialId: panel.materialId || project.material.backPanelMaterialId || "hdf-default",
    };
  }

  if (FACADE_PANEL_ROLES.has(mappedRole)) {
    const kind: MaterialKindV4 = panel.materialType === "mdf" ? "mdf" : "ldsp";
    const thicknessMm = kind === "mdf" ? 18 : 16;
    if (panel.thicknessMm !== thicknessMm || panel.materialType !== kind) {
      warnings.push({
        code: "adapter.material.facade.normalized",
        severity: "warning",
        visibleToClient: false,
        requiresTechnologistCheck: true,
        message: `Facade panel ${panel.id} normalized to ${kind.toUpperCase()} ${thicknessMm} mm for v4 projection`,
        path: `panels.${panel.id}`,
      });
    }
    return {
      kind,
      thicknessMm,
      materialId: panel.materialId || project.material.facadeMaterialId,
    };
  }

  if (panel.thicknessMm !== 16 || panel.materialType !== "ldsp") {
    warnings.push({
      code: "adapter.material.body.normalized",
      severity: "warning",
      visibleToClient: false,
      requiresTechnologistCheck: true,
      message: `Body panel ${panel.id} normalized to LDSP 16 mm for v4 projection`,
      path: `panels.${panel.id}`,
    });
  }

  return {
    kind: "ldsp",
    thicknessMm: 16,
    materialId: panel.materialId || project.material.bodyMaterialId,
  };
}

function textureDirectionForPanel(
  widthMm: number,
  heightMm: number,
  kind: MaterialKindV4,
  role: PanelRoleV4,
): TextureDirectionV4 {
  return deriveTextureDirectionFromPanelSize({
    dimensions: { widthMm, heightMm, thicknessMm: kind === "hdf" ? 3 : kind === "mdf" ? 18 : 16 },
    materialKind: kind,
    role,
  });
}

function mapFaceSide(role: PanelRoleV4, faceSide: FaceSide): PanelFaceSideV4 | undefined {
  if (FACADE_PANEL_ROLES.has(role) && faceSide === "front") {
    return "outer";
  }
  if (faceSide === "top") {
    return "top";
  }
  if (faceSide === "bottom") {
    return "bottom";
  }
  if (faceSide === "front" || faceSide === "back" || faceSide === "left" || faceSide === "right") {
    return "inner";
  }
  return undefined;
}

function orientationForRole(role: PanelRoleV4): PanelV4["orientation"] {
  switch (role) {
    case "side-left":
    case "side-right":
    case "vertical-partition":
    case "drawer-side-left":
    case "drawer-side-right":
      return { basisPanelKind: "vertical", plane: "YZ", normalAxis: "X" };
    case "bottom":
    case "top":
    case "shelf":
    case "drawer-back":
    case "drawer-bottom":
      return { basisPanelKind: "horizontal", plane: "XZ", normalAxis: "Y" };
    default:
      return { basisPanelKind: "frontal", plane: "XY", normalAxis: "Z" };
  }
}

function mapHardwareType(type: HardwareType): HardwareTypeV4 {
  switch (type) {
    case "hinge":
      return "hinge";
    case "drawer-slide":
      return "concealed-slide";
    case "shelf-support":
      return "reinforced-shelf-support";
    case "rod-holder":
      return "rod-holder";
    case "handle":
      return "handle";
    case "push-to-open":
      return "push-to-open";
    case "leg":
      return "adjustable-leg";
    case "confirmat":
      return "confirmat";
    default:
      return "confirmat";
  }
}

function mapReviewStatus(status: ProductionExportPackage["review"]["status"]): ReviewStatusV4 {
  if (status === "approved-for-basis") {
    return "approved";
  }
  if (status === "blocked") {
    return "blocked";
  }
  return "manual-review-required";
}

function mapBasisManualPlan(plan: BasisExportPlanStep[]): BasisManualPlanStepV4[] {
  const hasCreatePanels = plan.some((step) => step.action === "create-panel");
  const hasMaterials = plan.some((step) => step.action === "set-material");
  const hasEdge = plan.some((step) => step.action === "set-edge");
  const steps: BasisManualPlanStepV4[] = [];

  if (hasCreatePanels) {
    steps.push({
      id: "basis-step-create-panels",
      type: "create-panels",
      status: "manual",
      description: "Создать панели по списку panels",
    });
  }
  if (hasMaterials) {
    steps.push({
      id: "basis-step-apply-materials",
      type: "apply-materials",
      status: "manual",
      description: "Назначить материалы и направление текстуры",
    });
  }
  if (hasEdge) {
    steps.push({
      id: "basis-step-apply-edge",
      type: "apply-edge",
      status: "manual",
      description: "Нанести кромку по edgeBanding",
    });
  }

  steps.push({
    id: "basis-step-technologist-review",
    type: "technologist-review",
    status: "required",
    description: "Проверить пазы, присадку, фурнитуру и сборку",
  });

  return steps;
}

function buildMaterials(
  panels: PanelV4[],
  edgeBanding: EdgeBandingV4[],
  input: ProductionExportPackage,
  warnings: AdapterWarning[],
): MaterialV4[] {
  const materials = new Map<string, MaterialV4>();

  for (const panel of input.productionModel.panels) {
    const mappedRole = mapPanelRole(panel);
    const normalized = normalizeMaterial(panel, mappedRole, input.project, warnings);
    const id = materialSnapshotId(normalized.kind, normalized.thicknessMm, normalized.materialId);
    if (!materials.has(id)) {
      materials.set(id, {
        id,
        kind: normalized.kind,
        decorName: normalized.materialId,
        thicknessMm: normalized.thicknessMm,
        textureDirection: textureDirectionForPanel(panel.widthMm, panel.heightMm, normalized.kind, mappedRole),
        source: "seed",
      });
    }
  }

  for (const edge of edgeBanding) {
    if (!edge.materialRef || materials.has(edge.materialRef)) {
      continue;
    }
    const sourcePanel = panels.find((panel) => panel.id === edge.panelId);
    const edgeKind: MaterialKindV4 = FACADE_PANEL_ROLES.has(sourcePanel?.role ?? "shelf") ? "ldsp" : "ldsp";
    materials.set(edge.materialRef, {
      id: edge.materialRef,
      kind: edgeKind,
      decorName: `edge-${edge.thicknessMm}mm`,
      thicknessMm: edge.thicknessMm,
      textureDirection: "none",
      source: "manual",
    });
  }

  return [...materials.values()];
}

function buildEdgeBanding(
  input: ProductionExportPackage,
  panelById: Map<string, PanelV4>,
  warnings: AdapterWarning[],
): EdgeBandingV4[] {
  const edges: EdgeBandingV4[] = [];

  for (const panel of input.productionModel.panels) {
    const mappedRole = mapPanelRole(panel);
    if (HDF_PANEL_ROLES.has(mappedRole)) {
      continue;
    }

    const expectedThickness = FACADE_PANEL_ROLES.has(mappedRole) ? 2 : 1;
    for (const side of EDGE_SIDES) {
      const edgeSide = panel.edgeBanding?.[side];
      if (!edgeSide) {
        continue;
      }

      const thicknessMm = expectedThickness;
      if (edgeSide.thicknessMm !== expectedThickness) {
        warnings.push({
          code: "adapter.edgeBanding.normalized",
          severity: "warning",
          visibleToClient: false,
          requiresTechnologistCheck: true,
          message: `Edge on ${panel.id}/${side} normalized to ${expectedThickness} mm for v4 projection`,
          path: `edgeBanding.${panel.id}.${side}`,
        });
      }

      const edgeId = `edge-${panel.id}-${side}`;
      const materialRef = `edge-v3-${thicknessMm}-${sanitizeMaterialId(edgeSide.materialId)}`;
      edges.push({
        id: edgeId,
        objectType: "edgeBanding",
        panelId: panel.id,
        side: side as EdgeBandingSideV4,
        materialRef,
        thicknessMm,
        lengthMm: edgeSide.lengthMm,
        visible: side === "front" || FACADE_PANEL_ROLES.has(mappedRole),
        basisOperation: "apply-edge",
      });
    }
  }

  for (const edge of edges) {
    const panel = panelById.get(edge.panelId);
    if (!panel) {
      continue;
    }
    panel.edgeBandingRefs = [...(panel.edgeBandingRefs ?? []), edge.id];
  }

  return edges;
}

function buildPanels(input: ProductionExportPackage, warnings: AdapterWarning[]): PanelV4[] {
  return input.productionModel.panels.map((panel) => {
    const role = mapPanelRole(panel);
    const normalized = normalizeMaterial(panel, role, input.project, warnings);
    const materialRef = materialSnapshotId(normalized.kind, normalized.thicknessMm, normalized.materialId);
    const textureDirection = textureDirectionForPanel(
      panel.widthMm,
      panel.heightMm,
      normalized.kind,
      role,
    );

    const mapped: PanelV4 = {
      id: panel.id,
      objectType: "panel",
      basisObjectType: "panel",
      role,
      name: panel.name,
      article: panel.basis.article,
      materialRef,
      materialKind: normalized.kind,
      thicknessMm: normalized.thicknessMm,
      dimensions: {
        widthMm: panel.widthMm,
        heightMm: panel.heightMm,
        thicknessMm: normalized.thicknessMm,
      },
      position: {
        xMm: panel.position.xMm,
        yMm: panel.position.yMm,
        zMm: panel.position.zMm,
      },
      orientation: orientationForRole(role),
      faceSide: mapFaceSide(role, panel.faceSide),
      textureDirection,
      includeInDocumentation: panel.basis.includeInDocs,
      edgeBandingRefs: [],
      grooveRefs: [],
      hardwareRefs: [],
      drillingRefs: [],
      review: {
        requiresTechnologistCheck: false,
        visibleToClient: false,
      },
    };

    if (role === "shelf") {
      mapped.frontInsetMm = 30;
    }

    if (FACADE_PANEL_ROLES.has(role)) {
      mapped.facadeGaps = {
        topMm: 1.5,
        rightMm: 1.5,
        bottomMm: 1.5,
        leftMm: 1.5,
      };
      if (input.productionModel.panels.filter((item) => item.role === "facade-door").length >= 2) {
        mapped.pairedFacadeCenterGapMm = 3;
      }
    }

    return mapped;
  });
}

function buildDrilling(input: ProductionExportPackage, warnings: AdapterWarning[]): DrillingV4[] {
  return input.productionModel.drilling.map((operation) => {
    const requiresTechnologistCheck = operation.requiresTechnologistCheck !== false;
    if (!requiresTechnologistCheck) {
      warnings.push({
        code: "adapter.drilling.forced-technologist-check",
        severity: "warning",
        visibleToClient: false,
        requiresTechnologistCheck: true,
        message: `Drilling ${operation.id} forced to requiresTechnologistCheck=true until P2-07 is finalized`,
        path: `drilling.${operation.id}`,
      });
    }

    return {
      id: operation.id,
      objectType: "drilling",
      panelId: operation.panelId,
      purpose: operation.purpose,
      side: operation.side,
      coordinateSpace: "world",
      world: {
        xMm: operation.xMm,
        yMm: operation.yMm,
        zMm: operation.zMm,
      },
      local: null,
      diameterMm: operation.diameterMm,
      depthMm: operation.depthMm,
      templateRef: null,
      requiresTechnologistCheck: true,
    };
  });
}

function buildHardware(
  input: ProductionExportPackage,
  panels: PanelV4[],
  warnings: AdapterWarning[],
): HardwareV4[] {
  const panelById = new Map(panels.map((panel) => [panel.id, panel]));

  return input.productionModel.hardware.map((item) => mapHardwareItem(item, panelById, warnings));
}

function mapHardwareItem(
  item: HardwareItem,
  panelById: Map<string, PanelV4>,
  warnings: AdapterWarning[],
): HardwareV4 {
  const mappedType = mapHardwareType(item.type);
  if (mappedType === "confirmat" && item.type !== "confirmat") {
    warnings.push({
      code: "adapter.hardware.type.mapped",
      severity: "warning",
      visibleToClient: false,
      requiresTechnologistCheck: true,
      message: `Hardware ${item.id} type ${item.type} mapped to ${mappedType} in v4 projection`,
      path: `hardware.${item.id}.type`,
    });
  }

  const facadePanelId = item.linkedPanelIds.find((panelId) => {
    const panel = panelById.get(panelId);
    return panel && FACADE_PANEL_ROLES.has(panel.role);
  });
  const mountingPanelId = item.linkedPanelIds.find((panelId) => {
    const panel = panelById.get(panelId);
    return panel && !FACADE_PANEL_ROLES.has(panel.role);
  }) ?? item.linkedPanelIds[0];

  const mapped: HardwareV4 = {
    id: item.id,
    objectType: "hardware",
    basisObjectType: "furniture-component",
    type: mappedType,
    supplier: item.vendor || undefined,
    model: item.name,
    sku: null,
    article: null,
    mountingPanelId,
    facadePanelId,
    mountingTemplateId: null,
    drillingRefs: [...item.drillingRefs],
    requiresTechnologistCheck: true,
  };

  if (mappedType === "hinge") {
    mapped.openingAngleDeg = 105;
    mapped.cupDiameterMm = 35;
    mapped.minCupDepthMm = 12;
    mapped.doorType = "overlay";
  }

  if (mountingPanelId) {
    const panel = panelById.get(mountingPanelId);
    if (panel) {
      panel.hardwareRefs = [...(panel.hardwareRefs ?? []), item.id];
    }
  }

  return mapped;
}

function buildSupports(input: ProductionExportPackage, warnings: AdapterWarning[]): SupportV4[] {
  const legs = input.productionModel.hardware.filter((item) => item.type === "leg");
  const hasPlinth = input.productionModel.panels.some((panel) => panel.role === "plinth");
  const bottomPanel = input.productionModel.panels.find((panel) => panel.role === "bottom");

  if (legs.length > 0) {
    return legs.map((leg) => ({
      id: `support-${leg.id}`,
      objectType: "support",
      mode: "adjustable-leg-60" satisfies SupportModeV4,
      heightMm: 60,
      hardwareRequired: true,
      affectsBodyGeometry: true,
      requiresTechnologistCheck: false,
      mountingPanelId: bottomPanel?.id,
    }));
  }

  if (hasPlinth) {
    warnings.push({
      code: "adapter.support.plinth-panel",
      severity: "warning",
      visibleToClient: false,
      requiresTechnologistCheck: true,
      message: "v3 plinth panel mapped with no-support-on-bottom; plinth geometry remains in panels",
      path: "supports",
    });
  }

  return [
    {
      id: "support-no-support-on-bottom",
      objectType: "support",
      mode: "no-support-on-bottom",
      heightMm: 0,
      hardwareRequired: false,
      affectsBodyGeometry: true,
      requiresTechnologistCheck: false,
      mountingPanelId: bottomPanel?.id,
    },
  ];
}

function buildAssemblies(panels: PanelV4[], hardware: HardwareV4[], supports: SupportV4[]): AssemblyV4[] {
  const panelIds = new Set(panels.map((panel) => panel.id));
  const byRole = (role: PanelRoleV4) => panels.find((panel) => panel.role === role)?.id;

  const sideLeft = byRole("side-left");
  const sideRight = byRole("side-right");
  const bottom = byRole("bottom");
  const top = byRole("top");

  const contacts: AssemblyContactV4[] = [];
  if (sideLeft && bottom) {
    contacts.push({
      id: "contact-side-left-bottom",
      panelId: sideLeft,
      restsOnPanelId: bottom,
      contactType: "vertical-panel-on-horizontal-panel",
      fasteningDirection: "from-bottom",
      requiresFasteners: true,
    });
  }
  if (sideRight && bottom) {
    contacts.push({
      id: "contact-side-right-bottom",
      panelId: sideRight,
      restsOnPanelId: bottom,
      contactType: "vertical-panel-on-horizontal-panel",
      fasteningDirection: "from-bottom",
      requiresFasteners: true,
    });
  }
  if (top && sideLeft) {
    contacts.push({
      id: "contact-top-between-sides-left",
      panelId: top,
      restsOnPanelId: sideLeft,
      contactType: "vertical-panel-on-horizontal-panel",
      fasteningDirection: "from-side",
      requiresFasteners: true,
    });
  }
  if (top && sideRight) {
    contacts.push({
      id: "contact-top-between-sides-right",
      panelId: top,
      restsOnPanelId: sideRight,
      contactType: "vertical-panel-on-horizontal-panel",
      fasteningDirection: "from-side",
      requiresFasteners: true,
    });
  }

  const bodyChildren = panels
    .filter((panel) => panel.role !== "facade-door" && panel.role !== "drawer-front")
    .map((panel) => panel.id);
  const supportChildren = supports.map((support) => support.id);

  const assemblies: AssemblyV4[] = [
    {
      id: "assembly-body",
      objectType: "assembly",
      basisObjectType: "composite-object",
      role: "body",
      children: [...bodyChildren, ...supportChildren].filter((id) => panelIds.has(id) || supportChildren.includes(id)),
      contacts,
    },
  ];

  const facadePanels = panels.filter((panel) => panel.role === "facade-door" || panel.role === "drawer-front");
  const facadeHardware = hardware.filter((item) => item.type === "hinge" || item.type === "handle");
  if (facadePanels.length > 0) {
    assemblies.push({
      id: "assembly-facade-block",
      objectType: "assembly",
      basisObjectType: "composite-object",
      role: "facade-block",
      children: [...facadePanels.map((panel) => panel.id), ...facadeHardware.map((item) => item.id)],
      contacts: [],
    });
  }

  return assemblies;
}

function mapValidationIssues(input: ProductionExportPackage, adapterWarnings: AdapterWarning[]) {
  const errors: ValidationIssueV4[] = input.validation.errors.map((message, index) => ({
    code: `v3.validation.error.${index + 1}`,
    severity: "error",
    visibleToClient: false,
    message,
  }));

  const warnings: ValidationIssueV4[] = [
    ...adapterWarnings,
    ...input.validation.warnings.map((message, index) => ({
      code: `v3.validation.warning.${index + 1}`,
      severity: "warning" as const,
      visibleToClient: false,
      message,
    })),
    ...input.productionModel.warnings.map((warning) => ({
      code: warning.code,
      severity: warning.severity === "error" ? ("error" as const) : ("warning" as const),
      visibleToClient: false,
      requiresTechnologistCheck: warning.severity !== "info",
      message: warning.message,
      path: warning.panelId ? `panels.${warning.panelId}` : undefined,
    })),
  ];

  if (input.productionModel.drilling.length > 0) {
    warnings.push({
      code: "drilling-template-not-final",
      severity: "warning",
      visibleToClient: false,
      requiresTechnologistCheck: true,
      message: "Присадка требует проверки технологом (P2-07 не финализирован)",
    });
  }

  return { errors, warnings };
}

export function buildProductionJsonV4FromV3(input: ProductionExportPackage): ProductionJsonV4 {
  const adapterWarnings: AdapterWarning[] = [];
  const panels = buildPanels(input, adapterWarnings);
  const panelById = new Map(panels.map((panel) => [panel.id, panel]));
  const edgeBanding = buildEdgeBanding(input, panelById, adapterWarnings);
  const materials = buildMaterials(panels, edgeBanding, input, adapterWarnings);
  const drilling = buildDrilling(input, adapterWarnings);
  const hardware = buildHardware(input, panels, adapterWarnings);
  const supports = buildSupports(input, adapterWarnings);
  const assemblies = buildAssemblies(panels, hardware, supports);

  const hasPlinth = panels.some((panel) => panel.role === "plinth");
  const heightIncludesSupportMm = hasPlinth || supports.some((support) => support.affectsBodyGeometry);

  const validation = mapValidationIssues(input, adapterWarnings);

  const model: ProductionJsonV4 = {
    schema: PRODUCTION_JSON_V4_SCHEMA,
    meta: {
      orderId: resolveOrderId(input),
      generator: "razmerno-production-v4-adapter",
      configVersion: input.meta.configVersion,
      createdAt: input.meta.createdAt,
      source: input.source,
    },
    basisCompatibility: {
      target: "basis-mebelshchik",
      mode: "manual-json",
      status: "manual-json-ready",
      doesNotGenerateB3d: true,
      requiresTechnologist: input.manufacturing.requiresTechnologistCheck,
    },
    coordinateSystem: {
      unit: "mm",
      worldOrigin: "front-bottom-left",
      axes: {
        x: "left-to-right",
        y: "bottom-to-top",
        z: "front-to-back",
      },
      precisionMm: 0.1,
    },
    product: {
      type: mapProductType(input.project.productType),
      widthMm: input.project.dimensions.widthMm,
      heightMm: input.project.dimensions.heightMm,
      depthMm: input.project.dimensions.depthMm,
      heightIncludesSupportMm,
    },
    rules: {
      materials: {
        body: { kind: "ldsp", thicknessMm: 16, locked: true },
        facade: { ldspThicknessMm: 16, mdfThicknessMm: 18 },
        hdf: { thicknessMm: 3 },
        drawerBottom: { kind: "hdf", thicknessMm: 3 },
      },
      edgeBanding: {
        bodyThicknessMm: 1,
        facadeThicknessMm: 2,
        bodyCoverage: "all-around",
        facadeCoverage: "all-around",
        hdfCoverage: "none",
      },
      facadeGapMm: 1.5,
      shelfFrontInsetMm: 30,
      bodyConstruction: "side-panels-on-bottom",
      topPanelPlacement: "between-sides",
      pairedFacadePolicy: {
        centerGapMm: 3,
        sideGapMm: 1.5,
      },
      textureDirectionPolicy: "longest-panel-side",
      hdfTextureDirection: "none",
    },
    materials,
    panels,
    assemblies,
    edgeBanding,
    grooves: [],
    hardware,
    drilling,
    supports,
    basisManualPlan: mapBasisManualPlan(input.basis.plan),
    validation,
    review: {
      visibleToClient: false,
      requiresTechnologistCheck: input.manufacturing.requiresTechnologistCheck,
      status: mapReviewStatus(input.review.status),
    },
    revisions: input.revisions.map((revision) => ({
      id: revision.id,
      createdAt: revision.createdAt,
      label: revision.note,
      status: mapReviewStatus(revision.status),
    })),
  };

  const enriched = enrichPanelSemanticsV4(model);

  return {
    ...enriched,
    assemblyPolicySnapshot: buildAssemblyPolicySnapshot(enriched),
  };
}
