import { formatSection, getSectionLabel } from './viewerUtils'

const scenarioActions = [
  ['clothes', 'Одежда'],
  ['shelves', 'Полки'],
  ['drawers', 'Ящики'],
]

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

export default function SectionMap({ project, activeSection, onSectionSelect, onPresetApply, onPresetApplyToSection }) {
  const activeMeta = getSectionMeta(activeSection)

  function handleScenarioClick(sectionNumber, presetId) {
    if (onPresetApplyToSection) {
      onPresetApplyToSection(sectionNumber, presetId)
      return
    }

    onSectionSelect(sectionNumber)
    onPresetApply(presetId)
  }

  return (
    <div className="rp-ref-section-map rp-ref-section-map--polished rp-ref-section-map--smart">
      <div className="rp-ref-section-map__head">
        <div>
          <h3>Карта секций</h3>
          <p>Активна секция {project.activeSection}: {activeMeta.label} · {activeMeta.short}</p>
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
              <div className="rp-ref-section-map__actions" aria-label={`Быстрые сценарии для секции ${sectionNumber}`}>
                {scenarioActions.map(([presetId, label]) => (
                  <button type="button" key={presetId} onClick={() => handleScenarioClick(sectionNumber, presetId)}>{label}</button>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
