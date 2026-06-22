import type { FurnitureProject, Panel } from './types.js'

export const PLINTH_HEIGHT_MM = 100

export function hingeCountForHeight(facadeHeightMm: number): { count: number; needsCheck: boolean } {
  if (facadeHeightMm <= 900) return { count: 2, needsCheck: false }
  if (facadeHeightMm <= 1600) return { count: 3, needsCheck: false }
  if (facadeHeightMm <= 2200) return { count: 4, needsCheck: false }
  return { count: 5, needsCheck: true }
}

export function isPushToOpen(project: FurnitureProject): boolean {
  return project.structure.openingMode === 'push-to-open'
}

export function isHiddenHandle(project: FurnitureProject): boolean {
  return project.structure.openingMode === 'hidden-handle-soft-close'
}

export function doorHingeSide(door: Panel): 'left' | 'right' {
  return door.basis.userProperties.hingeSide === 'right' ? 'right' : 'left'
}

export function hingeX(door: Panel): number {
  return doorHingeSide(door) === 'left'
    ? door.position.xMm + 22
    : door.position.xMm + door.widthMm - 22
}

export function oppositeHandleX(door: Panel): number {
  return doorHingeSide(door) === 'left'
    ? door.position.xMm + door.widthMm - 30
    : door.position.xMm + 30
}
