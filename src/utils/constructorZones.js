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

function getSectionById(layout, sectionId) {
  return layout.sections.find(section => section.id === sectionId) || layout.sections[0]
}

function syncSectionLegacyFilling(section) {
  return section.zones.reduce((acc, zone) => {
    const content = zone.content || {}
    return {
      shelves: acc.shelves + toNumber(content.shelves, 0),
      drawers: acc.drawers + toNumber(content.drawers, 0),
      rail: acc.rail || Boolean(content.rail),
    }
  }, { shelves: section.dividers.length, drawers: 0, rail: false })
}

function syncProjectFillingFromLayout(project, layout) {
  return layout.sections.map((section) => syncSectionLegacyFilling(section))
}

function updateSectionInLayout(layout, nextSection) {
  return {
    ...layout,
    sections: layout.sections.map(section => section.id === nextSection.id ? nextSection : section),
    active: {
      type: 'zone',
      sectionId: nextSection.id,
      zoneId: nextSection.activeZoneId,
    },
  }
}

function setZoneContent(section, zoneId, content) {
  return {
    ...section,
    activeZoneId: zoneId,
    zones: section.zones.map(zone => zone.id === zoneId
      ? {
        ...zone,
        content: {
          type: content.type || 'empty',
          shelves: toNumber(content.shelves, 0),
          drawers: toNumber(content.drawers, 0),
          rail: Boolean(content.rail),
        },
      }
      : zone),
  }
}

function makeActionError(reason, action, suggestion = null) {
  return { ok: false, reason, action, suggestion }
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

export function ensureZoneLayout(project, filling = project?.filling ?? []) {
  return normalizeZoneLayout(project, filling)
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

export function getActiveZoneHints(project) {
  const active = getActiveZone(project)
  if (!active?.zone) return []

  const rules = getZoneRules(project)
  const { zone, section } = active
  const hints = []

  if (zone.height < MIN_ZONE_GAP_MM * 2 + MATERIAL_THICKNESS_MM) {
    hints.push({ type: 'warning', title: 'Полку сюда уже не добавить', text: `Для разделения зоны нужно минимум ${MIN_ZONE_GAP_MM * 2 + MATERIAL_THICKNESS_MM} мм по высоте.` })
  } else {
    hints.push({ type: 'success', title: 'Зону можно разделить', text: 'Полка поставится по центру или ниже, а секция разделится на две области.' })
  }

  if (!rules.canUseDrawers) {
    hints.push({ type: 'warning', title: 'Ящики недоступны', text: 'Для ящиков нужна глубина от 450 мм и ширина секции от 350 мм.' })
  } else if (zone.height < MIN_DRAWER_FACE_HEIGHT_MM) {
    hints.push({ type: 'warning', title: 'Зона слишком низкая для ящиков', text: `Минимальная высота одного фасада — ${MIN_DRAWER_FACE_HEIGHT_MM} мм.` })
  } else {
    const drawerCount = Math.min(4, Math.floor(zone.height / MIN_DRAWER_FACE_HEIGHT_MM))
    hints.push({ type: 'success', title: `Поместится до ${drawerCount} ящ.`, text: `${zone.label}: ${zone.height} мм, секция ${section.index}.` })
  }

  if (!rules.canUseRail) {
    hints.push({ type: 'warning', title: 'Штанга недоступна', text: 'Для обычной штанги нужна глубина от 520 мм и ширина секции от 400 мм.' })
  } else if (zone.height < 700) {
    hints.push({ type: 'warning', title: 'Мало высоты для штанги', text: 'Для одежды на плечиках нужна зона от 700 мм.' })
  }

  return hints.slice(0, 3)
}

export function splitZoneByShelf(section, zoneId, position = 'middle') {
  const zone = section?.zones?.find(item => item.id === zoneId)
  if (!section || !zone) return { section, result: makeActionError('Выберите зону, которую нужно разделить.', 'Нажмите на область внутри шкафа или выберите её в списке зон.') }

  const minY = zone.fromY + MIN_ZONE_GAP_MM
  const maxY = zone.toY - MIN_ZONE_GAP_MM
  if (maxY <= minY) {
    return {
      section,
      result: makeActionError(
        'В этой зоне недостаточно места для новой полки.',
        `Минимальное расстояние между полками — ${MIN_ZONE_GAP_MM} мм. Выберите более высокую зону или уберите соседний разделитель.`
      ),
    }
  }

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
  const nextSection = {
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

  return { section: nextSection, result: { ok: true, message: 'Полка добавлена. Теперь можно настроить верхнюю и нижнюю зоны отдельно.' } }
}

export function canPlaceDrawersInZone(project, zone, drawerCount = 3) {
  const rules = getZoneRules(project)
  const count = clamp(toNumber(drawerCount, 3), 1, 4)
  const requiredHeight = count * MIN_DRAWER_FACE_HEIGHT_MM

  if (!zone) return makeActionError('Выберите зону для ящиков.', 'Нажмите на область внутри шкафа или выберите её в списке зон.')
  if (!rules.canUseDrawers) return makeActionError('Ящики здесь недоступны.', 'Для ящиков нужна глубина от 450 мм и ширина секции от 350 мм.')
  if (zone.height < requiredHeight) {
    const possibleCount = Math.max(0, Math.floor(zone.height / MIN_DRAWER_FACE_HEIGHT_MM))
    return makeActionError(
      `Для ${count} ящиков нужно минимум ${requiredHeight} мм по высоте.`,
      possibleCount > 0 ? `В этой зоне можно поставить ${possibleCount} ящ. или увеличить высоту зоны.` : 'Выберите более высокую зону или сначала разделите секцию иначе.',
      possibleCount > 0 && possibleCount < count ? { type: 'reduceDrawers', count: possibleCount } : null,
    )
  }

  return { ok: true, message: `${count} ящ. помещаются в выбранную зону.` }
}

export function getRecommendedDrawerBlockHeight(sectionHeight, drawerCount = 3) {
  const minHeight = drawerCount * MIN_DRAWER_FACE_HEIGHT_MM
  const target = Math.max(DEFAULT_DRAWER_BLOCK_HEIGHT_MM, minHeight)
  return clamp(target, minHeight, Math.max(minHeight, sectionHeight - MIN_ZONE_GAP_MM))
}

export function selectZone(project, sectionId, zoneId) {
  const layout = normalizeZoneLayout(project, project.filling)
  const section = getSectionById(layout, sectionId)
  const zone = section.zones.find(item => item.id === zoneId) || section.zones[0]
  const nextLayout = {
    ...layout,
    active: { type: 'zone', sectionId: section.id, zoneId: zone.id },
    sections: layout.sections.map(item => item.id === section.id ? { ...item, activeZoneId: zone.id } : item),
  }

  return {
    ...project,
    activeSection: section.index,
    zoneLayout: nextLayout,
  }
}

export function splitActiveZone(project, position = 'middle') {
  const layout = normalizeZoneLayout(project, project.filling)
  const section = getSectionById(layout, layout.active?.sectionId)
  const { section: nextSection, result } = splitZoneByShelf(section, layout.active?.zoneId || section.activeZoneId, position)
  if (!result?.ok) return { project, result }
  const nextLayout = updateSectionInLayout(layout, nextSection)

  return {
    project: {
      ...project,
      activeSection: nextSection.index,
      filling: syncProjectFillingFromLayout(project, nextLayout),
      zoneLayout: nextLayout,
    },
    result,
  }
}

export function setActiveZoneShelves(project, shelves) {
  const layout = normalizeZoneLayout(project, project.filling)
  const section = getSectionById(layout, layout.active?.sectionId)
  const zoneId = layout.active?.zoneId || section.activeZoneId
  const zone = section.zones.find(item => item.id === zoneId)
  if (!zone) return { project, result: makeActionError('Выберите зону для полок.', 'Нажмите на область внутри шкафа или выберите её в списке зон.') }

  const nextSection = setZoneContent(section, zoneId, {
    type: shelves > 0 ? 'shelves' : 'empty',
    shelves: clamp(toNumber(shelves, 0), 0, 8),
    drawers: 0,
    rail: false,
  })
  const nextLayout = updateSectionInLayout(layout, nextSection)

  return {
    project: {
      ...project,
      activeSection: nextSection.index,
      filling: syncProjectFillingFromLayout(project, nextLayout),
      zoneLayout: nextLayout,
    },
    result: { ok: true },
  }
}

export function setActiveZoneDrawers(project, drawers) {
  const layout = normalizeZoneLayout(project, project.filling)
  const section = getSectionById(layout, layout.active?.sectionId)
  const zoneId = layout.active?.zoneId || section.activeZoneId
  const zone = section.zones.find(item => item.id === zoneId)
  const count = clamp(toNumber(drawers, 0), 0, 4)
  if (!zone) return { project, result: makeActionError('Выберите зону для ящиков.', 'Нажмите на область внутри шкафа или выберите её в списке зон.') }
  if (count === 0) {
    const cleared = setZoneContent(section, zoneId, { type: 'empty' })
    const nextLayout = updateSectionInLayout(layout, cleared)
    return { project: { ...project, filling: syncProjectFillingFromLayout(project, nextLayout), zoneLayout: nextLayout }, result: { ok: true } }
  }

  const result = canPlaceDrawersInZone(project, zone, count)
  if (!result.ok) return { project, result }

  const nextSection = setZoneContent(section, zoneId, {
    type: 'drawers',
    shelves: 0,
    drawers: count,
    rail: false,
  })
  const nextLayout = updateSectionInLayout(layout, nextSection)

  return {
    project: {
      ...project,
      activeSection: nextSection.index,
      filling: syncProjectFillingFromLayout(project, nextLayout),
      zoneLayout: nextLayout,
    },
    result,
  }
}

export function setActiveZoneRail(project, enabled) {
  const layout = normalizeZoneLayout(project, project.filling)
  const section = getSectionById(layout, layout.active?.sectionId)
  const zoneId = layout.active?.zoneId || section.activeZoneId
  const zone = section.zones.find(item => item.id === zoneId)
  const rules = getZoneRules(project)
  if (!zone) return { project, result: makeActionError('Выберите зону для штанги.', 'Нажмите на область внутри шкафа или выберите её в списке зон.') }
  if (enabled && !rules.canUseRail) {
    return { project, result: makeActionError('Штанга здесь недоступна.', 'Для обычной штанги нужна глубина от 520 мм и ширина секции от 400 мм.') }
  }
  if (enabled && zone.height < 700) {
    return { project, result: makeActionError('В зоне мало высоты для штанги.', 'Для одежды на плечиках нужна зона от 700 мм. Выберите более высокую зону.') }
  }

  const nextSection = setZoneContent(section, zoneId, {
    type: enabled ? 'rail' : 'empty',
    shelves: 0,
    drawers: 0,
    rail: Boolean(enabled),
  })
  const nextLayout = updateSectionInLayout(layout, nextSection)

  return {
    project: {
      ...project,
      activeSection: nextSection.index,
      filling: syncProjectFillingFromLayout(project, nextLayout),
      zoneLayout: nextLayout,
    },
    result: { ok: true },
  }
}

export function clearActiveZone(project) {
  const layout = normalizeZoneLayout(project, project.filling)
  const section = getSectionById(layout, layout.active?.sectionId)
  const zoneId = layout.active?.zoneId || section.activeZoneId
  const nextSection = setZoneContent(section, zoneId, { type: 'empty' })
  const nextLayout = updateSectionInLayout(layout, nextSection)

  return {
    ...project,
    activeSection: nextSection.index,
    filling: syncProjectFillingFromLayout(project, nextLayout),
    zoneLayout: nextLayout,
  }
}

export function applyDrawerBlockToSection(project, sectionId, drawerCount = 3) {
  const layout = normalizeZoneLayout(project, project.filling)
  const section = getSectionById(layout, sectionId)
  const count = clamp(toNumber(drawerCount, 3), 1, 4)
  const blockHeight = getRecommendedDrawerBlockHeight(section.height, count)
  const splitY = blockHeight
  const baseZone = section.zones[0]
  if (!baseZone || section.zones.length > 1) {
    return { project, result: makeActionError('Автоблок ящиков доступен только для пустой неразделённой секции.', 'Выберите пустую секцию или поставьте ящики в конкретную зону через счётчик.') }
  }

  const { section: splitSection, result: splitResult } = splitZoneByShelf(section, baseZone.id, splitY)
  if (!splitResult?.ok) return { project, result: splitResult }
  const bottomZone = splitSection.zones.find(zone => zone.fromY === 0) || splitSection.zones[0]
  const result = canPlaceDrawersInZone(project, bottomZone, count)
  if (!result.ok) return { project, result }

  const nextSection = setZoneContent(splitSection, bottomZone.id, {
    type: 'drawers',
    shelves: 0,
    drawers: count,
    rail: false,
  })
  const nextLayout = updateSectionInLayout(layout, nextSection)

  return {
    project: {
      ...project,
      activeSection: nextSection.index,
      filling: syncProjectFillingFromLayout(project, nextLayout),
      zoneLayout: nextLayout,
    },
    result: { ok: true, message: 'Ящики добавлены снизу. Система автоматически поставила верхнюю полку блока.' },
  }
}

export function applyShelvesPresetToZone(project, shelves = 5) {
  return setActiveZoneShelves(project, shelves)
}

export function applyWardrobePresetToSection(project, sectionId) {
  const layout = normalizeZoneLayout(project, project.filling)
  const section = getSectionById(layout, sectionId)
  const baseZone = section.zones[0]

  if (!baseZone || section.zones.length > 1) {
    const shelfResult = setActiveZoneShelves(project, 1)
    if (!shelfResult.result?.ok) return shelfResult
    return setActiveZoneRail(shelfResult.project, true)
  }

  const railZoneHeight = Math.max(700, Math.round(section.height * 0.72))
  const splitY = clamp(railZoneHeight, 700, Math.max(700, section.height - MIN_ZONE_GAP_MM))
  const { section: splitSection, result: splitResult } = splitZoneByShelf(section, baseZone.id, splitY)
  if (!splitResult?.ok) return { project, result: splitResult }

  const bottomZone = splitSection.zones.find(zone => zone.fromY === 0) || splitSection.zones[0]
  const topZone = splitSection.zones.find(zone => zone.id !== bottomZone.id) || splitSection.zones[1]
  let nextSection = setZoneContent(splitSection, bottomZone.id, { type: 'rail', shelves: 0, drawers: 0, rail: true })
  nextSection = setZoneContent(nextSection, topZone.id, { type: 'shelves', shelves: 1, drawers: 0, rail: false })
  nextSection.activeZoneId = bottomZone.id

  const nextLayout = updateSectionInLayout(layout, nextSection)

  return {
    project: {
      ...project,
      activeSection: nextSection.index,
      filling: syncProjectFillingFromLayout(project, nextLayout),
      zoneLayout: nextLayout,
    },
    result: { ok: true, message: 'Гардероб добавлен: сверху полка, ниже зона со штангой.' },
  }
}

export function applyComboPresetToSection(project, sectionId) {
  const drawerResult = applyDrawerBlockToSection(project, sectionId, 3)
  if (!drawerResult.result?.ok) return drawerResult

  const layout = normalizeZoneLayout(drawerResult.project, drawerResult.project.filling)
  const section = getSectionById(layout, sectionId)
  const topZone = section.zones.slice().sort((a, b) => b.fromY - a.fromY)[0]
  const nextSection = setZoneContent(section, topZone.id, { type: 'shelves', shelves: 4, drawers: 0, rail: false })
  nextSection.activeZoneId = topZone.id
  const nextLayout = updateSectionInLayout(layout, nextSection)

  return {
    project: {
      ...drawerResult.project,
      activeSection: nextSection.index,
      filling: syncProjectFillingFromLayout(drawerResult.project, nextLayout),
      zoneLayout: nextLayout,
    },
    result: { ok: true, message: 'Комбо добавлено: снизу 3 ящика, сверху полки.' },
  }
}
