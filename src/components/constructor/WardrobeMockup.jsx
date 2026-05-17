function ShelvesContent({ content }) {
  const shelfCount = Math.min(content?.shelves ?? 0, 5)

  return (
    <>
      {Array.from({ length: shelfCount }, (_, index) => (
        <span className="rp-wardrobe-shelf rp-wardrobe-zone-shelf" key={`shelf-${index}`} style={{ top: `${22 + index * 14}%` }} />
      ))}
      {shelfCount >= 3 && (
        <>
          <i className="rp-wardrobe-towels rp-wardrobe-towels--one" />
          <i className="rp-wardrobe-towels rp-wardrobe-towels--two" />
        </>
      )}
      {shelfCount >= 1 && <i className="rp-wardrobe-box" />}
    </>
  )
}

function RailContent({ content }) {
  if (!content?.rail) return null

  return (
    <>
      <strong className="rp-wardrobe-rail" />
      <i className="rp-wardrobe-clothes rp-wardrobe-clothes--one" />
      <i className="rp-wardrobe-clothes rp-wardrobe-clothes--two" />
      <i className="rp-wardrobe-clothes rp-wardrobe-clothes--three" />
    </>
  )
}

function DrawersContent({ content }) {
  const drawerCount = Math.min(content?.drawers ?? 0, 4)

  return (
    <>
      {Array.from({ length: drawerCount }, (_, index) => (
        <b className="rp-wardrobe-drawer rp-wardrobe-zone-drawer" key={`drawer-${index}`} style={{ bottom: `${4 + index * 19}%` }} />
      ))}
    </>
  )
}

function LegacySectionMockup({ section, active }) {
  return (
    <div className={`rp-ctor-col ${active ? 'is-active' : ''}`}>
      <ShelvesContent content={section} />
      <RailContent content={section} />
      <DrawersContent content={section} />
    </div>
  )
}

function ZoneContent({ zone }) {
  const content = zone?.content ?? {}

  return (
    <>
      <ShelvesContent content={content} />
      <RailContent content={content} />
      <DrawersContent content={content} />
    </>
  )
}

function ZoneLayer({ zone, section, active, onZoneSelect }) {
  const sectionHeight = Math.max(section.height || 1, 1)
  const bottom = (zone.fromY / sectionHeight) * 100
  const height = Math.max(4, (zone.height / sectionHeight) * 100)
  const contentType = zone?.content?.type || 'empty'

  return (
    <button
      type="button"
      className={`rp-wardrobe-zone ${active ? 'is-active' : ''} has-${contentType}`}
      style={{ bottom: `${bottom}%`, height: `${height}%` }}
      title={`${zone.label} · ${zone.height} мм`}
      aria-label={`Выбрать ${zone.label}, ${zone.height} мм`}
      onClick={() => onZoneSelect?.(section.id, zone.id)}
    >
      <span className="rp-wardrobe-zone__label">{zone.label}</span>
      <small>{zone.height} мм</small>
      <ZoneContent zone={zone} />
    </button>
  )
}

function DividerLayer({ divider, section }) {
  const sectionHeight = Math.max(section.height || 1, 1)
  const bottom = (divider.y / sectionHeight) * 100

  return <span className="rp-wardrobe-zone-divider" style={{ bottom: `${bottom}%` }} />
}

function ZoneSectionMockup({ section, activeSection, activeZoneId, onZoneSelect }) {
  return (
    <div className={`rp-ctor-col rp-ctor-col--zones ${activeSection ? 'is-active' : ''}`}>
      {section.zones.map((zone) => (
        <ZoneLayer zone={zone} section={section} active={zone.id === activeZoneId} onZoneSelect={onZoneSelect} key={zone.id} />
      ))}
      {section.dividers.map((divider) => (
        <DividerLayer divider={divider} section={section} key={divider.id} />
      ))}
    </div>
  )
}

function getMockupStyle(project, sectionCount) {
  const width = project?.dimensions?.width ?? 1800
  const height = project?.dimensions?.height ?? 2400
  const safeRatio = width / Math.max(height, 1)
  const visualRatio = Math.min(1.55, Math.max(0.42, safeRatio))
  const visualWidth = sectionCount === 1
    ? Math.max(36, Math.min(56, 32 + visualRatio * 30))
    : Math.max(58, Math.min(82, 50 + visualRatio * 32))
  const aspectRatio = Math.max(0.66, Math.min(1.22, visualRatio * 1.34))

  return {
    width: `${visualWidth}%`,
    aspectRatio: `${aspectRatio} / 1`,
    gridTemplateColumns: `repeat(${sectionCount}, minmax(0, 1fr))`,
  }
}

export default function WardrobeMockup({ project, onZoneSelect }) {
  const zoneSections = project?.zoneLayout?.sections
  const legacySections = project?.filling ?? [
    { shelves: 4, drawers: 2, rail: false },
    { shelves: 1, drawers: 0, rail: true },
    { shelves: 3, drawers: 0, rail: false },
  ]
  const sections = Array.isArray(zoneSections) && zoneSections.length ? zoneSections : legacySections
  const isZoneMode = Array.isArray(zoneSections) && zoneSections.length > 0
  const activeSectionId = project?.zoneLayout?.active?.sectionId
  const activeZoneId = project?.zoneLayout?.active?.zoneId
  const style = getMockupStyle(project, sections.length)

  return (
    <div className={`rp-ctor-wardrobe rp-ctor-wardrobe--renderlike ${isZoneMode ? 'rp-ctor-wardrobe--zones' : ''}`} style={style}>
      <div className="rp-ctor-top" aria-hidden="true" />
      {sections.map((section, index) => (
        isZoneMode
          ? <ZoneSectionMockup section={section} activeSection={activeSectionId === section.id || project?.activeSection === index + 1} activeZoneId={activeZoneId} onZoneSelect={onZoneSelect} key={section.id} />
          : <LegacySectionMockup section={section} active={project?.activeSection === index + 1} key={index} />
      ))}
    </div>
  )
}