function ZoneContent({ zone }) {
  const content = zone?.content ?? { shelves: 0, drawers: 0, rail: false }
  const shelfCount = Math.min(content.shelves || 0, 5)
  const drawerCount = Math.min(content.drawers || 0, 3)

  return (
    <>
      {Array.from({ length: shelfCount }, (_, index) => (
        <span className="rp-wardrobe-shelf" key={`zs-${index}`} style={{ top: `${12 + ((index + 1) * 72) / (shelfCount + 1)}%` }} />
      ))}
      {Array.from({ length: drawerCount }, (_, index) => (
        <b className="rp-wardrobe-drawer" key={`zd-${index}`} style={{ bottom: `${4 + index * 19}%` }} />
      ))}
      {content.rail && <strong className="rp-wardrobe-rail" />}
      {!content.rail && !shelfCount && !drawerCount && <em className="rp-wardrobe-empty">Пусто</em>}
    </>
  )
}

function SectionMockup({ section, active, onZoneSelect }) {
  const zones = section.zones?.length ? section.zones : [{ id: `${section.id}-zone-main`, fromY: 0, toY: section.height || 100, height: section.height || 100, label: 'Основная зона', content: section }]
  const total = Math.max(1, zones.reduce((sum, zone) => sum + (zone.height || 0), 0))

  return (
    <div className={`rp-ctor-col ${active ? 'is-active' : ''}`}>
      {zones.map(zone => (
        <button
          type="button"
          key={zone.id}
          className={`rp-ctor-zone ${section.activeZoneId === zone.id ? 'is-active' : ''}`}
          style={{ height: `${Math.max(18, ((zone.height || 0) / total) * 100)}%` }}
          onClick={() => onZoneSelect?.(section.id, zone.id)}
        >
          <ZoneContent zone={zone} />
        </button>
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
  const sections = zoneSections?.length ? zoneSections : (project?.filling ?? []).map((section, index) => ({ id: `section-${index + 1}`, zones: [{ id: `section-${index + 1}-zone-main`, height: project?.dimensions?.height ?? 2400, content: section }], activeZoneId: `section-${index + 1}-zone-main` }))
  const style = getMockupStyle(project, sections.length)

  return (
    <div className="rp-ctor-wardrobe rp-ctor-wardrobe--renderlike" style={style} aria-hidden="true">
      <div className="rp-ctor-top" />
      {sections.map((section, index) => (
        <SectionMockup section={section} active={project?.activeSection === index + 1} onZoneSelect={onZoneSelect} key={section.id || index} />
      ))}
    </div>
  )
}
