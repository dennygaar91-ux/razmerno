import type { ReactNode } from "react";

export function AccordionPlusIcon({ open }: { open: boolean }) {
  return (
    <span
      className={`w-8 h-8 rounded-full bg-[var(--color-bg-soft)] grid place-items-center transition-transform ${
        open ? "rotate-45" : ""
      }`}
      aria-hidden="true"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function AccordionItem({
  id,
  open,
  onToggle,
  className,
  buttonClassName,
  children,
  panelClassName,
  panel,
}: {
  id: string;
  open: boolean;
  onToggle: () => void;
  className: string;
  buttonClassName: string;
  children: ReactNode;
  panelClassName: string;
  panel: ReactNode;
}) {
  return (
    <article className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className={buttonClassName}
      >
        {children}
      </button>
      {open && (
        <div id={id} className={panelClassName}>
          {panel}
        </div>
      )}
    </article>
  );
}
