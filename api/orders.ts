import type { OrderPricingAttribution, OrderRequest } from './_shared/order-types.js'
import { toOrderDbInsert } from './_shared/order-db.js'
import { isSameOrderPayload } from './_shared/order-idempotency.js'
import { buildClientText, buildManagerAttachments, buildManagerText, sendEmail } from './_shared/order-email.js'
import { applyCorsHeaders, getHeader, isAllowedOrigin } from './_shared/order-cors.js'
import { CUSTOMER_UNAUTHORIZED_MESSAGE } from './_shared/customer-api-auth.js'
import { extractBearerToken } from './_shared/customer-cors.js'
import { getConstructorProjectById } from './_shared/constructor-projects-store.js'
import { isValidProjectId } from './_shared/constructor-project-types.js'
import { maybeAutofillProfilePhoneFromOrder } from './_shared/order-profile-autofill.js'
import { authorizeOrderSubmit } from './_shared/order-submit-auth.js'
import { assertServerEnvReady } from './_shared/env.js'
import { applyNoStoreHeaders } from './_shared/headers.js'
import { logEvent, safeErrorMessage } from './_shared/logger.js'
import { getClientKey, isRateLimited } from './_shared/order-rate-limit.js'
import { applyRequestIdHeader, getRequestId } from './_shared/request-context.js'
import type { ServerlessRequest, ServerlessResponse } from './_shared/serverless-types.js'
import { getOrderRecordByOrderId, insertOrderRecord, updateOrderEmailStatus, allocatePublicOrderNumber } from './_shared/supabase-orders.js'
import { validateOrder } from './_shared/order-validation.js'
import { buildProductionExportFromPayload } from '../src/constructor/production/orderExportPackage.js'
import { calculateServerOrderPriceResolved, withServerPrice } from './_shared/server-price.js'

const MANAGER_NOTIFICATION_FAILED = 'manager_notification_failed'
const CUSTOMER_NOTIFICATION_FAILED = 'customer_notification_failed'
const IDEMPOTENCY_CONFLICT_MESSAGE = 'Конфликт повторной отправки: состав заявки изменился. Обновите заявку и отправьте снова.'
const GENERIC_ORDER_SUBMIT_FAILED = 'Не удалось обработать заявку. Попробуйте ещё раз или свяжитесь с нами.'
const RATE_LIMIT_MESSAGE = 'Слишком много запросов. Попробуйте позже.'
const ORDER_PREPARATION_FAILED_MESSAGE = 'Не удалось подготовить заявку.'
const DB_INSERT_FAILED_MESSAGE = 'Не удалось сохранить заявку. Попробуйте позже.'
const INVALID_IDEMPOTENCY_KEY_MESSAGE = 'Некорректный Idempotency-Key.'
const ORDER_ID_MISMATCH_MESSAGE = 'Idempotency-Key должен совпадать с orderId заявки.'
const INVALID_ORDER_ID_MESSAGE = 'Некорректный идентификатор заявки.'
const INVALID_PROJECT_ID_MESSAGE = 'Некорректный идентификатор проекта.'
const PROJECT_NOT_FOUND_MESSAGE = 'Проект не найден.'
const ORDER_ID_PATTERN = /^RZ-\d{8}-\d{4}$/

async function resolveConstructorProjectLink(
  projectId: string | undefined,
  userId: string,
): Promise<
  | { ok: true; constructorProjectId: string | null }
  | { ok: false; status: number; message: string }
> {
  const normalized = projectId?.trim()
  if (!normalized) {
    return { ok: true, constructorProjectId: null }
  }

  if (!isValidProjectId(normalized)) {
    return { ok: false, status: 400, message: INVALID_PROJECT_ID_MESSAGE }
  }

  const loaded = await getConstructorProjectById(normalized)
  if (!loaded.ok) {
    if (loaded.notFound) {
      return { ok: false, status: 404, message: PROJECT_NOT_FOUND_MESSAGE }
    }
    logEvent('error', 'orders.project_lookup_failed', { projectId: normalized, reason: loaded.error })
    return { ok: false, status: 502, message: GENERIC_ORDER_SUBMIT_FAILED }
  }

  if (loaded.project.user_id !== userId) {
    return { ok: false, status: 404, message: PROJECT_NOT_FOUND_MESSAGE }
  }

  return { ok: true, constructorProjectId: normalized }
}

function safeOrderId(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `RZ-${yyyy}${mm}${dd}-${rand}`
}

function isSafeOrderId(value: string): boolean {
  return value.length <= 32 && ORDER_ID_PATTERN.test(value)
}

function resolveOrderIdentity(bodyOrderId: string | undefined, headerIdempotencyKey: string | null) {
  const normalizedBodyOrderId = bodyOrderId?.trim() || null
  const normalizedHeaderKey = headerIdempotencyKey?.trim() || null

  if (normalizedHeaderKey && !isSafeOrderId(normalizedHeaderKey)) {
    return { ok: false as const, status: 400, message: INVALID_IDEMPOTENCY_KEY_MESSAGE }
  }

  if (normalizedBodyOrderId && !isSafeOrderId(normalizedBodyOrderId)) {
    return { ok: false as const, status: 400, message: INVALID_ORDER_ID_MESSAGE }
  }

  if (normalizedHeaderKey && normalizedBodyOrderId && normalizedHeaderKey !== normalizedBodyOrderId) {
    return { ok: false as const, status: 400, message: ORDER_ID_MISMATCH_MESSAGE }
  }

  return {
    ok: true as const,
    orderId: normalizedBodyOrderId || normalizedHeaderKey || safeOrderId(),
    idempotencyKey: normalizedHeaderKey,
  }
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
    publicOrderNumber: row.public_order_number,
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
    return res.status(429).json({ ok: false, message: RATE_LIMIT_MESSAGE })
  }

  const body = req.body as OrderRequest
  if (body.honeypot?.trim()) {
    logEvent('warn', 'orders.honeypot_rejected', { requestId, clientHash: clientKey })
    return res.status(200).json({ ok: true, orderId: safeOrderId(), receivedAt: new Date().toISOString(), spam: 'filtered' })
  }

  const customer = await authorizeOrderSubmit(extractBearerToken(req))
  if (!customer) {
    return res.status(401).json({ ok: false, message: CUSTOMER_UNAUTHORIZED_MESSAGE })
  }

  const orderIdentity = resolveOrderIdentity(body.orderId, getHeader(req, 'idempotency-key'))
  if (!orderIdentity.ok) {
    return res.status(orderIdentity.status).json({ ok: false, message: orderIdentity.message })
  }

  const validationError = validateOrder(body)
  if (validationError) return res.status(400).json({ ok: false, message: validationError })

  const projectLink = await resolveConstructorProjectLink(body.projectId, customer.userId)
  if (!projectLink.ok) {
    return res.status(projectLink.status).json({ ok: false, message: projectLink.message })
  }

  let orderBodyForPersistence: OrderRequest
  let pricingAttribution: OrderPricingAttribution | null = null
  try {
    const bodyWithOrderId = { ...body, orderId: orderIdentity.orderId }
    const productionExport = buildProductionExportFromPayload(bodyWithOrderId)
    const resolvedPricing = await calculateServerOrderPriceResolved({
      body: bodyWithOrderId,
      productionExport,
    })
    pricingAttribution = {
      catalog_source_used: resolvedPricing.catalogSourceUsed,
      pricing_source_diagnostic: resolvedPricing.source,
      pricing_fallback_reason: resolvedPricing.fallbackReason,
    }
    orderBodyForPersistence = withServerPrice(
      { ...bodyWithOrderId, productionExport },
      resolvedPricing.price,
    )
  } catch (error) {
    logEvent('error', 'orders.order_preparation_failed', { reason: safeErrorMessage(error) })
    return res.status(400).json({ ok: false, message: ORDER_PREPARATION_FAILED_MESSAGE })
  }

  const orderId = orderIdentity.orderId
  const idempotencyKey = orderIdentity.idempotencyKey
  const managerEmail = process.env.ORDER_MANAGER_EMAIL

  const publicNumberResult = await allocatePublicOrderNumber()
  if (!publicNumberResult.ok) {
    logEvent('error', 'orders.public_number_allocation_failed', { requestId, orderId, reason: publicNumberResult.error })
    return res.status(502).json({ ok: false, message: DB_INSERT_FAILED_MESSAGE })
  }

  try {
    const dbRecord = toOrderDbInsert({
      orderId,
      body: orderBodyForPersistence,
      userAgent: getHeader(req, 'user-agent'),
      clientIp: clientKey,
      pricingAttribution,
      userId: customer.userId,
      publicOrderNumber: publicNumberResult.value,
      constructorProjectId: projectLink.constructorProjectId,
    })

    if (idempotencyKey) {
      const existingOrder = await getOrderRecordByOrderId(orderId)
      if (!existingOrder.ok) {
        logEvent('error', 'orders.idempotency_read_failed', { requestId, orderId, reason: existingOrder.error })
        return res.status(502).json({ ok: false, message: GENERIC_ORDER_SUBMIT_FAILED })
      }

      if (existingOrder.row && isSameOrderPayload(dbRecord, existingOrder.row)) {
        logEvent('info', 'orders.idempotent_replay', { requestId, orderId })
        return res.status(200).json(buildReplayResponse(existingOrder.row))
      }

      if (existingOrder.row) {
        logEvent('warn', 'orders.idempotency_conflict', { requestId, orderId })
        return res.status(409).json({ ok: false, message: IDEMPOTENCY_CONFLICT_MESSAGE })
      }
    }

    const dbResult = await insertOrderRecord(dbRecord)
if (dbResult.ok === false) {
  const insertError = {
    error: dbResult.error,
    code: dbResult.code ?? null,
  }

  if (idempotencyKey && isDuplicateInsert(insertError)) {
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
      return res.status(502).json({ ok: false, message: DB_INSERT_FAILED_MESSAGE })
    }

    void maybeAutofillProfilePhoneFromOrder(customer.userId, orderBodyForPersistence.customer?.phone ?? '')

    let managerEmailStatus: 'sent' | 'skipped' | 'failed' = 'skipped'
    let customerEmailStatus: 'sent' | 'skipped' | 'failed' = 'skipped'
    let managerEmailError: string | null = null
    let customerEmailError: string | null = null

    if (managerEmail) {
      try {
        const result = await sendEmail(
          managerEmail,
          `Размерно — заявка ${orderId}`,
          buildManagerText(orderId, orderBodyForPersistence),
          buildManagerAttachments(orderId, orderBodyForPersistence),
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

    if (orderBodyForPersistence.customer?.email) {
      try {
        const result = await sendEmail(
          orderBodyForPersistence.customer.email,
          `Размерно — заявка ${orderId}`,
          buildClientText(orderId, orderBodyForPersistence),
        )
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
      publicOrderNumber: publicNumberResult.value,
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
