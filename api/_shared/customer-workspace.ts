import { listConstructorProjectsForUser } from './constructor-projects-store'
import { isActiveProject } from './constructor-project-types'
import { listCustomerOrdersForUser } from './customer-orders-store'
import { ensureCustomerProfile } from './customer-profiles'
import { buildCustomerWorkspace } from './customer-workspace-types'
import { isFailureResult, readFailureError } from './result-utils'

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
  if (isFailureResult(ensured)) return { ok: false, error: readFailureError(ensured) }

  const listedProjects = await listConstructorProjectsForUser(input.userId)
  if (isFailureResult(listedProjects)) return { ok: false, error: readFailureError(listedProjects) }

  const listedOrders = await listCustomerOrdersForUser(input.userId)
  if (isFailureResult(listedOrders)) return { ok: false, error: readFailureError(listedOrders) }

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
