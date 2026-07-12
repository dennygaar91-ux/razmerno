import { isValidProjectId } from './constructor-project-types'
import {
  isOperationsChangeRequestDecision,
  type OperationsChangeRequestDecision,
} from './operations-change-request-policy'

export type OperationsChangeRequestDecisionBody = {
  changeRequestId: string
  decision: OperationsChangeRequestDecision
}

export type OperationsChangeRequestDecisionValidationResult =
  | { ok: true; value: OperationsChangeRequestDecisionBody }
  | { ok: false; message: string }

export function validateOperationsChangeRequestDecisionBody(
  body: unknown,
): OperationsChangeRequestDecisionValidationResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, message: 'Invalid request body' }
  }

  const record = body as Record<string, unknown>

  if (typeof record.changeRequestId !== 'string' || !isValidProjectId(record.changeRequestId)) {
    return { ok: false, message: 'Invalid changeRequestId' }
  }

  if (typeof record.decision !== 'string' || !isOperationsChangeRequestDecision(record.decision)) {
    return { ok: false, message: 'Invalid decision' }
  }

  return {
    ok: true,
    value: {
      changeRequestId: record.changeRequestId.trim(),
      decision: record.decision,
    },
  }
}
