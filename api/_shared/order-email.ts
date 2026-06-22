import type { OrderRequest } from './order-types.js'
import { buildProductionEmailAttachments } from '../../src/constructor/production/emailAttachments.js'
import { logEvent } from './logger.js'

export type ResendAttachment = {
  filename: string
  content: string
  contentType?: string
}

function isProductionRuntime(): boolean {
  return process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production'
}

function formatPrice(value?: number): string {
  if (!value) return '—'
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽'
}

function formatLayoutSummary(body: OrderRequest): string[] {
  const layout = body.layout
  if (!layout?.sections?.length) return ['Схема: не передана']

  const compartments = layout.sections.reduce((sum, section) => sum + section.compartments.length, 0)
  const rods = layout.sections.reduce((sum, section) => sum + section.compartments.filter((c) => c.kind === 'rod' || c.hasRod).length, 0)
  const drawers = layout.sections.reduce((sum, section) => sum + section.compartments.reduce((acc, c) => acc + c.drawers, 0), 0)
  const shelves = layout.sections.reduce((sum, section) => sum + section.compartments.reduce((acc, c) => acc + c.shelves, 0), 0)

  return [
    `Схема: ${layout.sections.length} секц., ${compartments} отсеков`,
    `Полки по отсекам: ${shelves}`,
    `Ящики по отсекам: ${drawers}`,
    `Отсеки со штангой: ${rods}`,
  ]
}

function formatBreakdown(body: OrderRequest): string[] {
  const p = body.priceBreakdown ?? {}
  return [
    `Материалы: ${formatPrice(p.materials)}`,
    `Корпус: ${formatPrice(p.body)}`,
    `Фасады: ${formatPrice(p.facades)}`,
    `Кромка: ${formatPrice(p.edgeBanding)}`,
    `Наполнение: ${formatPrice(p.filling)}`,
    `Фурнитура: ${formatPrice(p.hardware)}`,
    `Услуги: ${formatPrice(p.services)}`,
    `Производство: ${formatPrice(p.production)}`,
    `Доставка: ${formatPrice(p.delivery)}`,
    `Сборка: ${formatPrice(p.assembly)}`,
  ]
}

export function buildManagerText(orderId: string, body: OrderRequest): string {
  return [
    `Новая заявка ${orderId}`,
    '',
    `Клиент: ${body.customer?.name ?? '—'}`,
    `Телефон: ${body.customer?.phone ?? '—'}`,
    `Email: ${body.customer?.email || '—'}`,
    `Комментарий: ${body.customer?.comment || '—'}`,
    `Сборка: ${body.assembly?.enabled ? formatPrice(body.assembly.price) : 'не нужна'}`,
    '',
    `Изделие: ${body.productType}`,
    `Размеры: ${body.dimensions?.width} × ${body.dimensions?.height} × ${body.dimensions?.depth} мм`,
    `Секции: ${body.sections ?? '—'}`,
    `Наполнение: полки ${body.filling?.shelves ?? 0}, ящики ${body.filling?.drawers ?? 0}, штанга ${body.filling?.hangingRod ? 'да' : 'нет'}`,
    `Материалы: корпус ${body.materials?.bodyId ?? '—'}, фасады ${body.materials?.facadeId ?? '—'}`,
    `Стиль: ${body.style?.facadeStyleId ?? '—'}, фурнитура ${body.style?.hardwareId ?? '—'}`,
    '',
    `Предварительная цена: ${formatPrice(body.totalPrice)}`,
    '',
    'Схема изделия:',
    ...formatLayoutSummary(body),
    '',
    'Состав цены:',
    ...formatBreakdown(body),
    '',
    `Доставка: ${body.delivery?.enabled ? 'да' : 'нет'}${body.delivery?.address ? `, ${body.delivery.address}` : ''}`,
    `Источник: ${body.source ?? 'configurator'}`,
    `Согласие: ${body.consent?.personalData ? 'да' : 'нет'} (${body.consent?.privacyVersion ?? '—'}, ${body.consent?.acceptedAt ?? '—'})`,
    `Версия конфигурации: ${body.configVersion ?? '—'}`,
    `UTM: ${JSON.stringify(body.utm ?? {})}`,
  ].join('\n')
}

export function buildManagerAttachments(orderId: string, body: OrderRequest): ResendAttachment[] {
  if (!body.productionExport || typeof body.productionExport !== 'object') return []

  const attachments = buildProductionEmailAttachments(body.productionExport as never, orderId)
  return attachments.map((item) => ({
    filename: item.filename,
    content: Buffer.from(item.content, 'utf8').toString('base64'),
    contentType: item.contentType,
  }))
}

export function buildClientText(orderId: string, body: OrderRequest): string {
  return [
    `Здравствуйте, ${body.customer?.name ?? ''}!`,
    '',
    `Мы получили вашу заявку ${orderId}.`,
    `Предварительная стоимость: ${formatPrice(body.totalPrice)}.`,
    '',
    'Схема изделия:',
    ...formatLayoutSummary(body),
    '',
    'Состав предварительной цены:',
    ...formatBreakdown(body),
    '',
    'Следующий шаг: проверим конфигурацию, уточним технические детали и свяжемся с вами.',
    'Заявка ни к чему не обязывает — финальная цена фиксируется только после проверки проекта.',
    '',
    'Размерно',
  ].join('\n')
}

export async function sendEmail(to: string, subject: string, text: string, attachments?: ResendAttachment[]) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.MAIL_FROM || (isProductionRuntime() ? '' : 'Размерно <onboarding@resend.dev>')
  if (!apiKey) {
    logEvent('warn', 'orders.email_skipped_no_provider', { subject })
    return { skipped: true }
  }
  if (!from) {
    throw new Error('MAIL_FROM is not set')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, text, ...(attachments?.length ? { attachments } : {}) }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Email provider error ${response.status}: ${details}`)
  }

  return response.json()
}
