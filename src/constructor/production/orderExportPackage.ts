import { buildCabinetGeometry } from "../geometry/buildCabinetGeometry.js";
import type { FurnitureProject } from "../geometry/types.js";
import type { OrderRequest } from "../../../api/_shared/order-types.js";
import type { ProductionExportPackage } from "./types.js";
import { buildProductionValidationReport } from "./validationReport.js";
import { getDefaultFactoryProfile } from "./factoryProfile.js";
import { evaluateManufacturingRules } from "./manufacturingRules.js";
import { createInitialProductionRevision } from "./revisions.js";

export function buildProductionExportFromOrder(
  order: OrderRequest,
  configVersion = order.configVersion ?? "rzm.order.v1",
): ProductionExportPackage {
  const facadeKind = order.materials?.facadeKind === "mdf" ? "mdf" : "ldsp";
  const facadeThicknessMm = facadeKind === "mdf" ? 18 : 16;

  const project: FurnitureProject = {
    productType: order.productType ?? "wardrobe",
    dimensions: {
      widthMm: order.dimensions?.width ?? 1800,
      heightMm: order.dimensions?.height ?? 2400,
      depthMm: order.dimensions?.depth ?? 600,
    },
    material: {
      bodyMaterialId: order.materials?.bodyId ?? "white-matt",
      facadeMaterialId: order.materials?.facadeId ?? "oak-natural",
      backPanelMaterialId: order.materials?.backPanelId ?? order.materials?.bodyId ?? "white-matt",
      edgeMaterialId: undefined,
      bodyThicknessMm: 16,
      facadeThicknessMm,
      backPanelThicknessMm: 3,
    },
    structure: {
      sectionCount: order.sections ?? 2,
      layout: order.layout ?? {
        sections: [],
      },
      shelves: order.filling?.shelves ?? 0,
      drawers: order.filling?.drawers ?? 0,
      hangingRod: order.filling?.hangingRod ?? false,
      facadeMode: pickFacadeMode(order),
      openingMode: pickOpeningMode(order.style?.facadeStyleId),
      hardwareMode: order.style?.hardwareId === "comfort" ? "comfort" : "base",
    },
    meta: {
      schemaVersion: 3,
      configVersion,
      createdAt: new Date().toISOString(),
    },
  };

  return buildProductionExportPackage(project, "api-order");
}

export function buildProductionExportPackage(
  project: FurnitureProject,
  source: ProductionExportPackage["source"],
): ProductionExportPackage {
  const productionModel = buildCabinetGeometry(project);
  const factoryProfile = getDefaultFactoryProfile();
  const requiresTechnologistCheck =
    productionModel.warnings.some((warning) => warning.severity !== "info") ||
    productionModel.drilling.some((operation) => operation.requiresTechnologistCheck);

  const basePackage = {
    schema: "razmerno.production-export.v1" as const,
    units: "mm" as const,
    source,
    project,
    productionModel,
    manufacturing: {
      requiresTechnologistCheck,
      warnings: productionModel.warnings,
      totals: productionModel.totals,
    },
    basis: {
      status: "manual-json-ready" as const,
      plan: productionModel.basisExportPlan,
    },
    factoryProfile: {
      id: factoryProfile.id,
      title: factoryProfile.title,
    },
    meta: {
      createdAt: new Date().toISOString(),
      configVersion: project.meta.configVersion,
    },
  };

  const rules = evaluateManufacturingRules(basePackage, factoryProfile);

  const validation = buildProductionValidationReport({ ...basePackage, rules });
  const packageWithValidation = {
    ...basePackage,
    rules,
    validation,
  };
  const initialRevision = createInitialProductionRevision(packageWithValidation);

  return {
    ...packageWithValidation,
    revisions: [initialRevision],
    review: {
      status: initialRevision.status,
      manualChangesAllowed: true,
      visibleToClient: false,
    },
  };
}

function pickFacadeMode(order: OrderRequest): "open" | "hinged" | "drawers" {
  if (order.productType === "dresser") return "drawers";
  if (order.productType === "nightstand" && (order.filling?.drawers ?? 0) > 0 && (order.filling?.shelves ?? 0) === 0) {
    return "drawers";
  }
  return "hinged";
}

function pickOpeningMode(facadeStyleId: string | undefined): "handle-soft-close" | "hidden-handle-soft-close" | "push-to-open" {
  if (facadeStyleId === "no-handle") return "push-to-open";
  if (facadeStyleId === "hidden-handle") return "hidden-handle-soft-close";
  return "handle-soft-close";
}
