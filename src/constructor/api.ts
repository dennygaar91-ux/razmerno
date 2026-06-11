import type { OrderPayload } from './payload'
import type { ConstructorProject } from './schema'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true' || !API_BASE

export function isMockMode(): boolean {
  return USE_MOCK
}

export class ApiError extends Error {
  status: number
  data: unknown
  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function request<T>(path: string, init: Omit<RequestInit, 'body'> & { body?: unknown } = {}): Promise<T> {
  const { body, headers, ...rest } = init
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await response.text()
  const data = text ? safeJson(text) : null

  if (!response.ok) {
    throw new ApiError(
      ((data as { message?: string })?.message) ?? `HTTP ${response.status}`,
      response.status,
      data,
    )
  }
  return data as T
}

function safeJson(text: string): unknown {
  try { return JSON.parse(text) } catch { return null }
}


const MOCK_PROJECTS_KEY = 'razmerno.mock-projects.v1'

function readMockProjects(): Record<string, ConstructorProject> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(MOCK_PROJECTS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeMockProject(projectId: string, project: ConstructorProject): void {
  if (typeof window === 'undefined') return
  try {
    const projects = readMockProjects()
    projects[projectId] = project
    window.localStorage.setItem(MOCK_PROJECTS_KEY, JSON.stringify(projects))
  } catch {
    // local mock persistence is best-effort only
  }
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(t)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

export interface OrderResponse {
  orderId: string
  receivedAt: string
  duplicate?: boolean
}

export async function submitOrder(payload: OrderPayload, opts: { signal?: AbortSignal } = {}): Promise<OrderResponse> {
  if (USE_MOCK) {
    await delay(900, opts.signal)
    return {
      orderId: `RZM-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      receivedAt: new Date().toISOString(),
    }
  }
  return request<OrderResponse>('/api/constructor/orders', {
    method: 'POST',
    body: payload,
    headers: { 'Idempotency-Key': payload.idempotencyKey },
    signal: opts.signal,
  })
}

export async function saveProjectRemote(project: ConstructorProject, opts: { signal?: AbortSignal } = {}): Promise<{ projectId: string; createdAt?: string }> {
  if (USE_MOCK) {
    await delay(400, opts.signal)
    const projectId = `PRJ-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
    writeMockProject(projectId, project)
    return { projectId, createdAt: new Date().toISOString() }
  }
  return request<{ projectId: string; createdAt?: string }>('/api/constructor/projects', {
    method: 'POST',
    body: { project },
    signal: opts.signal,
  })
}

export async function getProjectRemote(projectId: string, opts: { signal?: AbortSignal } = {}): Promise<{ projectId: string; project: ConstructorProject }> {
  if (USE_MOCK) {
    await delay(250, opts.signal)
    const project = readMockProjects()[projectId]
    if (!project) throw new ApiError('Project not found', 404, { code: 'NOT_FOUND' })
    return { projectId, project }
  }
  return request<{ projectId: string; project: ConstructorProject }>(`/api/constructor/projects/${encodeURIComponent(projectId)}`, {
    method: 'GET',
    signal: opts.signal,
  })
}
