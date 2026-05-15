import { Router } from 'express'
import { createOrder, createProject, getEstimate, getProject } from '../controllers/constructor.controller.js'

const router = Router()

router.post('/estimate', getEstimate)
router.post('/orders', createOrder)
router.post('/projects', createProject)
router.get('/projects/:projectId', getProject)

export default router
