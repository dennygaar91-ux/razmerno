export const OPERATIONS_CHANGE_REQUEST_DECISIONS = ['reviewed', 'resolved', 'rejected'] as const

export type OperationsChangeRequestDecision = (typeof OPERATIONS_CHANGE_REQUEST_DECISIONS)[number]

export function isOperationsChangeRequestDecision(
  value: string,
): value is OperationsChangeRequestDecision {
  return (OPERATIONS_CHANGE_REQUEST_DECISIONS as readonly string[]).includes(value)
}

export function isOperationsChangeRequestDecisionAllowed(status: string): boolean {
  return status === 'submitted' || status === 'reviewed'
}

export function isValidOperationsChangeRequestDecisionTransition(
  fromStatus: string,
  toStatus: OperationsChangeRequestDecision,
): boolean {
  if (fromStatus === 'submitted') {
    return toStatus === 'reviewed' || toStatus === 'resolved' || toStatus === 'rejected'
  }
  if (fromStatus === 'reviewed') {
    return toStatus === 'resolved' || toStatus === 'rejected'
  }
  return false
}
