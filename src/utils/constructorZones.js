const MIN_ZONE_HEIGHT = 360
const MIN_DRAWER_ZONE_HEIGHT = 460
const THREE_DRAWER_HEIGHT = 600
const MIN_RAIL_HEIGHT = 700
const MIN_RAIL_DEPTH = 520

function clone(project) {
  return JSON.parse(JSON.stringify(project))
}

function sectionIdFromIndex(index) { return `section-${index + 1}` }

function toContent(section) {
  return {
    type: section.drawers > 0 ? 'drawers' : section.rail ? 'rail' : section.shelves > 0 ? 'shelves' : 'empty',
    shelves: section.shelves ?? 0,
    drawers: section.drawers ?? 0,
    rail: Boolean(section.rail),
  }
}

function buildZoneLayout(project) {
  const sectionWidth = Math.round(project.dimensions.width / project.sections)
  const sections = project.filling.map((section, index) => {
    const id = sectionIdFromIndex(index)
    return {
      id,
      index: index + 1,
      width: sectionWidth,
      height: project.dimensions.height,
      activeZoneId: `${id}-zone-main`,
      dividers: [],
      zones: [{ id: `${id}-zone-main`, label: 'Основная зона', fromY: 0, toY: project.dimensions.height, height: project.dimensions.height, content: toContent(section) }],
    }
  })

  return {
    version: 1,
    dimensions: { ...project.dimensions },
    sectionsCount: project.sections,
    active: { type: 'zone', sectionId: sectionIdFromIndex(project.activeSection - 1), zoneId: `${sectionIdFromIndex(project.activeSection - 1)}-zone-main` },
    sections,
  }
}

function isZoneLayoutStale(project) {
  const layout = project.zoneLayout
  if (!layout || !Array.isArray(layout.sections)) return true
  if (layout.sections.length !== project.sections) return true
  if (layout.sectionsCount && layout.sectionsCount !== project.sections) return true

  const expectedSectionWidth = Math.round(project.dimensions.width / project.sections)
  const dimensions = layout.dimensions

  if (dimensions) {
    if (dimensions.width !== project.dimensions.width) return true
    if (dimensions.height !== project.dimensions.height) return true
    if (dimensions.depth !== project.dimensions.depth) return true
  }

  return layout.sections.some((section, index) => (
    section.index !== index + 1
    || section.width !== expectedSectionWidth
    || section.height !== project.dimensions.height
    || !Array.isArray(section.zones)
    || section.zones.length === 0
    || section.zones.some(zone => zone.toY > project.dimensions.height || zone.height <= 0)
  ))
}

function ensureLayout(project) {
  const next = clone(project)
  if (isZoneLayoutStale(next)) next.zoneLayout = buildZoneLayout(next)
  return next
}

function syncFilling(next) {
  next.filling = next.zoneLayout.sections.map((section) => section.zones.reduce((acc, zone) => ({
    shelves: acc.shelves + (zone.content.shelves || 0),
    drawers: acc.drawers + (zone.content.drawers || 0),
    rail: acc.rail || Boolean(zone.content.rail),
  }), { shelves: 0, drawers: 0, rail: false }))
  return next
}

function getActiveRefs(next) {
  const sectionId = next.zoneLayout.active?.sectionId ?? sectionIdFromIndex(next.activeSection - 1)
  const section = next.zoneLayout.sections.find(s => s.id === sectionId) ?? next.zoneLayout.sections[next.activeSection - 1]
  if (!section) return {}
  const zoneId = section.activeZoneId ?? section.zones[0]?.id
  const zone = section.zones.find(z => z.id === zoneId) ?? section.zones[0]
  return { section, zone }
}

export function ensureZoneLayout(project) { return syncFilling(ensureLayout(project)) }

export function selectZone(project, sectionId, zoneId) {
  const next = ensureLayout(project)
  const section = next.zoneLayout.sections.find(s => s.id === sectionId)
  if (!section) return next
  const zone = section.zones.find(z => z.id === zoneId)
  if (!zone) return next
  section.activeZoneId = zoneId
  next.zoneLayout.active = { type: 'zone', sectionId, zoneId }
  next.activeSection = section.index
  return syncFilling(next)
}

export function splitActiveZone(project, position = 'middle') {
  const next = ensureLayout(project)
  const { section, zone } = getActiveRefs(next)
  if (!section || !zone) return { project: next, ok: false, reason: 'Выберите зону для разделения.' }
  if (zone.height < MIN_ZONE_HEIGHT * 2) return { project: next, ok: false, reason: 'Эту зону уже нельзя разделить: мало места между полками.' }
  const splitRatio = position === 'top' ? 0.35 : position === 'bottom' ? 0.65 : 0.5
  const splitY = Math.round(zone.fromY + zone.height * splitRatio)
  const dividerY = Math.max(zone.fromY + MIN_ZONE_HEIGHT, Math.min(zone.toY - MIN_ZONE_HEIGHT, splitY))
  const bottom = { id: `${section.id}-zone-bottom-${section.dividers.length + 1}`, label: 'Нижняя зона', fromY: zone.fromY, toY: dividerY - 8, height: dividerY - 8 - zone.fromY, content: { type: 'empty', shelves: 0, drawers: 0, rail: false } }
  const top = { id: `${section.id}-zone-top-${section.dividers.length + 1}`, label: 'Верхняя зона', fromY: dividerY + 8, toY: zone.toY, height: zone.toY - dividerY - 8, content: { ...zone.content, type: zone.content.drawers ? 'drawers' : zone.content.rail ? 'rail' : zone.content.shelves ? 'shelves' : 'empty' } }
  section.dividers.push({ id: `${section.id}-divider-${section.dividers.length + 1}`, type: 'horizontalShelf', y: dividerY, thickness: 16 })
  section.zones = section.zones.flatMap(z => z.id === zone.id ? [bottom, top] : [z])
  section.activeZoneId = bottom.id
  next.zoneLayout.active = { type: 'zone', sectionId: section.id, zoneId: bottom.id }
  return { project: syncFilling(next), ok: true }
}

export function setActiveZoneShelves(project, shelves) {
  const next = ensureLayout(project)
  const { zone } = getActiveRefs(next)
  if (!zone) return { project: next, ok: false, reason: 'Выберите зону.' }
  zone.content = { ...zone.content, shelves: Math.max(0, shelves), type: shelves > 0 ? 'shelves' : zone.content.drawers ? 'drawers' : zone.content.rail ? 'rail' : 'empty' }
  return { project: syncFilling(next), ok: true }
}

export function setActiveZoneDrawers(project, drawers) {
  const next = ensureLayout(project)
  const { zone } = getActiveRefs(next)
  if (!zone) return { project: next, ok: false, reason: 'Выберите зону.' }
  if (zone.height < MIN_DRAWER_ZONE_HEIGHT) return { project: next, ok: false, reason: 'Для ящиков нужна более высокая зона.' }
  if (drawers >= 3 && zone.height < THREE_DRAWER_HEIGHT) return { project: next, ok: false, reason: 'Для 3 ящиков нужно минимум 600 мм по высоте.' }
  const safe = Math.max(0, Math.min(4, drawers))
  zone.content = { ...zone.content, drawers: safe, rail: false, type: safe > 0 ? 'drawers' : zone.content.shelves ? 'shelves' : 'empty' }
  return { project: syncFilling(next), ok: true }
}

export function setActiveZoneRail(project, enabled) {
  const next = ensureLayout(project)
  const { zone } = getActiveRefs(next)
  if (!zone) return { project: next, ok: false, reason: 'Выберите зону.' }
  if (enabled && next.dimensions.depth < MIN_RAIL_DEPTH) return { project: next, ok: false, reason: 'Для штанги нужна глубина от 520 мм.' }
  if (enabled && zone.height < MIN_RAIL_HEIGHT) return { project: next, ok: false, reason: 'Для штанги нужна высота зоны от 700 мм.' }
  zone.content = { ...zone.content, rail: enabled, drawers: enabled ? 0 : zone.content.drawers, type: enabled ? 'rail' : zone.content.drawers ? 'drawers' : zone.content.shelves ? 'shelves' : 'empty' }
  return { project: syncFilling(next), ok: true }
}

export function clearActiveZone(project) {
  const next = ensureLayout(project)
  const { zone } = getActiveRefs(next)
  if (!zone) return { project: next, ok: false, reason: 'Выберите зону.' }
  zone.content = { type: 'empty', shelves: 0, drawers: 0, rail: false }
  return { project: syncFilling(next), ok: true }
}

export function applyDrawerBlockToSection(project, sectionId, drawerCount = 3) {
  const next = ensureLayout(project)
  const section = next.zoneLayout.sections.find(s => s.id === sectionId)
  if (!section) return { project: next, ok: false, reason: 'Секция не найдена.' }
  next.zoneLayout.active = { type: 'zone', sectionId, zoneId: section.activeZoneId }
  const result = splitActiveZone({ ...next, activeSection: section.index })
  if (!result.ok) return result
  let updated = result.project
  updated = selectZone(updated, sectionId, updated.zoneLayout.sections.find(s=>s.id===sectionId).zones[0].id)
  return setActiveZoneDrawers(updated, drawerCount)
}

export function applyWardrobePresetToSection(project, sectionId) {
  let next = ensureLayout(project)
  const section = next.zoneLayout.sections.find(s => s.id === sectionId)
  if (!section) return { project: next, ok: false, reason: 'Секция не найдена.' }
  next = selectZone(next, sectionId, section.activeZoneId)
  if (section.zones.length === 1) {
    const split = splitActiveZone(next)
    if (!split.ok) return split
    next = split.project
  }
  const current = next.zoneLayout.sections.find(s=>s.id===sectionId)
  const bottom = current.zones.reduce((a,b)=>a.fromY<b.fromY?a:b)
  const top = current.zones.reduce((a,b)=>a.fromY>b.fromY?a:b)
  next = selectZone(next, sectionId, bottom.id)
  next = setActiveZoneRail(next, true).project
  next = selectZone(next, sectionId, top.id)
  return setActiveZoneShelves(next, 1)
}

export function applyShelvesPresetToZone(project, shelves = 5) { return setActiveZoneShelves(project, shelves) }

export function applyComboPresetToSection(project, sectionId) {
  let next = ensureLayout(project)
  const section = next.zoneLayout.sections.find(s => s.id === sectionId)
  if (!section) return { project: next, ok: false, reason: 'Секция не найдена.' }
  next = selectZone(next, sectionId, section.activeZoneId)
  if (section.zones.length === 1) {
    const split = splitActiveZone(next)
    if (!split.ok) return split
    next = split.project
  }
  const current = next.zoneLayout.sections.find(s=>s.id===sectionId)
  const bottom = current.zones.reduce((a,b)=>a.fromY<b.fromY?a:b)
  const top = current.zones.reduce((a,b)=>a.fromY>b.fromY?a:b)
  next = selectZone(next, sectionId, bottom.id)
  next = setActiveZoneDrawers(next, 3).project
  next = selectZone(next, sectionId, top.id)
  return setActiveZoneShelves(next, 4)
}

export function getActiveZone(project) {
  const next = ensureLayout(project)
  return getActiveRefs(next).zone ?? null
}

export function getActiveZoneHints(project) {
  const next = ensureLayout(project)
  const { zone } = getActiveRefs(next)
  if (!zone) return { canSplit: false, canRail: false, canDrawers: false, reason: 'Выберите зону.' }
  return {
    canSplit: zone.height >= MIN_ZONE_HEIGHT * 2,
    canRail: next.dimensions.depth >= MIN_RAIL_DEPTH && zone.height >= MIN_RAIL_HEIGHT,
    canDrawers: zone.height >= MIN_DRAWER_ZONE_HEIGHT,
    splitReason: zone.height < MIN_ZONE_HEIGHT * 2 ? 'Эту зону уже нельзя разделить: мало места между полками.' : '',
  }
}