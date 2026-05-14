const STEPS = [
  {
    id: "size",
    number: 1,
    title: "Размеры",
    subtitle: "Укажите габариты и секции",
  },
  {
    id: "fill",
    number: 2,
    title: "Наполнение",
    subtitle: "Полки, ящики и штанги",
  },
  {
    id: "materials",
    number: 3,
    title: "Материалы",
    subtitle: "Декоры и фурнитура",
  },
];

export default function ConstructorProgress({ activeStep, onStepChange }) {
  return (
    <div className="rv2-progress">
      {STEPS.map((step) => (
        <button
          key={step.id}
          type="button"
          className={activeStep === step.id ? "active" : ""}
          onClick={() => onStepChange(step.id)}
        >
          <b>{step.number}</b>
          <div>
            <strong>{step.title}</strong>
            <span>{step.subtitle}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
