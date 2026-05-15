import Icon from '../../icons/Icon'
import WardrobeMockup from './WardrobeMockup'

function formatSection(section) {
  const parts = []
  if (section.shelves) parts.push(`${section.shelves}П`)
  if (section.drawers) parts.push(`${section.drawers}Я`)
  if (section.rail) parts.push('Ш')
  return parts.length ? parts.join(' · ') : 'Пусто'
}

export default function ConstructorViewer({ project, onSectionSelect, onSectionPartChange, onRailToggle }) {
  const activeSection = project.filling[project.activeSection - 1]

  return (
    <section className="rp-ctor-card rp-ctor-viewer rp-ref-viewer" aria-label="Предпросмотр шкафа">
      <div className="rp-ref-viewer-toolbar">
        <div className="rp-ref-view-mode">
          <span>Вид</span>
          <button className="is-active" type="button">3D</button>
          <button type="button">2D</button>
        </div>

        <div className="rp-ref-scale">
          <span>Масштаб</span>
          <button type="button">−</button>
          <b>100%</b>
          <button type="button">+</button>
          <button type="button" aria-label="Развернуть"><Icon name="expand" size={15} /></button>
        </div>
      </div>

      <div className="rp-ref-scene">
        <span className="rp-ctor-size rp-ctor-size--h">{project.dimensions.height} мм</span>
        <WardrobeMockup project={project} />
        <span className="rp-ctor-size rp-ctor-size--w">{project.dimensions.width} мм</span>
        <span className="rp-ctor-size rp-ctor-size--d">{project.dimensions.depth} мм</span>
      </div>

      <div className="rp-ref-quick-actions">
        <button type="button" onClick={() => onSectionPartChange('shelves', 1)}><Icon name="plus" size={16} />Полка</button>
        <button type="button" onClick={() => onSectionPartChange('drawers', 1)}><Icon name="plus" size={16} />Ящик</button>
        <button className={activeSection.rail ? 'is-active' : ''} type="button" onClick={onRailToggle}><span className="rp-ref-rail-icon" />Штанга</button>
        <button type="button" onClick={() => {}}><Icon name="x" size={15} />Очистить</button>
      </div>

      <div className="rp-ref-section-map">
        <h3>Карта секций</h3>
        <p>Наглядная схема наполнения по секциям</p>
        <div style={{ gridTemplateColumns: `repeat(${project.sections}, 1fr)` }}>
          {project.filling.map((section, index) => (
            <button className={project.activeSection === index + 1 ? 'is-active' : ''} type="button" key={index} onClick={() => onSectionSelect(index + 1)}>
              <span>{index + 1}</span>
              <b>{formatSection(section)}</b>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
