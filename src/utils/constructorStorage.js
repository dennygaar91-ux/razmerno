const STORAGE_KEY = 'razmerno.constructor.project.v1'
const PROJECT_ID_KEY = 'razmerno.constructor.projectId.v1'
const PROJECT_META_KEY = 'razmerno.constructor.projectMeta.v1'

export function saveConstructorProject(project) {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
    window.localStorage.setItem(PROJECT_META_KEY, JSON.stringify({ updatedAt: new Date().toISOString() }))
    return true
  } catch (error) {
    console.warn('Failed to save constructor project:', error)
    return false
  }
}

export function loadConstructorProject() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    return JSON.parse(raw)
  } catch (error) {
    console.warn('Failed to load constructor project:', error)
    return null
  }
}

export function saveConstructorProjectId(projectId) {
  if (typeof window === 'undefined' || !projectId) return false

  try {
    window.localStorage.setItem(PROJECT_ID_KEY, projectId)
    return true
  } catch (error) {
    console.warn('Failed to save constructor project id:', error)
    return false
  }
}

export function loadConstructorProjectId() {
  if (typeof window === 'undefined') return ''

  try {
    return window.localStorage.getItem(PROJECT_ID_KEY) ?? ''
  } catch (error) {
    console.warn('Failed to load constructor project id:', error)
    return ''
  }
}

export function loadConstructorProjectMeta() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(PROJECT_META_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (error) {
    console.warn('Failed to load constructor project meta:', error)
    return null
  }
}

export function clearConstructorProject() {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.removeItem(STORAGE_KEY)
    window.localStorage.removeItem(PROJECT_ID_KEY)
    window.localStorage.removeItem(PROJECT_META_KEY)
    return true
  } catch (error) {
    console.warn('Failed to clear constructor project:', error)
    return false
  }
}