import { getMaterialById, hdfMaterials, resolveMaterialId, type MaterialId, type MaterialToken } from "./materialCatalog";
import type { MaterialCatalogItem } from "./materialTypes";

export const backPanelByBodyMaterial: Partial<Record<MaterialId, MaterialId>> = {
  "ldsp-egger-h1910-buk-lugovoy-st9": "hdf-kronospan-0522-bezhevyy",
  "ldsp-egger-h3395-dub-korbridzh-naturalnyy-st12": "hdf-kronospan-k535-dub-barokko-zolotoy",
  "ldsp-egger-h3734-oreh-dizhon-naturalnyy-st9": "hdf-kronospan-k536-dub-barokko-yantarnyy",
  "ldsp-egger-u708-svetlo-seryy-st9": "hdf-kronospan-0522-bezhevyy",
  "ldsp-egger-u780-seryy-monumentalnyy-st9": "hdf-kronospan-k164-antratsit",
  "ldsp-egger-u961-chernyy-grafit-st7": "hdf-kronospan-k190-chernyy",
  "ldsp-egger-w960-belyy-klassicheskiy-sm": "hdf-kronospan-k101-belyy-fasadnyy",
};

export function getBackPanelMaterialForBody(bodyMaterialId: MaterialToken): MaterialCatalogItem {
  const bodyId = resolveMaterialId(bodyMaterialId);
  const mappedId = backPanelByBodyMaterial[bodyId] ?? "hdf-kronospan-k101-belyy-fasadnyy";
  return getMaterialById(mappedId) ?? hdfMaterials[1];
}
