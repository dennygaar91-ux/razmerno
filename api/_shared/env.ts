export type EnvCheck = {
  name: string
  required: boolean
  present: boolean
  safeValue?: string
}

export type EnvReport = {
  ok: boolean
  runtime: string
  missing: string[]
  checks: EnvCheck[]
}

const REQUIRED_SERVER_ENV = [
  'ALLOWED_ORIGINS',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'ORDER_MANAGER_EMAIL',
  'MAIL_FROM',
  'ADMIN_API_KEY',
] as const

const OPTIONAL_SERVER_ENV = [
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
] as const

function safeValue(name: string, value: string | undefined): string | undefined {
  if (!value) return undefined
  if (name.includes('KEY') || name.includes('TOKEN') || name.includes('SECRET')) return '[set]'
  if (name.includes('EMAIL')) return '[set]'
  if (value.length > 80) return `${value.slice(0, 76)}...`
  return value
}

export function getRuntimeName(): string {
  return process.env.VERCEL_ENV || process.env.NODE_ENV || 'development'
}

export function getServerEnvReport(): EnvReport {
  const checks: EnvCheck[] = [
    ...REQUIRED_SERVER_ENV.map((name) => ({
      name,
      required: true,
      present: Boolean(process.env[name]),
      safeValue: safeValue(name, process.env[name]),
    })),
    ...OPTIONAL_SERVER_ENV.map((name) => ({
      name,
      required: false,
      present: Boolean(process.env[name]),
      safeValue: safeValue(name, process.env[name]),
    })),
  ]

  const missing = checks.filter((item) => item.required && !item.present).map((item) => item.name)

  return {
    ok: missing.length === 0,
    runtime: getRuntimeName(),
    missing,
    checks,
  }
}

export function assertServerEnvReady(): string[] {
  return getServerEnvReport().missing
}
