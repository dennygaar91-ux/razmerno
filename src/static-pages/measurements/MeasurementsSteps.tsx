import { InfoCard } from "../shared/InfoCard";
import { InfoCardGrid } from "../shared/InfoCardGrid";
import { SectionHeader } from "../shared/SectionHeader";

export function MeasurementsSteps() {
  return (
  <section className="rzm-info-section rzm-measurements-steps-v54">
    <SectionHeader
      variant="info"
      chip="Ширина / Высота / Глубина"
      title="Три размера, которые нужны конструктору"
      lead="В интерфейсе вы вводите основные габариты. Сложные места можно уточнить после заявки по фото."
    />
    <InfoCardGrid variant="three">
      <InfoCard
        marker="Ш"
        title="Ширина"
        text="Расстояние слева направо в месте установки. Проверьте сверху, по центру и снизу."
      />
      <InfoCard
        marker="В"
        title="Высота"
        text="Расстояние от пола до верхней границы мебели. Проверьте слева, по центру и справа."
      />
      <InfoCard
        marker="Г"
        title="Глубина"
        text="Расстояние от стены до переднего края мебели. Учтите проход, фасады и ручки."
      />
    </InfoCardGrid>
  </section>
  );
}
