import { SectionHeader } from "../shared/SectionHeader";

const kitItems = [
  {
    title: "Детали по размеру",
    text: "Панели под выбранный формат, габариты, секции и декор.",
  },
  {
    title: "Фурнитура и крепёж",
    text: "Крепления и механизмы под выбранные полки, ящики и фасады.",
  },
  {
    title: "Понятная инструкция",
    text: "Порядок сборки без производственных чертежей и лишней терминологии.",
  },
] as const;

export function HomeKit() {
  return (
    <section className="rzm-home-section rzm-reveal" id="kit" aria-label="Что получите в комплекте">
      <SectionHeader
        chip="Что получите"
        title="В заказ приезжает готовый комплект для сборки"
        lead="После проверки проекта детали, фурнитура и инструкция собираются под ваши размеры и выбранное наполнение."
      />
      <div className="rzm-split-block">
        <div className="rzm-media-card" aria-hidden="true">
          <img src="/assets/home-kit-flatlay.jpeg" alt="" />
          <span className="rzm-ui-marker rzm-ui-marker--dark">детали · фурнитура · инструкция</span>
        </div>
        <div className="rzm-feature-list">
          {kitItems.map((item, index) => (
            <article className="rzm-feature-card" key={item.title}>
              <span className="rzm-card-number">{index + 1}</span>
              <h3>{item.title}</h3>
              <p className="rzm-card-text">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
