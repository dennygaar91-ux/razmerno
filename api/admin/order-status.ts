import { validateAdminRequest } from '../_shared/admin-auth'
import { isAdminOrderStatus, updateAdminOrderStatus } from '../_shared/admin-orders'
import { logEvent } from '../_shared/logger'

import { applyJsonHeaders } from '../_shared/headers'
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

type StatusBody = {
  orderId?: string
  status?: unknown
}

function parseBody(body: unknown): StatusBody {
  if (!body || typeof body !== 'object') return {}
  return body as StatusBody
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

  const body = parseBody(req.body)
  const orderId = body.orderId?.trim() ?? ''
  if (!/^RZ-\d{8}-\d{4}$/.test(orderId)) {
    return res.status(400).json({ ok: false, message: 'Invalid orderId' })
  }

  if (!isAdminOrderStatus(body.status)) {
    return res.status(400).json({ ok: false, message: 'Invalid status' })
  }

  try {
    await updateAdminOrderStatus(orderId, body.status, 'admin')
    logEvent('info', 'admin.order_status_updated', { requestId, orderId, status: body.status })
    return res.status(200).json({ ok: true, orderId, status: body.status })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logEvent('error', 'admin.order_status_update_failed', { requestId, orderId, reason: message.slice(0, 300) })
    return res.status(500).json({ ok: false, message: 'Unable to update order status' })
  }
}
