import { apiGet, apiPost, shouldUseMockApi } from './constructorApiClient'
import { loadConstructorProject, saveConstructorProject } from '../utils/constructorStorage'

async function createMockProject(project) {
  await new Promise(resolve => setTimeout(resolve, 220))
  saveConstructorProject(project)

  return {
    ok: true,
    projectId: `LOCAL-${Date.now().toString().slice(-6)}`,
    updatedAt: new Date().toISOString(),
    project,
  }
}

async function loadMockProject(projectId) {
  await new Promise(resolve => setTimeout(resolve, 180))
  const project = loadConstructorProject()

  if (!project) {
    return {
      ok: false,
      code: 'PROJECT_NOT_FOUND',
      message: 'Сохранённый проект не найден',
    }
  }

  return {
    ok: true,
    projectId,
    project,
  }
}

export async function saveConstructorProjectRemote(project) {
  if (shouldUseMockApi()) {
    return createMockProject(project)
  }

  return apiPost('/api/constructor/projects', project)
}

export async function loadConstructorProjectRemote(projectId) {
  if (shouldUseMockApi()) {
    return loadMockProject(projectId)
  }

  return apiGet(`/api/constructor/projects/${projectId}`)
}
