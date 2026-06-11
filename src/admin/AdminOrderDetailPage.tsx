import type { AdminProductionDetail, ProductionReviewStatus } from "./types";
import { ProductionReviewPanel } from "./ProductionReviewPanel";

export function AdminOrderDetailPage({
  orderId,
  detail,
  status,
  note,
  loading,
  onStatusChange,
  onNoteChange,
  onSave,
  onClose,
}: {
  orderId: string;
  detail: AdminProductionDetail | null;
  status: ProductionReviewStatus;
  note: string;
  loading: boolean;
  onStatusChange: (value: ProductionReviewStatus) => void;
  onNoteChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <section className="mt-6">
      <div className="rzm-card-soft p-4 md:p-5">
        <div className="eyebrow mb-2">Admin order detail</div>
        <h2 className="font-display text-[26px] md:text-[34px] font-bold tracking-[-0.04em] leading-[1]">
          Заявка {orderId}
        </h2>
        <p className="mt-2 text-[14px] leading-[1.55] text-[var(--rzm-text-muted)]">
          Отдельный detail foundation для production-проверки. Клиент эту страницу не видит.
        </p>
      </div>

      <ProductionReviewPanel
        orderId={orderId}
        detail={detail}
        status={status}
        note={note}
        loading={loading}
        onStatusChange={onStatusChange}
        onNoteChange={onNoteChange}
        onSave={onSave}
        onClose={onClose}
      />
    </section>
  );
}
