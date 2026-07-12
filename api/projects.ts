import {
  authorizeCustomerApi,
  parseCustomerApiBody,
  prepareCustomerApi,
} from './_shared/customer-api-auth'
import { canCreateActiveProject, validateProjectCreateBody } from './_shared/constructor-project-validation'
import {
  countActiveProjectsForUser,
  createConstructorProject,
  listConstructorProjectsForUser,
} from './_shared/constructor-projects-store'
import { MAX_ACTIVE_PROJECTS_PER_USER } from './_shared/constructor-project-types'
import { logEvent } from './_shared/logger'
import { isFailureResult, readFailureError, readFailureMessage } from './_shared/result-utils'
import type { ServerlessRequest, ServerlessResponse } from './_shared/serverless-types'

const PROJECT_LIMIT_MESSAGE = `Можно хранить не более ${MAX_ACTIVE_PROJECTS_PER_USER} активных проектов. Архивируйте старый проект и попробуйте снова.`
const PROJECT_UNAVAILABLE_MESSAGE = 'Проекты временно недоступны. Попробуйте позже.'

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  const prepared = prepareCustomerApi(req, res, ['GET', 'POST'])
  if (!prepared) return

  const auth = await authorizeCustomerApi(req, res, prepared.requestId)
  if (!auth) return

  if (req.method === 'GET') {
    const includeArchived = readIncludeArchived(req)
    const listed = await listConstructorProjectsForUser(auth.user.userId, { includeArchived })
    if (isFailureResult(listed)) {
      logEvent('error', 'projects.list_failed', {
        requestId: prepared.requestId,
        userId: auth.user.userId,
        reason: readFailureError(listed),
      })
      return res.status(500).json({ ok: false, message: PROJECT_UNAVAILABLE_MESSAGE })
    }

    return res.status(200).json({ ok: true, projects: listed.projects })
  }

  const validation = validateProjectCreateBody(parseCustomerApiBody(req.body))
  if (isFailureResult(validation)) {
    return res.status(400).json({ ok: false, message: readFailureMessage(validation) })
  }

  const activeCount = await countActiveProjectsForUser(auth.user.userId)
  if (!canCreateActiveProject(activeCount)) {
    return res.status(409).json({ ok: false, message: PROJECT_LIMIT_MESSAGE })
  }

  const created = await createConstructorProject(auth.user.userId, validation.value)
  if (isFailureResult(created)) {
    logEvent('error', 'projects.create_failed', {
      requestId: prepared.requestId,
      userId: auth.user.userId,
      reason: readFailureError(created),
    })
    return res.status(500).json({ ok: false, message: PROJECT_UNAVAILABLE_MESSAGE })
  }

  return res.status(201).json({ ok: true, project: created.project })
}

function readIncludeArchived(req: ServerlessRequest): boolean {
  const raw = req.query?.includeArchived
  const value = Array.isArray(raw) ? raw[0] : raw
  return value === '1' || value === 'true'
}
