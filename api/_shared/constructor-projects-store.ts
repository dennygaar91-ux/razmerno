import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { normalizeSupabaseProjectUrl } from './supabase-url'
import {
  mapConstructorProjectRow,
  type ConstructorProject,
  type ConstructorProjectCreateInput,
  type ConstructorProjectPatchInput,
} from './constructor-project-types'

type ProjectRow = {
  id: string
  user_id: string
  title: string
  snapshot: unknown
  furniture_type: string
  preview_path: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

let cachedClient: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient | null {
  const url = normalizeSupabaseProjectUrl(process.env.SUPABASE_URL)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return null

  if (!cachedClient) {
    cachedClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return cachedClient
}

function mapRows(rows: ProjectRow[] | null): ConstructorProject[] {
  if (!rows) return []
  return rows
    .map((row) => mapConstructorProjectRow(row))
    .filter((project): project is ConstructorProject => project !== null)
}

export async function countActiveProjectsForUser(userId: string): Promise<number> {
  const client = getSupabaseClient()
  if (!client) return 0

  const { count, error } = await client
    .from('constructor_projects')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('archived_at', null)

  if (error) return 0
  return count ?? 0
}

export async function listConstructorProjectsForUser(
  userId: string,
  options?: { includeArchived?: boolean },
): Promise<{ ok: true; projects: ConstructorProject[] } | { ok: false; error: string }> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'project_storage_unavailable' }

  let query = client
    .from('constructor_projects')
    .select('id, user_id, title, snapshot, furniture_type, preview_path, archived_at, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (!options?.includeArchived) {
    query = query.is('archived_at', null)
  }

  const { data, error } = await query.returns<ProjectRow[]>()
  if (error) return { ok: false, error: error.message }

  return { ok: true, projects: mapRows(data) }
}

export type ProjectStoreFailure =
  | { ok: false; notFound: true }
  | { ok: false; error: string }

export async function getConstructorProjectById(
  projectId: string,
): Promise<{ ok: true; project: ConstructorProject } | ProjectStoreFailure> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'project_storage_unavailable' }

  const { data, error } = await client
    .from('constructor_projects')
    .select('id, user_id, title, snapshot, furniture_type, preview_path, archived_at, created_at, updated_at')
    .eq('id', projectId)
    .maybeSingle<ProjectRow>()

  if (error) return { ok: false, error: error.message }
  if (!data) return { ok: false, notFound: true }

  const project = mapConstructorProjectRow(data)
  if (!project) return { ok: false, error: 'project_snapshot_invalid' }

  return { ok: true, project }
}

export async function createConstructorProject(
  userId: string,
  input: ConstructorProjectCreateInput,
): Promise<{ ok: true; project: ConstructorProject } | { ok: false; error: string }> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'project_storage_unavailable' }

  const now = new Date().toISOString()
  const insertRow = {
    user_id: userId,
    title: input.title?.trim() || 'Проект',
    snapshot: input.snapshot,
    furniture_type: input.furniture_type,
    preview_path: input.preview_path ?? null,
    archived_at: null,
    created_at: now,
    updated_at: now,
  }

  const { data, error } = await client
    .from('constructor_projects')
    .insert(insertRow)
    .select('id, user_id, title, snapshot, furniture_type, preview_path, archived_at, created_at, updated_at')
    .single<ProjectRow>()

  if (error || !data) return { ok: false, error: error?.message || 'project_insert_failed' }

  const project = mapConstructorProjectRow(data)
  if (!project) return { ok: false, error: 'project_snapshot_invalid' }

  return { ok: true, project }
}

export async function updateConstructorProject(
  projectId: string,
  userId: string,
  patch: ConstructorProjectPatchInput,
): Promise<{ ok: true; project: ConstructorProject } | ProjectStoreFailure> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'project_storage_unavailable' }

  const updateRow: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if ('title' in patch) updateRow.title = patch.title
  if ('snapshot' in patch) updateRow.snapshot = patch.snapshot
  if ('furniture_type' in patch) updateRow.furniture_type = patch.furniture_type
  if ('preview_path' in patch) updateRow.preview_path = patch.preview_path ?? null

  const { data, error } = await client
    .from('constructor_projects')
    .update(updateRow)
    .eq('id', projectId)
    .eq('user_id', userId)
    .select('id, user_id, title, snapshot, furniture_type, preview_path, archived_at, created_at, updated_at')
    .maybeSingle<ProjectRow>()

  if (error) return { ok: false, error: error.message }
  if (!data) return { ok: false, notFound: true }

  const project = mapConstructorProjectRow(data)
  if (!project) return { ok: false, error: 'project_snapshot_invalid' }

  return { ok: true, project }
}

export async function archiveConstructorProject(
  projectId: string,
  userId: string,
): Promise<{ ok: true; project: ConstructorProject } | ProjectStoreFailure> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'project_storage_unavailable' }

  const now = new Date().toISOString()
  const { data, error } = await client
    .from('constructor_projects')
    .update({ archived_at: now, updated_at: now })
    .eq('id', projectId)
    .eq('user_id', userId)
    .select('id, user_id, title, snapshot, furniture_type, preview_path, archived_at, created_at, updated_at')
    .maybeSingle<ProjectRow>()

  if (error) return { ok: false, error: error.message }
  if (!data) return { ok: false, notFound: true }

  const project = mapConstructorProjectRow(data)
  if (!project) return { ok: false, error: 'project_snapshot_invalid' }

  return { ok: true, project }
}
