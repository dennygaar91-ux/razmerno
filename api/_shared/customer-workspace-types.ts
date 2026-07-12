import type { ConstructorProject } from './constructor-project-types'
import type { CustomerProfile } from './customer-profile'
import type { CustomerOrderListRow } from './customer-orders-store'
import { mapCustomerOrderStatus, type CustomerOrderStatus } from './customer-order-status'

export type CustomerWorkspaceProfile = {
  fullName: string
  email: string
  phone: string | null
}

export type CustomerWorkspaceProject = {
  id: string
  title: string
  furnitureType: string | null
  updatedAt: string
  previewPath: string | null
}

export type CustomerWorkspaceOrder = {
  id: string
  publicOrderNumber: string | null
  status: CustomerOrderStatus
  createdAt: string
  totalPrice: number
  customerName: string
  deliveryAddress: string | null
}

export type CustomerWorkspaceStats = {
  activeProjects: number
  orders: number
}

export type CustomerWorkspace = {
  profile: CustomerWorkspaceProfile
  projects: CustomerWorkspaceProject[]
  orders: CustomerWorkspaceOrder[]
  stats: CustomerWorkspaceStats
}

export function mapWorkspaceProfile(profile: CustomerProfile): CustomerWorkspaceProfile {
  return {
    fullName: profile.full_name,
    email: profile.email,
    phone: profile.phone,
  }
}

export function mapWorkspaceProject(project: ConstructorProject): CustomerWorkspaceProject {
  return {
    id: project.id,
    title: project.title,
    furnitureType: project.furniture_type || null,
    updatedAt: project.updated_at,
    previewPath: project.preview_path,
  }
}

export function mapWorkspaceOrder(row: CustomerOrderListRow): CustomerWorkspaceOrder {
  return {
    id: row.id,
    publicOrderNumber: row.public_order_number,
    status: mapCustomerOrderStatus(row.domain_status),
    createdAt: row.created_at,
    totalPrice: row.total_price,
    customerName: row.customer_name,
    deliveryAddress: row.delivery_enabled ? row.delivery_address : null,
  }
}

export function buildCustomerWorkspace(input: {
  profile: CustomerProfile
  projects: ConstructorProject[]
  orders: CustomerOrderListRow[]
}): CustomerWorkspace {
  const workspaceProjects = input.projects.map(mapWorkspaceProject)
  const workspaceOrders = input.orders.map(mapWorkspaceOrder)

  return {
    profile: mapWorkspaceProfile(input.profile),
    projects: workspaceProjects,
    orders: workspaceOrders,
    stats: {
      activeProjects: workspaceProjects.length,
      orders: workspaceOrders.length,
    },
  }
}
