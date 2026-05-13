const DIMENSION_LIMITS = {
  height: { min: 200, max: 2800 },
  width: { min: 200, max: 3600 },
  depth: { min: 200, max: 900 },
};

function getDimensionKey(input) {
  const controls = Array.from(document.querySelectorAll(".cst-dimension-control"));
  const control = input.closest(".cst-dimension-control");
  const index = controls.indexOf(control);

  if (index === 0) return "height";
  if (index === 1) return "width";
  if (index === 2) return "depth";

  return null;
}

function emitInput(input) {
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function installConstructorInputGuard() {
  document.addEventListener(
    "input",
    (event) => {
      const input = event.target;

      if (!(input instanceof HTMLInputElement)) return;
      if (input.type !== "number") return;
      if (!input.closest(".cst-dimensions-grid")) return;

      const key = getDimensionKey(input);
      const limits = key ? DIMENSION_LIMITS[key] : null;
      if (!limits) return;

      const value = input.value;
      const numericValue = Number(value);

      if (value === "" || Number.isNaN(numericValue) || numericValue < limits.min) {
        event.stopImmediatePropagation();
      }
    },
    true
  );

  document.addEventListener(
    "blur",
    (event) => {
      const input = event.target;

      if (!(input instanceof HTMLInputElement)) return;
      if (input.type !== "number") return;
      if (!input.closest(".cst-dimensions-grid")) return;

      const key = getDimensionKey(input);
      const limits = key ? DIMENSION_LIMITS[key] : null;
      if (!limits) return;

      const numericValue = Number(input.value);

      if (!input.value || Number.isNaN(numericValue) || numericValue < limits.min) {
        input.value = String(limits.min);
        emitInput(input);
        return;
      }

      if (numericValue > limits.max) {
        input.value = String(limits.max);
        emitInput(input);
      }
    },
    true
  );
}

if (typeof window !== "undefined") {
  installConstructorInputGuard();
}
