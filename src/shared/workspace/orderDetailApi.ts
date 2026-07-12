import type { CustomerOrderDetail, CustomerOrderDetailApiResult } from "./orderDetailTypes";

const DEFAULT_ORDER_DETAIL_API_URL = "/api/customer/order";

function getOrderDetailApiUrl(): string {
  const configured = import.meta.env.VITE_CUSTOMER_ORDER_DETAIL_API_URL?.trim();
  return configured || DEFAULT_ORDER_DETAIL_API_URL;
}

export async function fetchCustomerOrderDetail(
  accessToken: string,
  orderId: string,
): Promise<CustomerOrderDetailApiResult> {
  try {
    const response = await fetch(
      `${getOrderDetailApiUrl()}?id=${encodeURIComponent(orderId)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; order?: CustomerOrderDetail; message?: string }
      | null;

    if (!response.ok || !payload?.ok || !payload.order) {
      return {
        ok: false,
        status: response.status,
        message: payload?.message || "Не удалось загрузить заказ.",
      };
    }

    return { ok: true, data: payload.order };
  } catch {
    return { ok: false, message: "Сетевая ошибка при загрузке заказа." };
  }
}
