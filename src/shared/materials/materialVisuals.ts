import { bodyMaterials, facadeMaterials, getRequiredMaterial, type MaterialToken } from "./materialCatalog";
import { getTextureRepeatForMaterial, getMaterialShortLabel } from "./materialPresentation";
import type { MaterialCatalogItem, MaterialUsage } from "./materialTypes";

export type MaterialVisualMapping = {
  id: string;
  name: string;
  kind: MaterialCatalogItem["kind"];
  usage: MaterialUsage[];
  textureUrl: string;
  fallbackHex: string;
  swatchStyle: string;
  repeat: [number, number];
  label: string;
  productionLabel: string;
};

export function getMaterialVisualMapping(materialToken: MaterialToken | string): MaterialVisualMapping {
  const material = getRequiredMaterial(materialToken);
  const repeat = getTextureRepeatForMaterial(material);
  return {
    id: material.id,
    name: material.displayName,
    kind: material.kind,
    usage: [...material.usage],
    textureUrl: material.textureUrl,
    fallbackHex: material.fallbackHex,
    swatchStyle: `linear-gradient(135deg, rgba(255,255,255,.18), rgba(42,44,65,.08)), url(${material.textureUrl})`,
    repeat,
    label: getMaterialShortLabel(material),
    productionLabel: `${material.kind.toUpperCase()} ${material.thicknessMm} мм`,
  };
}

export function getMvpMaterialVisualMappings() {
  return {
    body: bodyMaterials.map((material) => getMaterialVisualMapping(material.id)),
    facade: facadeMaterials.map((material) => getMaterialVisualMapping(material.id)),
  };
}
