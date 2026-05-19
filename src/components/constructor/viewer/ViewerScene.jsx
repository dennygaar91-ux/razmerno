import CanvasSlot from './CanvasSlot'

export default function ViewerScene({ sceneProps, renderCanvas, onZoneSelect, viewMode = '3d' }) {
  const { dimensions, activeSection, meta } = sceneProps
  const is2d = viewMode === '2d'

  return (
    <div
      className={`rp-ref-scene rp-ref-scene--polished ${is2d ? 'is-technical-2d' : 'is-presentation-3d'}`}
      data-viewer-scene="wardrobe"
      data-renderer={renderCanvas ? 'three' : 'css'}
      data-view-mode={viewMode}
      data-active-section={activeSection}
    >
      <div className="rp-ref-scene__badge">
        <span>{is2d ? '2D схема' : renderCanvas ? 'Three.js preview' : '3D preview'}</span>
        <b>{is2d ? 'Технический вид' : `Секция ${activeSection}`}</b>
      </div>

      <div className="rp-ref-scene__meta">
        <span>{meta?.sectionWidth} мм / секц.</span>
        <span>{meta?.materialTone}</span>
        <span>{meta?.fillingElements} элем.</span>
      </div>

      {is2d && (
        <div className="rp-ref-technical-grid" aria-hidden="true">
          <span className="rp-ref-technical-grid__v" />
          <span className="rp-ref-technical-grid__h" />
          <span className="rp-ref-technical-grid__label rp-ref-technical-grid__label--top">Фронтальная схема</span>
          <span className="rp-ref-technical-grid__label rp-ref-technical-grid__label--bottom">Размеры и секции</span>
        </div>
      )}

      <span className="rp-ctor-size rp-ctor-size--h"><em>Высота</em>{dimensions.height} мм</span>
      <CanvasSlot sceneProps={sceneProps} renderCanvas={renderCanvas && !is2d} onZoneSelect={onZoneSelect} />
      <span className="rp-ctor-size rp-ctor-size--w"><em>Ширина</em>{dimensions.width} мм</span>
      <span className="rp-ctor-size rp-ctor-size--d"><em>{is2d ? 'Глубина' : 'Глубина'}</em>{dimensions.depth} мм</span>

      <div className="rp-ref-scene__hint">{is2d ? '2D-режим помогает проверить секции и размеры' : 'Нажмите на секцию шкафа, чтобы выбрать её'}</div>
    </div>
  )
}
