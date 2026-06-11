export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'ENV_ERROR'
  | 'EMAIL_ERROR'
  | 'INTERNAL_ERROR'

export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly publicMessage: string

  constructor(code: ApiErrorCode, status: number, publicMessage: string, message = publicMessage) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.publicMessage = publicMessage
  }
}

export class ValidationError extends ApiError {
  constructor(publicMessage: string) {
    super('VALIDATION_ERROR', 400, publicMessage)
  }
}

export class AuthError extends ApiError {
  constructor(publicMessage = 'Unauthorized') {
    super('AUTH_ERROR', 401, publicMessage)
  }
}

export class RateLimitError extends ApiError {
  readonly retryAfterSec: number

  constructor(publicMessage: string, retryAfterSec: number) {
    super('RATE_LIMIT_ERROR', 429, publicMessage)
    this.retryAfterSec = retryAfterSec
  }
}

export class EnvError extends ApiError {
  constructor(publicMessage = 'Service is not configured') {
    super('ENV_ERROR', 503, publicMessage)
  }
}

export class EmailError extends ApiError {
  constructor(publicMessage = 'Email delivery failed') {
    super('EMAIL_ERROR', 502, publicMessage)
  }
}

type ResponseLike = {
  setHeader(name: string, value: string): void
  status(code: number): {
    json(payload: unknown): void
  }
}

export function sendApiError(res: ResponseLike, error: unknown, requestId?: string) {
  if (error instanceof RateLimitError) {
    res.setHeader('Retry-After', String(error.retryAfterSec))
  }

  if (error instanceof ApiError) {
    return res.status(error.status).json({
      ok: false,
      code: error.code,
      message: error.publicMessage,
      requestId,
    })
  }

  return res.status(500).json({
    ok: false,
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    requestId,
  })
}
