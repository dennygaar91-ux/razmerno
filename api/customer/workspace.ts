import { authorizeCustomerApi, prepareCustomerApi } from '../_shared/customer-api-auth'
import { buildCustomerWorkspaceForUser } from '../_shared/customer-workspace'
import { logEvent } from '../_shared/logger'
import type { ServerlessRequest, ServerlessResponse } from '../_shared/serverless-types'

const WORKSPACE_UNAVAILABLE_MESSAGE = 'Рабочая область временно недоступна. Попробуйте позже.'

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  const prepared = prepareCustomerApi(req, res, ['GET'])
  if (!prepared) return

  const auth = await authorizeCustomerApi(req, res, prepared.requestId)
  if (!auth) return

  const built = await buildCustomerWorkspaceForUser({
    userId: auth.user.userId,
    email: auth.user.email,
    fullName: auth.user.fullName,
  })

  if (!built.ok) {
    logEvent('error', 'customer_workspace.load_failed', {
      requestId: prepared.requestId,
      userId: auth.user.userId,
      reason: built.error,
    })
    return res.status(500).json({ ok: false, message: WORKSPACE_UNAVAILABLE_MESSAGE })
  }

  return res.status(200).json({ ok: true, workspace: built.workspace })
}
