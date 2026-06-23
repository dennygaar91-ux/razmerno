/**
 * Адаптер UI-state → FurnitureProject.
 *
 * Geometry engine не должен знать про React-context и про UI-формы.
 * Эта функция переводит то, что лежит в `configurator/context.tsx`
 * (простая модель: width, height, depth, sections (number), filling, ids)
 * в каноническую `FurnitureProject` (структурированная модель по спеку).
 */
import type { ConfigState } from "../../configurator/context.js";
import type { FurnitureProject, OpeningMode, ProductType } from "./types.js";

const BODY_THICKNESS_MM = 16;
const LDSP_FACADE_THICKNESS_MM = 16;
const MDF_FACADE_THICKNESS_MM = 18;
const BACK_PANEL_THICKNESS_MM = 3;

export function fromConfigState(state: ConfigState, configVersion: string): FurnitureProject {
  // Защищаемся от состояния без выбранного типа
  const productType: ProductType = (state.type ?? "wardrobe") as ProductType;
  const facadeThicknessMm = state.facadeMaterialKind === "mdf" ? MDF_FACADE_THICKNESS_MM : LDSP_FACADE_THICKNESS_MM;

  return {
    productType,
    dimensions: {
      widthMm: state.width,
      heightMm: state.height,
      depthMm: state.depth,
    },
    material: {
      bodyMaterialId: state.bodyMaterialId,
      facadeMaterialId: state.facadeMaterialId,
      // Задник наследует декор корпуса по умолчанию
      backPanelMaterialId: state.bodyMaterialId,
      edgeMaterialId: undefined,
      bodyThicknessMm: BODY_THICKNESS_MM,
      facadeThicknessMm,
      backPanelThicknessMm: BACK_PANEL_THICKNESS_MM,
    },
    structure: {
      sectionCount: state.sections,
      layout: state.layout,
      shelves: state.filling.shelves,
      drawers: state.filling.drawers,
      hangingRod: state.filling.hangingRod,
      facadeMode: pickFacadeMode(state.filling.drawers, state.filling.shelves, productType),
      openingMode: pickOpeningMode(state.facadeStyleId),
      hardwareMode: pickHardwareMode(state.facadeStyleId, state.hardwareId),
    },
    meta: {
      schemaVersion: 3,
      configVersion,
      createdAt: new Date().toISOString(),
    },
  };
}

function pickFacadeMode(
  drawers: number,
  shelves: number,
  type: ProductType,
): "open" | "hinged" | "drawers" {
  // Тумба с ящиками без полок — drawer-режим
  if (type === "dresser" || (type === "nightstand" && drawers > 0 && shelves === 0)) {
    return "drawers";
  }
  // Открытый стеллаж без шкафа: пока MVP не моделируем (всегда hinged)
  return "hinged";
}


function pickOpeningMode(facadeStyleId: string): OpeningMode {
  if (facadeStyleId === "no-handle") return "push-to-open";
  if (facadeStyleId === "hidden-handle") return "hidden-handle-soft-close";
  return "handle-soft-close";
}


function pickHardwareMode(_facadeStyleId: string, hardwareId: string): "base" | "comfort" {
  // facadeStyleId отвечает за способ открывания:
  // - no-handle → push-to-open;
  // - hidden-handle → скрытая ручка;
  // - regular → ручка.
  //
  // hardwareId отвечает за уровень комплекта, который выбирает клиент:
  // - base;
  // - comfort.
  //
  // Это сохраняет клиентский выбор и не смешивает его со способом открывания.
  return hardwareId === "comfort" ? "comfort" : "base";
}
