export function CheckoutSuccess({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  return (
    <div className="flex-1 px-5 md:px-6 py-8 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--rzm-surface-soft)] text-[var(--rzm-text-main)] grid place-items-center mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12.5l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--rzm-text-muted)] mb-2">
        Заявка отправлена
      </div>
      <h3 className="h-card text-[var(--rzm-text-main)]">Ваш шкаф собран</h3>
      <p className="mt-3 text-[14px] leading-[1.55] text-[var(--rzm-text-muted)] max-w-[340px]">
        Конфигурация сохранена. Мы проверим размеры, смету и детали перед запуском в работу.
      </p>

      <div className="mt-6 w-full max-w-[320px] bg-[var(--rzm-surface-soft)] rounded-[22px] p-4">
        <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--rzm-text-muted)] mb-1">
          Номер заявки
        </div>
        <div className="font-mono text-[18px] tabular-nums font-semibold text-[var(--rzm-text-main)] tracking-tight">
          {orderId}
        </div>
        <p className="mt-2 text-[12px] text-[var(--rzm-text-muted)] leading-snug">
          Сохраните номер: по нему менеджер быстро найдет вашу конфигурацию.
        </p>
      </div>

      <div className="mt-5 grid gap-2 text-left text-[12.5px] leading-snug text-[var(--rzm-text-muted)] max-w-[320px]">
        <div className="rounded-[16px] bg-white px-3.5 py-3">Письмо со сметой и номером заявки придет на email.</div>
        <div className="rounded-[16px] bg-white px-3.5 py-3">Менеджер позвонит, сверит спорные места и подскажет следующий шаг.</div>
      </div>

      <button type="button" onClick={onClose} className="btn btn-primary mt-7 focus-ring">
        Готово
      </button>
    </div>
  );
}
