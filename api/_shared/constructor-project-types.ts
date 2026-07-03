export const MAX_ACTIVE_PROJECTS_PER_USER = 3

export type ConstructorProjectSnapshot = {
  version: 1
  draft: Record<string, unknown>
}

export type ConstructorProject = {
  id: string
  user_id: string
  title: string
  snapshot: ConstructorProjectSnapshot
  furniture_type: string
  preview_path: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

export type ConstructorProjectCreateInput = {
  title?: string
  snapshot: ConstructorProjectSnapshot
  furniture_type: string
  preview_path?: string | null
}

export type ConstructorProjectPatchInput = {
  title?: string
  snapshot?: ConstructorProjectSnapshot
  furniture_type?: string
  preview_path?: string | null
}

export function isActiveProject(project: Pick<ConstructorProject, 'archived_at'>): boolean {
  return project.archived_at === null
}

export function mapConstructorProjectRow(row: {
  id: string
  user_id: string
  title: string
  snapshot: unknown
  furniture_type: string
  preview_path: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}): ConstructorProject | null {
  if (!isValidProjectSnapshot(row.snapshot)) return null

  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    snapshot: row.snapshot,
    furniture_type: row.furniture_type,
    preview_path: row.preview_path,
    archived_at: row.archived_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function isValidProjectSnapshot(value: unknown): value is ConstructorProjectSnapshot {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return record.version === 1 && !!record.draft && typeof record.draft === 'object'
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidProjectId(value: string): boolean {
  return UUID_PATTERN.test(value.trim())
}
