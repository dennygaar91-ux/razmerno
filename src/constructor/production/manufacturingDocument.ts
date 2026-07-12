import type {
  ManufacturingCutListItem,
  ManufacturingSpecification,
} from "./manufacturingSpecification.js";

export interface ManufacturingDocument {
  schema: "razmerno.manufacturing-document.v1";
  derivedFrom: {
    manufacturingSpecificationSchema: ManufacturingSpecification["schema"];
    basisBoundary: "manual-json";
  };
  sections: {
    cover: {
      title: "Manufacturing Specification";
      productType: string;
      dimensionsLabel: string;
      sectionCount: number;
      facadeMode: string;
      openingMode: string;
      hardwareMode: string;
      bodyMaterialId: string;
      facadeMaterialId: string;
      backPanelMaterialId: string | null;
      basisBoundaryStatement: string;
      automaticB3dStatement: string;
      technologistReviewStatement: string;
    };
    cutList: {
      title: "Cut List";
      totalPanels: number;
      items: Array<{
        role: string;
        material: string;
        thicknessMm: number;
        sizeMm: string;
        quantity: number;
        edgeBanding: string;
      }>;
    };
    edgeBanding: {
      title: "Edge Banding Sheet";
      totalEdges: number;
      totalLengthMm: number;
      byThickness: Array<{
        thicknessMm: number;
        count: number;
        totalLengthMm: number;
        materialIds: string[];
      }>;
      byPanelRole: Array<{
        role: string;
        count: number;
        totalLengthMm: number;
      }>;
    };
    hardware: {
      title: "Hardware List";
      totalItems: number;
      items: Array<{
        type: string;
        vendor: string;
        count: number;
        includeInDocumentation: boolean;
        visibleInViewer: boolean;
      }>;
    };
    drillingAndOperations: {
      title: "Drilling and Operations Summary";
      totalOperations: number;
      requiresTechnologistCheck: boolean;
      drilling: Array<{
        purpose: string;
        count: number;
        diameterMm: number;
        depthMm: number;
        side: string;
        through: boolean;
        requiresTechnologistCheck: boolean;
      }>;
      basisActions: Array<{
        action: string;
        count: number;
      }>;
    };
    basisChecklist: {
      title: "Basis Manual Checklist";
      status: string;
      manualPlanStepCount: number;
      checklist: string[];
    };
    validation: {
      title: "Validation and Review Summary";
      status: string;
      reviewStatus: string;
      errorCount: number;
      warningCount: number;
      rulesStatus: string;
      productionWarnings: Array<{
        code: string;
        severity: string;
        count: number;
      }>;
      statements: string[];
    };
  };
}

export function buildManufacturingDocumentFromSpecification(
  spec: ManufacturingSpecification,
): ManufacturingDocument {
  const dimensionsLabel = `${spec.product.dimensions.widthMm} x ${spec.product.dimensions.heightMm} x ${spec.product.dimensions.depthMm} mm`;
  const requiresReview = spec.review.requiresTechnologistCheck;

  return {
    schema: "razmerno.manufacturing-document.v1",
    derivedFrom: {
      manufacturingSpecificationSchema: spec.schema,
      basisBoundary: "manual-json",
    },
    sections: {
      cover: {
        title: "Manufacturing Specification",
        productType: spec.product.productType,
        dimensionsLabel,
        sectionCount: spec.product.sectionCount,
        facadeMode: spec.product.facadeMode,
        openingMode: spec.product.openingMode,
        hardwareMode: spec.product.hardwareMode,
        bodyMaterialId: spec.product.materials.bodyMaterialId,
        facadeMaterialId: spec.product.materials.facadeMaterialId,
        backPanelMaterialId: spec.product.materials.backPanelMaterialId ?? null,
        basisBoundaryStatement: "Basis boundary: manual JSON handoff only.",
        automaticB3dStatement: "Automatic .b3d generation is not provided.",
        technologistReviewStatement: requiresReview
          ? "Technologist review may be required."
          : "Technologist review is not currently required by this specification.",
      },
      cutList: {
        title: "Cut List",
        totalPanels: spec.cutList.totalPanels,
        items: spec.cutList.groupedItems.map((item) => ({
          role: item.role,
          material: `${item.materialType}:${item.materialId}`,
          thicknessMm: item.thicknessMm,
          sizeMm: formatPanelSize(item),
          quantity: item.quantity,
          edgeBanding: formatEdgeBanding(item),
        })),
      },
      edgeBanding: {
        title: "Edge Banding Sheet",
        totalEdges: spec.edgeBanding.totalEdges,
        totalLengthMm: spec.edgeBanding.totalLengthMm,
        byThickness: spec.edgeBanding.byThickness.map((item) => ({
          thicknessMm: item.thicknessMm,
          count: item.count,
          totalLengthMm: item.totalLengthMm,
          materialIds: [...item.materialIds],
        })),
        byPanelRole: spec.edgeBanding.byPanelRole.map((item) => ({
          role: item.role,
          count: item.count,
          totalLengthMm: item.totalLengthMm,
        })),
      },
      hardware: {
        title: "Hardware List",
        totalItems: spec.hardware.totalItems,
        items: spec.hardware.byType.map((item) => ({
          type: item.type,
          vendor: item.vendor,
          count: item.count,
          includeInDocumentation: item.includeInDocumentation,
          visibleInViewer: item.visibleInViewer,
        })),
      },
      drillingAndOperations: {
        title: "Drilling and Operations Summary",
        totalOperations: spec.drilling.totalOperations,
        requiresTechnologistCheck: spec.drilling.requiresTechnologistCheck,
        drilling: spec.drilling.byPurpose.map((item) => ({
          purpose: item.purpose,
          count: item.count,
          diameterMm: item.diameterMm,
          depthMm: item.depthMm,
          side: item.side,
          through: item.through,
          requiresTechnologistCheck: item.requiresTechnologistCheck,
        })),
        basisActions: spec.operations.byAction.map((item) => ({
          action: item.action,
          count: item.count,
        })),
      },
      basisChecklist: {
        title: "Basis Manual Checklist",
        status: spec.basisManualJson.status,
        manualPlanStepCount: spec.basisManualJson.manualPlanStepCount,
        checklist: [
          "Confirm Basis boundary is manual JSON.",
          "Do not claim automatic .b3d generation.",
          "Review Basis manual plan steps before factory handoff.",
          spec.review.requiresTechnologistCheck
            ? "Technologist review is required before release to production."
            : "Technologist review is not currently flagged by the specification.",
        ],
      },
      validation: {
        title: "Validation and Review Summary",
        status: spec.validation.status,
        reviewStatus: spec.review.status,
        errorCount: spec.validation.errorCount,
        warningCount: spec.validation.warningCount,
        rulesStatus: spec.validation.rulesStatus,
        productionWarnings: spec.validation.productionWarningCodes.map((item) => ({
          code: item.code,
          severity: item.severity,
          count: item.count,
        })),
        statements: [
          `Validation status: ${spec.validation.status}.`,
          `Review status: ${spec.review.status}.`,
          `Manufacturing rules status: ${spec.validation.rulesStatus}.`,
          spec.review.requiresTechnologistCheck
            ? "Technologist review may be required."
            : "No technologist review requirement is currently flagged.",
        ],
      },
    },
  };
}

export function serializeManufacturingDocumentMarkdown(
  document: ManufacturingDocument,
): string {
  const lines: string[] = [];
  const { cover, cutList, edgeBanding, hardware, drillingAndOperations, basisChecklist, validation } =
    document.sections;

  lines.push(`# ${cover.title}`);
  lines.push("");
  lines.push(`- Product: ${cover.productType}`);
  lines.push(`- Dimensions: ${cover.dimensionsLabel}`);
  lines.push(`- Sections: ${cover.sectionCount}`);
  lines.push(`- Facade mode: ${cover.facadeMode}`);
  lines.push(`- Opening mode: ${cover.openingMode}`);
  lines.push(`- Hardware mode: ${cover.hardwareMode}`);
  lines.push(`- Body material: ${cover.bodyMaterialId}`);
  lines.push(`- Facade material: ${cover.facadeMaterialId}`);
  lines.push(`- Back panel material: ${cover.backPanelMaterialId ?? "not-specified"}`);
  lines.push(`- ${cover.basisBoundaryStatement}`);
  lines.push(`- ${cover.automaticB3dStatement}`);
  lines.push(`- ${cover.technologistReviewStatement}`);
  lines.push("");

  lines.push(`## ${cutList.title}`);
  lines.push("");
  lines.push(`Total panels: ${cutList.totalPanels}`);
  lines.push("");
  lines.push("| Role | Material | Thickness | Size | Qty | Edge banding |");
  lines.push("| --- | --- | ---: | --- | ---: | --- |");
  for (const item of cutList.items) {
    lines.push(
      `| ${item.role} | ${item.material} | ${item.thicknessMm} | ${item.sizeMm} | ${item.quantity} | ${item.edgeBanding} |`,
    );
  }
  lines.push("");

  lines.push(`## ${edgeBanding.title}`);
  lines.push("");
  lines.push(`Total edges: ${edgeBanding.totalEdges}`);
  lines.push(`Total edge banding length: ${edgeBanding.totalLengthMm} mm`);
  lines.push("");
  lines.push("| Thickness | Count | Total length | Materials |");
  lines.push("| ---: | ---: | ---: | --- |");
  for (const item of edgeBanding.byThickness) {
    lines.push(
      `| ${item.thicknessMm} | ${item.count} | ${item.totalLengthMm} | ${item.materialIds.join(", ")} |`,
    );
  }
  lines.push("");

  lines.push(`## ${hardware.title}`);
  lines.push("");
  lines.push(`Total hardware items: ${hardware.totalItems}`);
  lines.push("");
  lines.push("| Type | Vendor | Count | In docs | In viewer |");
  lines.push("| --- | --- | ---: | --- | --- |");
  for (const item of hardware.items) {
    lines.push(
      `| ${item.type} | ${item.vendor} | ${item.count} | ${item.includeInDocumentation ? "yes" : "no"} | ${item.visibleInViewer ? "yes" : "no"} |`,
    );
  }
  lines.push("");

  lines.push(`## ${drillingAndOperations.title}`);
  lines.push("");
  lines.push(`Total drilling operations: ${drillingAndOperations.totalOperations}`);
  lines.push(
    `Technologist check required: ${drillingAndOperations.requiresTechnologistCheck ? "yes" : "no"}`,
  );
  lines.push("");
  lines.push("| Purpose | Count | Diameter | Depth | Side | Through | Review |");
  lines.push("| --- | ---: | ---: | ---: | --- | --- | --- |");
  for (const item of drillingAndOperations.drilling) {
    lines.push(
      `| ${item.purpose} | ${item.count} | ${item.diameterMm} | ${item.depthMm} | ${item.side} | ${item.through ? "yes" : "no"} | ${item.requiresTechnologistCheck ? "yes" : "no"} |`,
    );
  }
  lines.push("");
  lines.push("| Basis action | Count |");
  lines.push("| --- | ---: |");
  for (const item of drillingAndOperations.basisActions) {
    lines.push(`| ${item.action} | ${item.count} |`);
  }
  lines.push("");

  lines.push(`## ${basisChecklist.title}`);
  lines.push("");
  lines.push(`Status: ${basisChecklist.status}`);
  lines.push(`Manual plan steps: ${basisChecklist.manualPlanStepCount}`);
  lines.push("");
  for (const item of basisChecklist.checklist) {
    lines.push(`- ${item}`);
  }
  lines.push("");

  lines.push(`## ${validation.title}`);
  lines.push("");
  lines.push(`Validation status: ${validation.status}`);
  lines.push(`Review status: ${validation.reviewStatus}`);
  lines.push(`Errors: ${validation.errorCount}`);
  lines.push(`Warnings: ${validation.warningCount}`);
  lines.push(`Rules status: ${validation.rulesStatus}`);
  lines.push("");
  lines.push("| Warning code | Severity | Count |");
  lines.push("| --- | --- | ---: |");
  for (const item of validation.productionWarnings) {
    lines.push(`| ${item.code} | ${item.severity} | ${item.count} |`);
  }
  lines.push("");
  for (const statement of validation.statements) {
    lines.push(`- ${statement}`);
  }
  lines.push("");

  return lines.join("\n");
}

function formatPanelSize(item: ManufacturingCutListItem) {
  return `${item.widthMm}x${item.heightMm}x${item.depthMm} mm`;
}

function formatEdgeBanding(item: ManufacturingCutListItem) {
  const entries = Object.entries(item.edgeBanding)
    .filter(([, value]) => value !== null)
    .map(([side, value]) => `${side}:${value}`);

  return entries.length > 0 ? entries.join(", ") : "none";
}
