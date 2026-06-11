import { cn } from "../../utils/cn";

export function CheckoutField({
  label, value, onChange, error, type = "text", placeholder, autoComplete, required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[var(--rzm-text-main)] mb-1.5">
        {label}
        {required && <span className="text-[var(--rzm-error)] ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        className={cn(
          "w-full bg-white border outline-none rounded-[16px] h-12 px-4 text-[14px] transition-colors focus-ring",
          error ? "border-[var(--color-accent)]" : "border-[var(--rzm-line-soft)]/90 focus:border-[var(--rzm-text-main)]",
        )}
      />
      {error && (
        <div className="mt-1.5 text-[12px] text-[var(--rzm-error-ink)]" role="alert">{error}</div>
      )}
    </div>
  );
}
