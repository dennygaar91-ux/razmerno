import WardrobeMockup from '../WardrobeMockup'

export default function ViewerScene({ sceneProps, renderCanvas }) {
  const { dimensions } = sceneProps

  return (
    <div className="rp-ref-scene" data-viewer-scene="wardrobe">
      <span className="rp-ctor-size rp-ctor-size--h">{dimensions.height} мм</span>
      {renderCanvas ? renderCanvas(sceneProps) : <WardrobeMockup project={sceneProps} />}
      <span className="rp-ctor-size rp-ctor-size--w">{dimensions.width} мм</span>
      <span className="rp-ctor-size rp-ctor-size--d">{dimensions.depth} мм</span>
    </div>
  )
}
