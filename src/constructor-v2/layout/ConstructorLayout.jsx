import ConstructorActions from "../components/ConstructorActions";
import ConstructorProgress from "../components/ConstructorProgress";
import ConstructorSummary from "../components/ConstructorSummary";
import ConstructorViewer from "../components/ConstructorViewer";
import SizePanel from "../components/SizePanel";
import { useCabinetStore } from "../../store/cabinetStore";
import "../styles/constructor-v2.css";

export default function ConstructorLayout() {
  const {
    config,
    result,
    validation,
    updateDimensions,
    addSection,
    removeSection,
    autoDistributeSections,
  } = useCabinetStore();

  function setSectionCount(nextCount) {
    const safeCount = Math.max(1, Math.min(6, nextCount));
    const currentCount = config.sections.length;

    if (safeCount === currentCount) return;

    if (safeCount > currentCount) {
      for (let index = currentCount; index < safeCount; index += 1) addSection();
    } else {
      config.sections.slice(safeCount).forEach((section) => removeSection(section.id));
    }

    autoDistributeSections();
  }

  return (
    <section className="rv2-shell">
      <ConstructorActions />

      <ConstructorProgress />

      <div className="rv2-grid">
        <SizePanel
          dimensions={config.dimensions}
          sections={config.sections}
          onUpdateDimension={updateDimensions}
          onSetSectionCount={setSectionCount}
        />

        <ConstructorViewer config={config} />

        <ConstructorSummary
          config={config}
          result={result}
          validation={validation}
        />
      </div>
    </section>
  );
}
