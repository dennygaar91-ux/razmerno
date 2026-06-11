import { furnitureOptions } from "../options";
import type { FurnitureKey } from "../types";

export function FurnitureTypeSwitch({
  value,
  onChange,
}: {
  value: FurnitureKey;
  onChange: (value: FurnitureKey) => void;
}) {
  return (
    <div className="rzm-furniture-type-switcher" aria-label="Тип мебели">
      {furnitureOptions.map((option) => (
        <button
          key={option.key}
          className={`rzm-furniture-type-btn ${value === option.key ? "is-active" : ""}`}
          type="button"
          aria-pressed={value === option.key}
          onClick={() => onChange(option.key)}
        >
          {value === option.key ? (
            <span className="rzm-furniture-type-check" aria-hidden="true">✓</span>
          ) : null}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
