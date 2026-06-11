import { SectionHeader } from "../shared/SectionHeader";

export function MaterialsPalette() {
  return (
  <section className="rzm-info-section rzm-materials-palette-v55">
    <SectionHeader
      variant="info"
      chip="7 декоров"
      title="7 спокойных декоров"
      lead="Светлые, древесные и тёмные варианты без ярких мебельных акцентов."
    />
    <div className="rzm-materials-palette-layout">
      <div className="rzm-materials-palette-photo" aria-hidden="true">
        <img src="/assets/materials-palette-scene.jpeg" alt="" />
        <span>нейтральная палитра · спокойный интерьер</span>
      </div>
      <div className="rzm-material-swatches rzm-material-swatches--v55 rzm-reveal">
        <button className="rzm-material-swatch-card is-active">
          <span className="rzm-material-swatch rzm-material-swatch--white"></span>
          <strong>Белый матовый</strong>
          <small>база</small>
        </button>
        <button className="rzm-material-swatch-card">
          <span className="rzm-material-swatch rzm-material-swatch--lightwood"></span>
          <strong>Светлое дерево</strong>
          <small>тёплый</small>
        </button>
        <button className="rzm-material-swatch-card">
          <span className="rzm-material-swatch rzm-material-swatch--oak"></span>
          <strong>Тёплый дуб</strong>
          <small>тёплый</small>
        </button>
        <button className="rzm-material-swatch-card">
          <span className="rzm-material-swatch rzm-material-swatch--sand"></span>
          <strong>Песочный</strong>
          <small>нейтральный</small>
        </button>
        <button className="rzm-material-swatch-card">
          <span className="rzm-material-swatch rzm-material-swatch--graphite"></span>
          <strong>Графит</strong>
          <small>акцент</small>
        </button>
        <button className="rzm-material-swatch-card">
          <span className="rzm-material-swatch rzm-material-swatch--black"></span>
          <strong>Чёрный</strong>
          <small>акцент</small>
        </button>
        <button className="rzm-material-swatch-card">
          <span className="rzm-material-swatch rzm-material-swatch--gray"></span>
          <strong>Серый</strong>
          <small>нейтральный</small>
        </button>
      </div>
    </div>
  </section>
  );
}
