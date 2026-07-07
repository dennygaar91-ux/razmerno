export function isFailureResult(result: { ok: boolean }): result is { ok: false } {
  return result.ok === false
}

export function readFailureError(result: { ok: false; error: string }): string {
  return result.error
}

export function readFailureMessage(result: { ok: false; message: string }): string {
  return result.message
}

export function isNotFoundResult(
  result: { ok: false; notFound?: true },
): result is { ok: false; notFound: true } {
  return result.notFound === true
}
