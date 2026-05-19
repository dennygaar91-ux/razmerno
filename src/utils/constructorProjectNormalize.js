import { DEFAULT_PROJECT, EDGE_OPTIONS, HANDLE_OPTIONS, HARDWARE_OPTIONS, MATERIALS } from '../data/constructorCatalog'
import { ensureZoneLayout } from './constructorZones'

function normalizeNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeSection(section) {
  return {
    shelves: normalizeNumber(section?.shelves, 0),
    drawers: normalizeNumber(section?.drawers, 0),
    rail: Boolean(section?.rail),
  }
}

export function normalizeConstructorProject(project) {
  const source = project && typeof project === 'object' ? project : DEFAULT_PROJECT
  const dimensions = {
    height: normalizeNumber(source.dimensions?.height, DEFAULT_PROJECT.dimensions.height),
    width: normalizeNumber(source.dimensions?.width, DEFAULT_PROJECT.dimensions.width),
    depth: normalizeNumber(source.dimensions?.depth, DEFAULT_PROJECT.dimensions.depth),
  }
  const sections = Math.min(6, Math.max(1, normalizeNumber(source.sections, DEFAULT_PROJECT.sections)))
  const material = MATERIALS.find(item => item.id === source.material?.materialId) ?? MATERIALS[0]
  const edge = EDGE_OPTIONS.find(item => item.id === source.material?.edgeId) ?? EDGE_OPTIONS.find(item => item.id === material.edgeId) ?? EDGE_OPTIONS[0]
  const handle = HANDLE_OPTIONS.find(item => item.id === source.material?.handleId) ?? HANDLE_OPTIONS[0]
  const hardware = HARDWARE_OPTIONS.find(item => item.id === source.material?.hardwareId) ?? HARDWARE_OPTIONS[0]
  const fillingSource = Array.isArray(source.filling) && source.filling.length ? source.filling : DEFAULT_PROJECT.filling
  const filling = Array.from({ length: sections }, (_, index) => normalizeSection(fillingSource[index] ?? { shelves: 1, drawers: 0, rail: false }))

  const normalized = {
    ...DEFAULT_PROJECT,
    ...source,
    dimensions,
    sections,
    activeSection: Math.min(sections, Math.max(1, normalizeNumber(source.activeSection, 1))),
    filling,
    material: {
      ...DEFAULT_PROJECT.material,
      ...source.material,
      body: material.fullTitle ?? material.title,
      materialId: material.id,
      manufacturer: material.manufacturer,
      article: material.article,
      thickness: material.thickness,
      edge: edge.text,
      edgeId: edge.id,
      edgePriceAdd: edge.priceAdd,
      hardware: hardware.title,
      hardwareId: hardware.id,
      hardwarePriceAdd: hardware.priceAdd,
      tone: material.tone,
      handles: handle.title,
      handleId: handle.id,
      handlePriceAdd: handle.priceAdd,
      priceFactor: material.priceFactor,
    },
  }

  return ensureZoneLayout(normalized)
}
