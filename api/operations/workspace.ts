import { validateAdminRequest } from '../_shared/admin-auth'
import { applyJsonHeaders } from '../_shared/headers'
import { logEvent } from '../_shared/logger'
import { buildOperationsWorkspaceFromStore } from '../_shared/operations-workspace'
import { applyRequestIdHeader, getRequestId } from '../_shared/request-context'
import { isFailureResult, readFailureError } from '../_shared/result-utils'
import type { ServerlessRequest, ServerlessResponse } from '../_shared/serverless-types'

const WORKSPACE_UNAVAILABLE_MESSAGE = 'Operations workspace is temporarily unavailable.'

function queryNumber(value: string | string[] | undefined, fallback: number): number {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  const requestId = getRequestId(req)
  applyRequestIdHeader(res, requestId)
  applyJsonHeaders(res)
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-Admin-Key, Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method not allowed' })

  const auth = validateAdminRequest(req)
  if (auth.ok === false) return res.status(auth.status).json({ ok: false, message: auth.message })

  try {
    const limit = queryNumber(req.query?.limit, 50)
    const built = await buildOperationsWorkspaceFromStore(limit)
    if (isFailureResult(built)) {
      logEvent('error', 'operations_workspace.load_failed', {
        requestId,
        reason: readFailureError(built).slice(0, 300),
      })
      return res.status(500).json({ ok: false, message: WORKSPACE_UNAVAILABLE_MESSAGE })
    }

    return res.status(200).json({ ok: true, workspace: built.workspace })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logEvent('error', 'operations_workspace.load_failed', { requestId, reason: message.slice(0, 300) })
    return res.status(500).json({ ok: false, message: WORKSPACE_UNAVAILABLE_MESSAGE })
  }
}
