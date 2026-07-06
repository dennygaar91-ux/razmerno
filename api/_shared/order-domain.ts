/** Customer-facing canonical order status (RPES VII). */
export const INITIAL_ORDER_DOMAIN_STATUS = 'Проверка' as const

/** Next domain status after operations manual review approval (no payment automation). */
export const OPERATIONS_APPROVED_DOMAIN_STATUS = 'Оплата' as const

/** Terminal domain status after operations manual review rejection. */
export const OPERATIONS_REJECTED_DOMAIN_STATUS = 'Отмена' as const

/**
 * Legacy technical pipeline status for admin/email flows.
 * Kept separate from `domain_status`; new submits still use `new`.
 */
export const LEGACY_ORDER_STATUS_ON_SUBMIT = 'new' as const

/** Legacy status after operations approval for internal pipeline tracking. */
export const LEGACY_ORDER_STATUS_AFTER_APPROVAL = 'in_progress' as const

export const PUBLIC_ORDER_NUMBER_PATTERN = /^RZM_\d{4,}$/
