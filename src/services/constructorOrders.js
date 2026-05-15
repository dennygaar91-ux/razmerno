export async function createConstructorOrder(payload) {
  await new Promise(resolve => setTimeout(resolve, 350))

  return {
    ok: true,
    orderId: `RZM-${Date.now().toString().slice(-6)}`,
    payload,
  }
}
