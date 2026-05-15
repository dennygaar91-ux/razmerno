import { apiPost, shouldUseMockApi } from './constructorApiClient'
import { calculatePrice, getPriceBreakdown, getProjectSummary, getWarnings } from '../utils/constructorPricing'

async function createMockEstimate(project) {
  await new Promise(resolve => setTimeout(resolve, 220))

  const summary = getProjectSummary(project)
  const breakdown = getPriceBreakdown(project, summary)
  const total = calculatePrice(project, summary)
  const warnings = getWarnings(project, summary)

  return {
    ok: true,
    estimate: {
      total,
      currency: 'RUB',
      breakdown,
    },
    summary,
    warnings,
  }
}

export async function calculateConstructorEstimate(project) {
  if (shouldUseMockApi()) {
    return createMockEstimate(project)
  }

  return apiPost('/api/constructor/estimate', project)
}
