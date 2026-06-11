import { getServerEnvReport } from './_shared/env'
import { applyJsonHeaders } from './_shared/headers'
import { applyRequestIdHeader, getRequestId } from './_shared/request-context'
import { validateAdminRequest } from './_shared/admin-auth'
import { logEvent } from './_shared/logger'
import { ApiEvents } from './_shared/events'

type ServerlessRequest = {
  method?: string
  headers: Record<string, string | string[] | undefined>
}

type ServerlessResponse = {
  setHeader(name: string, value: string): void
  status(code: number): {
    json(payload: unknown): void
    end(): void
  }
}

function getDiagnosticsPayload() {
  const env = getServerEnvReport()
  return {
    ok: env.ok,
    service: 'razmerno-api',
    runtime: env.runtime,
    ts: new Date().toISOString(),
    node: process.version,
    uptimeSec: Math.round(process.uptime()),
    env: {
      ok: env.ok,
      missing: env.missing,
      checks: env.checks.map((item) => ({
        name: item.name,
        required: item.required,
        present: item.present,
      })),
    },
    features: {
      orders: true,
      admin: true,
      statusAudit: true,
      metrika: Boolean(process.env.VITE_YANDEX_METRIKA_ID),
      rateLimitExternal: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    },
  }
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

  logEvent('info', ApiEvents.diagnosticsRead, { requestId })
  return res.status(200).json(getDiagnosticsPayload())
}
