import { useMemo } from 'react'
import WardrobeMockup from '../WardrobeMockup'

function FallbackNote({ error }) {
  return (
    <div className={`rp-canvas-slot__fallback-note ${error ? 'has-error' : ''}`}>
      <span>{error ? '3D недоступен' : 'CSS fallback'}</span>
      <b>{error ? 'Показываем безопасный предпросмотр шкафа' : 'Готово к замене на Three.js Canvas'}</b>
    </div>
  )
}

export default function CanvasSlot({ sceneProps, renderCanvas, onZoneSelect }) {
  const canvasReady = typeof renderCanvas === 'function'

  const canvasContent = useMemo(() => {
    if (!canvasReady) return null

    try {
      return renderCanvas(sceneProps)
    } catch (error) {
      console.warn('Constructor Canvas render failed:', error)
      return null
    }
  }, [canvasReady, renderCanvas, sceneProps])

  const shouldRenderFallback = !canvasReady || !canvasContent

  return (
    <div className={`rp-canvas-slot ${shouldRenderFallback ? 'is-fallback' : 'is-canvas'}`} data-renderer={shouldRenderFallback ? 'css' : 'three'}>
      <div className="rp-canvas-slot__stage">
        {shouldRenderFallback ? <WardrobeMockup project={sceneProps} onZoneSelect={onZoneSelect} /> : canvasContent}
      </div>
      {shouldRenderFallback && <FallbackNote error={canvasReady && !canvasContent} />}
    </div>
  )
}