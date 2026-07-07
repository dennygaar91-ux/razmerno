import { INITIAL_ORDER_DOMAIN_STATUS } from './order-domain'

export const CUSTOMER_CHANGE_REQUEST_STATUS_NOT_ALLOWED_MESSAGE =
  'Изменения недоступны для текущего статуса заявки.'

/** Change requests are allowed only while the order is in manual review (`Проверка`). */
export function isCustomerChangeRequestAllowedForDomainStatus(
  domainStatus: string | null | undefined,
): boolean {
  return domainStatus === INITIAL_ORDER_DOMAIN_STATUS
}
