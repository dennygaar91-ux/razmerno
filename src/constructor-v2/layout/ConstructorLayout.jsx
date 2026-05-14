import { useEffect, useState } from "react";
import ConstructorActions from "../components/ConstructorActions";
import ConstructorProgress from "../components/ConstructorProgress";
import ConstructorSummary from "../components/ConstructorSummary";
import ConstructorViewer from "../components/ConstructorViewer";
import MobileConstructorBar from "../components/MobileConstructorBar";
import SizePanel from "../components/SizePanel";
import { useCabinetStore } from "../../store/cabinetStore";
import "../styles/constructor-v2.css";

function getItemCount(section, type) {
  return section?.items?.find((item) => item.type === type)?.count || 0;
}

export default function ConstructorLayout() {
  const [activeStep, setActiveStep] = useState("size");
  const [activeSectionId, setActiveSectionId] = useState(null);

  const {
    config,
    result,
    validation,
    updateDimensions,
    addSection,
    removeSection,
    autoDistributeSections,
    setSectionShelves,
    setSectionDrawers,
    setSectionHangerRails,
  } = useCabinetStore();

  const activeSection = config.sections.find((section) => section.id === activeSectionId) || config.sections[0];
  const price = result?.price?.total || 0;

  useEffect(() => {
    if (!activeSectionId && config.sections[0]?.id) {
      setActiveSectionId(config.sections[0].id);
    }
  }, [activeSectionId, config.sections]);

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

  function addShelf() {
    if (!activeSection) return;
    setSectionShelves(activeSection.id, Math.min(12, getItemCount(activeSection, "shelf") + 1));
  }

  function addDrawer() {
    if (!activeSection) return;
    setSectionDrawers(activeSection.id, Math.min(6, getItemCount(activeSection, "drawer") + 1));
  }

  function toggleRail() {
    if (!activeSection) return;
    const next = getItemCount(activeSection, "hanger_rail") > 0 ? 0 : 1;
    setSectionHangerRails(activeSection.id, next);
  }

  function clearActiveSection() {
    if (!activeSection) return;
    setSectionShelves(activeSection.id, 0);
    setSectionDrawers(activeSection.id, 0);
    setSectionHangerRails(activeSection.id, 0);
  }

  return (
    <>
      <section className="rv2-shell">
        <ConstructorActions />

        <ConstructorProgress
          activeStep={activeStep}
          onStepChange={setActiveStep}
        />

        <div className="rv2-grid">
          <SizePanel
            dimensions={config.dimensions}
            sections={config.sections}
            onUpdateDimension={updateDimensions}
            onSetSectionCount={setSectionCount}
          />

          <ConstructorViewer
            config={config}
            activeSectionId={activeSection?.id}
            onSelectSection={setActiveSectionId}
            onAddShelf={addShelf}
            onAddDrawer={addDrawer}
            onToggleRail={toggleRail}
            onClearSection={clearActiveSection}
          />

          <ConstructorSummary
            config={config}
            result={result}
            validation={validation}
          />
        </div>
      </section>

      <MobileConstructorBar
        price={price}
        dimensions={config.dimensions}
      />
    </>
  );
}
