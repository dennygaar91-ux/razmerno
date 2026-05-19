const STORAGE_KEY = 'razmerno.constructor.project.v1'
const PROJECT_ID_KEY = 'razmerno.constructor.projectId.v1'
const PROJECT_META_KEY = 'razmerno.constructor.projectMeta.v1'
const LEGACY_KEYS = [
  'razhmerno.constructor.project.v1',
  'razhmerno.constructor.projectId.v1',
  'razhmerno.constructor.projectMeta.v1',
  'razhmerno_project',
  'razhmerno_project_id',
]

let memoryProject = null
let memoryProjectId = ''
let memoryMeta = null
let storageWarningShown = false

function warnStorageOnce(message, error) {
  if (storageWarningShown) return
  storageWarningShown = true
  console.warn(message, error)
}

function getLocalStorage() {
  if (typeof window === 'undefined') return null

  try {
    const storage = window.localStorage
    const testKey = 'razmerno.constructor.storage.test'
    storage.setItem(testKey, '1')
    storage.removeItem(testKey)
    return storage
  } catch (error) {
    warnStorageOnce('Constructor localStorage is unavailable:', error)
    return null
  }
}

function createMeta() {
  const now = new Date().toISOString()

  return {
    version: 1,
    updatedAt: now,
  }
}

export function saveConstructorProject(project) {
  const meta = createMeta()
  memoryProject = project
  memoryMeta = meta

  const storage = getLocalStorage()
  if (!storage) return { ok: true, meta, persistent: false }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(project))
    storage.setItem(PROJECT_META_KEY, JSON.stringify(meta))
    return { ok: true, meta, persistent: true }
  } catch (error) {
    warnStorageOnce('Failed to save constructor project:', error)
    return { ok: true, meta, persistent: false }
  }
}

export function loadConstructorProject() {
  const storage = getLocalStorage()
  if (!storage) return memoryProject

  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return memoryProject

    const parsed = JSON.parse(raw)
    memoryProject = parsed
    return parsed
  } catch (error) {
    warnStorageOnce('Failed to load constructor project:', error)
    return memoryProject
  }
}

export function saveConstructorProjectId(projectId) {
  if (!projectId) return false

  memoryProjectId = projectId
  const storage = getLocalStorage()
  if (!storage) return false

  try {
    storage.setItem(PROJECT_ID_KEY, projectId)
    return true
  } catch (error) {
    warnStorageOnce('Failed to save constructor project id:', error)
    return false
  }
}

export function loadConstructorProjectId() {
  const storage = getLocalStorage()
  if (!storage) return memoryProjectId

  try {
    const projectId = storage.getItem(PROJECT_ID_KEY) ?? memoryProjectId
    memoryProjectId = projectId
    return projectId
  } catch (error) {
    warnStorageOnce('Failed to load constructor project id:', error)
    return memoryProjectId
  }
}

export function loadConstructorProjectMeta() {
  const storage = getLocalStorage()
  if (!storage) return memoryMeta

  try {
    const raw = storage.getItem(PROJECT_META_KEY)
    if (!raw) return memoryMeta

    const parsed = JSON.parse(raw)
    memoryMeta = parsed
    return parsed
  } catch (error) {
    warnStorageOnce('Failed to load constructor project meta:', error)
    return memoryMeta
  }
}

export function clearConstructorProject() {
  memoryProject = null
  memoryProjectId = ''
  memoryMeta = null

  const storage = getLocalStorage()
  if (!storage) return true

  try {
    storage.removeItem(STORAGE_KEY)
    storage.removeItem(PROJECT_ID_KEY)
    storage.removeItem(PROJECT_META_KEY)
    LEGACY_KEYS.forEach(key => storage.removeItem(key))
    return true
  } catch (error) {
    warnStorageOnce('Failed to clear constructor project:', error)
    return false
  }
}

export function isConstructorStoragePersistent() {
  return Boolean(getLocalStorage())
}
