import { SectionHeader } from "../shared/SectionHeader";

const products = [
  {
    title: "Шкафы",
    text: "Для одежды, прихожей, спальни или отдельной ниши.",
    variant: "dark",
  },
  {
    title: "Комоды",
    text: "Та же модульная логика — больше ящиков и фасадов для хранения.",
    variant: "light",
  },
  {
    title: "Тумбы",
    text: "Компактный формат для спальни, прихожей или рабочего места.",
    variant: "wood",
  },
] as const;

export function HomeProducts() {
  return (
    <section className="rzm-home-section rzm-reveal" id="products" aria-label="Что можно создать">
      <SectionHeader
        chip="Что можно создать"
        title="Шкаф, тумба и комод под ваш размер"
        lead="Три формата работают по одной логике: простая форма, точные размеры, понятное наполнение и проверка перед заявкой."
      />
      <div className="rzm-showcase-card" aria-hidden="true">
        <img src="/assets/home-products-scene.jpeg" alt="" />
        <span className="rzm-ui-dot rzm-ui-dot--a"></span>
        <span className="rzm-ui-dot rzm-ui-dot--b"></span>
        <span className="rzm-ui-dot rzm-ui-dot--c"></span>
      </div>
      <div className="rzm-card-grid rzm-card-grid--three">
        {products.map((product) => (
          <article className="rzm-product-card" key={product.title}>
            <h3>{product.title}</h3>
            <p className="rzm-card-text">{product.text}</p>
            <span className={`rzm-product-swatch rzm-product-swatch--${product.variant}`} aria-hidden="true"></span>
          </article>
        ))}
      </div>
    </section>
  );
}
