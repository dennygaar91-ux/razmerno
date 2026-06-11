export type HeaderBag = Record<string, string | string[] | undefined>

export type RequestLike = {
  headers: HeaderBag
}

export type ResponseLike = {
  setHeader(name: string, value: string): void
}

function readHeader(headers: HeaderBag, name: string): string | null {
  const value = headers[name] ?? headers[name.toLowerCase()]
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function safeRandomId(): string {
  const random = Math.random().toString(36).slice(2, 10)
  return `${Date.now().toString(36)}-${random}`
}

export function getRequestId(req: RequestLike): string {
  const incoming = readHeader(req.headers, 'x-request-id') || readHeader(req.headers, 'x-correlation-id')
  if (incoming && /^[a-zA-Z0-9._:-]{8,120}$/.test(incoming)) return incoming
  return `rzm-${safeRandomId()}`
}

export function applyRequestIdHeader(res: ResponseLike, requestId: string) {
  res.setHeader('X-Request-Id', requestId)
}

export function getClientIpHash(req: RequestLike & { socket?: { remoteAddress?: string } }): string {
  const forwarded = readHeader(req.headers, 'x-forwarded-for')?.split(',')[0]?.trim()
  const ip = forwarded || req.socket?.remoteAddress || 'unknown'
  let hash = 0
  for (let i = 0; i < ip.length; i += 1) {
    hash = ((hash << 5) - hash + ip.charCodeAt(i)) | 0
  }
  return `ip_${Math.abs(hash)}`
}
