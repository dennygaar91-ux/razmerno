import { formatSection, getSectionLabel } from './viewerUtils'

function getSectionMeta(section) {
  const label = getSectionLabel(section)
  const isEmpty = label === 'Пусто'
  const tone = label === 'Одежда' ? 'clothes' : label === 'Полки' ? 'shelves' : label === 'Ящики' ? 'drawers' : isEmpty ? 'empty' : 'mixed'

  return { label, tone, isEmpty }
}

export default function SectionMap({ project, activeSection, onSectionSelect, onPresetApply }) {
  const activeMeta = getSectionMeta(activeSection)

  return (
    <div className="rp-ref-section-map rp-ref-section-map--polished">
      <div className="rp-ref-section-map__head">
        <div>
          <h3>Карта секций</h3>
          <p>Активна секция {project.activeSection}: {activeMeta.label}</p>
        </div>
        <button type="button" onClick={() => onPresetApply('clothes')}>Сценарий одежды</button>
      </div>

      <div className="rp-ref-section-map__grid" style={{ gridTemplateColumns: `repeat(${project.sections}, 1fr)` }}>
        {project.filling.map((section, index) => {
          const meta = getSectionMeta(section)
          const active = project.activeSection === index + 1

          return (
            <button className={`rp-ref-section-map__item is-${meta.tone} ${active ? 'is-active' : ''}`} type="button" key={index} onClick={() => onSectionSelect(index + 1)}>
              <span>{index + 1}</span>
              <strong>{meta.label}</strong>
              <b>{formatSection(section)}</b>
              <em>{active ? 'Редактируется' : 'Выбрать'}</em>
            </button>
          )
        })}
      </div>
    </div>
  )
}
