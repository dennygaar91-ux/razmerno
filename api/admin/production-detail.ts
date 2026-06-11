import { validateAdminRequest } from '../_shared/admin-auth'
import { getAdminProductionDetail } from '../_shared/admin-orders'
import { applyJsonHeaders } from '../_shared/headers'
import { logEvent } from '../_shared/logger'
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

function readOrderId(req: ServerlessRequest): string {
  const raw = req.query?.orderId
  return (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? ''
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

  const orderId = readOrderId(req)
  if (!/^RZ-\d{8}-\d{4}$/.test(orderId)) {
    return res.status(400).json({ ok: false, message: 'Invalid orderId' })
  }

  try {
    const detail = await getAdminProductionDetail(orderId)
    return res.status(200).json({ ok: true, detail })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logEvent('error', 'admin.production_detail_failed', { requestId, orderId, reason: message.slice(0, 300) })
    return res.status(500).json({ ok: false, message: 'Unable to load production detail' })
  }
}
