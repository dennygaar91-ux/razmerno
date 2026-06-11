import type { EdgeBanding, EdgeBandingSide, EdgeSide } from './productionModel.types'
import { round2 } from './productionModelMath'

export function makeEdge(
  materialId: string,
  thicknessMm: EdgeBandingSide['thicknessMm'],
  sides: EdgeSide[],
): EdgeBanding {
  return sides.reduce<EdgeBanding>((acc, side) => {
    acc[side] = {
      side,
      materialId,
      thicknessMm,
      widthMm: thicknessMm === 2 ? 22 : 19,
      note: thicknessMm === 2 ? 'Фасадная кромка 2 мм' : 'Корпусная кромка 0.8 мм',
    }
    return acc
  }, {})
}

export function edgeLm(edge: EdgeBanding, widthMm: number, heightMm: number, quantity = 1): number {
  let mm = 0
  if (edge.front) mm += widthMm
  if (edge.back) mm += widthMm
  if (edge.left) mm += heightMm
  if (edge.right) mm += heightMm
  return round2((mm * quantity) / 1000)
}
