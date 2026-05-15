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

export default function WardrobeMockup({ project }) {
  const sections = project?.filling ?? [
    { shelves: 4, drawers: 2, rail: false },
    { shelves: 1, drawers: 0, rail: true },
    { shelves: 3, drawers: 0, rail: false },
  ]

  return (
    <div className="rp-ctor-wardrobe" style={{ gridTemplateColumns: `repeat(${sections.length}, 1fr)` }} aria-hidden="true">
      <div className="rp-ctor-top" />
      {sections.map((section, index) => (
        <SectionMockup section={section} active={project?.activeSection === index + 1} key={index} />
      ))}
    </div>
  )
}
