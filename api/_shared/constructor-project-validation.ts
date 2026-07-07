import {
  isValidProjectSnapshot,
  MAX_ACTIVE_PROJECTS_PER_USER,
  type ConstructorProjectCreateInput,
  type ConstructorProjectPatchInput,
} from './constructor-project-types'

export type ProjectValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string }

const TITLE_MAX_LENGTH = 120
const FURNITURE_TYPE_MAX_LENGTH = 64
const PREVIEW_PATH_MAX_LENGTH = 512

function normalizeTitle(value: unknown, fallback = 'Проект'): ProjectValidationResult<string> {
  if (value === undefined) return { ok: true, value: fallback }
  if (typeof value !== 'string') return { ok: false, message: 'title must be a string.' }
  const title = value.trim()
  if (!title) return { ok: false, message: 'title cannot be empty.' }
  if (title.length > TITLE_MAX_LENGTH) return { ok: false, message: 'title is too long.' }
  return { ok: true, value: title }
}

function normalizeFurnitureType(value: unknown): ProjectValidationResult<string> {
  if (typeof value !== 'string') return { ok: false, message: 'furniture_type must be a string.' }
  const furnitureType = value.trim()
  if (!furnitureType) return { ok: false, message: 'furniture_type cannot be empty.' }
  if (furnitureType.length > FURNITURE_TYPE_MAX_LENGTH) {
    return { ok: false, message: 'furniture_type is too long.' }
  }
  return { ok: true, value: furnitureType }
}

function normalizePreviewPath(value: unknown): ProjectValidationResult<string | null | undefined> {
  if (value === undefined) return { ok: true, value: undefined }
  if (value === null) return { ok: true, value: null }
  if (typeof value !== 'string') return { ok: false, message: 'preview_path must be a string or null.' }
  const previewPath = value.trim()
  if (!previewPath) return { ok: true, value: null }
  if (previewPath.length > PREVIEW_PATH_MAX_LENGTH) {
    return { ok: false, message: 'preview_path is too long.' }
  }
  return { ok: true, value: previewPath }
}

export function validateProjectCreateBody(body: unknown): ProjectValidationResult<ConstructorProjectCreateInput> {
  if (!body || typeof body !== 'object') {
    return { ok: false, message: 'Invalid request body.' }
  }

  const record = body as Record<string, unknown>
  const title = normalizeTitle(record.title)
  if (title.ok === false) return { ok: false, message: title.message }

  const furnitureType = normalizeFurnitureType(record.furniture_type)
  if (furnitureType.ok === false) return { ok: false, message: furnitureType.message }

  if (!isValidProjectSnapshot(record.snapshot)) {
    return { ok: false, message: 'snapshot must be a versioned constructor project payload.' }
  }

  const previewPath = normalizePreviewPath(record.preview_path)
  if (previewPath.ok === false) return { ok: false, message: previewPath.message }

  return {
    ok: true,
    value: {
      title: title.value,
      furniture_type: furnitureType.value,
      snapshot: record.snapshot,
      preview_path: previewPath.value,
    },
  }
}

export function validateProjectPatchBody(body: unknown): ProjectValidationResult<ConstructorProjectPatchInput> {
  if (!body || typeof body !== 'object') {
    return { ok: false, message: 'Invalid request body.' }
  }

  const record = body as Record<string, unknown>
  const patch: ConstructorProjectPatchInput = {}

  if ('title' in record) {
    const title = normalizeTitle(record.title, '')
    if (title.ok === false) return { ok: false, message: title.message }
    patch.title = title.value
  }

  if ('furniture_type' in record) {
    const furnitureType = normalizeFurnitureType(record.furniture_type)
    if (furnitureType.ok === false) return { ok: false, message: furnitureType.message }
    patch.furniture_type = furnitureType.value
  }

  if ('snapshot' in record) {
    if (!isValidProjectSnapshot(record.snapshot)) {
      return { ok: false, message: 'snapshot must be a versioned constructor project payload.' }
    }
    patch.snapshot = record.snapshot
  }

  if ('preview_path' in record) {
    const previewPath = normalizePreviewPath(record.preview_path)
    if (previewPath.ok === false) return { ok: false, message: previewPath.message }
    patch.preview_path = previewPath.value ?? null
  }

  if (
    !('title' in patch) &&
    !('furniture_type' in patch) &&
    !('snapshot' in patch) &&
    !('preview_path' in patch)
  ) {
    return { ok: false, message: 'No editable project fields provided.' }
  }

  return { ok: true, value: patch }
}

export function canCreateActiveProject(activeCount: number): boolean {
  return activeCount < MAX_ACTIVE_PROJECTS_PER_USER
}

export function isProjectOwnedByUser(projectUserId: string, requestUserId: string): boolean {
  return projectUserId === requestUserId
}
