import type { ProductionExportPackage } from "./types";

type ProductionRevisionInput = Pick<ProductionExportPackage, "validation" | "rules" | "manufacturing">;

export type ProductionReviewStatus =
  | "auto-generated"
  | "requires-review"
  | "manually-adjusted"
  | "approved-for-basis"
  | "blocked";

export interface ProductionRevision {
  id: string;
  version: number;
  status: ProductionReviewStatus;
  source: "auto" | "manual";
  createdAt: string;
  changedBy: "system" | "admin";
  note: string;
  changes: Array<{
    field: string;
    before?: unknown;
    after?: unknown;
    reason: string;
  }>;
}

export function createInitialProductionRevision(pack: ProductionRevisionInput): ProductionRevision {
  const blocked = pack.validation.status === "blocked" || pack.rules.status === "blocked";
  const requiresReview = pack.manufacturing.requiresTechnologistCheck || pack.rules.autoWarnings.length > 0 || pack.rules.autoRepairs.length > 0;

  return {
    id: `production-rev-${Date.now()}-1`,
    version: 1,
    status: blocked ? "blocked" : requiresReview ? "requires-review" : "auto-generated",
    source: "auto",
    createdAt: new Date().toISOString(),
    changedBy: "system",
    note: blocked
      ? "Автоматическая production model заблокирована правилами."
      : requiresReview
      ? "Автоматическая production model требует ручной проверки."
      : "Автоматическая production model готова к проверке.",
    changes: [],
  };
}

export function createManualProductionRevision({
  previous,
  note,
  changedBy = "admin",
  changes,
}: {
  previous: ProductionRevision;
  note: string;
  changedBy?: "admin";
  changes: ProductionRevision["changes"];
}): ProductionRevision {
  return {
    id: `production-rev-${Date.now()}-${previous.version + 1}`,
    version: previous.version + 1,
    status: "manually-adjusted",
    source: "manual",
    createdAt: new Date().toISOString(),
    changedBy,
    note,
    changes,
  };
}
