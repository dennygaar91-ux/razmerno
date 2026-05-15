import { formatSection, getSectionLabel } from './viewerUtils'

export default function SectionMap({ project, activeSection, onSectionSelect, onPresetApply }) {
  return (
    <div className="rp-ref-section-map">
      <div className="rp-ref-section-map__head">
        <div>
          <h3>Карта секций</h3>
          <p>Активна секция {project.activeSection}: {getSectionLabel(activeSection)}</p>
        </div>
        <button type="button" onClick={() => onPresetApply('clothes')}>Сценарий одежды</button>
      </div>
      <div style={{ gridTemplateColumns: `repeat(${project.sections}, 1fr)` }}>
        {project.filling.map((section, index) => (
          <button className={project.activeSection === index + 1 ? 'is-active' : ''} type="button" key={index} onClick={() => onSectionSelect(index + 1)}>
            <span>{index + 1}</span>
            <strong>{getSectionLabel(section)}</strong>
            <b>{formatSection(section)}</b>
          </button>
        ))}
      </div>
    </div>
  )
}
