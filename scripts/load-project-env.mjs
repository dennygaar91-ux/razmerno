import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const DEFAULT_ENV_FILES = ['.env', '.env.local', '.env.production', '.env.production.local']

function parseEnvLine(line) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return null

  const eqIndex = trimmed.indexOf('=')
  if (eqIndex <= 0) return null

  const key = trimmed.slice(0, eqIndex).trim()
  let value = trimmed.slice(eqIndex + 1).trim()
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1)
  }

  return { key, value }
}

export function loadProjectEnvFiles(files = DEFAULT_ENV_FILES, root = process.cwd()) {
  const loadedFiles = []

  for (const file of files) {
    const path = resolve(root, file)
    if (!existsSync(path)) continue

    const content = readFileSync(path, 'utf8')
    for (const line of content.split(/\r?\n/u)) {
      const parsed = parseEnvLine(line)
      if (!parsed) continue
      if (parsed.key === 'SUPABASE_URL') {
        parsed.value = parsed.value.replace(/\/rest\/v1\/?$/iu, '').replace(/\/+$/u, '')
      }
      if (process.env[parsed.key] === undefined || process.env[parsed.key] === '') {
        process.env[parsed.key] = parsed.value
      }
    }

    loadedFiles.push(file)
  }

  return loadedFiles
}

export function getEnvPresenceReport(keys) {
  return keys.map((name) => ({
    name,
    present: Boolean(process.env[name]?.trim()),
  }))
}
