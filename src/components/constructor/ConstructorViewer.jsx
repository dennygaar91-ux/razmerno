import Icon from '../../icons/Icon'
import WardrobeMockup from './WardrobeMockup'

export default function ConstructorViewer() {
  return (
    <section className="rp-ctor-card rp-ctor-viewer" aria-label="Предпросмотр шкафа">
      <div className="rp-ctor-views">
        <button type="button"><Icon name="home" size={23} /><span>Вид<br />спереди</span></button>
        <button type="button"><Icon name="cube" size={23} /><span>Вид<br />сбоку</span></button>
        <button type="button"><Icon name="layers" size={23} /><span>Вид<br />сверху</span></button>
      </div>

      <div className="rp-ctor-history">
        <button type="button">←</button>
        <button type="button" disabled>→</button>
      </div>

      <div className="rp-ctor-scene">
        <span className="rp-ctor-size rp-ctor-size--h">2400 мм</span>
        <WardrobeMockup />
        <span className="rp-ctor-size rp-ctor-size--w">1800 мм</span>
      </div>

      <div className="rp-ctor-view-controls">
        <div className="rp-ctor-mode">
          <button className="is-active" type="button">3D</button>
          <button type="button">2D</button>
        </div>
        <div className="rp-ctor-zoom">
          <button type="button">−</button>
          <button type="button">⌖</button>
          <button type="button">+</button>
        </div>
      </div>
    </section>
  )
}
