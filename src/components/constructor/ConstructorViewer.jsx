import Icon from '../../icons/Icon'
import WardrobeMockup from './WardrobeMockup'

const sectionMap = [
  ['1', '4П · 2Я'],
  ['2', 'Ш'],
  ['3', '3П'],
]

export default function ConstructorViewer() {
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
        <span className="rp-ctor-size rp-ctor-size--h">2400 мм</span>
        <WardrobeMockup />
        <span className="rp-ctor-size rp-ctor-size--w">1800 мм</span>
        <span className="rp-ctor-size rp-ctor-size--d">600 мм</span>
      </div>

      <div className="rp-ref-quick-actions">
        <button type="button"><Icon name="plus" size={16} />Полка</button>
        <button type="button"><Icon name="plus" size={16} />Ящик</button>
        <button type="button"><span className="rp-ref-rail-icon" />Штанга</button>
        <button type="button"><Icon name="x" size={15} />Очистить</button>
      </div>

      <div className="rp-ref-section-map">
        <h3>Карта секций</h3>
        <p>Наглядная схема наполнения по секциям</p>
        <div>
          {sectionMap.map(([num, label]) => (
            <button type="button" key={num}>
              <span>{num}</span>
              <b>{label}</b>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
