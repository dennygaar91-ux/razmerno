import type React from "react";
import type { ValidationMessage } from "../context";
import { cn } from "../../utils/cn";

export function FieldMessages({ messages }: { messages: ValidationMessage[] }) {
  if (messages.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1.5">
      {messages.map((m, i) => (
        <li
          key={i}
          data-status={m.kind}
          className="rzm-status"
        >
          <span>{m.text}</span>
        </li>
      ))}
    </ul>
  );
}

export function AssemblyCue({
  items,
}: {
  items: Array<{ label: string; value: string; active?: boolean }>;
}) {
  return (
    <div className="rzm-assembly-cue" aria-label="Сборка по частям">
      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className={cn("rzm-assembly-cue-item", item.active && "is-active")}
        >
          <span className="rzm-assembly-cue-dot" aria-hidden="true" />
          <span className="rzm-assembly-cue-label">{item.label}</span>
          <span className="rzm-assembly-cue-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export function StepShell({
  title,
  description,
  children,
  onBack,
  onNext,
  nextLabel = "Далее",
  nextDisabled,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex flex-col h-full rzm-animate-in" data-configurator-step>
      <div className="mb-3.5 md:mb-4 px-1">
        <h2 className="font-display text-[22px] md:text-[24px] font-bold tracking-[-0.032em] leading-[1.06] text-[var(--rzm-text-main)]">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-[30rem] text-[13px] leading-[1.45] text-[var(--rzm-text-muted)]">
            {description}
          </p>
        )}
      </div>

      <div className="flex-1">{children}</div>

      <div className="hidden lg:flex mt-4 pt-3 items-center justify-between gap-3 border-t border-[var(--rzm-line-soft)]/70">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="btn btn-outline btn-sm focus-ring rzm-pressable"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Назад
          </button>
        ) : (
          <span />
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className={cn("btn btn-primary btn-sm focus-ring rzm-pressable", nextDisabled && "opacity-55 cursor-not-allowed")}
          >
            {nextLabel}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
