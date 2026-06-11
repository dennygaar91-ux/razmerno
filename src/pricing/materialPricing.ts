import { findBestPriceItem, type PriceCatalogQuery } from "./catalog";
import {
  getMaterialById,
  type MaterialToken,
} from "../shared/materials/materialCatalog";
import type { MaterialCatalogItem } from "../shared/materials/materialTypes";

export type MaterialPricingSource = "exact" | "producer-thickness" | "fallback";

export type MaterialPricingQuery = PriceCatalogQuery & {
  materialId: string;
  materialKind: MaterialCatalogItem["kind"];
  materialName: string;
  source: MaterialPricingSource;
  matchedItemName: string | null;
  matchedRetailPrice: number | null;
};

export type ConstructorMaterialPricingContext = {
  body: MaterialPricingQuery;
  facade: MaterialPricingQuery;
  hasExactBodyPrice: boolean;
  hasExactFacadePrice: boolean;
  warnings: string[];
};

function getArticleFromMaterial(material: MaterialCatalogItem): string {
  return material.code.trim().split(/\s+/)[0] ?? material.code.trim();
}

function getBaseQuery(material: MaterialCatalogItem): PriceCatalogQuery {
  return {
    itemType: "board",
    producer: material.brand,
    thicknessMm: material.thicknessMm,
  };
}

function resolveMaterialPricingQuery(material: MaterialCatalogItem): MaterialPricingQuery {
  const article = getArticleFromMaterial(material);
  const exactQuery = { ...getBaseQuery(material), article } satisfies PriceCatalogQuery;
  const exactItem = findBestPriceItem(exactQuery);

  if (exactItem) {
    return {
      ...exactQuery,
      materialId: material.id,
      materialKind: material.kind,
      materialName: material.displayName,
      source: "exact",
      matchedItemName: exactItem.name,
      matchedRetailPrice: exactItem.retailPrice,
    };
  }

  const producerThicknessQuery = getBaseQuery(material);
  const producerThicknessItem = findBestPriceItem(producerThicknessQuery);

  if (producerThicknessItem) {
    return {
      ...producerThicknessQuery,
      materialId: material.id,
      materialKind: material.kind,
      materialName: material.displayName,
      source: "producer-thickness",
      matchedItemName: producerThicknessItem.name,
      matchedRetailPrice: producerThicknessItem.retailPrice,
    };
  }

  const fallbackQuery = {
    itemType: "board",
    thicknessMm: material.thicknessMm,
  } satisfies PriceCatalogQuery;
  const fallbackItem = findBestPriceItem(fallbackQuery);

  return {
    ...fallbackQuery,
    materialId: material.id,
    materialKind: material.kind,
    materialName: material.displayName,
    source: "fallback",
    matchedItemName: fallbackItem?.name ?? null,
    matchedRetailPrice: fallbackItem?.retailPrice ?? null,
  };
}

export function buildConstructorMaterialPricingContext(input: {
  bodyMaterialId: MaterialToken;
  facadeMaterialId: MaterialToken;
}): ConstructorMaterialPricingContext {
  const bodyMaterial = getMaterialById(input.bodyMaterialId);
  const facadeMaterial = getMaterialById(input.facadeMaterialId);

  if (!bodyMaterial) {
    throw new Error(`Unknown body material for pricing: ${input.bodyMaterialId}`);
  }
  if (!facadeMaterial) {
    throw new Error(`Unknown facade material for pricing: ${input.facadeMaterialId}`);
  }
  if (bodyMaterial.kind !== "ldsp") {
    throw new Error(`Body pricing requires LDSP material, received: ${bodyMaterial.kind}`);
  }
  if (facadeMaterial.kind !== "ldsp" && facadeMaterial.kind !== "mdf") {
    throw new Error(`Facade pricing requires LDSP or MDF material, received: ${facadeMaterial.kind}`);
  }

  const body = resolveMaterialPricingQuery(bodyMaterial);
  const facade = resolveMaterialPricingQuery(facadeMaterial);
  const warnings: string[] = [];

  if (body.source !== "exact") {
    warnings.push(`Для корпуса ${bodyMaterial.displayName} не найден точный прайс; используется ${body.matchedItemName ?? "fallback"}.`);
  }
  if (facade.source !== "exact") {
    warnings.push(`Для фасада ${facadeMaterial.displayName} не найден точный прайс; используется ${facade.matchedItemName ?? "fallback"}.`);
  }

  return {
    body,
    facade,
    hasExactBodyPrice: body.source === "exact",
    hasExactFacadePrice: facade.source === "exact",
    warnings,
  };
}
