import { listConstructorProjectsForUser } from './constructor-projects-store'
import { isActiveProject } from './constructor-project-types'
import { listCustomerOrdersForUser } from './customer-orders-store'
import { ensureCustomerProfile } from './customer-profiles'
import { buildCustomerWorkspace } from './customer-workspace-types'

export async function buildCustomerWorkspaceForUser(input: {
  userId: string
  email: string
  fullName?: string
}): Promise<
  | { ok: true; workspace: ReturnType<typeof buildCustomerWorkspace> }
  | { ok: false; error: string }
> {
  const ensured = await ensureCustomerProfile({
    userId: input.userId,
    email: input.email,
    fullName: input.fullName,
  })
  if (!ensured.ok) return { ok: false, error: ensured.error }

  const listedProjects = await listConstructorProjectsForUser(input.userId)
  if (!listedProjects.ok) return { ok: false, error: listedProjects.error }

  const listedOrders = await listCustomerOrdersForUser(input.userId)
  if (!listedOrders.ok) return { ok: false, error: listedOrders.error }

  const activeProjects = listedProjects.projects.filter(isActiveProject)

  return {
    ok: true,
    workspace: buildCustomerWorkspace({
      profile: ensured.profile,
      projects: activeProjects,
      orders: listedOrders.orders,
    }),
  }
}
