/** Customer-facing canonical order status (RPES VII). */
export const INITIAL_ORDER_DOMAIN_STATUS = 'Проверка' as const

/**
 * Legacy technical pipeline status for admin/email flows.
 * Kept separate from `domain_status`; new submits still use `new`.
 */
export const LEGACY_ORDER_STATUS_ON_SUBMIT = 'new' as const

export const PUBLIC_ORDER_NUMBER_PATTERN = /^RZM_\d{4,}$/
