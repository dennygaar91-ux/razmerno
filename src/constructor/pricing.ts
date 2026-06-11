import type { ConstructorProject } from './schema'
import { getOpening, getHardware, getFacadeMode } from './catalog'
import { buildProductionModel } from './productionModel'
import { getDecorPrice, getEdgePricePerMeter, SERVICE_PRICES, HDF_PRICE } from './priceList'

export interface PriceBreakdown {
  material: number
  cutting: number
  edging: number
  drilling: number
  facades: number
  hardware: number
  packaging: number
}

export interface ProjectSummary {
  shelves: number
  drawers: number
  rods: number
  elements: number
  sectionWidth: number
  parts: number
  bodyAreaM2: number
  facadeAreaM2: number
  hdfAreaM2: number
  edgeLm: number
}

export interface Estimate {
  summary: ProjectSummary
  breakdown: PriceBreakdown
  total: number
  currency: 'RUB'
  pricingSource: 'dealer-price-list-2026-04-01-plus-30'
}

function round10(v: number): number {
  return Math.round(v / 10) * 10
}

export function getSummary(project: ConstructorProject): ProjectSummary {
  const production = buildProductionModel(project)
  const shelves = project.sections.reduce((a, s) => a + s.shelves, 0)
  const drawers = project.sections.reduce((a, s) => a + s.drawers, 0)
  const rods    = project.sections.reduce((a, s) => a + (s.hasRod ? 1 : 0), 0)
  const sectionsCount = project.sections.length

  return {
    shelves,
    drawers,
    rods,
    elements: shelves + drawers + rods,
    sectionWidth: Math.round(project.dimensions.width / sectionsCount),
    parts: production.totals.panelCount,
    bodyAreaM2: production.totals.bodyAreaM2,
    facadeAreaM2: production.totals.facadeAreaM2,
    hdfAreaM2: production.totals.hdfAreaM2,
    edgeLm: production.totals.edgeLm,
  }
}

export function getBreakdown(project: ConstructorProject, summary: ProjectSummary): PriceBreakdown {
  const production = buildProductionModel(project)
  const bodyDecorPrice = getDecorPrice(project.material.bodyDecorId)
  const facadeDecorPrice = getDecorPrice(project.material.facadeDecorId)
  const facadeMode = getFacadeMode(project.material.facadeMode)
  const opening = getOpening(project.material.opening)
  const hardware = getHardware(project.material.hardware)

  const bodyMaterialCost = production.totals.bodyAreaM2 * bodyDecorPrice.price
  const hdfMaterialCost = production.totals.hdfAreaM2 * HDF_PRICE.price
  const facadeMaterialCost = production.totals.facadeAreaM2 * facadeDecorPrice.price
  const materialCost = bodyMaterialCost + hdfMaterialCost

  const cutting = Math.max(
    1800,
    production.totals.panelAreaM2 * SERVICE_PRICES.customPanelProcessing.price,
  )

  const edgePrice = getEdgePricePerMeter(project.material.edgeDecorId)
  const edgePremium = project.material.edge === 'contrast' ? 650 : 0
  const edging = production.totals.edgeLm * edgePrice + edgePremium

  const drilling =
    650 +
    production.totals.panelCount * 55 +
    summary.shelves * 70 +
    summary.drawers * 280 +
    summary.rods * 120 +
    production.totals.drillingCount * 25

  const facadeModeSetup = project.material.facadeMode === 'open' ? 0 : facadeMode.priceAdd
  const facades = facadeMaterialCost + facadeModeSetup

  const productionHardwareCost = production.hardware.reduce((sum, item) => sum + item.totalPrice, 0)
  const handleOrPushCost = project.material.facadeMode === 'open'
    ? 0
    : production.panels
        .filter(panel => panel.role === 'facade-door' || panel.role === 'facade-drawer')
        .reduce((sum, panel) => sum + panel.quantity, 0) * (project.material.opening === 'push' ? 273 : 208)
  const hardwareCost = productionHardwareCost + handleOrPushCost + opening.priceAdd + hardware.priceAdd

  const packaging = Math.max(
    850,
    production.totals.panelAreaM2 * SERVICE_PRICES.cardboardPackaging.price +
      production.totals.panelAreaM2 * SERVICE_PRICES.stretchPackaging.price,
  )

  return {
    material:  round10(materialCost),
    cutting:   round10(cutting),
    edging:    round10(edging),
    drilling:  round10(drilling),
    facades:   round10(facades),
    hardware:  round10(hardwareCost),
    packaging: round10(packaging),
  }
}

export function getTotal(breakdown: PriceBreakdown): number {
  return round10(
    breakdown.material +
    breakdown.cutting +
    breakdown.edging +
    breakdown.drilling +
    breakdown.facades +
    breakdown.hardware +
    breakdown.packaging,
  )
}

export function getEstimate(project: ConstructorProject): Estimate {
  const summary = getSummary(project)
  const breakdown = getBreakdown(project, summary)
  const total = getTotal(breakdown)
  return {
    summary,
    breakdown,
    total,
    currency: 'RUB',
    pricingSource: 'dealer-price-list-2026-04-01-plus-30',
  }
}

const PRICE_FORMATTER = new Intl.NumberFormat('ru-RU')

export function formatPrice(value: number): string {
  return PRICE_FORMATTER.format(Number.isFinite(value) ? value : 0)
}
