function ShelvesContent({ section }) {
  const shelfCount = Math.min(section.shelves, 5)

  return (
    <>
      {Array.from({ length: shelfCount }, (_, index) => (
        <span className="rp-wardrobe-shelf" key={`shelf-${index}`} style={{ top: `${18 + index * 14}%` }} />
      ))}
      {section.shelves >= 3 && (
        <>
          <i className="rp-wardrobe-towels rp-wardrobe-towels--one" />
          <i className="rp-wardrobe-towels rp-wardrobe-towels--two" />
        </>
      )}
      {section.shelves >= 1 && <i className="rp-wardrobe-box" />}
    </>
  )
}

function RailContent({ section }) {
  if (!section.rail) return null

  return (
    <>
      <strong className="rp-wardrobe-rail" />
      <i className="rp-wardrobe-clothes rp-wardrobe-clothes--one" />
      <i className="rp-wardrobe-clothes rp-wardrobe-clothes--two" />
      <i className="rp-wardrobe-clothes rp-wardrobe-clothes--three" />
    </>
  )
}

function DrawersContent({ section }) {
  const drawerCount = Math.min(section.drawers, 3)

  return (
    <>
      {Array.from({ length: drawerCount }, (_, index) => (
        <b className="rp-wardrobe-drawer" key={`drawer-${index}`} style={{ bottom: `${2 + index * 13}%` }} />
      ))}
    </>
  )
}

function SectionMockup({ section, active }) {
  return (
    <div className={`rp-ctor-col ${active ? 'is-active' : ''}`}>
      <ShelvesContent section={section} />
      <RailContent section={section} />
      <DrawersContent section={section} />
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

export default function WardrobeMockup({ project }) {
  const sections = project?.filling ?? [
    { shelves: 4, drawers: 2, rail: false },
    { shelves: 1, drawers: 0, rail: true },
    { shelves: 3, drawers: 0, rail: false },
  ]
  const style = getMockupStyle(project, sections.length)

  return (
    <div className="rp-ctor-wardrobe rp-ctor-wardrobe--renderlike" style={style} aria-hidden="true">
      <div className="rp-ctor-top" />
      {sections.map((section, index) => (
        <SectionMockup section={section} active={project?.activeSection === index + 1} key={index} />
      ))}
    </div>
  )
}