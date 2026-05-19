import { useState } from 'react'
import SectionMap from './viewer/SectionMap'
import ViewerScene from './viewer/ViewerScene'
import ViewerToolbar from './viewer/ViewerToolbar'
import { buildViewerSceneProps } from './viewer/viewerUtils'

const EMPTY_SECTION = { shelves: 0, drawers: 0, rail: false }

export default function ConstructorViewer({ project, onSectionSelect, onZoneSelect, renderCanvas }) {
  const [viewMode, setViewMode] = useState('3d')
  const activeSection = project.filling[project.activeSection - 1] ?? EMPTY_SECTION
  const sceneProps = buildViewerSceneProps(project)
  const sceneWithHandlers = { ...sceneProps, onSectionSelect, onZoneSelect }

  return (
    <section className="rp-ctor-card rp-ctor-viewer rp-ref-viewer" aria-label="Предпросмотр шкафа">
      <ViewerToolbar viewMode={viewMode} onViewModeChange={setViewMode} />
      <ViewerScene sceneProps={sceneWithHandlers} renderCanvas={renderCanvas} viewMode={viewMode} />
      <SectionMap project={project} activeSection={activeSection} onSectionSelect={onSectionSelect} />
    </section>
  )
}
