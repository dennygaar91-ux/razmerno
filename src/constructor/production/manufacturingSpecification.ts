import type {
  BasisExportAction,
  BasisExportStatus,
  DrillingPurpose,
  EdgeSide,
  HardwareType,
  MaterialType,
  PanelRole,
  ProductionModelWarning,
} from "../geometry/types.js";
import type { ProductionExportPackage } from "./types.js";

type EdgeSignature = Record<EdgeSide, number | null>;

export interface ManufacturingCutListItem {
  role: PanelRole;
  materialType: MaterialType;
  materialId: string;
  thicknessMm: number;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  faceSide: string;
  includeInDocumentation: boolean;
  edgeBanding: EdgeSignature;
  quantity: number;
  panelIds: string[];
}

export interface ManufacturingSpecification {
  schema: "razmerno.manufacturing-spec.v1";
  derivedFrom: {
    productionExportSchema: ProductionExportPackage["schema"];
    productionModelSchema: ProductionExportPackage["productionModel"]["schema"];
    basisBoundary: "manual-json";
  };
  units: ProductionExportPackage["units"];
  product: {
    productType: ProductionExportPackage["project"]["productType"];
    dimensions: ProductionExportPackage["project"]["dimensions"];
    sectionCount: number;
    facadeMode: ProductionExportPackage["project"]["structure"]["facadeMode"];
    openingMode: ProductionExportPackage["project"]["structure"]["openingMode"];
    hardwareMode: ProductionExportPackage["project"]["structure"]["hardwareMode"];
    materials: {
      bodyMaterialId: string;
      facadeMaterialId: string;
      backPanelMaterialId?: string;
      bodyThicknessMm: number;
      facadeThicknessMm: number;
      backPanelThicknessMm: number;
    };
  };
  cutList: {
    totalPanels: number;
    groupedItems: ManufacturingCutListItem[];
  };
  edgeBanding: {
    totalEdges: number;
    totalLengthMm: number;
    byThickness: Array<{
      thicknessMm: number;
      count: number;
      totalLengthMm: number;
      materialIds: string[];
    }>;
    byPanelRole: Array<{
      role: PanelRole;
      count: number;
      totalLengthMm: number;
    }>;
  };
  hardware: {
    totalItems: number;
    byType: Array<{
      type: HardwareType;
      vendor: string;
      visibleInViewer: boolean;
      includeInDocumentation: boolean;
      count: number;
    }>;
  };
  drilling: {
    totalOperations: number;
    requiresTechnologistCheck: boolean;
    byPurpose: Array<{
      purpose: DrillingPurpose;
      diameterMm: number;
      depthMm: number;
      side: string;
      through: boolean;
      requiresTechnologistCheck: boolean;
      count: number;
    }>;
  };
  operations: {
    basisManualPlanStepCount: number;
    byAction: Array<{
      action: BasisExportAction;
      count: number;
    }>;
    byStatus: Array<{
      status: BasisExportStatus;
      count: number;
    }>;
  };
  validation: {
    status: ProductionExportPackage["validation"]["status"];
    errorCount: number;
    warningCount: number;
    productionWarningCodes: Array<{
      code: string;
      severity: ProductionModelWarning["severity"];
      count: number;
    }>;
    rulesStatus: ProductionExportPackage["rules"]["status"];
    autoWarningCount: number;
    autoRejectCount: number;
    autoRepairCount: number;
  };
  review: {
    status: ProductionExportPackage["review"]["status"];
    requiresTechnologistCheck: boolean;
    manualChangesAllowed: boolean;
    visibleToClient: boolean;
  };
  basisManualJson: {
    status: ProductionExportPackage["basis"]["status"];
    doesNotGenerateB3d: true;
    manualPlanStepCount: number;
  };
}

export function buildManufacturingSpecificationFromProductionExport(
  pack: ProductionExportPackage,
): ManufacturingSpecification {
  return {
    schema: "razmerno.manufacturing-spec.v1",
    derivedFrom: {
      productionExportSchema: pack.schema,
      productionModelSchema: pack.productionModel.schema,
      basisBoundary: "manual-json",
    },
    units: pack.units,
    product: {
      productType: pack.project.productType,
      dimensions: { ...pack.project.dimensions },
      sectionCount: pack.project.structure.sectionCount,
      facadeMode: pack.project.structure.facadeMode,
      openingMode: pack.project.structure.openingMode,
      hardwareMode: pack.project.structure.hardwareMode,
      materials: {
        bodyMaterialId: pack.project.material.bodyMaterialId,
        facadeMaterialId: pack.project.material.facadeMaterialId,
        backPanelMaterialId: pack.project.material.backPanelMaterialId,
        bodyThicknessMm: pack.project.material.bodyThicknessMm,
        facadeThicknessMm: pack.project.material.facadeThicknessMm,
        backPanelThicknessMm: pack.project.material.backPanelThicknessMm,
      },
    },
    cutList: {
      totalPanels: pack.productionModel.panels.length,
      groupedItems: buildCutList(pack),
    },
    edgeBanding: {
      totalEdges: pack.productionModel.edgeBanding.length,
      totalLengthMm: pack.productionModel.edgeBanding.reduce((sum, item) => sum + item.lengthMm, 0),
      byThickness: buildEdgeBandingByThickness(pack),
      byPanelRole: buildEdgeBandingByPanelRole(pack),
    },
    hardware: {
      totalItems: pack.productionModel.hardware.length,
      byType: buildHardwareSummary(pack),
    },
    drilling: {
      totalOperations: pack.productionModel.drilling.length,
      requiresTechnologistCheck:
        pack.manufacturing.requiresTechnologistCheck ||
        pack.productionModel.drilling.some((item) => item.requiresTechnologistCheck),
      byPurpose: buildDrillingSummary(pack),
    },
    operations: {
      basisManualPlanStepCount: pack.basis.plan.length,
      byAction: buildBasisActionSummary(pack),
      byStatus: buildBasisStatusSummary(pack),
    },
    validation: {
      status: pack.validation.status,
      errorCount: pack.validation.errors.length,
      warningCount: pack.validation.warnings.length,
      productionWarningCodes: buildProductionWarningSummary(pack),
      rulesStatus: pack.rules.status,
      autoWarningCount: pack.rules.autoWarnings.length,
      autoRejectCount: pack.rules.autoRejects.length,
      autoRepairCount: pack.rules.autoRepairs.length,
    },
    review: {
      status: pack.review.status,
      requiresTechnologistCheck: pack.manufacturing.requiresTechnologistCheck,
      manualChangesAllowed: pack.review.manualChangesAllowed,
      visibleToClient: pack.review.visibleToClient,
    },
    basisManualJson: {
      status: pack.basis.status,
      doesNotGenerateB3d: true,
      manualPlanStepCount: pack.basis.plan.length,
    },
  };
}

function buildCutList(pack: ProductionExportPackage): ManufacturingCutListItem[] {
  const groups = new Map<string, ManufacturingCutListItem>();

  for (const panel of [...pack.productionModel.panels].sort((left, right) => left.id.localeCompare(right.id))) {
    const edgeBanding = extractEdgeSignature(panel.edgeBanding);
    const key = [
      panel.role,
      panel.materialType,
      panel.materialId,
      panel.thicknessMm,
      panel.widthMm,
      panel.heightMm,
      panel.depthMm,
      panel.faceSide,
      panel.basis.includeInDocs ? "docs" : "no-docs",
      JSON.stringify(edgeBanding),
    ].join("|");

    const existing = groups.get(key);
    if (existing) {
      existing.quantity += 1;
      existing.panelIds.push(panel.id);
      continue;
    }

    groups.set(key, {
      role: panel.role,
      materialType: panel.materialType,
      materialId: panel.materialId,
      thicknessMm: panel.thicknessMm,
      widthMm: panel.widthMm,
      heightMm: panel.heightMm,
      depthMm: panel.depthMm,
      faceSide: panel.faceSide,
      includeInDocumentation: panel.basis.includeInDocs,
      edgeBanding,
      quantity: 1,
      panelIds: [panel.id],
    });
  }

  return [...groups.values()].sort((left, right) =>
    [
      left.role,
      left.materialType,
      left.materialId,
      left.widthMm,
      left.heightMm,
      left.depthMm,
      left.faceSide,
      left.panelIds[0] ?? "",
    ]
      .join("|")
      .localeCompare(
        [
          right.role,
          right.materialType,
          right.materialId,
          right.widthMm,
          right.heightMm,
          right.depthMm,
          right.faceSide,
          right.panelIds[0] ?? "",
        ].join("|"),
      ),
  );
}

function buildEdgeBandingByThickness(pack: ProductionExportPackage) {
  const groups = new Map<string, { thicknessMm: number; count: number; totalLengthMm: number; materialIds: Set<string> }>();

  for (const item of pack.productionModel.edgeBanding) {
    const key = String(item.thicknessMm);
    const existing = groups.get(key) ?? {
      thicknessMm: item.thicknessMm,
      count: 0,
      totalLengthMm: 0,
      materialIds: new Set<string>(),
    };
    existing.count += 1;
    existing.totalLengthMm += item.lengthMm;
    existing.materialIds.add(item.materialId);
    groups.set(key, existing);
  }

  return [...groups.values()]
    .map((item) => ({
      thicknessMm: item.thicknessMm,
      count: item.count,
      totalLengthMm: item.totalLengthMm,
      materialIds: [...item.materialIds].sort(),
    }))
    .sort((left, right) => left.thicknessMm - right.thicknessMm);
}

function buildEdgeBandingByPanelRole(pack: ProductionExportPackage) {
  const panelRoleById = new Map(pack.productionModel.panels.map((panel) => [panel.id, panel.role] as const));
  const groups = new Map<PanelRole, { role: PanelRole; count: number; totalLengthMm: number }>();

  for (const item of pack.productionModel.edgeBanding) {
    const role = panelRoleById.get(item.panelId);
    if (!role) continue;
    const existing = groups.get(role) ?? { role, count: 0, totalLengthMm: 0 };
    existing.count += 1;
    existing.totalLengthMm += item.lengthMm;
    groups.set(role, existing);
  }

  return [...groups.values()].sort((left, right) => left.role.localeCompare(right.role));
}

function buildHardwareSummary(pack: ProductionExportPackage) {
  const groups = new Map<string, {
    type: HardwareType;
    vendor: string;
    visibleInViewer: boolean;
    includeInDocumentation: boolean;
    count: number;
  }>();

  for (const item of pack.productionModel.hardware) {
    const key = [item.type, item.vendor, item.visibleInViewer ? "viewer" : "hidden", item.includeInDocs ? "docs" : "no-docs"].join("|");
    const existing = groups.get(key) ?? {
      type: item.type,
      vendor: item.vendor,
      visibleInViewer: item.visibleInViewer,
      includeInDocumentation: item.includeInDocs,
      count: 0,
    };
    existing.count += 1;
    groups.set(key, existing);
  }

  return [...groups.values()].sort((left, right) =>
    [left.type, left.vendor, String(left.visibleInViewer), String(left.includeInDocumentation)].join("|")
      .localeCompare([right.type, right.vendor, String(right.visibleInViewer), String(right.includeInDocumentation)].join("|")),
  );
}

function buildDrillingSummary(pack: ProductionExportPackage) {
  const groups = new Map<string, {
    purpose: DrillingPurpose;
    diameterMm: number;
    depthMm: number;
    side: string;
    through: boolean;
    requiresTechnologistCheck: boolean;
    count: number;
  }>();

  for (const item of pack.productionModel.drilling) {
    const key = [
      item.purpose,
      item.diameterMm,
      item.depthMm,
      item.side,
      item.through ? "through" : "blind",
      item.requiresTechnologistCheck ? "needs-check" : "ready",
    ].join("|");
    const existing = groups.get(key) ?? {
      purpose: item.purpose,
      diameterMm: item.diameterMm,
      depthMm: item.depthMm,
      side: item.side,
      through: item.through,
      requiresTechnologistCheck: item.requiresTechnologistCheck,
      count: 0,
    };
    existing.count += 1;
    groups.set(key, existing);
  }

  return [...groups.values()].sort((left, right) =>
    [
      left.purpose,
      left.diameterMm,
      left.depthMm,
      left.side,
      String(left.through),
      String(left.requiresTechnologistCheck),
    ]
      .join("|")
      .localeCompare(
        [
          right.purpose,
          right.diameterMm,
          right.depthMm,
          right.side,
          String(right.through),
          String(right.requiresTechnologistCheck),
        ].join("|"),
      ),
  );
}

function buildBasisActionSummary(pack: ProductionExportPackage) {
  return buildCountSummary(pack.basis.plan.map((step) => step.action), "action");
}

function buildBasisStatusSummary(pack: ProductionExportPackage) {
  return buildCountSummary(pack.basis.plan.map((step) => step.status), "status");
}

function buildProductionWarningSummary(pack: ProductionExportPackage) {
  const groups = new Map<string, { code: string; severity: ProductionModelWarning["severity"]; count: number }>();

  for (const item of pack.productionModel.warnings) {
    const key = `${item.code}|${item.severity}`;
    const existing = groups.get(key) ?? { code: item.code, severity: item.severity, count: 0 };
    existing.count += 1;
    groups.set(key, existing);
  }

  return [...groups.values()].sort((left, right) =>
    [left.code, left.severity].join("|").localeCompare([right.code, right.severity].join("|")),
  );
}

function buildCountSummary<T extends string>(
  items: T[],
  property: "action" | "status",
): Array<{ [key in typeof property]: T } & { count: number }> {
  const counts = new Map<T, number>();
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([value, count]) => ({ [property]: value, count }) as { [key in typeof property]: T } & { count: number });
}

function extractEdgeSignature(edgeBanding: Partial<Record<EdgeSide, { thicknessMm: number }>>): EdgeSignature {
  return {
    front: edgeBanding.front?.thicknessMm ?? null,
    back: edgeBanding.back?.thicknessMm ?? null,
    left: edgeBanding.left?.thicknessMm ?? null,
    right: edgeBanding.right?.thicknessMm ?? null,
  };
}
