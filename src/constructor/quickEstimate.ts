import { getEstimate } from './pricing'
import { createDefaultProject, type ConstructorProject, type Dimensions } from './schema'
import { normalizeProject } from './normalize'

/**
 * Builds the same baseline project that the constructor prices.
 * Keeps landing estimates aligned with the real constructor engine.
 */
export function createQuickEstimateProject(dimensions: Partial<Dimensions>): ConstructorProject {
  const defaults = createDefaultProject()

  return normalizeProject({
    ...defaults,
    dimensions: {
      ...defaults.dimensions,
      ...dimensions,
    },
  })
}

/** Returns the real constructor estimate for a baseline project with the provided dimensions. */
export function getQuickEstimate(dimensions: Partial<Dimensions>): ReturnType<typeof getEstimate> {
  return getEstimate(createQuickEstimateProject(dimensions))
}
