import { bodyMaterialOptions, facadeMaterialOptions } from "../../shared/materials/materialCatalog";
import type { FurnitureOption, MaterialOption, StepKey } from "./types";

export const stepOrder: StepKey[] = ["sizes", "fill", "materials", "checkout"];

export const stepLabels: Record<StepKey, string> = {
  sizes: "Размеры",
  fill: "Наполнение",
  materials: "Материалы",
  checkout: "Заявка",
};

export const furnitureOptions: FurnitureOption[] = [
  { key: "wardrobe", label: "Шкаф", productType: "wardrobe" },
  { key: "nightstand", label: "Тумба", productType: "nightstand" },
  { key: "dresser", label: "Комод", productType: "dresser" },
];

export const materialOptions = bodyMaterialOptions satisfies MaterialOption[];
export const facadeOptions = facadeMaterialOptions satisfies MaterialOption[];

export const fillOptions = [
  { key: "shelves", title: "Полки", text: "для вещей и коробок" },
  { key: "drawers", title: "Ящики", text: "для мелких вещей" },
  { key: "rod", title: "Штанга", text: "для одежды на плечиках" },
] as const;
