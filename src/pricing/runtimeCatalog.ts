import type { RawPriceItem } from "./types";

export interface RuntimePriceItemsResponse {
  ok: boolean;
  source?: "supabase" | "seed";
  count?: number;
  items?: RawPriceItem[];
  message?: string;
}

export async function loadRuntimePriceItems(params: {
  itemType?: string;
  producer?: string;
  thicknessMm?: number;
  limit?: number;
} = {}): Promise<RuntimePriceItemsResponse> {
  const query = new URLSearchParams();
  if (params.itemType) query.set("itemType", params.itemType);
  if (params.producer) query.set("producer", params.producer);
  if (params.thicknessMm !== undefined) query.set("thicknessMm", String(params.thicknessMm));
  if (params.limit !== undefined) query.set("limit", String(params.limit));

  const res = await fetch(`/api/price-items${query.size > 0 ? `?${query.toString()}` : ""}`);
  const data = (await res.json()) as RuntimePriceItemsResponse;
  if (!res.ok) {
    throw new Error(data.message ?? `HTTP ${res.status}`);
  }
  return data;
}
