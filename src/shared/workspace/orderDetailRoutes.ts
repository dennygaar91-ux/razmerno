const ORDER_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function buildAccountOrderUrl(orderId: string): string {
  return `/account/order/${encodeURIComponent(orderId)}`;
}

export function parseAccountOrderIdFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/account\/order\/([^/]+)\/?$/);
  const orderId = match?.[1]?.trim();
  if (!orderId || !ORDER_ID_PATTERN.test(orderId)) return null;
  return orderId;
}
