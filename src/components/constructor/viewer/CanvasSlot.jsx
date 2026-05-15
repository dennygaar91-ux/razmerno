import WardrobeMockup from '../WardrobeMockup'

export default function CanvasSlot({ sceneProps, renderCanvas }) {
  const canvasReady = typeof renderCanvas === 'function'

  return (
    <div className={`rp-canvas-slot ${canvasReady ? 'is-canvas' : 'is-fallback'}`} data-renderer={canvasReady ? 'three' : 'css'}>
      <div className="rp-canvas-slot__stage">
        {canvasReady ? renderCanvas(sceneProps) : <WardrobeMockup project={sceneProps} />}
      </div>
      {!canvasReady && (
        <div className="rp-canvas-slot__fallback-note">
          <span>CSS fallback</span>
          <b>Готово к замене на Three.js Canvas</b>
        </div>
      )}
    </div>
  )
}
