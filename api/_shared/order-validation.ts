import type { OrderRequest } from './order-types.js'
import { validateDelivery } from '../../src/pricing/delivery.js'
import { validateAssembly } from '../../src/pricing/assembly.js'
import { validateOrderLayout } from './layout-validation.js'

export function validateOrder(body: OrderRequest): string | null {
  const name = body.customer?.name?.trim() ?? ''
  const phoneDigits = body.customer?.phone?.replace(/\D/g, '') ?? ''
  const email = body.customer?.email?.trim() ?? ''
  const isRuPhone = phoneDigits.length === 11 && (phoneDigits.startsWith('7') || phoneDigits.startsWith('8'))

  if (name.length < 2) return 'Укажите имя'
  if (!isRuPhone) return 'Укажите российский номер в формате +7'
  if (!email) return 'Укажите email'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email указан с ошибкой'
  if (!body.productType) return 'Не указан тип изделия'
  if (!body.dimensions?.width || !body.dimensions?.height || !body.dimensions?.depth) return 'Не указаны размеры'

  const layoutError = validateOrderLayout(body.layout, body.dimensions)
  if (layoutError) return layoutError

  const deliveryError = validateDelivery(body.delivery?.enabled === true, body.delivery?.address ?? '')
  if (deliveryError) return deliveryError

  const assemblyBase = body.assembly?.basePrice ?? body.totalPrice ?? 0
  const assemblyError = validateAssembly(body.assembly?.enabled === true, assemblyBase)
  if (assemblyError) return assemblyError

  if (body.assembly?.enabled === true && (body.assembly?.rate ?? 0) > 0.1001) {
    return 'Стоимость сборки рассчитана некорректно'
  }

  if (!body.consent?.personalData) return 'Нужно согласие на обработку персональных данных'

  return null
}
