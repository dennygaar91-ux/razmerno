export type OperationsOrderDecision = 'approve' | 'reject'

export type OperationsOrderDecisionInput = {
  orderId: string
  decision: OperationsOrderDecision
  reason: string | null
}

export type OperationsOrderDecisionResult = {
  orderId: string
  decision: OperationsOrderDecision
  domainStatus: string
  legacyStatus: string
}
