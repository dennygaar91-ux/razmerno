import { SCHEMA_VERSION, type ConstructorProject } from './schema'
import { normalizeProject } from './normalize'

const STORAGE_KEY = 'razmerno.project.v1'
const META_KEY    = 'razmerno.project-meta.v1'

interface StoredMeta {
  schemaVersion: number
  createdAt: string
  updatedAt: string
}

function safeStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage
  } catch {
    return null
  }
}

export function saveProjectLocally(project: ConstructorProject): StoredMeta | null {
  const storage = safeStorage()
  if (!storage) return null
  const now = new Date().toISOString()
  const meta: StoredMeta = {
    schemaVersion: SCHEMA_VERSION,
    updatedAt: now,
    createdAt: project.meta?.createdAt ?? now,
  }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...project, meta }))
    storage.setItem(META_KEY, JSON.stringify(meta))
    return meta
  } catch {
    return null
  }
}

export function loadProjectLocally(): ConstructorProject | null {
  const storage = safeStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return null
    return normalizeProject(JSON.parse(raw))
  } catch {
    return null
  }
}

export function loadProjectMeta(): StoredMeta | null {
  const storage = safeStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(META_KEY)
    return raw ? (JSON.parse(raw) as StoredMeta) : null
  } catch {
    return null
  }
}

export function clearLocalProject(): void {
  const storage = safeStorage()
  if (!storage) return
  try {
    storage.removeItem(STORAGE_KEY)
    storage.removeItem(META_KEY)
  } catch {
    /* noop */
  }
}


function encodeUnicodeBase64(value: string): string {
  if (typeof window === 'undefined') return ''
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return window.btoa(binary)
}

function decodeUnicodeBase64(value: string): string {
  if (typeof window === 'undefined') return ''
  const binary = window.atob(value)
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function createProjectIdUrl(projectId: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    const url = new URL(window.location.href)
    url.searchParams.delete('project')
    url.searchParams.set('projectId', projectId)
    return url.toString()
  } catch {
    return null
  }
}

export function createProjectShareUrl(project: ConstructorProject): string | null {
  if (typeof window === 'undefined') return null
  try {
    const url = new URL(window.location.href)
    url.searchParams.set('project', encodeUnicodeBase64(JSON.stringify(project)))
    return url.toString()
  } catch {
    return null
  }
}

export function loadProjectFromShareUrl(): ConstructorProject | null {
  if (typeof window === 'undefined') return null
  try {
    const url = new URL(window.location.href)
    const raw = url.searchParams.get('project')
    if (!raw) return null
    return normalizeProject(JSON.parse(decodeUnicodeBase64(raw)))
  } catch {
    return null
  }
}

export function getProjectIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const url = new URL(window.location.href)
    const projectId = url.searchParams.get('projectId')
    return projectId?.trim() || null
  } catch {
    return null
  }
}

export function clearProjectUrlParams(): void {
  if (typeof window === 'undefined') return
  try {
    const url = new URL(window.location.href)
    url.searchParams.delete('project')
    url.searchParams.delete('projectId')
    url.searchParams.delete('localProjectId')
    window.history.replaceState({}, '', url.toString())
  } catch {
    // noop
  }
}

const SAVED_PROJECTS_KEY = 'razmerno.saved-projects.v1'
const LOCAL_PROJECT_ID_PARAM = 'localProjectId'

export interface SavedProjectRecord {
  id: string
  title: string
  project: ConstructorProject
  createdAt: string
  updatedAt: string
}

function createLocalProjectId(): string {
  const cryptoRef = typeof window !== 'undefined' ? window.crypto : undefined
  if (cryptoRef?.randomUUID) return `local-${cryptoRef.randomUUID()}`
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function readSavedProjects(storage: Storage): SavedProjectRecord[] {
  const raw = storage.getItem(SAVED_PROJECTS_KEY)
  if (!raw) return []
  const parsed = JSON.parse(raw) as SavedProjectRecord[]
  if (!Array.isArray(parsed)) return []
  return parsed
    .filter(item => item && typeof item.id === 'string' && item.project)
    .map(item => ({
      ...item,
      project: normalizeProject(item.project),
    }))
}

export function loadSavedProjects(): SavedProjectRecord[] {
  const storage = safeStorage()
  if (!storage) return []
  try {
    return readSavedProjects(storage).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  } catch {
    return []
  }
}

export function loadSavedProjectById(id: string): SavedProjectRecord | null {
  const storage = safeStorage()
  if (!storage) return null
  try {
    return readSavedProjects(storage).find(item => item.id === id) ?? null
  } catch {
    return null
  }
}

export function saveProjectToLibrary(project: ConstructorProject, title: string): SavedProjectRecord | null {
  const storage = safeStorage()
  if (!storage) return null
  const now = new Date().toISOString()
  const existingId = project.meta?.projectId?.startsWith('local-') ? project.meta.projectId : undefined
  const id = existingId ?? createLocalProjectId()
  const normalizedProject = normalizeProject({
    ...project,
    meta: {
      ...project.meta,
      projectId: id,
      createdAt: project.meta?.createdAt ?? now,
      updatedAt: now,
    },
  })
  const nextRecord: SavedProjectRecord = {
    id,
    title: title.trim() || 'Проект без названия',
    project: normalizedProject,
    createdAt: normalizedProject.meta?.createdAt ?? now,
    updatedAt: now,
  }

  try {
    const records = readSavedProjects(storage)
    const nextRecords = [nextRecord, ...records.filter(item => item.id !== id)].slice(0, 25)
    storage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(nextRecords))
    return nextRecord
  } catch {
    return null
  }
}

export function removeSavedProject(id: string): boolean {
  const storage = safeStorage()
  if (!storage) return false
  try {
    const records = readSavedProjects(storage).filter(item => item.id !== id)
    storage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(records))
    return true
  } catch {
    return false
  }
}

export function createLocalProjectUrl(id: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    const url = new URL(window.location.origin + '/constructor')
    url.searchParams.set(LOCAL_PROJECT_ID_PARAM, id)
    return url.toString()
  } catch {
    return null
  }
}

export function getLocalProjectIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const url = new URL(window.location.href)
    const projectId = url.searchParams.get(LOCAL_PROJECT_ID_PARAM)
    return projectId?.trim() || null
  } catch {
    return null
  }
}
