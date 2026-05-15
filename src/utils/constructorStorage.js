const STORAGE_KEY = 'razmerno.constructor.project.v1'

export function saveConstructorProject(project) {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
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

export function clearConstructorProject() {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.warn('Failed to clear constructor project:', error)
    return false
  }
}
