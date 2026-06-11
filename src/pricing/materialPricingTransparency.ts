import type { ConstructorMaterialPricingContext, MaterialPricingQuery } from "./materialPricing";

export type PricingAccuracyLevel = "exact" | "fallback" | "unknown";

export type PricingTransparencyNotice = {
  level: PricingAccuracyLevel;
  calculationBasis: "catalog" | "production-panels";
  clientLabel: string;
  clientMessage: string;
  debugLabel: string;
  bodySource: string;
  facadeSource: string;
  warnings: string[];
};

function getSourceLabel(query: MaterialPricingQuery | null | undefined) {
  if (!query) return "нет данных";
  if (query.source === "exact") return "точный артикул";
  if (query.source === "producer-thickness") return "производитель + толщина";
  return "fallback";
}

function getDebugLine(label: string, query: MaterialPricingQuery | null | undefined) {
  if (!query) return `${label}: нет данных`;
  const article = query.article ? ` · ${query.article}` : "";
  const matched = query.matchedItemName ? ` → ${query.matchedItemName}` : "";
  return `${label}: ${query.materialName} · ${query.materialKind.toUpperCase()} ${query.thicknessMm} мм · ${getSourceLabel(query)}${article}${matched}`;
}

export function buildPricingTransparencyNotice(
  context: ConstructorMaterialPricingContext | null | undefined,
): PricingTransparencyNotice {
  if (!context) {
    return {
      level: "unknown",
      calculationBasis: "catalog",
      clientLabel: "Точная стоимость рассчитывается",
      clientMessage: "Подбираем материалы и обновляем точную смету по текущей конфигурации.",
      debugLabel: "pricing: нет context",
      bodySource: "нет данных",
      facadeSource: "нет данных",
      warnings: [],
    };
  }

  const hasFallback = !context.hasExactBodyPrice || !context.hasExactFacadePrice;

  if (!hasFallback) {
    return {
      level: "exact",
      calculationBasis: "catalog",
      clientLabel: "Точная смета по выбранным материалам",
      clientMessage: "Стоимость рассчитана по выбранным декорам, толщине материала и текущей конфигурации.",
      debugLabel: "pricing: exact material articles",
      bodySource: getDebugLine("Корпус", context.body),
      facadeSource: getDebugLine("Фасады", context.facade),
      warnings: context.warnings,
    };
  }

  const fallbackParts: string[] = [];
  if (!context.hasExactBodyPrice) fallbackParts.push("корпус");
  if (!context.hasExactFacadePrice) fallbackParts.push("фасады");

  return {
    level: "fallback",
    calculationBasis: "catalog",
    clientLabel: "Техническая проверка материала",
    clientMessage: `Для позиции ${fallbackParts.join(" и ")} нет прямого совпадения артикула в прайсе. Стоимость рассчитана по ближайшей группе материала; предупреждение относится к проверке комплектации, не к статусу цены.`,
    debugLabel: "pricing: material fallback used",
    bodySource: getDebugLine("Корпус", context.body),
    facadeSource: getDebugLine("Фасады", context.facade),
    warnings: context.warnings,
  };
}


export function withProductionPanelPricingNotice(
  notice: PricingTransparencyNotice,
  panelWarnings: string[] = [],
): PricingTransparencyNotice {
  const hasWarnings = notice.level === "fallback" || panelWarnings.length > 0;
  return {
    ...notice,
    level: hasWarnings ? "fallback" : notice.level,
    calculationBasis: "production-panels",
    clientLabel: hasWarnings ? "Техническая проверка проекта" : "Точная смета по фактическим деталям",
    clientMessage: hasWarnings
      ? `${notice.clientMessage} Материалы пересчитаны по фактическим деталям проекта; менеджер подтвердит технологические детали перед запуском.`
      : "Материалы, фасады, задняя стенка, кромка и упаковка рассчитаны по фактическим деталям текущего проекта.",
    debugLabel: `${notice.debugLabel} · production panels`,
    warnings: [...notice.warnings, ...panelWarnings],
  };
}
