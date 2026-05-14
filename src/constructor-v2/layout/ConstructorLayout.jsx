import ConstructorActions from "../components/ConstructorActions";
import ConstructorProgress from "../components/ConstructorProgress";
import ConstructorSummary from "../components/ConstructorSummary";
import ConstructorViewer from "../components/ConstructorViewer";
import "../styles/constructor-v2.css";

export default function ConstructorLayout() {
  return (
    <section className="rv2-shell">
      <ConstructorActions />

      <ConstructorProgress />

      <div className="rv2-grid">
        <aside className="rv2-sidebar">
          <div className="rv2-card">
            <span className="rv2-card-index">1</span>
            <h3>Размеры и секции</h3>
          </div>
        </aside>

        <ConstructorViewer />

        <ConstructorSummary />
      </div>
    </section>
  );
}
