import { getProfileByUserId, updateCustomerProfile } from './customer-profiles'
import { logEvent } from './logger'
import { isFailureResult, readFailureError } from './result-utils'

export async function maybeAutofillProfilePhoneFromOrder(userId: string, orderPhone: string): Promise<void> {
  const trimmedPhone = orderPhone.trim()
  if (!trimmedPhone) return

  const profile = await getProfileByUserId(userId)
  if (!profile) return
  if (profile.phone?.trim()) return

  const result = await updateCustomerProfile(userId, { phone: trimmedPhone })
  if (isFailureResult(result)) {
    logEvent('warn', 'orders.profile_phone_autofill_failed', { userId, reason: readFailureError(result) })
  }
}
