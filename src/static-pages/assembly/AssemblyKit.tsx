import { InfoCard } from "../shared/InfoCard";
import { InfoCardGrid } from "../shared/InfoCardGrid";
import { SectionHeader } from "../shared/SectionHeader";

export function AssemblyKit() {
  return (
  <section className="rzm-info-section rzm-assembly-kit-v56">
    <SectionHeader
      variant="info"
      chip="Комплект"
      title="Что приезжает в комплекте"
      lead="Детали, крепёж, фурнитура и инструкция собраны под вашу конфигурацию."
    />
    <div className="rzm-assembly-kit-layout">
      <div className="rzm-assembly-kit-photo" aria-hidden="true">
        <img src="/assets/assembly-kit-flatlay.jpeg" alt="" />
        <span>детали · крепёж · инструкция</span>
      </div>
      <InfoCardGrid variant="three">
        <InfoCard
          marker="1"
          title="Детали корпуса"
          text="Панели под выбранный размер и наполнение."
        />
        <InfoCard
          marker="2"
          title="Крепёж и фурнитура"
          text="Крепления и элементы под вашу конфигурацию."
        />
        <InfoCard
          marker="3"
          title="Инструкция"
          text="Сборка идёт от корпуса к наполнению и фасадам."
        />
      </InfoCardGrid>
    </div>
  </section>
  );
}
