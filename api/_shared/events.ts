export const ApiEvents = {
  healthEnvMissing: 'health.env_missing',
  diagnosticsRead: 'diagnostics.read',

  orderEnvNotReady: 'orders.env_not_ready',
  orderCreateStarted: 'orders.create_started',
  orderCreateSucceeded: 'orders.create_succeeded',
  orderCreateFailed: 'orders.create_failed',

  adminAuthKeyNotConfigured: 'admin.auth_key_not_configured',
  adminAuthRejected: 'admin.auth_rejected',
  adminLoginSuccess: 'admin.login_success',
  adminLoginFailed: 'admin.login_failed',
  adminLoginRateLimited: 'admin.login_rate_limited',
  adminLoginNotConfigured: 'admin.login_not_configured',
  adminOrdersListFailed: 'admin.orders_list_failed',
  adminOrderStatusUpdated: 'admin.order_status_updated',
  adminOrderStatusUpdateFailed: 'admin.order_status_update_failed',
  adminStatusEventsListFailed: 'admin.status_events_list_failed',

  emailManagerFailed: 'email.manager_failed',
  emailCustomerFailed: 'email.customer_failed',
} as const

export type ApiEventName = typeof ApiEvents[keyof typeof ApiEvents]
