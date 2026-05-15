import SectionMap from './viewer/SectionMap'
import ViewerQuickActions from './viewer/ViewerQuickActions'
import ViewerScene from './viewer/ViewerScene'
import ViewerToolbar from './viewer/ViewerToolbar'
import { buildViewerSceneProps } from './viewer/viewerUtils'

export default function ConstructorViewer({ project, onSectionSelect, onSectionPartChange, onRailToggle, onClearSection, onPresetApply, renderCanvas }) {
  const activeSection = project.filling[project.activeSection - 1]
  const railDisabled = project.dimensions.depth < 520
  const sceneProps = buildViewerSceneProps(project)

  return (
    <section className="rp-ctor-card rp-ctor-viewer rp-ref-viewer" aria-label="Предпросмотр шкафа">
      <ViewerToolbar />
      <ViewerScene sceneProps={sceneProps} renderCanvas={renderCanvas} />
      <ViewerQuickActions activeSection={activeSection} railDisabled={railDisabled} onSectionPartChange={onSectionPartChange} onRailToggle={onRailToggle} onClearSection={onClearSection} />
      <SectionMap project={project} activeSection={activeSection} onSectionSelect={onSectionSelect} onPresetApply={onPresetApply} />
    </section>
  )
}
