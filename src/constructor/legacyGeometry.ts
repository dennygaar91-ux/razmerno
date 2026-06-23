/**
 * @deprecated Legacy production model v2.
 *
 * Новые Three.js/geometry-процессы должны использовать `src/constructor/geometry/*`
 * и `buildCabinetGeometry()`.
 *
 * Файл оставлен временно, потому что на него ещё завязаны старые процессы:
 * pricing, payload, basisAdapter/manualExport, rules/drillingTemplates.
 * Не добавлять новые импорты на этот слой.
 */

import type { ConstructorProject } from './schema'
import { getProductConfig } from './catalog'

export interface SectionLayout {
  sectionId: number
  index: number
  xMm: number
  widthMm: number
  innerWidthMm: number
  innerHeightMm: number
  innerDepthMm: number
  shelves: number
  drawers: number
  hasRod: boolean
}

export interface ProjectGeometry {
  outer: ConstructorProject['dimensions']
  thicknessMm: number
  sectionCount: number
  innerWidthMm: number
  innerHeightMm: number
  innerDepthMm: number
  partitionCount: number
  layouts: SectionLayout[]
  clearances: {
    backPanelThicknessMm: number
    backGapMm: number
    facadeGapMm: number
    drawerRunnerClearanceMm: number
    rodDepthMinimumMm: number
  }
}

const BACK_PANEL_THICKNESS_MM = 3
const BACK_GAP_MM = 20
const FACADE_GAP_MM = 3
const DRAWER_RUNNER_CLEARANCE_MM = 60
const ROD_DEPTH_MINIMUM_MM = 550

function clampPositive(value: number): number {
  return Math.max(1, Math.round(value))
}


export function buildGeometry(project: ConstructorProject): ProjectGeometry {
  const thickness = project.material.thicknessMm
  const sectionCount = Math.max(1, project.sections.length)
  const partitionCount = Math.max(0, sectionCount - 1)
  const innerWidth = clampPositive(project.dimensions.width - thickness * 2 - partitionCount * thickness)
  const innerHeight = clampPositive(project.dimensions.height - thickness * 2)
  const innerDepth = clampPositive(project.dimensions.depth - BACK_GAP_MM)
  const baseWidth = Math.floor(innerWidth / sectionCount)
  let cursorX = thickness

  const layouts = project.sections.map<SectionLayout>((section, index) => {
    const isLast = index === sectionCount - 1
    const width = isLast
      ? innerWidth - baseWidth * (sectionCount - 1)
      : baseWidth
    const layout: SectionLayout = {
      sectionId: section.id,
      index,
      xMm: cursorX,
      widthMm: clampPositive(width),
      innerWidthMm: clampPositive(width),
      innerHeightMm: innerHeight,
      innerDepthMm: innerDepth,
      shelves: section.shelves,
      drawers: section.drawers,
      hasRod: section.hasRod,
    }
    cursorX += layout.widthMm + thickness
    return layout
  })

  return {
    outer: project.dimensions,
    thicknessMm: thickness,
    sectionCount,
    innerWidthMm: innerWidth,
    innerHeightMm: innerHeight,
    innerDepthMm: innerDepth,
    partitionCount,
    layouts,
    clearances: {
      backPanelThicknessMm: BACK_PANEL_THICKNESS_MM,
      backGapMm: BACK_GAP_MM,
      facadeGapMm: FACADE_GAP_MM,
      drawerRunnerClearanceMm: DRAWER_RUNNER_CLEARANCE_MM,
      rodDepthMinimumMm: ROD_DEPTH_MINIMUM_MM,
    },
  }
}

export function getMinimumSectionWidth(project: ConstructorProject): number {
  return getProductConfig(project.productType).minSectionWidth
}

export function getDrawerInnerWidth(sectionWidthMm: number): number {
  return Math.max(1, sectionWidthMm - DRAWER_RUNNER_CLEARANCE_MM)
}
