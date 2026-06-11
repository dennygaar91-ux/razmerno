import type React from "react";

export function CheckoutSummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start justify-between gap-3 text-[12.5px]">
      <span className="text-[var(--rzm-text-muted)]">{label}</span>
      <span className="text-[var(--rzm-text-main)] text-right">{children}</span>
    </li>
  );
}
