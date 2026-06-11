type ResponseLike = {
  setHeader(name: string, value: string): void
}

export function applyNoStoreHeaders(res: ResponseLike) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'no-referrer')
}

export function applyJsonHeaders(res: ResponseLike) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  applyNoStoreHeaders(res)
}
