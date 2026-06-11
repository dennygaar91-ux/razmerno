import type { FactoryProfile } from "./factoryProfile";
import type { ProductionModel } from "../geometry/types";

export type ManufacturingRuleSeverity = "info" | "warning" | "reject";
export type ManufacturingRuleAction = "auto-warning" | "auto-reject" | "auto-repair";

export interface ManufacturingRuleResult {
  code: string;
  severity: ManufacturingRuleSeverity;
  action: ManufacturingRuleAction;
  message: string;
  targetId?: string;
  repair?: {
    kind: "add-synchronizer" | "set-edge-thickness" | "set-facade-gap" | "set-hinge-count" | "mark-reinforcement-required";
    payload: Record<string, string | number | boolean>;
  };
}

interface ManufacturingRuleInput {
  productionModel: ProductionModel;
}

export interface ManufacturingRulesReport {
  schema: "razmerno.manufacturing-rules.v1";
  factoryProfileId: "default_mvp";
  status: "ready-for-review" | "blocked";
  autoWarnings: ManufacturingRuleResult[];
  autoRejects: ManufacturingRuleResult[];
  autoRepairs: ManufacturingRuleResult[];
}

export function evaluateManufacturingRules(
  pack: ManufacturingRuleInput,
  profile: FactoryProfile,
): ManufacturingRulesReport {
  const results: ManufacturingRuleResult[] = [];

  evaluateShelves(pack, profile, results);
  evaluateDrawers(pack, profile, results);
  evaluateFacades(pack, profile, results);
  evaluateEdgeBanding(pack, profile, results);

  const autoRejects = results.filter((item) => item.action === "auto-reject");
  const autoWarnings = results.filter((item) => item.action === "auto-warning");
  const autoRepairs = results.filter((item) => item.action === "auto-repair");

  return {
    schema: "razmerno.manufacturing-rules.v1",
    factoryProfileId: profile.id,
    status: autoRejects.length > 0 ? "blocked" : "ready-for-review",
    autoWarnings,
    autoRejects,
    autoRepairs,
  };
}

function evaluateShelves(
  pack: ManufacturingRuleInput,
  profile: FactoryProfile,
  results: ManufacturingRuleResult[],
) {
  for (const panel of pack.productionModel.panels) {
    if (panel.role !== "shelf") continue;
    if (panel.widthMm > profile.shelves.maxWidthWithoutReinforcementMm) {
      results.push({
        code: "SHELF_REINFORCEMENT_REQUIRED",
        severity: "warning",
        action: "auto-warning",
        targetId: panel.id,
        message: `Полка шире ${profile.shelves.maxWidthWithoutReinforcementMm} мм — требуется усиление или дополнительная перегородка.`,
        repair: {
          kind: "mark-reinforcement-required",
          payload: { panelId: panel.id, widthMm: panel.widthMm },
        },
      });
    }
  }
}

function evaluateDrawers(
  pack: ManufacturingRuleInput,
  profile: FactoryProfile,
  results: ManufacturingRuleResult[],
) {
  const drawerFronts = pack.productionModel.panels.filter((panel) => panel.role === "drawer-front");

  for (const panel of drawerFronts) {
    if (panel.widthMm < profile.drawers.minWidthMm) {
      results.push({
        code: "DRAWER_TOO_NARROW",
        severity: "reject",
        action: "auto-reject",
        targetId: panel.id,
        message: `Ящик уже ${profile.drawers.minWidthMm} мм — такой ящик запрещён для MVP.`,
      });
    }

    if (panel.widthMm > profile.drawers.maxWidthMm) {
      results.push({
        code: "DRAWER_TOO_WIDE",
        severity: "reject",
        action: "auto-reject",
        targetId: panel.id,
        message: `Ящик шире ${profile.drawers.maxWidthMm} мм — такой ящик запрещён для MVP.`,
      });
    }

    if (panel.widthMm > profile.drawers.synchronizeAboveWidthMm && panel.widthMm <= profile.drawers.maxWidthMm) {
      results.push({
        code: "DRAWER_SYNCHRONIZER_REQUIRED",
        severity: "warning",
        action: "auto-repair",
        targetId: panel.id,
        message: `Ящик шире ${profile.drawers.synchronizeAboveWidthMm} мм — добавляем синхронизатор той же фирмы, что и направляющая.`,
        repair: {
          kind: "add-synchronizer",
          payload: { panelId: panel.id, widthMm: panel.widthMm },
        },
      });
    }
  }
}

function evaluateFacades(
  pack: ManufacturingRuleInput,
  profile: FactoryProfile,
  results: ManufacturingRuleResult[],
) {
  const facades = pack.productionModel.panels.filter((panel) => panel.role === "facade-door" || panel.role === "drawer-front");

  for (const panel of facades) {
    const hingeCount = getHingeCount(panel.heightMm, profile);
    if (panel.role === "facade-door") {
      results.push({
        code: "HINGE_COUNT_RULE_APPLIED",
        severity: "info",
        action: "auto-repair",
        targetId: panel.id,
        message: `Количество петель по высоте фасада ${panel.heightMm} мм: ${hingeCount}.`,
        repair: {
          kind: "set-hinge-count",
          payload: { panelId: panel.id, heightMm: panel.heightMm, hingeCount },
        },
      });
    }

    results.push({
      code: "FACADE_GAP_RULE_APPLIED",
      severity: "info",
      action: "auto-repair",
      targetId: panel.id,
      message: `Зазор фасада применяется по ${profile.facadeGaps.perSideMm} мм с каждой стороны.`,
      repair: {
        kind: "set-facade-gap",
        payload: { panelId: panel.id, gapPerSideMm: profile.facadeGaps.perSideMm },
      },
    });
  }
}

function evaluateEdgeBanding(
  pack: ManufacturingRuleInput,
  profile: FactoryProfile,
  results: ManufacturingRuleResult[],
) {
  if (!profile.edgeBanding.edgeAllSides) return;

  for (const edge of pack.productionModel.edgeBanding) {
    const panel = pack.productionModel.panels.find((item) => item.id === edge.panelId);
    const expected = panel?.role === "facade-door" || panel?.role === "drawer-front"
      ? profile.edgeBanding.facadeThicknessMm
      : profile.edgeBanding.otherThicknessMm;

    if (edge.thicknessMm !== expected) {
      results.push({
        code: "EDGE_THICKNESS_REPAIR",
        severity: "info",
        action: "auto-repair",
        targetId: edge.panelId,
        message: `Кромка приведена к правилу MVP: фасады 2 мм, остальные детали 0.8 мм.`,
        repair: {
          kind: "set-edge-thickness",
          payload: { panelId: edge.panelId, expectedThicknessMm: expected },
        },
      });
    }
  }
}

function getHingeCount(heightMm: number, profile: FactoryProfile): number {
  for (const rule of profile.hinges.byFacadeHeight) {
    if (heightMm <= rule.maxHeightMm) return rule.count;
  }
  return profile.hinges.countAboveMax;
}
