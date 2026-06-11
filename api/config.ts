import manifest from '../src/config/manifest.json'
import materials from '../src/config/materials.json'
import facadeStyles from '../src/config/facade-styles.json'
import hardware from '../src/config/hardware.json'
import furniturePresets from '../src/config/furniture-presets.json'
import fillingPresets from '../src/config/filling-presets.json'
import limits from '../src/config/limits.json'
import pricing from '../src/config/pricing.json'

type ServerlessRequest = {
  method?: string
  headers: Record<string, string | string[] | undefined>
}

type ServerlessResponse = {
  setHeader(name: string, value: string): void
  status(code: number): {
    json(payload: unknown): void
    end(): void
  }
}

const snapshot = {
  manifest,
  materials,
  facadeStyles,
  hardware,
  furniturePresets,
  fillingPresets,
  limits,
  pricing,
}

function etag(): string {
  return `"${manifest.configVersion}"`
}

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400')
  res.setHeader('ETag', etag())

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method not allowed' })

  const ifNoneMatch = req.headers['if-none-match']
  if (ifNoneMatch === etag()) return res.status(304).end()

  return res.status(200).json({
    ok: true,
    config: snapshot,
  })
}
