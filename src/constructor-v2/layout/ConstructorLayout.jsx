import ConstructorActions from "../components/ConstructorActions";
import ConstructorProgress from "../components/ConstructorProgress";
import ConstructorSummary from "../components/ConstructorSummary";
import ConstructorViewer from "../components/ConstructorViewer";
import SizePanel from "../components/SizePanel";
import "../styles/constructor-v2.css";

export default function ConstructorLayout() {
  return (
    <section className="rv2-shell">
      <ConstructorActions />

      <ConstructorProgress />

      <div className="rv2-grid">
        <SizePanel />

        <ConstructorViewer />

        <ConstructorSummary />
      </div>
    </section>
  );
}
