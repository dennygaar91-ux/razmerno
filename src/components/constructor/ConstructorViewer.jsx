import ViewerScene from './viewer/ViewerScene'
import ViewerToolbar from './viewer/ViewerToolbar'
import { buildViewerSceneProps } from './viewer/viewerUtils'

export default function ConstructorViewer({ project, renderCanvas }) {
  const sceneProps = buildViewerSceneProps(project)

  return (
    <section className="rp-ctor-card rp-ctor-viewer rp-ref-viewer rp-ref-viewer--expanded" aria-label="Предпросмотр шкафа">
      <ViewerToolbar />
      <ViewerScene sceneProps={sceneProps} renderCanvas={renderCanvas} />
    </section>
  )
}