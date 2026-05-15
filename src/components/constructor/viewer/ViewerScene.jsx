import WardrobeMockup from '../WardrobeMockup'

export default function ViewerScene({ sceneProps, renderCanvas }) {
  const { dimensions, activeSection } = sceneProps

  return (
    <div className="rp-ref-scene rp-ref-scene--polished" data-viewer-scene="wardrobe">
      <div className="rp-ref-scene__badge">
        <span>3D preview</span>
        <b>Секция {activeSection}</b>
      </div>

      <span className="rp-ctor-size rp-ctor-size--h"><em>Высота</em>{dimensions.height} мм</span>
      {renderCanvas ? renderCanvas(sceneProps) : <WardrobeMockup project={sceneProps} />}
      <span className="rp-ctor-size rp-ctor-size--w"><em>Ширина</em>{dimensions.width} мм</span>
      <span className="rp-ctor-size rp-ctor-size--d"><em>Глубина</em>{dimensions.depth} мм</span>

      <div className="rp-ref-scene__hint">Выберите секцию на модели или в карте ниже</div>
    </div>
  )
}
