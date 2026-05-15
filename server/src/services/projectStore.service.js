import { nanoid } from 'nanoid'

const projects = new Map()
const orders = new Map()

export function createProjectRecord(project) {
  const now = new Date().toISOString()
  const projectId = `PRJ-${nanoid(8).toUpperCase()}`
  const record = {
    ...project,
    projectId,
    createdAt: now,
    updatedAt: now,
  }

  projects.set(projectId, record)
  return record
}

export function findProjectById(projectId) {
  return projects.get(projectId) ?? null
}

export function createOrderRecord(payload) {
  const now = new Date().toISOString()
  const orderId = `RZM-${nanoid(8).toUpperCase()}`
  const record = {
    ...payload,
    orderId,
    createdAt: now,
    updatedAt: now,
  }

  orders.set(orderId, record)
  return record
}

export function findOrderById(orderId) {
  return orders.get(orderId) ?? null
}
