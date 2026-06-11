import { validateAdminRequest } from '../_shared/admin-auth'
import { listAdminOrders } from '../_shared/admin-orders'
import { logEvent } from '../_shared/logger'

import { applyJsonHeaders } from '../_shared/headers'
import { applyRequestIdHeader, getRequestId } from '../_shared/request-context'
type ServerlessRequest = {
  method?: string
  headers: Record<string, string | string[] | undefined>
  query?: Record<string, string | string[] | undefined>
}

type ServerlessResponse = {
  setHeader(name: string, value: string): void
  status(code: number): {
    json(payload: unknown): void
    end(): void
  }
}

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
    const orders = await listAdminOrders(limit)
    return res.status(200).json({ ok: true, orders })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logEvent('error', 'admin.orders_list_failed', { requestId, reason: message.slice(0, 300) })
    return res.status(500).json({ ok: false, message: 'Unable to load orders' })
  }
}
