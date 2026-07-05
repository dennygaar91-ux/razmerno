const OPERATIONS_ORDER_ID_PATTERN = /^RZ-\d{8}-\d{4}$/;

export function buildOperationsOrderDetailPath(orderId: string): string {
  return `/operations/orders/${orderId}`;
}

export function parseOperationsRouteOrderId(pathname: string): string | null {
  const match = pathname.match(/^\/operations\/orders\/(RZ-\d{8}-\d{4})$/);
  const orderId = match?.[1] ?? null;
  if (!orderId || !OPERATIONS_ORDER_ID_PATTERN.test(orderId)) return null;
  return orderId;
}

export function isOperationsRoute(pathname: string): boolean {
  return pathname === "/operations" || pathname === "/operations/" || pathname.startsWith("/operations/");
}
