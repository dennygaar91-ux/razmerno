#!/usr/bin/env node

const baseUrl = process.env.SMOKE_BASE_URL || process.argv[2]
const adminKey = process.env.ADMIN_API_KEY || process.env.SMOKE_ADMIN_API_KEY || ''

if (!baseUrl) {
  console.error('SMOKE_BASE_URL is required, e.g. https://razmerno.ru')
  process.exit(1)
}

const normalizedBase = baseUrl.replace(/\/$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${normalizedBase}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })

  const text = await response.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = { raw: text.slice(0, 500) }
  }

  return { response, json }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function main() {
  const results = []

  const health = await request('/api/health')
  results.push({ name: 'health', status: health.response.status, ok: health.response.ok })
  assert([200, 503].includes(health.response.status), `Unexpected health status ${health.response.status}`)

  if (adminKey) {
    const adminOrders = await request('/api/admin/orders?limit=5', {
      headers: { Authorization: `Bearer ${adminKey}` },
    })
    results.push({ name: 'admin-orders', status: adminOrders.response.status, ok: adminOrders.response.ok })
    assert(adminOrders.response.status !== 401, 'Admin orders returned 401 with provided key')
    assert(adminOrders.response.status !== 500, 'Admin orders returned 500')
  } else {
    const adminOrders = await request('/api/admin/orders?limit=1')
    results.push({ name: 'admin-orders-unauthorized', status: adminOrders.response.status, ok: adminOrders.response.ok })
    assert(adminOrders.response.status === 401 || adminOrders.response.status === 500, 'Admin orders should not be open without key')
  }

  console.log(JSON.stringify({ ok: true, baseUrl: normalizedBase, results }, null, 2))
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, message: error instanceof Error ? error.message : String(error) }, null, 2))
  process.exit(1)
})
