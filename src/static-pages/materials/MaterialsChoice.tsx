import { InfoCard } from "../shared/InfoCard";
import { InfoCardGrid } from "../shared/InfoCardGrid";
import { SectionHeader } from "../shared/SectionHeader";

export function MaterialsChoice() {
  return (
  <section className="rzm-info-section rzm-materials-choice-v55">
    <SectionHeader
      variant="info"
      chip="Как выбрать"
      title="Отталкивайтесь от света, размера комнаты и роли мебели"
      lead="Пользователь выбирает не артикул, а ощущение: легче, теплее или строже. Остальное можно уточнить после заявки."
    />
    <InfoCardGrid variant="three">
      <InfoCard
        marker="1"
        title="Светлее"
        text="Белый, светлое дерево и серый визуально облегчают мебель и подходят для небольших комнат."
      />
      <InfoCard
        marker="2"
        title="Теплее"
        text="Тёплый дуб и песочный добавляют мягкости и хорошо работают рядом с тёплым светом."
      />
      <InfoCard
        marker="3"
        title="Строже"
        text="Графит и чёрный лучше использовать как акцент: ТВ-зона, кабинет или минималистичный интерьер."
      />
    </InfoCardGrid>
  </section>
  );
}
