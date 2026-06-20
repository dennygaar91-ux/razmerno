import type { OrderRequest } from './_shared/order-types'
import { toOrderDbInsert } from './_shared/order-db'
import { isSameOrderPayload } from './_shared/order-idempotency'
import { buildClientText, buildManagerAttachments, buildManagerText, sendEmail } from './_shared/order-email'
import { applyCorsHeaders, getHeader, isAllowedOrigin } from './_shared/order-cors'
import { assertServerEnvReady } from './_shared/env'
import { applyNoStoreHeaders } from './_shared/headers'
import { logEvent, safeErrorMessage } from './_shared/logger'
import { getClientKey, isRateLimited } from './_shared/order-rate-limit'
import { applyRequestIdHeader, getRequestId } from './_shared/request-context'
import { calculateServerPrice, withServerPrice } from './_shared/server-price'
import type { ServerlessRequest, ServerlessResponse } from './_shared/serverless-types'
import { getOrderRecordByOrderId, insertOrderRecord, updateOrderEmailStatus } from './_shared/supabase-orders'
import { validateOrder } from './_shared/order-validation'
import { buildProductionExportFromOrder } from '../src/constructor/production/orderExportPackage'

const MANAGER_NOTIFICATION_FAILED = 'manager_notification_failed'
const CUSTOMER_NOTIFICATION_FAILED = 'customer_notification_failed'
const IDEMPOTENCY_CONFLICT_MESSAGE = 'Конфликт повторной отправки: состав заявки изменился. Обновите заявку и отправьте снова.'
const GENERIC_ORDER_SUBMIT_FAILED = 'РќРµ СѓРґР°Р»РѕСЃСЊ РѕР±СЂР°Р±РѕС‚Р°С‚СЊ Р·Р°СЏРІРєСѓ. РџРѕРїСЂРѕР±СѓР№С‚Рµ РµС‰С‘ СЂР°Р· РёР»Рё СЃРІСЏР¶РёС‚РµСЃСЊ СЃ РЅР°РјРё.'

function safeOrderId(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `RZ-${yyyy}${mm}${dd}-${rand}`
}

async function persistEmailPatch(orderId: string, patch: Parameters<typeof updateOrderEmailStatus>[1]) {
  const result = await updateOrderEmailStatus(orderId, patch)
  if (!result.ok) {
    logEvent('error', 'orders.email_status_update_failed', { orderId, reason: result.error })
  }
}

function isDuplicateInsert(error: { error: string; code?: string | null }): boolean {
  return error.code === '23505' || /duplicate key|unique/i.test(error.error)
}

function buildReplayResponse(row: NonNullable<Awaited<ReturnType<typeof getOrderRecordByOrderId>>['row']>) {
  return {
    ok: true,
    orderId: row.order_id,
    receivedAt: row.created_at,
    email: {
      manager: row.manager_email_status,
      managerError: row.manager_email_error === MANAGER_NOTIFICATION_FAILED ? MANAGER_NOTIFICATION_FAILED : null,
      customer: row.customer_email_status,
      customerError: row.customer_email_error === CUSTOMER_NOTIFICATION_FAILED ? 'logged' : null,
    },
  }
}

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  const requestId = getRequestId(req)
  applyRequestIdHeader(res, requestId)
  applyNoStoreHeaders(res)
  applyCorsHeaders(req, res)

  const origin = getHeader(req, 'origin')
  if (!isAllowedOrigin(origin)) {
    logEvent('warn', 'orders.origin_rejected', { requestId, origin })
    return res.status(403).json({ ok: false, message: 'Forbidden origin' })
  }

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'Method not allowed' })

  const missingEnv = assertServerEnvReady()
  if (missingEnv.length > 0) {
    logEvent('error', 'orders.env_not_ready', { requestId, missing: missingEnv.join(',') })
    return res.status(503).json({ ok: false, message: 'Service is not configured' })
  }

  const clientKey = getClientKey(req)
  if (await isRateLimited(clientKey)) {
    return res.status(429).json({ ok: false, message: 'Р РЋР В»Р С‘РЎв‚¬Р С”Р С•Р С Р СР Р…Р С•Р С–Р С• Р В·Р В°Р С—РЎР‚Р С•РЎРѓР С•Р Р†. Р СџР С•Р С—РЎР‚Р С•Р В±РЎС“Р в„–РЎвЂљР Вµ Р С—Р С•Р В·Р В¶Р Вµ.' })
  }

  const body = req.body as OrderRequest
  if (body.honeypot?.trim()) {
    logEvent('warn', 'orders.honeypot_rejected', { requestId, clientHash: clientKey })
    return res.status(200).json({ ok: true, orderId: safeOrderId(), receivedAt: new Date().toISOString(), spam: 'filtered' })
  }

  const validationError = validateOrder(body)
  if (validationError) return res.status(400).json({ ok: false, message: validationError })

  let serverPrice
  let pricedBody: OrderRequest
  try {
    serverPrice = calculateServerPrice(body)
    pricedBody = withServerPrice(body, serverPrice)
    const productionExport = buildProductionExportFromOrder(pricedBody)
    pricedBody = { ...pricedBody, productionExport }
  } catch (error) {
    logEvent('error', 'orders.server_price_failed', { reason: safeErrorMessage(error) })
    return res.status(400).json({ ok: false, message: 'Р СњР Вµ РЎС“Р Т‘Р В°Р В»Р С•РЎРѓРЎРЉ Р С—Р ВµРЎР‚Р ВµРЎРѓРЎвЂЎР С‘РЎвЂљР В°РЎвЂљРЎРЉ РЎРѓРЎвЂљР С•Р С‘Р СР С•РЎРѓРЎвЂљРЎРЉ Р В·Р В°РЎРЏР Р†Р С”Р С‘.' })
  }

  const idempotencyKey = getHeader(req, 'idempotency-key')?.trim() || null
  const orderId = idempotencyKey || body.orderId || safeOrderId()
  const managerEmail = process.env.ORDER_MANAGER_EMAIL

  try {
    const dbRecord = toOrderDbInsert({
      orderId,
      body: pricedBody,
      userAgent: getHeader(req, 'user-agent'),
      clientIp: clientKey,
    })
    const dbResult = await insertOrderRecord(dbRecord)
    if (!dbResult.ok) {
      if (idempotencyKey && isDuplicateInsert(dbResult)) {
        const existingOrder = await getOrderRecordByOrderId(orderId)
        if (!existingOrder.ok) {
          logEvent('error', 'orders.idempotency_read_failed', { requestId, orderId, reason: existingOrder.error })
          return res.status(502).json({ ok: false, message: GENERIC_ORDER_SUBMIT_FAILED })
        }

        if (existingOrder.row && isSameOrderPayload(dbRecord, existingOrder.row)) {
          logEvent('info', 'orders.idempotent_replay', { requestId, orderId })
          return res.status(200).json(buildReplayResponse(existingOrder.row))
        }

        logEvent('warn', 'orders.idempotency_conflict', { requestId, orderId })
        return res.status(409).json({ ok: false, message: IDEMPOTENCY_CONFLICT_MESSAGE })
      }

      logEvent('error', 'orders.db_insert_failed', { requestId, orderId, reason: dbResult.error })
      return res.status(502).json({ ok: false, message: 'Р СњР Вµ РЎС“Р Т‘Р В°Р В»Р С•РЎРѓРЎРЉ РЎРѓР С•РЎвЂ¦РЎР‚Р В°Р Р…Р С‘РЎвЂљРЎРЉ Р В·Р В°РЎРЏР Р†Р С”РЎС“. Р СџР С•Р С—РЎР‚Р С•Р В±РЎС“Р в„–РЎвЂљР Вµ Р С—Р С•Р В·Р В¶Р Вµ.' })
    }

    let managerEmailStatus: 'sent' | 'skipped' | 'failed' = 'skipped'
    let customerEmailStatus: 'sent' | 'skipped' | 'failed' = 'skipped'
    let managerEmailError: string | null = null
    let customerEmailError: string | null = null

    if (managerEmail) {
      try {
        const result = await sendEmail(
          managerEmail,
          `Р  Р В°Р В·Р СР ВµРЎР‚Р Р…Р С• РІР‚вЂќ Р В·Р В°РЎРЏР Р†Р С”Р В° ${orderId}`,
          buildManagerText(orderId, pricedBody),
          buildManagerAttachments(orderId, pricedBody),
        )
        managerEmailStatus = result && 'skipped' in result ? 'skipped' : 'sent'
        await persistEmailPatch(orderId, { manager_email_status: managerEmailStatus, manager_email_error: null })
      } catch (error) {
        void error
        managerEmailStatus = 'failed'
        managerEmailError = MANAGER_NOTIFICATION_FAILED
        await persistEmailPatch(orderId, {
          manager_email_status: 'failed',
          manager_email_error: MANAGER_NOTIFICATION_FAILED,
        })
        logEvent('error', 'orders.manager_email_failed', {
          requestId,
          orderId,
          reason: MANAGER_NOTIFICATION_FAILED,
          notificationState: MANAGER_NOTIFICATION_FAILED,
        })
      }
    } else {
      await persistEmailPatch(orderId, { manager_email_status: 'skipped', manager_email_error: 'ORDER_MANAGER_EMAIL is not set' })
    }

    if (pricedBody.customer?.email) {
      try {
        const result = await sendEmail(pricedBody.customer.email, `Р  Р В°Р В·Р СР ВµРЎР‚Р Р…Р С• РІР‚вЂќ Р В·Р В°РЎРЏР Р†Р С”Р В° ${orderId}`, buildClientText(orderId, pricedBody))
        customerEmailStatus = result && 'skipped' in result ? 'skipped' : 'sent'
        await persistEmailPatch(orderId, { customer_email_status: customerEmailStatus, customer_email_error: null })
      } catch (error) {
        void error
        customerEmailStatus = 'failed'
        customerEmailError = CUSTOMER_NOTIFICATION_FAILED
        await persistEmailPatch(orderId, {
          customer_email_status: 'failed',
          customer_email_error: CUSTOMER_NOTIFICATION_FAILED,
        })
        logEvent('warn', 'orders.customer_email_failed', {
          requestId,
          orderId,
          reason: CUSTOMER_NOTIFICATION_FAILED,
          notificationState: CUSTOMER_NOTIFICATION_FAILED,
        })
      }
    } else {
      await persistEmailPatch(orderId, { customer_email_status: 'skipped', customer_email_error: 'customer email is empty' })
    }

    return res.status(200).json({
      ok: true,
      orderId,
      receivedAt: new Date().toISOString(),
      email: {
        manager: managerEmailStatus,
        managerError: managerEmailError,
        customer: customerEmailStatus,
        customerError: customerEmailError ? 'logged' : null,
      },
    })
  } catch (error) {
    logEvent('error', 'orders.submit_failed', { reason: safeErrorMessage(error) })
    return res.status(502).json({
      ok: false,
      message: GENERIC_ORDER_SUBMIT_FAILED,
    })
  }
}
