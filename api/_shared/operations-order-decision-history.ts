import type { OperationsDecisionAudit, OperationsDecisionHistoryEntry } from './operations-order-decision-types'

export type OrderStatusEventHistoryRow = {
  id: number
  from_status: string | null
  to_status: string
  changed_by: string
  reason?: string | null
  created_at: string | null
}

export function normalizeAuditReason(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function parseOperationsDecisionFromChangedBy(
  changedBy: string,
): OperationsDecisionAudit['decision'] | null {
  if (changedBy.endsWith(':approve')) return 'approve'
  if (changedBy.endsWith(':reject')) return 'reject'
  return null
}

export function mapOrderStatusEventHistoryRow(row: OrderStatusEventHistoryRow): OperationsDecisionHistoryEntry {
  return {
    id: String(row.id),
    fromStatus: row.from_status,
    toStatus: row.to_status,
    reason: normalizeAuditReason(row.reason),
    changedBy: row.changed_by,
    createdAt: row.created_at ?? '',
  }
}

export function deriveLatestOperationsDecisionAudit(
  history: OperationsDecisionHistoryEntry[],
): OperationsDecisionAudit | null {
  for (const entry of history) {
    const decision = parseOperationsDecisionFromChangedBy(entry.changedBy)
    if (!decision) continue

    return {
      decision,
      reason: entry.reason,
      fromDomainStatus: entry.fromStatus,
      toDomainStatus: entry.toStatus,
      changedBy: entry.changedBy,
      createdAt: entry.createdAt || null,
    }
  }

  return null
}
