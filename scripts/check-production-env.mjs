const requiredServerEnv = [
  'ORDER_MANAGER_EMAIL',
  'RESEND_API_KEY',
  'MAIL_FROM',
  'ALLOWED_ORIGINS',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
]

const requiredClientEnv = [
  'VITE_YM_ID',
]

const expectedOrigin = 'https://razmerno.ru'
const mode = process.env.CHECK_ENV_MODE ?? 'local'
let ok = true

function fail(message) {
  console.error(`✗ ${message}`)
  ok = false
}

function pass(message) {
  console.log(`✓ ${message}`)
}

function hasValue(name) {
  return typeof process.env[name] === 'string' && process.env[name].trim().length > 0
}

if (mode === 'production') {
  for (const name of requiredServerEnv) {
    if (!hasValue(name)) fail(`missing production env: ${name}`)
    else pass(`${name} is set`)
  }

  for (const name of requiredClientEnv) {
    if (!hasValue(name)) fail(`missing production client env: ${name}`)
    else pass(`${name} is set`)
  }

  const origins = (process.env.ALLOWED_ORIGINS ?? '').split(',').map((item) => item.trim()).filter(Boolean)
  if (!origins.includes(expectedOrigin)) {
    fail(`ALLOWED_ORIGINS must include ${expectedOrigin}`)
  } else {
    pass(`ALLOWED_ORIGINS includes ${expectedOrigin}`)
  }

  if ((process.env.MAIL_FROM ?? '').includes('onboarding@resend.dev')) {
    fail('MAIL_FROM must not use onboarding@resend.dev in production')
  }

  if ((process.env.VITE_USE_MOCK_API ?? '') === '1' || (process.env.VITE_USE_MOCK_API ?? '') === 'true') {
    fail('VITE_USE_MOCK_API must be disabled in production')
  }

  if (!ok) process.exit(1)
  console.log('Production env checks passed.')
} else {
  pass('production env presence check skipped in local mode')
  pass('run with CHECK_ENV_MODE=production in CI/Vercel preflight')
  console.log('Production env check script is installed.')
}
