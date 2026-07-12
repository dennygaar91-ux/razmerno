import type { ServerlessRequest, ServerlessResponse } from './serverless-types'

const DEFAULT_ALLOWED_ORIGINS = ['https://razmerno.ru']
const DEV_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']

export function getHeader(req: ServerlessRequest, name: string): string | null {
  const value = req.headers[name.toLowerCase()]
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function getAllowedOrigins(): string[] {
  const envValue = process.env.ALLOWED_ORIGINS || process.env.VERCEL_ALLOWED_ORIGINS
  const envOrigins = envValue
    ? envValue.split(',').map((item) => item.trim()).filter(Boolean)
    : []
  return [...DEFAULT_ALLOWED_ORIGINS, ...DEV_ALLOWED_ORIGINS, ...envOrigins]
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true
  return getAllowedOrigins().includes(origin)
}

export function applyCorsHeaders(req: ServerlessRequest, res: ServerlessResponse) {
  const origin = getHeader(req, 'origin')
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Idempotency-Key, Authorization')
}
