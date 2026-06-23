import { buildCabinetGeometry } from "../geometry/buildCabinetGeometry.js";
import type { FurnitureProject } from "../geometry/types.js";
import type { OrderRequest } from "../../../api/_shared/order-types.js";
import type { ProductionExportPackage } from "./types.js";
import { buildProductionValidationReport } from "./validationReport.js";
import { getDefaultFactoryProfile } from "./factoryProfile.js";
import { evaluateManufacturingRules } from "./manufacturingRules.js";
import { createInitialProductionRevision } from "./revisions.js";

type ProductionExportDeterministicOptions = {
  createdAt?: string;
  revisionIdSeed?: string;
};

function resolveDeterministicOptionsFromPayload(payload: OrderRequest): Required<ProductionExportDeterministicOptions> {
  const createdAt = payload.consent?.acceptedAt ?? "1970-01-01T00:00:00.000Z";
  const revisionIdSeed =
    payload.orderId ??
    [
      payload.productType ?? "wardrobe",
      payload.dimensions?.width ?? 1800,
      payload.dimensions?.height ?? 2400,
      payload.dimensions?.depth ?? 600,
      payload.sections ?? 2,
      payload.materials?.bodyId ?? "white-matt",
      payload.materials?.facadeId ?? "oak-natural",
      payload.style?.facadeStyleId ?? "regular",
      payload.style?.hardwareId ?? "base",
    ].join("-");

  return { createdAt, revisionIdSeed };
}

export function buildProductionExportFromPayload(
  payload: OrderRequest,
  configVersion = payload.configVersion ?? "rzm.order.v1",
): ProductionExportPackage {
  const deterministic = resolveDeterministicOptionsFromPayload(payload);
  const facadeKind = payload.materials?.facadeKind === "mdf" ? "mdf" : "ldsp";
  const facadeThicknessMm = facadeKind === "mdf" ? 18 : 16;

  const project: FurnitureProject = {
    productType: payload.productType ?? "wardrobe",
    dimensions: {
      widthMm: payload.dimensions?.width ?? 1800,
      heightMm: payload.dimensions?.height ?? 2400,
      depthMm: payload.dimensions?.depth ?? 600,
    },
    material: {
      bodyMaterialId: payload.materials?.bodyId ?? "white-matt",
      facadeMaterialId: payload.materials?.facadeId ?? "oak-natural",
      backPanelMaterialId: payload.materials?.backPanelId ?? payload.materials?.bodyId ?? "white-matt",
      edgeMaterialId: undefined,
      bodyThicknessMm: 16,
      facadeThicknessMm,
      backPanelThicknessMm: 3,
    },
    structure: {
      sectionCount: payload.sections ?? 2,
      layout: payload.layout ?? {
        sections: [],
      },
      shelves: payload.filling?.shelves ?? 0,
      drawers: payload.filling?.drawers ?? 0,
      hangingRod: payload.filling?.hangingRod ?? false,
      facadeMode: pickFacadeMode(payload),
      openingMode: pickOpeningMode(payload.style?.facadeStyleId),
      hardwareMode: payload.style?.hardwareId === "comfort" ? "comfort" : "base",
    },
    meta: {
      schemaVersion: 3,
      configVersion,
      createdAt: deterministic.createdAt,
    },
  };

  return buildProductionExportPackage(project, "api-order", deterministic);
}

export function buildProductionExportFromOrder(
  order: OrderRequest,
  configVersion = order.configVersion ?? "rzm.order.v1",
): ProductionExportPackage {
  return buildProductionExportFromPayload(order, configVersion);
}

export function buildProductionExportPackage(
  project: FurnitureProject,
  source: ProductionExportPackage["source"],
  deterministic?: ProductionExportDeterministicOptions,
): ProductionExportPackage {
  const createdAt = deterministic?.createdAt ?? new Date().toISOString();
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
      createdAt,
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
  const initialRevision = createInitialProductionRevision(packageWithValidation, {
    createdAt,
    deterministicIdSeed: deterministic?.revisionIdSeed,
  });

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
