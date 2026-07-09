/**
 * Supabase JS client expects the project API root URL (https://<ref>.supabase.co),
 * not a REST path suffix. Misconfigured env values like .../rest/v1/ break RPC/table calls.
 */
export function normalizeSupabaseProjectUrl(raw: string | undefined): string | null {
  const trimmed = raw?.trim()
  if (!trimmed) return null

  const stripped = trimmed.replace(/\/rest\/v1\/?$/iu, "").replace(/\/+$/u, "")
  try {
    const parsed = new URL(stripped)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null
    return `${parsed.protocol}//${parsed.host}`
  } catch {
    return null
  }
}
