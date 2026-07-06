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
  auditReason: string | null
}

export type OperationsDecisionAudit = {
  decision: OperationsOrderDecision
  reason: string | null
  fromDomainStatus: string | null
  toDomainStatus: string
  changedBy: string
  createdAt: string | null
}
