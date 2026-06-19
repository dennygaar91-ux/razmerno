import type { OrderRequest } from './_shared/order-types'
import { toOrderDbInsert } from './_shared/order-db'
import { insertOrderRecord, updateOrderEmailStatus } from './_shared/supabase-orders'
import { calculateServerPrice, withServerPrice } from './_shared/server-price'
import { logEvent, safeErrorMessage } from './_shared/logger'
import { assertServerEnvReady } from './_shared/env'
import { applyNoStoreHeaders } from './_shared/headers'
import { buildProductionExportFromOrder } from '../src/constructor/production/orderExportPackage'

import { applyRequestIdHeader, getRequestId } from './_shared/request-context'
import { buildClientText, buildManagerAttachments, buildManagerText, sendEmail } from './_shared/order-email'
import type { ServerlessRequest, ServerlessResponse } from './_shared/serverless-types'
import { applyCorsHeaders, getHeader, isAllowedOrigin } from './_shared/order-cors'
import { getClientKey, isRateLimited } from './_shared/order-rate-limit'
import { validateOrder } from './_shared/order-validation'

const MANAGER_NOTIFICATION_FAILED = 'manager_notification_failed'
const CUSTOMER_NOTIFICATION_FAILED = 'customer_notification_failed'

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
    return res.status(429).json({ ok: false, message: 'РЎР»РёС€РєРѕРј РјРЅРѕРіРѕ Р·Р°РїСЂРѕСЃРѕРІ. РџРѕРїСЂРѕР±СѓР№С‚Рµ РїРѕР·Р¶Рµ.' })
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
    return res.status(400).json({ ok: false, message: 'РќРµ СѓРґР°Р»РѕСЃСЊ РїРµСЂРµСЃС‡РёС‚Р°С‚СЊ СЃС‚РѕРёРјРѕСЃС‚СЊ Р·Р°СЏРІРєРё.' })
  }

  const orderId = body.orderId || safeOrderId()
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
      logEvent('error', 'orders.db_insert_failed', { requestId, orderId, reason: dbResult.error })
      return res.status(502).json({ ok: false, message: 'РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ Р·Р°СЏРІРєСѓ. РџРѕРїСЂРѕР±СѓР№С‚Рµ РїРѕР·Р¶Рµ.' })
    }

    let managerEmailStatus: 'sent' | 'skipped' | 'failed' = 'skipped'
    let customerEmailStatus: 'sent' | 'skipped' | 'failed' = 'skipped'
    let managerEmailError: string | null = null
    let customerEmailError: string | null = null

    if (managerEmail) {
      try {
        const result = await sendEmail(
          managerEmail,
          `Р Р°Р·РјРµСЂРЅРѕ вЂ” Р·Р°СЏРІРєР° ${orderId}`,
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
        const result = await sendEmail(pricedBody.customer.email, `Р Р°Р·РјРµСЂРЅРѕ вЂ” Р·Р°СЏРІРєР° ${orderId}`, buildClientText(orderId, pricedBody))
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
      message: error instanceof Error ? error.message : 'РќРµ СѓРґР°Р»РѕСЃСЊ РѕС‚РїСЂР°РІРёС‚СЊ Р·Р°СЏРІРєСѓ',
    })
  }
}
