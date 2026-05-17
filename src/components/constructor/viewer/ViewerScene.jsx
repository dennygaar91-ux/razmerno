import CanvasSlot from './CanvasSlot'

export default function ViewerScene({ sceneProps, renderCanvas, onZoneSelect }) {
  const { dimensions, activeSection, meta } = sceneProps

  return (
    <div className="rp-ref-scene rp-ref-scene--polished" data-viewer-scene="wardrobe" data-renderer={renderCanvas ? 'three' : 'css'}>
      <div className="rp-ref-scene__badge">
        <span>{renderCanvas ? 'Three.js preview' : '3D preview'}</span>
        <b>Секция {activeSection}</b>
      </div>

      <div className="rp-ref-scene__meta">
        <span>{meta?.sectionWidth} мм / секц.</span>
        <span>{meta?.materialTone}</span>
        <span>{meta?.fillingElements} элем.</span>
      </div>

      <span className="rp-ctor-size rp-ctor-size--h"><em>Высота</em>{dimensions.height} мм</span>
      <CanvasSlot sceneProps={sceneProps} renderCanvas={renderCanvas} onZoneSelect={onZoneSelect} />
      <span className="rp-ctor-size rp-ctor-size--w"><em>Ширина</em>{dimensions.width} мм</span>
      <span className="rp-ctor-size rp-ctor-size--d"><em>Глубина</em>{dimensions.depth} мм</span>

      <div className="rp-ref-scene__hint">Нажмите на область шкафа, чтобы выбрать зону</div>
    </div>
  )
}