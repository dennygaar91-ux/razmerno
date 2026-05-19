import { apiPost, shouldUseMockApi } from './constructorApiClient'
import { buildBasisExportContract } from '../utils/constructorContracts'

function createMockBasisFileName(contract) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return `razmerno-${contract.project.productSubtype}-${timestamp}.json`
}

async function createMockBasisExport(project) {
  await new Promise(resolve => setTimeout(resolve, 260))

  const contract = buildBasisExportContract(project)

  return {
    ok: true,
    exportId: contract.requestId,
    status: 'ready_for_local_basis_script',
    fileName: createMockBasisFileName(contract),
    mimeType: 'application/json',
    contract,
    notes: [
      'MVP export is JSON for a local Basis-Mebelshchik script.',
      'Future backend worker can turn this contract into .b3d/.fr3d files.',
    ],
  }
}

export async function exportConstructorProjectToBasis(project) {
  if (shouldUseMockApi()) {
    return createMockBasisExport(project)
  }

  return apiPost('/api/constructor/basis-export', buildBasisExportContract(project))
}

export function downloadBasisExportJson(exportResult) {
  if (!exportResult?.contract || typeof window === 'undefined') return false

  const blob = new Blob([JSON.stringify(exportResult.contract, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = exportResult.fileName || 'razmerno-basis-export.json'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)

  return true
}
