import { getOrderUuidByBusinessOrderId } from './customer-orders-store'
import { createCustomerNotification } from './customer-notifications-store'
import { logEvent } from './logger'

function formatPublicOrderNumber(publicOrderNumber: string | null | undefined): string {
  const normalized = publicOrderNumber?.trim()
  return normalized || 'без номера'
}

export async function createOrderCreatedNotificationBestEffort(input: {
  requestId: string
  userId: string
  businessOrderId: string
  publicOrderNumber: string
}): Promise<void> {
  const orderUuid = await getOrderUuidByBusinessOrderId(input.userId, input.businessOrderId)
  if (!orderUuid.ok) {
    logEvent('error', 'customer_notifications.order_created_lookup_failed', {
      requestId: input.requestId,
      userId: input.userId,
      businessOrderId: input.businessOrderId,
      reason: 'notFound' in orderUuid && orderUuid.notFound ? 'order_not_found' : orderUuid.error,
    })
    return
  }

  const publicOrderNumber = formatPublicOrderNumber(input.publicOrderNumber)
  const created = await createCustomerNotification({
    userId: input.userId,
    orderId: orderUuid.id,
    type: 'order_created',
    title: 'Заказ оформлен',
    message: `Ваш заказ ${publicOrderNumber} отправлен на проверку.`,
  })

  if (!created.ok) {
    logEvent('error', 'customer_notifications.order_created_insert_failed', {
      requestId: input.requestId,
      userId: input.userId,
      orderId: orderUuid.id,
      reason: created.error,
    })
  }
}

export async function createChangeRequestNotificationBestEffort(input: {
  requestId: string
  userId: string
  orderId: string
  publicOrderNumber: string | null
}): Promise<void> {
  const publicOrderNumber = formatPublicOrderNumber(input.publicOrderNumber)
  const created = await createCustomerNotification({
    userId: input.userId,
    orderId: input.orderId,
    type: 'change_request',
    title: 'Запрос на изменение отправлен',
    message: `Ваш запрос по заказу ${publicOrderNumber} передан менеджеру.`,
  })

  if (!created.ok) {
    logEvent('error', 'customer_notifications.change_request_insert_failed', {
      requestId: input.requestId,
      userId: input.userId,
      orderId: input.orderId,
      reason: created.error,
    })
  }
}
