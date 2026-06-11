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
import { buildGeometry } from './legacyGeometry'
import { makeEdge } from './productionModelEdges'
import { pushPanel } from './productionModelPanels'
import {
  addDrillingForPanelMounts,
  addHingeDrilling,
  addRunnerDrilling,
  addShelfPins,
  getHingeCount,
} from './productionModelDrilling'
import { getProductionTotals } from './productionModelTotals'
import { PRODUCTION_MODEL_BASIS_EXPORT_PLAN, PRODUCTION_MODEL_BASIS_NOTES } from './productionModelBasis'
import { getHardwareCatalogItem } from './hardwareCatalog'
import { RAZMERNO_PRODUCTION_RULES } from './productionRules'

import type {
  DrillingOperation,
  HardwareItem,
  ProductionModel,
  ProductionPanel,
} from './productionModel.types'

export type {
  DrillingOperation,
  DrillingPurpose,
  FacadeProductionMeta,
  HardwareItem,
  PanelFaceSide,
  PanelRole,
  ProductionModel,
  ProductionPanel,
} from './productionModel.types'

export function buildProductionModel(project: ConstructorProject): ProductionModel {
  const { width, height, depth } = project.dimensions
  const thickness = project.material.thicknessMm
  const bottomThickness = thickness
  const topThickness = thickness
  const sideHeight = Math.max(1, height - bottomThickness)
  const topBottomInnerWidth = Math.max(1, width - thickness * 2)
  const backGroove = RAZMERNO_PRODUCTION_RULES.backPanel
  const geometry = buildGeometry(project)
  const sectionCount = geometry.sectionCount
  const sectionWidth = geometry.layouts[0]?.innerWidthMm ?? Math.max(1, Math.floor(geometry.innerWidthMm / sectionCount))
  const bodyDecorId = project.material.bodyDecorId
  const facadeDecorId = project.material.facadeDecorId
  const edgeDecorId = project.material.edgeDecorId
  const panels: ProductionPanel[] = []
  const drilling: DrillingOperation[] = []
  const bodyEdge = makeEdge(edgeDecorId, RAZMERNO_PRODUCTION_RULES.bodyEdge.thicknessMm, [...RAZMERNO_PRODUCTION_RULES.bodyEdge.sides])
  const facadeEdge = makeEdge(edgeDecorId, RAZMERNO_PRODUCTION_RULES.facades.edgeThicknessMm, ['front', 'back', 'left', 'right'])

  pushPanel(panels, {
    id: 'body-side-left',
    name: 'Боковина левая',
    role: 'side-left',
    materialType: 'ldsp',
    materialDecorId: bodyDecorId,
    thicknessMm: thickness,
    widthMm: depth,
    heightMm: sideHeight,
    quantity: 1,
    faceSide: 'front',
    edge: bodyEdge,
    basis: { x: 0, y: 0, z: bottomThickness, width: depth, height: sideHeight, thickness, orientation: 'vertical-xz' },
  })
  pushPanel(panels, {
    id: 'body-side-right',
    name: 'Боковина правая',
    role: 'side-right',
    materialType: 'ldsp',
    materialDecorId: bodyDecorId,
    thicknessMm: thickness,
    widthMm: depth,
    heightMm: sideHeight,
    quantity: 1,
    faceSide: 'front',
    edge: bodyEdge,
    basis: { x: width - thickness, y: 0, z: bottomThickness, width: depth, height: sideHeight, thickness, orientation: 'vertical-xz' },
  })
  pushPanel(panels, {
    id: 'body-top',
    name: 'Крышка верхняя',
    role: 'top',
    materialType: 'ldsp',
    materialDecorId: bodyDecorId,
    thicknessMm: thickness,
    widthMm: topBottomInnerWidth,
    heightMm: depth,
    quantity: 1,
    faceSide: 'top',
    edge: bodyEdge,
    basis: { x: thickness, y: 0, z: height - topThickness, width: topBottomInnerWidth, height: depth, thickness, orientation: 'horizontal-xz' },
  })
  pushPanel(panels, {
    id: 'body-bottom',
    name: 'Дно',
    role: 'bottom',
    materialType: 'ldsp',
    materialDecorId: bodyDecorId,
    thicknessMm: thickness,
    widthMm: width,
    heightMm: depth,
    quantity: 1,
    faceSide: 'top',
    edge: bodyEdge,
    basis: { x: 0, y: 0, z: 0, width, height: depth, thickness, orientation: 'horizontal-xz' },
  })
  pushPanel(panels, {
    id: 'body-back',
    name: 'Задняя стенка ХДФ',
    role: 'back',
    materialType: 'hdf',
    materialDecorId: 'hdf-white-4mm',
    thicknessMm: 4,
    widthMm: Math.max(1, width - backGroove.grooveDepthMm * 2),
    heightMm: Math.max(1, height - bottomThickness - backGroove.grooveDepthMm * 2),
    quantity: 1,
    faceSide: 'front',
    edge: {},
    basis: { x: backGroove.grooveDepthMm, y: depth - backGroove.grooveOffsetMm - backGroove.thicknessMm, z: bottomThickness + backGroove.grooveDepthMm, width: Math.max(1, width - backGroove.grooveDepthMm * 2), height: Math.max(1, height - bottomThickness - backGroove.grooveDepthMm * 2), thickness: backGroove.thicknessMm, orientation: 'back-xy' },
    note: `ХДФ ${backGroove.thicknessMm} мм в паз. Паз: глубина ${backGroove.grooveDepthMm} мм, отступ от задней кромки ${backGroove.grooveOffsetMm} мм.`,
  })
  pushPanel(panels, {
    id: 'body-plinth',
    name: 'Цоколь / передняя планка',
    role: 'plinth',
    materialType: 'ldsp',
    materialDecorId: bodyDecorId,
    thicknessMm: thickness,
    widthMm: width - thickness * 2,
    heightMm: 80,
    quantity: project.productType === 'wardrobe' ? 1 : 0,
    faceSide: 'front',
    edge: bodyEdge,
    basis: { x: thickness, y: 0, z: 0, width: width - thickness * 2, height: 80, thickness, orientation: 'front-xy' },
  })

  if (sectionCount > 1) {
    pushPanel(panels, {
      id: 'body-partitions',
      name: 'Вертикальная перегородка',
      role: 'partition',
      materialType: 'ldsp',
      materialDecorId: bodyDecorId,
      thicknessMm: thickness,
      widthMm: depth,
      heightMm: Math.max(1, height - bottomThickness - topThickness),
      quantity: sectionCount - 1,
      faceSide: 'front',
      edge: bodyEdge,
      basis: { x: sectionWidth + thickness, y: 0, z: bottomThickness, width: depth, height: Math.max(1, height - bottomThickness - topThickness), thickness, orientation: 'vertical-xz' },
    })
  }

  project.sections.forEach((section, index) => {
    const layout = geometry.layouts[index]
    const x = layout?.xMm ?? thickness
    const currentSectionWidth = layout?.innerWidthMm ?? sectionWidth
    const currentSectionDepth = layout?.innerDepthMm ?? depth
    if (section.shelves > 0) {
      const panelId = `section-${section.id}-shelves`
      pushPanel(panels, {
        id: panelId,
        name: `Полка секции ${index + 1}`,
        role: 'shelf',
        materialType: 'ldsp',
        materialDecorId: bodyDecorId,
        thicknessMm: thickness,
        widthMm: currentSectionWidth,
        heightMm: currentSectionDepth,
        quantity: section.shelves,
        faceSide: 'top',
        edge: bodyEdge,
        basis: { x, y: 0, z: thickness, width: currentSectionWidth, height: currentSectionDepth, thickness, orientation: 'horizontal-xz' },
      })
      addShelfPins(drilling, section.id, panelId, section.shelves, currentSectionWidth)
    }

    if (section.drawers > 0) {
      pushPanel(panels, {
        id: `section-${section.id}-drawer-sides`,
        name: `Боковины ящиков секции ${index + 1}`,
        role: 'drawer-side',
        materialType: 'ldsp',
        materialDecorId: bodyDecorId,
        thicknessMm: thickness,
        widthMm: currentSectionDepth - 60,
        heightMm: 120,
        quantity: section.drawers * 2,
        faceSide: 'front',
        edge: bodyEdge,
        basis: { x, y: 0, z: thickness, width: currentSectionDepth - 60, height: 120, thickness, orientation: 'vertical-xz' },
      })
      pushPanel(panels, {
        id: `section-${section.id}-drawer-front-back`,
        name: `Передняя/задняя стенка ящиков секции ${index + 1}`,
        role: 'drawer-front-back',
        materialType: 'ldsp',
        materialDecorId: bodyDecorId,
        thicknessMm: thickness,
        widthMm: currentSectionWidth - 60,
        heightMm: 120,
        quantity: section.drawers * 2,
        faceSide: 'front',
        edge: bodyEdge,
        basis: { x, y: 0, z: thickness, width: currentSectionWidth - 60, height: 120, thickness, orientation: 'front-xy' },
      })
      for (let drawerIndex = 0; drawerIndex < section.drawers; drawerIndex += 1) {
        addRunnerDrilling(drilling, `section-${section.id}-drawer-sides`, drawerIndex, currentSectionWidth)
      }
    }
  })

  if (project.material.facadeMode === 'hinged') {
    const doorHeight = Math.max(1, height - RAZMERNO_PRODUCTION_RULES.facades.totalGapPerDimensionMm)
    geometry.layouts.forEach((layout, index) => {
      const doorCountPerSection = layout.innerWidthMm > 500 ? 2 : 1
      const doorWidth = Math.max(200, Math.floor(layout.innerWidthMm / doorCountPerSection) - RAZMERNO_PRODUCTION_RULES.facades.totalGapPerDimensionMm)
      const panelId = `section-${layout.sectionId}-facade-doors`
      pushPanel(panels, {
        id: panelId,
        name: `Распашной фасад секции ${index + 1}`,
        role: 'facade-door',
        materialType: 'ldsp',
        materialDecorId: facadeDecorId,
        thicknessMm: thickness,
        widthMm: doorWidth,
        heightMm: doorHeight,
        quantity: doorCountPerSection,
        faceSide: 'front',
        edge: facadeEdge,
        basis: { x: layout.xMm, y: -thickness, z: 3, width: doorWidth, height: doorHeight, thickness, orientation: 'front-xy' },
        facade: {
          mode: 'hinged',
          mount: project.material.facadeMount,
          swing: doorCountPerSection === 2 ? 'pair' : project.material.doorSwing,
          gapMm: RAZMERNO_PRODUCTION_RULES.facades.perimeterGapEachSideMm,
          sectionId: layout.sectionId,
          facadeIndex: 1,
          totalInSection: doorCountPerSection,
        },
        note: `Полное наложение. Фасад уменьшен на ${RAZMERNO_PRODUCTION_RULES.facades.perimeterGapEachSideMm} мм с каждой стороны по периметру.`
      })
      for (let doorIndex = 0; doorIndex < doorCountPerSection; doorIndex += 1) {
        addHingeDrilling(drilling, panelId, doorIndex, doorHeight)
      }
    })
  }

  const totalDrawers = project.sections.reduce((sum, section) => sum + section.drawers, 0)
  if (project.material.facadeMode === 'drawers' || totalDrawers > 0) {
    project.sections.forEach((section, index) => {
      if (section.drawers <= 0) return
      const layout = geometry.layouts[index]
      const currentSectionWidth = layout?.innerWidthMm ?? sectionWidth
      const x = layout?.xMm ?? thickness
      const faceHeight = Math.max(180, Math.floor((geometry.innerHeightMm - 40) / section.drawers) - 4)
      const panelId = `section-${section.id}-drawer-facades`
      pushPanel(panels, {
        id: panelId,
        name: `Фасад ящика секции ${index + 1}`,
        role: 'facade-drawer',
        materialType: 'ldsp',
        materialDecorId: facadeDecorId,
        thicknessMm: thickness,
        widthMm: currentSectionWidth - RAZMERNO_PRODUCTION_RULES.facades.totalGapPerDimensionMm,
        heightMm: faceHeight,
        quantity: section.drawers,
        faceSide: 'front',
        edge: facadeEdge,
        basis: { x, y: -thickness, z: 20, width: currentSectionWidth - 4, height: faceHeight, thickness, orientation: 'front-xy' },
        facade: {
          mode: 'drawers',
          mount: project.material.facadeMount,
          gapMm: RAZMERNO_PRODUCTION_RULES.facades.perimeterGapEachSideMm,
          sectionId: section.id,
          facadeIndex: 1,
          totalInSection: section.drawers,
        },
      })
      if (project.material.opening === 'handles') {
        for (let drawerIndex = 0; drawerIndex < section.drawers; drawerIndex += 1) {
          drilling.push({
            id: `${panelId}-handle-${drawerIndex + 1}`,
            panelId,
            x: Math.floor(currentSectionWidth / 2),
            y: 0,
            z: 90 + drawerIndex * faceHeight,
            diameterMm: 4,
            depthMm: 16,
            side: 'front',
            purpose: 'handle',
            templateId: 'handle-two-hole',
            requiresTechnologistCheck: true,
            note: 'MVP: отверстие под ручку. Межцентровое расстояние зависит от выбранной ручки.',
          })
        }
      }
    })
  }

  panels.forEach((item, index) => {
    if (item.materialType === 'ldsp' && !item.role.startsWith('facade')) {
      addDrillingForPanelMounts(drilling, item.id, index)
    }
  })

  const hardware: HardwareItem[] = []
  const totalShelves = project.sections.reduce((sum, section) => sum + section.shelves, 0)
  const hingedDoorPanels = panels.filter(item => item.role === 'facade-door').reduce((sum, item) => sum + item.quantity, 0)
  if (hingedDoorPanels > 0) {
    const item = getHardwareCatalogItem(project.material.hardware === 'soft-close' ? 'hinge-soft-close-110' : 'hinge-standard-110')
    const quantity = hingedDoorPanels * getHingeCount(Math.max(1, height - RAZMERNO_PRODUCTION_RULES.facades.totalGapPerDimensionMm))
    hardware.push({ id: 'hinges', catalogItemId: item.id, title: item.title, quantity, unit: item.unit, unitPrice: item.price, totalPrice: item.price * quantity, relatedPanelIds: panels.filter(panel => panel.role === 'facade-door').map(panel => panel.id), note: 'Количество петель рассчитано по утверждённой шкале: ≤500 — 2, 501–700 — 3, 701–1100 — 4, 1101–1500 — 5, от 1501 — 6.' })
  }
  if (totalDrawers > 0) {
    const item = getHardwareCatalogItem('runner-hidden-450')
    hardware.push({ id: 'drawer-runners', catalogItemId: item.id, title: `${item.title} Hettich/Firmax`, quantity: totalDrawers, unit: item.unit, unitPrice: item.price, totalPrice: item.price * totalDrawers, relatedPanelIds: project.sections.filter(s => s.drawers > 0).map(s => `section-${s.id}-drawer-sides`), note: 'Скрытые направляющие. Бренд Hettich/Firmax уточняется по наличию и ценовому уровню.' })
  }
  if (totalShelves > 0) {
    const item = getHardwareCatalogItem('reinforced-shelf-holder')
    const quantity = totalShelves * RAZMERNO_PRODUCTION_RULES.shelves.supportsPerShelf
    hardware.push({ id: 'reinforced-shelf-holders', catalogItemId: item.id, title: item.title, quantity, unit: item.unit, unitPrice: item.price, totalPrice: item.price * quantity, relatedPanelIds: panels.filter(panel => panel.role === 'shelf').map(panel => panel.id), note: 'Усиленные полкодержатели: 4 шт. на каждую полку.' })
  }
  if (project.productType === 'wardrobe') {
    const item = getHardwareCatalogItem('adjustable-leg-plinth-set')
    hardware.push({ id: 'adjustable-legs-plinth', catalogItemId: item.id, title: item.title, quantity: 1, unit: item.unit, unitPrice: item.price, totalPrice: item.price, relatedPanelIds: ['body-bottom', 'body-plinth'], note: 'Регулируемые ножки + цоколь для шкафа.' })
  }

  const rods = project.sections.filter(section => section.hasRod).length
  if (rods > 0) {
    {
      const item = getHardwareCatalogItem('rod-oval-set')
      hardware.push({ id: 'clothes-rod', catalogItemId: item.id, title: item.title, quantity: rods, unit: item.unit, unitPrice: item.price, totalPrice: item.price * rods })
    }
    project.sections.forEach(section => {
      if (!section.hasRod) return
      drilling.push({
        id: `section-${section.id}-rod-holder`,
        panelId: `section-${section.id}-rod-holder-zone`,
        x: 37,
        y: 0,
        z: Math.max(1200, height - 350),
        diameterMm: 5,
        depthMm: 12,
        side: 'left',
        purpose: 'rod-holder',
        templateId: 'rod-holder',
        requiresTechnologistCheck: true,
        note: 'MVP: зона крепления штангодержателя. Нужно привязать к боковине/перегородке при генерации .b3d.',
      })
    })
  }
  {
    const item = getHardwareCatalogItem('confirmat')
    const quantity = Math.max(1, Math.ceil(panels.length * 4))
    hardware.push({ id: 'confirmats', catalogItemId: item.id, title: item.title, quantity, unit: item.unit, unitPrice: item.price, totalPrice: item.price * quantity, relatedPanelIds: panels.filter(p => p.materialType === 'ldsp').map(p => p.id) })
  }

  const totals = getProductionTotals(panels, hardware, drilling)

  return {
    schema: 'razmerno.production-model.v2',
    source: 'constructor',
    productType: project.productType,
    dimensions: project.dimensions,
    thicknessMm: thickness,
    panels,
    drilling,
    hardware,
    totals,
    basisExportPlan: PRODUCTION_MODEL_BASIS_EXPORT_PLAN,
    basisNotes: PRODUCTION_MODEL_BASIS_NOTES,
  }
}
