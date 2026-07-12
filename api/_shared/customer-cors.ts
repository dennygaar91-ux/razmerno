import type { ServerlessRequest, ServerlessResponse } from './serverless-types'
import { getHeader, isAllowedOrigin } from './order-cors'

export function applyCustomerCorsHeaders(req: ServerlessRequest, res: ServerlessResponse) {
  const origin = getHeader(req, 'origin')
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export function extractBearerToken(req: ServerlessRequest): string | null {
  const header = getHeader(req, 'authorization')
  if (!header) return null
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}
