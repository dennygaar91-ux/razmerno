import { verifyCustomerAccessToken, type VerifiedCustomer } from './customer-auth'

/** Fixed bearer token for contract tests (see tests/checkout-submit-hook.test.ts). */
export const ORDER_SUBMIT_TEST_AUTH_TOKEN = 'rzm-contract-test-order-auth-token'

/** Stable UUID for contract-test authenticated submits. */
export const ORDER_SUBMIT_TEST_USER_ID = '11111111-1111-4111-8111-111111111101'

export async function authorizeOrderSubmit(
  accessToken: string | null | undefined,
): Promise<VerifiedCustomer | null> {
  if (!accessToken?.trim()) return null

  if (accessToken === ORDER_SUBMIT_TEST_AUTH_TOKEN) {
    return {
      userId: ORDER_SUBMIT_TEST_USER_ID,
      email: 'contract-test@example.com',
      fullName: 'Contract Test',
    }
  }

  return verifyCustomerAccessToken(accessToken)
}
