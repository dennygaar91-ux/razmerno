/**
 * Кромка — 0.8 мм для корпусных деталей, 2 мм для фасадов.
 * Хранится по сторонам панели (front/back/left/right).
 */
import type { EdgeBanding, EdgeSide } from "./types";

const BODY_EDGE_THK = 0.8;
const FACADE_EDGE_THK = 2;

function side(
  s: EdgeSide,
  materialId: string,
  thicknessMm: number,
  lengthMm: number,
) {
  return { side: s, materialId, thicknessMm, lengthMm };
}

/**
 * Корпусная панель — 0.8 мм по всему периметру.
 * widthMm — большой размер плоской панели (X), heightMm — второй (Y).
 */
export function bodyEdgeAll(
  materialId: string,
  widthMm: number,
  heightMm: number,
): EdgeBanding {
  return {
    front: side("front", materialId, BODY_EDGE_THK, widthMm),
    back: side("back", materialId, BODY_EDGE_THK, widthMm),
    left: side("left", materialId, BODY_EDGE_THK, heightMm),
    right: side("right", materialId, BODY_EDGE_THK, heightMm),
  };
}

/**
 * Полка — 0.8 мм только по переднему ребру (видимая часть).
 */
export function bodyEdgeFront(
  materialId: string,
  widthMm: number,
): EdgeBanding {
  return {
    front: side("front", materialId, BODY_EDGE_THK, widthMm),
  };
}

/**
 * Фасад — 2 мм по всему периметру.
 */
export function facadeEdgeAll(
  materialId: string,
  widthMm: number,
  heightMm: number,
): EdgeBanding {
  return {
    front: side("front", materialId, FACADE_EDGE_THK, widthMm),
    back: side("back", materialId, FACADE_EDGE_THK, widthMm),
    left: side("left", materialId, FACADE_EDGE_THK, heightMm),
    right: side("right", materialId, FACADE_EDGE_THK, heightMm),
  };
}

/**
 * HDF задняя стенка — без кромки (вставляется в паз).
 */
export function noEdge(): EdgeBanding {
  return {};
}
