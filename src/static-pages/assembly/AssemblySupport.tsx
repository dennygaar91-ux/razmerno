import { InfoCard } from "../shared/InfoCard";
import { InfoCardGrid } from "../shared/InfoCardGrid";
import { SectionHeader } from "../shared/SectionHeader";

export function AssemblySupport() {
  return (
  <section className="rzm-info-section rzm-assembly-support-v56">
    <SectionHeader
      variant="info"
      chip="Если что-то не сходится"
      title="Если что-то не сходится — уточните"
      lead="Не сверлите и не подпиливайте детали самостоятельно. Лучше сфотографировать место и написать менеджеру."
    />
    <InfoCardGrid variant="two">
      <InfoCard
        marker="1"
        title="Деталь не подходит"
        text="Сфотографируйте деталь, маркировку и место сборки."
      />
      <InfoCard
        marker="2"
        title="Не хватает крепежа"
        text="Напишите, какого элемента не хватает."
      />
    </InfoCardGrid>
  </section>
  );
}
