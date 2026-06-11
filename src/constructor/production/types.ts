import type { FurnitureProject, ProductionModel } from "../geometry/types";
import type { ManufacturingRulesReport } from "./manufacturingRules";
import type { ProductionRevision } from "./revisions";

export interface ProductionExportPackage {
  schema: "razmerno.production-export.v1";
  units: "mm";
  source: "configurator" | "api-order";
  project: FurnitureProject;
  productionModel: ProductionModel;
  manufacturing: {
    requiresTechnologistCheck: boolean;
    warnings: ProductionModel["warnings"];
    totals: ProductionModel["totals"];
  };
  basis: {
    status: "manual-json-ready";
    plan: ProductionModel["basisExportPlan"];
  };
  rules: ManufacturingRulesReport;
  validation: {
    schema: "razmerno.production-validation.v1";
    status: "ready-for-review" | "blocked";
    errors: string[];
    warnings: string[];
    summary: {
      panels: number;
      hardware: number;
      drilling: number;
      edgeBandingLengthMm: number;
      basisSteps: number;
    };
  };
  factoryProfile: {
    id: "default_mvp";
    title: string;
  };
  revisions: ProductionRevision[];
  review: {
    status: ProductionRevision["status"];
    manualChangesAllowed: true;
    visibleToClient: false;
  };
  meta: {
    createdAt: string;
    configVersion: string;
  };
}
