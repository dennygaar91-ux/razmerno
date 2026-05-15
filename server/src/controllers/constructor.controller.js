import { nanoid } from 'nanoid'
import { calculateEstimate } from '../services/estimate.service.js'
import { createOrderRecord, createProjectRecord, findProjectById } from '../services/projectStore.service.js'
import { validateOrderPayload, validateProjectPayload } from '../validators/constructor.validator.js'

export function getEstimate(req, res, next) {
  try {
    const project = validateProjectPayload(req.body)
    const result = calculateEstimate(project)
    res.json({ ok: true, ...result })
  } catch (error) {
    next(error)
  }
}

export function createOrder(req, res, next) {
  try {
    const payload = validateOrderPayload(req.body)
    const estimateResult = calculateEstimate(payload)
    const order = createOrderRecord({
      ...payload,
      estimate: estimateResult.estimate,
      serverWarnings: estimateResult.warnings,
      status: 'created',
      payment: {
        status: 'pending',
        paymentUrl: null,
      },
    })

    res.status(201).json({
      ok: true,
      orderId: order.orderId,
      status: order.status,
      payment: order.payment,
      managerReviewRequired: true,
      warnings: estimateResult.warnings,
    })
  } catch (error) {
    next(error)
  }
}

export function createProject(req, res, next) {
  try {
    const project = validateProjectPayload(req.body)
    const record = createProjectRecord(project)

    res.status(201).json({
      ok: true,
      projectId: record.projectId,
      updatedAt: record.updatedAt,
    })
  } catch (error) {
    next(error)
  }
}

export function getProject(req, res, next) {
  try {
    const project = findProjectById(req.params.projectId)

    if (!project) {
      res.status(404).json({ ok: false, code: 'PROJECT_NOT_FOUND', message: 'Project not found' })
      return
    }

    res.json({ ok: true, project })
  } catch (error) {
    next(error)
  }
}
