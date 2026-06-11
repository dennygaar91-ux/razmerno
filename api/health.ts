import { getServerEnvReport } from './_shared/env'
import { logEvent } from './_shared/logger'
import { ApiEvents } from './_shared/events'

import { applyJsonHeaders } from './_shared/headers'
import { applyRequestIdHeader, getRequestId } from './_shared/request-context'
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

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  const requestId = getRequestId(req)
  applyRequestIdHeader(res, requestId)
  applyJsonHeaders(res)
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method not allowed' })

  const report = getServerEnvReport()

  if (!report.ok) {
    logEvent('warn', ApiEvents.healthEnvMissing, { requestId, missing: report.missing.join(',') })
  }

  return res.status(report.ok ? 200 : 503).json({
    ok: report.ok,
    service: 'razmerno-api',
    runtime: report.runtime,
    missing: report.missing,
    checks: report.checks,
  })
}
