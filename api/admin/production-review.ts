import { validateAdminRequest } from '../_shared/admin-auth'
import { updateAdminProductionReview, type ManualProductionReviewPatch } from '../_shared/admin-orders'
import { applyJsonHeaders } from '../_shared/headers'
import { logEvent } from '../_shared/logger'
import { applyRequestIdHeader, getRequestId } from '../_shared/request-context'

type ServerlessRequest = {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body: unknown
}

type ServerlessResponse = {
  setHeader(name: string, value: string): void
  status(code: number): {
    json(payload: unknown): void
    end(): void
  }
}

const ALLOWED = new Set(['manually-adjusted', 'approved-for-basis', 'blocked', 'requires-review'])

function parseBody(body: unknown): ManualProductionReviewPatch | null {
  if (!body || typeof body !== 'object') return null
  const raw = body as Partial<ManualProductionReviewPatch>
  const orderId = typeof raw.orderId === 'string' ? raw.orderId.trim() : ''
  const status = typeof raw.status === 'string' && ALLOWED.has(raw.status) ? raw.status as ManualProductionReviewPatch['status'] : null
  const note = typeof raw.note === 'string' ? raw.note.trim().slice(0, 500) : ''
  if (!/^RZ-\d{8}-\d{4}$/.test(orderId) || !status || note.length < 3) return null
  return { orderId, status, note }
}

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  const requestId = getRequestId(req)
  applyRequestIdHeader(res, requestId)
  applyJsonHeaders(res)
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-Admin-Key, Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'PATCH') return res.status(405).json({ ok: false, message: 'Method not allowed' })

  const auth = validateAdminRequest(req)
  if (auth.ok === false) return res.status(auth.status).json({ ok: false, message: auth.message })

  const patch = parseBody(req.body)
  if (!patch) return res.status(400).json({ ok: false, message: 'Invalid production review patch' })

  try {
    await updateAdminProductionReview(patch)
    logEvent('info', 'admin.production_review_updated', { requestId, orderId: patch.orderId, status: patch.status })
    return res.status(200).json({ ok: true, orderId: patch.orderId, status: patch.status })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logEvent('error', 'admin.production_review_update_failed', { requestId, orderId: patch.orderId, reason: message.slice(0, 300) })
    return res.status(500).json({ ok: false, message: 'Unable to update production review' })
  }
}
