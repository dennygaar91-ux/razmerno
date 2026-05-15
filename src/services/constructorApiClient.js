const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'

export function shouldUseMockApi() {
  return USE_MOCK_API || !API_BASE_URL
}

export async function apiPost(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(data?.message ?? 'API request failed')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`)
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(data?.message ?? 'API request failed')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}
