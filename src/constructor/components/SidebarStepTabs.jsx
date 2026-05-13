const STEPS = [
  ["size", "Размеры"],
  ["fill", "Наполнение"],
  ["materials", "Материалы"],
];

export default function SidebarStepTabs({ activeStep, onStepChange }) {
  return (
    <div className="cp-steps">
      {STEPS.map(([id, label]) => (
        <button
          key={id}
          type="button"
          className={activeStep === id ? "active" : ""}
          onClick={() => onStepChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
