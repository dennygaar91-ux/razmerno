import { InfoCard } from "../shared/InfoCard";
import { InfoCardGrid } from "../shared/InfoCardGrid";
import { SectionHeader } from "../shared/SectionHeader";

export function MeasurementsBasics() {
  return (
  <section className="rzm-info-section rzm-measurements-basics-v54">
    <SectionHeader
      variant="info"
      chip="Подготовка"
      title="Сначала подготовьте место и проверьте всё вокруг"
      lead="Хороший замер — это не только рулетка. Важно увидеть ограничения: стены, пол, плинтус, розетки и трубы."
    />
    <InfoCardGrid variant="three">
      <InfoCard
        marker="1"
        title="Рулетка"
        text="Измеряйте в миллиметрах. Не округляйте размеры до сантиметров на глаз."
      />
      <InfoCard
        marker="2"
        title="Место установки"
        text="Освободите участок, где будет мебель: так проще заметить перекосы, плинтус и выступы."
      />
      <InfoCard
        marker="3"
        title="Фото места"
        text="Снимите общий вид, углы, плинтус, трубы и розетки — менеджер сможет заранее увидеть ограничения."
      />
    </InfoCardGrid>
  </section>
  );
}
