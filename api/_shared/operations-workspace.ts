import { listAdminOrders } from './admin-orders'
import { buildOperationsWorkspace } from './operations-workspace-types'

export async function buildOperationsWorkspaceFromStore(limit = 50): Promise<
  | { ok: true; workspace: ReturnType<typeof buildOperationsWorkspace> }
  | { ok: false; error: string }
> {
  try {
    const orders = await listAdminOrders(limit)
    return { ok: true, workspace: buildOperationsWorkspace(orders) }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, error: message }
  }
}
