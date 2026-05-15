import Icon from '../../../icons/Icon'

export default function ViewerToolbar() {
  return (
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
  )
}
