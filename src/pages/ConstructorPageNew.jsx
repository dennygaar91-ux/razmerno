import Header from "../components/Header/Header";
import "../styles/constructor-rebuild-start.css";

export default function ConstructorPageNew() {
  return (
    <>
      <Header />
      <main className="constructor-rebuild-page">
        <section className="constructor-rebuild-shell" aria-label="Конструктор мебели">
          <span className="constructor-rebuild-eyebrow">Размерно · конструктор</span>
          <h1>Конструктор будет собран заново</h1>
          <p>
            Старый UI очищен. Следующим шагом собираем новую страницу конструктора по выбранному макету:
            чистый layout, спокойные панели, крупная модель, понятная цена и минимум визуального шума.
          </p>
        </section>
      </main>
    </>
  );
}
