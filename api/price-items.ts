import { logEvent } from './_shared/logger'
import { fetchPriceItems } from './_shared/price-items-store'

type ServerlessRequest = {
  method?: string
  query?: Record<string, string | string[] | undefined>
}

type ServerlessResponse = {
  setHeader(name: string, value: string): void
  status(code: number): {
    json(payload: unknown): void
    end(): void
  }
}

function queryValue(req: ServerlessRequest, name: string): string | undefined {
  const value = req.query?.[name]
  return Array.isArray(value) ? value[0] : value
}

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600')

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' })
  }

  try {
    const result = await fetchPriceItems({
      itemType: queryValue(req, 'itemType'),
      producer: queryValue(req, 'producer'),
      thicknessMm: queryValue(req, 'thicknessMm') ? Number(queryValue(req, 'thicknessMm')) : undefined,
      limit: queryValue(req, 'limit') ? Number(queryValue(req, 'limit')) : 500,
    })

    return res.status(200).json({
      ok: true,
      source: result.source,
      count: result.items.length,
      items: result.items,
    })
  } catch (error) {
    logEvent('error', 'price_items.fetch_failed', {
      reason: error instanceof Error ? error.message : String(error),
    })
    return res.status(500).json({ ok: false, message: 'Не удалось получить прайс.' })
  }
}
