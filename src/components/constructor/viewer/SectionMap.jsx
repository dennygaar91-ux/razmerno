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
  const sectionWidth = Math.round(project.dimensions.width / project.sections)

  return (
    <div className="rp-ref-section-map rp-ref-section-map--polished rp-ref-section-map--smart rp-ref-section-map--compact rp-target-section-map">
      <div className="rp-ref-section-map__head rp-ref-section-map__head--compact">
        <div>
          <span>Навигация по шкафу</span>
          <h3>Секции</h3>
          <p>Секция {project.activeSection}: {activeMeta.label} · {activeMeta.short}</p>
        </div>
        <button type="button" onClick={() => onPresetApply?.('clothes')}>Одежда</button>
      </div>

      <div className="rp-ref-section-map__rail" style={{ gridTemplateColumns: `repeat(${project.sections}, minmax(0, 1fr))` }} aria-label="Карта секций шкафа">
        {project.filling.map((section, index) => {
          const sectionNumber = index + 1
          const meta = getSectionMeta(section)
          const active = project.activeSection === sectionNumber

          return (
            <button
              className={`rp-ref-section-map__segment is-${meta.tone} ${active ? 'is-active' : ''}`}
              type="button"
              key={sectionNumber}
              onClick={() => onSectionSelect(sectionNumber)}
              aria-pressed={active}
              aria-label={`Секция ${sectionNumber}: ${meta.details}`}
            >
              <span>{sectionNumber}</span>
              <strong>{meta.label}</strong>
              <small>{sectionWidth} мм</small>
              <i aria-hidden="true" />
            </button>
          )
        })}
      </div>

      <div className="rp-ref-section-map__legend">
        <span>Активная секция редактируется слева</span>
        <b>{project.sections} секц. · примерно {sectionWidth} мм каждая</b>
      </div>
    </div>
  )
}