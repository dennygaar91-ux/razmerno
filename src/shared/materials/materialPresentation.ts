import { getRequiredMaterial, type MaterialToken } from "./materialCatalog";
import { getBackPanelMaterialForBody } from "./materialMapping";
import type { MaterialCatalogItem } from "./materialTypes";

export type MaterialLayerKey = "body" | "facade" | "backPanel";

export type MaterialLayerView = {
  key: MaterialLayerKey;
  title: string;
  description: string;
  material: MaterialCatalogItem;
  thicknessLabel: string;
};

export type ProjectMaterialLayersInput = {
  bodyMaterialId: string;
  facadeMaterialId: string;
};

export function getMaterialThicknessLabel(material: MaterialCatalogItem): string {
  return `${material.kind.toUpperCase()} ${material.thicknessMm} мм`;
}

export function getMaterialShortLabel(material: Pick<MaterialCatalogItem, "name" | "code">): string {
  return `${material.name} · ${material.code}`;
}

export function getProjectMaterialLayers({
  bodyMaterialId,
  facadeMaterialId,
}: ProjectMaterialLayersInput): MaterialLayerView[] {
  const body = getRequiredMaterial(bodyMaterialId);
  const facade = getRequiredMaterial(facadeMaterialId);
  const backPanel = getBackPanelMaterialForBody(body.id as MaterialToken);

  return [
    {
      key: "body",
      title: "Корпус",
      description: "несущие детали",
      material: body,
      thicknessLabel: getMaterialThicknessLabel(body),
    },
    {
      key: "facade",
      title: "Фасады",
      description: facade.kind === "mdf" ? "МДФ-фасады" : "ЛДСП-фасады",
      material: facade,
      thicknessLabel: getMaterialThicknessLabel(facade),
    },
    {
      key: "backPanel",
      title: "Задняя стенка",
      description: "автоподбор под корпус",
      material: backPanel,
      thicknessLabel: getMaterialThicknessLabel(backPanel),
    },
  ];
}

export function getTextureRepeatForMaterial(material: MaterialCatalogItem): [number, number] {
  if (material.kind === "hdf") return [2.2, 2.2];
  if (material.colorFamily === "wood-light" || material.colorFamily === "wood-warm") return [1.35, 2.1];
  return [1.75, 1.75];
}
