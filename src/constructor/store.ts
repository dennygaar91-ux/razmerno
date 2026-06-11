import { create } from 'zustand'
import { createDefaultProject, type ConstructorProject, type Section } from './schema'
import { normalizeProject, resizeSections } from './normalize'
import { getProductConfig } from './catalog'
import { loadProjectFromShareUrl, loadProjectLocally, saveProjectLocally, clearLocalProject } from './storage'

export type SyncState = 'idle' | 'pending' | 'saved' | 'error'

export interface ConstructorStore {
  project: ConstructorProject
  syncState: SyncState
  lastSyncedAt: string | null
  activeSectionId: number | null

  setProductType: (type: ConstructorProject['productType']) => void
  setDimension: (key: keyof ConstructorProject['dimensions'], value: number) => void
  setSectionsCount: (count: number) => void
  setSection: (sectionId: number, patch: Partial<Omit<Section, 'id'>>) => void
  applyToAllSections: (template: Omit<Section, 'id'>) => void
  setMaterial: <K extends keyof ConstructorProject['material']>(
    key: K,
    value: ConstructorProject['material'][K],
  ) => void
  applyDimensionPreset: (preset: { dimensions: ConstructorProject['dimensions']; sectionsCount: number }) => void
  setActiveSection: (id: number | null) => void
  replaceProject: (project: ConstructorProject) => void
  resetProject: () => void
}

const initial: ConstructorProject = loadProjectFromShareUrl() ?? loadProjectLocally() ?? createDefaultProject()

export const useConstructorStore = create<ConstructorStore>((set, get) => {
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  function scheduleAutosave() {
    if (saveTimer) clearTimeout(saveTimer)
    set({ syncState: 'pending' })
    saveTimer = setTimeout(() => {
      const meta = saveProjectLocally(get().project)
      set({
        syncState: meta ? 'saved' : 'error',
        lastSyncedAt: meta?.updatedAt ?? null,
      })
    }, 400)
  }

  function update(updater: (p: ConstructorProject) => ConstructorProject) {
    set(state => ({ project: normalizeProject(updater(state.project)) }))
    scheduleAutosave()
  }

  return {
    project: initial,
    syncState: 'idle',
    lastSyncedAt: null,
    activeSectionId: initial.sections[0]?.id ?? null,

    setProductType(type) {
      update(p => {
        if (p.productType === type) return p
        const config = getProductConfig(type)
        const sections = resizeSections(
          Array.from({ length: config.defaultSectionsCount }, (_, index) => ({
            id: index + 1,
            ...config.defaultSection,
          })),
          config.defaultSectionsCount,
        )
        return {
          ...p,
          productType: type,
          dimensions: { ...config.defaultDimensions },
          sections,
          material: {
            ...p.material,
            facadeMode: config.defaultFacadeMode,
          },
        }
      })
      set({ activeSectionId: get().project.sections[0]?.id ?? null })
    },

    setDimension(key, value) {
      update(p => ({ ...p, dimensions: { ...p.dimensions, [key]: value } }))
    },

    setSectionsCount(count) {
      update(p => ({ ...p, sections: resizeSections(p.sections, count) }))
      // если активная секция теперь вне диапазона — выбираем первую
      const { project, activeSectionId } = get()
      if (activeSectionId && !project.sections.some(s => s.id === activeSectionId)) {
        set({ activeSectionId: project.sections[0]?.id ?? null })
      }
    },

    setSection(sectionId, patch) {
      update(p => ({
        ...p,
        sections: p.sections.map(s => (s.id === sectionId ? { ...s, ...patch } : s)),
      }))
    },

    applyToAllSections(template) {
      update(p => ({
        ...p,
        sections: p.sections.map(s => ({ ...s, ...template })),
      }))
    },

    setMaterial(key, value) {
      update(p => ({ ...p, material: { ...p.material, [key]: value } }))
    },

    applyDimensionPreset(preset) {
      update(p => ({
        ...p,
        dimensions: { ...preset.dimensions },
        sections: resizeSections(p.sections, preset.sectionsCount),
      }))
    },

    setActiveSection(id) {
      set({ activeSectionId: id })
    },

    replaceProject(project) {
      const normalized = normalizeProject(project)
      set({
        project: normalized,
        syncState: 'saved',
        lastSyncedAt: normalized.meta?.updatedAt ?? new Date().toISOString(),
        activeSectionId: normalized.sections[0]?.id ?? null,
      })
      saveProjectLocally(normalized)
    },

    resetProject() {
      clearLocalProject()
      const fresh = createDefaultProject()
      set({
        project: fresh,
        syncState: 'idle',
        lastSyncedAt: null,
        activeSectionId: fresh.sections[0]?.id ?? null,
      })
    },
  }
})
