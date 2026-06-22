import type { ProductionExportPackage } from "./types.js";

type ProductionExportDraft = Pick<ProductionExportPackage, "productionModel" | "rules">;

export type ProductionReadinessStatus = "ready-for-review" | "blocked";

export interface ProductionValidationReport {
  schema: "razmerno.production-validation.v1";
  status: ProductionReadinessStatus;
  errors: string[];
  warnings: string[];
  summary: {
    panels: number;
    hardware: number;
    drilling: number;
    edgeBandingLengthMm: number;
    basisSteps: number;
  };
}

export function buildProductionValidationReport(pack: ProductionExportDraft): ProductionValidationReport {
  const errors = pack.productionModel.warnings
    .filter((warning) => warning.severity === "error")
    .map((warning) => warning.message);

  const ruleRejects = pack.rules?.autoRejects?.map((item) => item.message) ?? [];
  const ruleWarnings = [
    ...(pack.rules?.autoWarnings?.map((item) => item.message) ?? []),
    ...(pack.rules?.autoRepairs?.map((item) => item.message) ?? []),
  ];

  const warnings = [
    ...pack.productionModel.warnings
      .filter((warning) => warning.severity !== "error")
      .map((warning) => warning.message),
    ...pack.productionModel.drilling
      .filter((operation) => operation.requiresTechnologistCheck)
      .slice(0, 8)
      .map((operation) => `Присадка требует проверки технолога: ${operation.purpose} / ${operation.panelId}`),
    ...ruleWarnings,
  ];

  return {
    schema: "razmerno.production-validation.v1",
    status: errors.length > 0 || ruleRejects.length > 0 ? "blocked" : "ready-for-review",
    errors: [...errors, ...ruleRejects],
    warnings,
    summary: {
      panels: pack.productionModel.totals.panelCount,
      hardware: pack.productionModel.totals.hardwareCount,
      drilling: pack.productionModel.totals.drillingCount,
      edgeBandingLengthMm: pack.productionModel.totals.edgeBandingLengthMm,
      basisSteps: pack.productionModel.basisExportPlan.length,
    },
  };
}
