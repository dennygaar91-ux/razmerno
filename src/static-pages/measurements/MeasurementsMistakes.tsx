import { InfoCard } from "../shared/InfoCard";
import { InfoCardGrid } from "../shared/InfoCardGrid";
import { SectionHeader } from "../shared/SectionHeader";

export function MeasurementsMistakes() {
  return (
  <section className="rzm-info-section rzm-measurements-mistakes-v54">
    <SectionHeader
      variant="info"
      chip="Сложные места"
      title="Что лучше сфотографировать перед заявкой"
      lead="Фото помогает увидеть ограничения до запуска в работу и не заставляет вас описывать всё словами."
    />
    <InfoCardGrid variant="three">
      <InfoCard
        marker="1"
        title="Трубы и выступы"
        text="Снимите общий план и крупный фрагмент с рулеткой рядом, чтобы было понятно расстояние."
      />
      <InfoCard
        marker="2"
        title="Розетки и выключатели"
        text="Покажите расстояние от розетки до пола, угла и будущей мебели."
      />
      <InfoCard
        marker="3"
        title="Плинтус и углы"
        text="Покажите, будет ли плинтус мешать корпусу, и есть ли заметный перекос стены."
      />
    </InfoCardGrid>
  </section>
  );
}
