const MATERIAL_THICKNESS_MM = 16
const MIN_ZONE_GAP_MM = 200
const MIN_DRAWER_FACE_HEIGHT_MM = 200
const DEFAULT_DRAWER_BLOCK_HEIGHT_MM = 720

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function createId(prefix, index) {
  return `${prefix}-${index + 1}`
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

export function getZoneRules(project) {
  const height = toNumber(project?.dimensions?.height, 0)
  const width = toNumber(project?.dimensions?.width, 0)
  const depth = toNumber(project?.dimensions?.depth, 0)
  const sections = Math.max(1, toNumber(project?.sections, 1))
  const sectionWidth = Math.round(width / sections)

  return {
    cabinetHeight: height,
    cabinetDepth: depth,
    sectionWidth,
    materialThickness: MATERIAL_THICKNESS_MM,
    minZoneGap: MIN_ZONE_GAP_MM,
    minDrawerFaceHeight: MIN_DRAWER_FACE_HEIGHT_MM,
    canUseRail: depth >= 520 && sectionWidth >= 400,
    canUseDrawers: depth >= 450 && sectionWidth >= 350,
  }
}

export function createEmptyZone(sectionIndex, fromY, toY, suffix = 'main') {
  const safeFrom = Math.max(0, Math.round(fromY))
  const safeTo = Math.max(safeFrom, Math.round(toY))

  return {
    id: `section-${sectionIndex + 1}-zone-${suffix}`,
    label: suffix === 'top' ? 'Верхняя зона' : suffix === 'bottom' ? 'Нижняя зона' : 'Вся секция',
    fromY: safeFrom,
    toY: safeTo,
    height: safeTo - safeFrom,
    content: {
      type: 'empty',
    },
  }
}

export function createZoneSection(project, sectionIndex, legacyFilling = {}) {
  const rules = getZoneRules(project)
  const height = rules.cabinetHeight
  const sectionId = createId('section', sectionIndex)
  const baseZone = createEmptyZone(sectionIndex, 0, height)

  return {
    id: sectionId,
    index: sectionIndex + 1,
    width: rules.sectionWidth,
    height,
    activeZoneId: baseZone.id,
    dividers: [],
    zones: [
      {
        ...baseZone,
        content: {
          type: legacyFilling.rail ? 'rail' : legacyFilling.drawers ? 'drawers' : legacyFilling.shelves ? 'shelves' : 'empty',
          shelves: toNumber(legacyFilling.shelves, 0),
          drawers: toNumber(legacyFilling.drawers, 0),
          rail: Boolean(legacyFilling.rail),
        },
      },
    ],
  }
}

export function createZoneLayout(project, filling = []) {
  const sections = Math.max(1, toNumber(project?.sections, 1))
  const activeSectionIndex = clamp(toNumber(project?.activeSection, 1) - 1, 0, sections - 1)
  const zoneSections = Array.from({ length: sections }, (_, index) => createZoneSection(project, index, filling[index]))
  const activeSection = zoneSections[activeSectionIndex]

  return {
    version: 1,
    active: {
      type: 'zone',
      sectionId: activeSection.id,
      zoneId: activeSection.activeZoneId,
    },
    sections: zoneSections,
  }
}

function normalizeZone(zone, sectionIndex, fallbackFromY, fallbackToY) {
  const fromY = toNumber(zone?.fromY, fallbackFromY)
  const toY = toNumber(zone?.toY, fallbackToY)
  const height = Math.max(0, toY - fromY)

  return {
    id: zone?.id || `section-${sectionIndex + 1}-zone-${fallbackFromY}-${fallbackToY}`,
    label: zone?.label || 'Зона',
    fromY,
    toY,
    height,
    content: {
      type: zone?.content?.type || 'empty',
      shelves: toNumber(zone?.content?.shelves, 0),
      drawers: toNumber(zone?.content?.drawers, 0),
      rail: Boolean(zone?.content?.rail),
    },
  }
}

export function normalizeZoneLayout(project, filling = []) {
  const fallbackLayout = createZoneLayout(project, filling)
  const source = project?.zoneLayout

  if (!source || !Array.isArray(source.sections)) return fallbackLayout

  const rules = getZoneRules(project)
  const sections = Math.max(1, toNumber(project?.sections, 1))
  const normalizedSections = Array.from({ length: sections }, (_, sectionIndex) => {
    const sourceSection = source.sections[sectionIndex]
    if (!sourceSection || !Array.isArray(sourceSection.zones) || !sourceSection.zones.length) {
      return fallbackLayout.sections[sectionIndex]
    }

    const zones = sourceSection.zones
      .map((zone) => normalizeZone(zone, sectionIndex, 0, rules.cabinetHeight))
      .filter((zone) => zone.height > 0)
      .sort((a, b) => a.fromY - b.fromY)

    if (!zones.length) return fallbackLayout.sections[sectionIndex]

    const dividers = Array.isArray(sourceSection.dividers)
      ? sourceSection.dividers.map((divider, dividerIndex) => ({
        id: divider?.id || `section-${sectionIndex + 1}-divider-${dividerIndex + 1}`,
        type: divider?.type || 'horizontalShelf',
        y: clamp(toNumber(divider?.y, Math.round(rules.cabinetHeight / 2)), MIN_ZONE_GAP_MM, Math.max(MIN_ZONE_GAP_MM, rules.cabinetHeight - MIN_ZONE_GAP_MM)),
        thickness: toNumber(divider?.thickness, MATERIAL_THICKNESS_MM),
      }))
      : []

    const activeZoneId = zones.some(zone => zone.id === sourceSection.activeZoneId) ? sourceSection.activeZoneId : zones[0].id

    return {
      id: sourceSection.id || createId('section', sectionIndex),
      index: sectionIndex + 1,
      width: rules.sectionWidth,
      height: rules.cabinetHeight,
      activeZoneId,
      dividers,
      zones,
    }
  })

  const activeSectionId = source?.active?.sectionId || normalizedSections[0].id
  const activeSection = normalizedSections.find(section => section.id === activeSectionId) || normalizedSections[0]
  const activeZoneId = activeSection.zones.some(zone => zone.id === source?.active?.zoneId) ? source.active.zoneId : activeSection.activeZoneId

  return {
    version: 1,
    active: {
      type: 'zone',
      sectionId: activeSection.id,
      zoneId: activeZoneId,
    },
    sections: normalizedSections,
  }
}

export function getActiveZone(project) {
  const layout = project?.zoneLayout
  if (!layout?.sections?.length) return null

  const section = layout.sections.find(item => item.id === layout.active?.sectionId) || layout.sections[0]
  const zone = section.zones.find(item => item.id === layout.active?.zoneId) || section.zones[0]

  return { section, zone }
}

export function splitZoneByShelf(section, zoneId, position = 'middle') {
  const zone = section?.zones?.find(item => item.id === zoneId)
  if (!section || !zone) return section

  const minY = zone.fromY + MIN_ZONE_GAP_MM
  const maxY = zone.toY - MIN_ZONE_GAP_MM
  if (maxY <= minY) return section

  const rawY = position === 'upper-third'
    ? zone.fromY + Math.round(zone.height * 0.66)
    : position === 'lower-third'
      ? zone.fromY + Math.round(zone.height * 0.33)
      : typeof position === 'number'
        ? position
        : zone.fromY + Math.round(zone.height / 2)

  const y = clamp(Math.round(rawY), minY, maxY)
  const halfThickness = MATERIAL_THICKNESS_MM / 2
  const bottomTo = Math.max(zone.fromY, Math.round(y - halfThickness))
  const topFrom = Math.min(zone.toY, Math.round(y + halfThickness))
  const dividerId = `${section.id}-divider-${section.dividers.length + 1}`
  const bottomZone = createEmptyZone(section.index - 1, zone.fromY, bottomTo, `bottom-${section.dividers.length + 1}`)
  const topZone = createEmptyZone(section.index - 1, topFrom, zone.toY, `top-${section.dividers.length + 1}`)

  return {
    ...section,
    activeZoneId: bottomZone.id,
    dividers: [
      ...section.dividers,
      { id: dividerId, type: 'horizontalShelf', y, thickness: MATERIAL_THICKNESS_MM },
    ].sort((a, b) => a.y - b.y),
    zones: section.zones
      .filter(item => item.id !== zoneId)
      .concat(bottomZone, topZone)
      .sort((a, b) => a.fromY - b.fromY),
  }
}

export function canPlaceDrawersInZone(project, zone, drawerCount = 3) {
  const rules = getZoneRules(project)
  const count = clamp(toNumber(drawerCount, 3), 1, 4)
  const requiredHeight = count * MIN_DRAWER_FACE_HEIGHT_MM

  if (!zone) return { ok: false, reason: 'Выберите зону для ящиков' }
  if (!rules.canUseDrawers) return { ok: false, reason: 'Для ящиков нужна глубина от 450 мм и ширина секции от 350 мм' }
  if (zone.height < requiredHeight) {
    const possibleCount = Math.max(1, Math.floor(zone.height / MIN_DRAWER_FACE_HEIGHT_MM))
    return {
      ok: false,
      reason: `Для ${count} ящиков нужно минимум ${requiredHeight} мм по высоте`,
      suggestion: possibleCount < count ? { type: 'reduceDrawers', count: possibleCount } : null,
    }
  }

  return { ok: true }
}

export function getRecommendedDrawerBlockHeight(sectionHeight, drawerCount = 3) {
  const minHeight = drawerCount * MIN_DRAWER_FACE_HEIGHT_MM
  const target = Math.max(DEFAULT_DRAWER_BLOCK_HEIGHT_MM, minHeight)
  return clamp(target, minHeight, Math.max(minHeight, sectionHeight - MIN_ZONE_GAP_MM))
}
