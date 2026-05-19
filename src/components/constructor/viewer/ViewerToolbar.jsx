import Icon from '../../../icons/Icon'

export default function ViewerToolbar({ viewMode = '3d', onViewModeChange }) {
  return (
    <div className="rp-ref-viewer-toolbar">
      <div className="rp-ref-view-mode" role="group" aria-label="Режим предпросмотра шкафа">
        <span>Вид</span>
        <button
          className={viewMode === '3d' ? 'is-active' : ''}
          type="button"
          aria-pressed={viewMode === '3d'}
          onClick={() => onViewModeChange?.('3d')}
        >
          3D
        </button>
        <button
          className={viewMode === '2d' ? 'is-active' : ''}
          type="button"
          aria-pressed={viewMode === '2d'}
          onClick={() => onViewModeChange?.('2d')}
        >
          2D
        </button>
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
