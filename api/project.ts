import {
  authorizeCustomerApi,
  parseCustomerApiBody,
  prepareCustomerApi,
  readQueryString,
} from './_shared/customer-api-auth'
import {
  isProjectOwnedByUser,
  validateProjectPatchBody,
} from './_shared/constructor-project-validation'
import {
  archiveConstructorProject,
  getConstructorProjectById,
  updateConstructorProject,
} from './_shared/constructor-projects-store'
import { isValidProjectId } from './_shared/constructor-project-types'
import { logEvent } from './_shared/logger'
import type { ServerlessRequest, ServerlessResponse } from './_shared/serverless-types'

const PROJECT_NOT_FOUND_MESSAGE = 'Проект не найден.'
const PROJECT_UNAVAILABLE_MESSAGE = 'Проекты временно недоступны. Попробуйте позже.'
const INVALID_PROJECT_ID_MESSAGE = 'Некорректный идентификатор проекта.'

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  const prepared = prepareCustomerApi(req, res, ['GET', 'PATCH', 'DELETE'])
  if (!prepared) return

  const projectId = readQueryString(req.query?.id)
  if (!isValidProjectId(projectId)) {
    return res.status(400).json({ ok: false, message: INVALID_PROJECT_ID_MESSAGE })
  }

  const auth = await authorizeCustomerApi(req, res, prepared.requestId)
  if (!auth) return

  if (req.method === 'GET') {
    const loaded = await getConstructorProjectById(projectId)
    if (!loaded.ok) {
      if (loaded.notFound) return res.status(404).json({ ok: false, message: PROJECT_NOT_FOUND_MESSAGE })
      logEvent('error', 'project.get_failed', {
        requestId: prepared.requestId,
        projectId,
        reason: loaded.error,
      })
      return res.status(500).json({ ok: false, message: PROJECT_UNAVAILABLE_MESSAGE })
    }

    if (!isProjectOwnedByUser(loaded.project.user_id, auth.user.userId)) {
      return res.status(404).json({ ok: false, message: PROJECT_NOT_FOUND_MESSAGE })
    }

    return res.status(200).json({ ok: true, project: loaded.project })
  }

  if (req.method === 'PATCH') {
    const existing = await getConstructorProjectById(projectId)
    if (!existing.ok) {
      if (existing.notFound) return res.status(404).json({ ok: false, message: PROJECT_NOT_FOUND_MESSAGE })
      return res.status(500).json({ ok: false, message: PROJECT_UNAVAILABLE_MESSAGE })
    }

    if (!isProjectOwnedByUser(existing.project.user_id, auth.user.userId)) {
      return res.status(404).json({ ok: false, message: PROJECT_NOT_FOUND_MESSAGE })
    }

    const validation = validateProjectPatchBody(parseCustomerApiBody(req.body))
    if (!validation.ok) {
      return res.status(400).json({ ok: false, message: validation.message })
    }

    const updated = await updateConstructorProject(projectId, auth.user.userId, validation.value)
    if (!updated.ok) {
      if (updated.notFound) return res.status(404).json({ ok: false, message: PROJECT_NOT_FOUND_MESSAGE })
      logEvent('error', 'project.patch_failed', {
        requestId: prepared.requestId,
        projectId,
        userId: auth.user.userId,
        reason: updated.error,
      })
      return res.status(500).json({ ok: false, message: PROJECT_UNAVAILABLE_MESSAGE })
    }

    return res.status(200).json({ ok: true, project: updated.project })
  }

  const archived = await archiveConstructorProject(projectId, auth.user.userId)
  if (!archived.ok) {
    if (archived.notFound) return res.status(404).json({ ok: false, message: PROJECT_NOT_FOUND_MESSAGE })
    logEvent('error', 'project.archive_failed', {
      requestId: prepared.requestId,
      projectId,
      userId: auth.user.userId,
      reason: archived.error,
    })
    return res.status(500).json({ ok: false, message: PROJECT_UNAVAILABLE_MESSAGE })
  }

  return res.status(200).json({ ok: true, project: archived.project })
}
