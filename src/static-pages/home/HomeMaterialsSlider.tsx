import { bodyMaterials } from "../../shared/materials/materialCatalog";
import { SectionHeader } from "../shared/SectionHeader";

export function HomeMaterialsSlider() {
  return (
    <section className="rzm-home-section rzm-reveal" id="materials-preview" aria-label="Материалы и декоры">
      <SectionHeader
        chip="Материалы"
        title="Выберите декор под интерьер"
        lead="На главной показываем базовые ЛДСП-декоры для корпуса. В конструкторе фасады можно выбрать из ЛДСП 16 мм или МДФ 18 мм."
      />
      <div className="rzm-material-slider" aria-label="Доступные декоры корпуса">
        {bodyMaterials.map((material, index) => (
          <article className={`rzm-material-card ${index === 0 ? "is-active" : ""}`} key={material.id}>
            <span
              className="rzm-material-surface rzm-material-surface--texture"
              style={{ backgroundColor: material.fallbackHex, backgroundImage: `url(${material.textureUrl})` }}
              aria-hidden="true"
            />
            <span className="rzm-material-name">{material.name}</span>
            <span className="rzm-material-note">ЛДСП {material.thicknessMm} мм · {material.code}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
