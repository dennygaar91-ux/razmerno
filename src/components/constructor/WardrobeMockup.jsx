function SectionMockup({ section, active }) {
  const shelfCount = Math.min(section.shelves, 5)
  const drawerCount = Math.min(section.drawers, 3)

  return (
    <div className={`rp-ctor-col ${active ? 'is-active' : ''}`}>
      {Array.from({ length: shelfCount }, (_, index) => (
        <span key={`shelf-${index}`} style={{ top: `${18 + index * 14}%` }} />
      ))}
      {section.rail && <strong />}
      {Array.from({ length: drawerCount }, (_, index) => (
        <b key={`drawer-${index}`} style={{ bottom: `${2 + index * 13}%` }} />
      ))}
    </div>
  )
}

function getMockupStyle(project, sectionCount) {
  const width = project?.dimensions?.width ?? 1800
  const height = project?.dimensions?.height ?? 2400
  const safeRatio = width / Math.max(height, 1)
  const visualRatio = Math.min(1.6, Math.max(0.38, safeRatio))
  const visualWidth = sectionCount === 1
    ? Math.max(34, Math.min(54, 32 + visualRatio * 30))
    : Math.max(56, Math.min(82, 48 + visualRatio * 34))
  const aspectRatio = Math.max(0.62, Math.min(1.28, visualRatio * 1.42))

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
    <div className="rp-ctor-wardrobe" style={style} aria-hidden="true">
      <div className="rp-ctor-top" />
      {sections.map((section, index) => (
        <SectionMockup section={section} active={project?.activeSection === index + 1} key={index} />
      ))}
    </div>
  )
}