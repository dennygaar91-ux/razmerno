/**
 * Stored order pricing snapshot contract (P0-03 / P0-13).
 * Customer and operations read models must use persisted server-owned totals,
 * not recalculate from catalog or manual pricing drafts.
 */
export type StoredOrderPricingSnapshot = {
  totalPrice: number
  deliveryEnabled: boolean
  deliveryPrice: number | null
  assemblyEnabled: boolean
  assemblyPrice: number | null
}

export function readStoredOrderPricingSnapshot(row: {
  total_price: number
  delivery_enabled: boolean
  delivery_price: number | null
  assembly_enabled: boolean
  assembly_price: number | null
}): StoredOrderPricingSnapshot {
  return {
    totalPrice: row.total_price,
    deliveryEnabled: row.delivery_enabled === true,
    deliveryPrice: row.delivery_enabled ? Math.max(0, row.delivery_price ?? 0) : null,
    assemblyEnabled: row.assembly_enabled === true,
    assemblyPrice: row.assembly_enabled ? Math.max(0, row.assembly_price ?? 0) : null,
  }
}

export function deriveFurnitureTotalFromStoredSnapshot(snapshot: StoredOrderPricingSnapshot): number {
  const deliveryPart = snapshot.deliveryPrice ?? 0
  const assemblyPart = snapshot.assemblyPrice ?? 0
  return Math.max(0, snapshot.totalPrice - deliveryPart - assemblyPart)
}

export function assertStoredOrderPricingSnapshotConsistent(snapshot: StoredOrderPricingSnapshot): void {
  const deliveryPart = snapshot.deliveryPrice ?? 0
  const assemblyPart = snapshot.assemblyPrice ?? 0
  const furnitureTotal = deriveFurnitureTotalFromStoredSnapshot(snapshot)

  if (snapshot.totalPrice < deliveryPart + assemblyPart) {
    throw new Error('stored order pricing snapshot: total is less than delivery + assembly parts')
  }

  if (furnitureTotal + deliveryPart + assemblyPart !== snapshot.totalPrice) {
    throw new Error('stored order pricing snapshot: furniture + delivery + assembly must equal total')
  }
}
