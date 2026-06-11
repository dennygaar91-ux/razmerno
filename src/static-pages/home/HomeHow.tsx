import { SectionHeader } from "../shared/SectionHeader";

const steps = [
  {
    title: "Задайте размеры",
    text: "Укажите ширину, высоту и глубину в миллиметрах — без чертежей и сложных схем.",
    href: "/measurements",
    variant: "measure",
  },
  {
    title: "Добавьте наполнение",
    text: "Соберите секции, полки, ящики и штангу под свои вещи.",
    href: "/configurator",
    variant: "modules",
  },
  {
    title: "Выберите декор",
    text: "Подберите спокойный оттенок корпуса и фасадов под интерьер.",
    href: "/materials",
    variant: "materials",
  },
  {
    title: "Отправьте заявку",
    text: "Менеджер проверит проект, уточнит детали и согласует запуск.",
    href: "/configurator",
    variant: "request",
  },
] as const;

export function HomeHow() {
  return (
    <section className="rzm-home-section rzm-reveal" id="how" aria-label="Как это работает">
      <SectionHeader
        chip="Как это работает"
        title="От размера до заявки — четыре шага"
        lead="Короткий путь: габариты, наполнение, декор и заявка на проверку. Сложную производственную логику берём на себя."
      />
      <div className="rzm-card-grid rzm-card-grid--four">
        {steps.map((step, index) => (
          <a className="rzm-process-card" href={step.href} key={step.title} aria-label={step.title}>
            <span className="rzm-card-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="rzm-card-arrow">↗</span>
            <span className={`rzm-card-visual rzm-card-visual--${step.variant}`} aria-hidden="true">
              <i></i><i></i><i></i>
            </span>
            <h3>{step.title}</h3>
            <p className="rzm-card-text">{step.text}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
