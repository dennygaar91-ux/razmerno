import { formatSection, getSectionLabel } from './viewerUtils'

function getSectionMeta(section) {
  const label = getSectionLabel(section)
  const isEmpty = label === 'Пусто'
  const tone = label === 'Одежда' ? 'clothes' : label === 'Полки' ? 'shelves' : label === 'Ящики' ? 'drawers' : isEmpty ? 'empty' : 'mixed'
  const details = []

  if (section.shelves) details.push(`${section.shelves} полок`)
  if (section.drawers) details.push(`${section.drawers} ящиков`)
  if (section.rail) details.push('штанга')

  return {
    label,
    tone,
    isEmpty,
    details: details.length ? details.join(' · ') : 'пустая секция',
    short: formatSection(section),
  }
}

export default function SectionMap({ project, activeSection, onSectionSelect, onPresetApply }) {
  const activeMeta = getSectionMeta(activeSection)

  return (
    <div className="rp-ref-section-map rp-ref-section-map--polished rp-ref-section-map--smart rp-target-section-map">
      <div className="rp-ref-section-map__head">
        <div>
          <h3>Карта секций</h3>
          <p>Секция {project.activeSection}: {activeMeta.label} · {activeMeta.short}</p>
        </div>
        <button type="button" onClick={() => onPresetApply('clothes')}>Сценарий одежды</button>
      </div>

      <div className="rp-ref-section-map__grid" style={{ gridTemplateColumns: `repeat(${project.sections}, 1fr)` }}>
        {project.filling.map((section, index) => {
          const sectionNumber = index + 1
          const meta = getSectionMeta(section)
          const active = project.activeSection === sectionNumber

          return (
            <article className={`rp-ref-section-map__item rp-ref-section-map__item--smart is-${meta.tone} ${active ? 'is-active' : ''}`} key={sectionNumber} aria-label={`Секция ${sectionNumber}: ${meta.details}`}>
              <button className="rp-ref-section-map__select" type="button" onClick={() => onSectionSelect(sectionNumber)} aria-pressed={active}>
                <span>{sectionNumber}</span>
                <strong>{meta.label}</strong>
                <b>{meta.details}</b>
                <em>{active ? 'Редактируется' : 'Выбрать'}</em>
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}