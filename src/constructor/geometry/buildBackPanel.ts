/**
 * Задняя стенка ХДФ 3 мм.
 * Вставляется в паз / прибивается гвоздями, в зависимости от конструктива.
 * MVP: одна цельная ХДФ-плита на всю заднюю плоскость, отступ 5 мм от заднего края.
 */
import type { FurnitureProject, Panel } from "./types.js";
import { createGeometryBuildContext, type GeometryBuildContext } from "./buildContext.js";
import { noEdge } from "./edgeBanding.js";

const PLINTH_HEIGHT_MM = 100;
const BACK_GAP_MM = 5; // отступ ХДФ от задней грани шкафа


export function buildBackPanel(p: FurnitureProject, buildContext: GeometryBuildContext = createGeometryBuildContext()): Panel[] {
  const W = p.dimensions.widthMm;
  const H = p.dimensions.heightMm;
  const D = p.dimensions.depthMm;
  const bt = p.material.backPanelThicknessMm;
  const matBack = p.material.backPanelMaterialId ?? p.material.bodyMaterialId;
  const hasPlinth = p.productType === "wardrobe";
  const plinthH = hasPlinth ? PLINTH_HEIGHT_MM : 0;

  return [
    {
      id: buildContext.nextBackId(),
      name: "Задняя стенка",
      role: "back-panel",
      materialType: "hdf",
      materialId: matBack,
      thicknessMm: bt,
      widthMm: W - 4,
      heightMm: H - plinthH - 4,
      depthMm: bt,
      position: { xMm: 2, yMm: plinthH + 2, zMm: D - bt - BACK_GAP_MM },
      rotation: { x: 0, y: 0, z: 0 },
      faceSide: "back",
      edgeBanding: noEdge(),
      visible: true,
      selectable: true,
      basis: {
        objectType: "panel",
        name: "Задняя стенка",
        article: "HD-BACK",
        designation: "back-panel",
        includeInDocs: true,
        userProperties: {
          materialKind: "hdf",
          backGapMm: BACK_GAP_MM,
        },
      },
    },
  ];
}

// Заменить значения по умолчанию (на случай если geometry.ts хочет ту же константу)
export const HDF_BACK_GAP_MM = BACK_GAP_MM;
