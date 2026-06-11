import { InfoFooter } from "./shared/InfoFooter";
import { SiteHeader } from "./shared/SiteHeader";
import { MaterialsHero } from "./materials/MaterialsHero";
import { MaterialsPalette } from "./materials/MaterialsPalette";
import { MaterialsChoice } from "./materials/MaterialsChoice";
import { MaterialsHowToChoose } from "./materials/MaterialsHowToChoose";
import { MaterialsFinalCTA } from "./materials/MaterialsFinalCTA";

export default function MaterialsPage() {
  return (
    <>
      <SiteHeader activePage="materials" />
      <main className="rzm-info-main rzm-info-main--materials">
        <MaterialsHero />
        <MaterialsPalette />
        <MaterialsChoice />
        <MaterialsHowToChoose />
        <MaterialsFinalCTA />
      </main>
      <InfoFooter />
    </>
  );
}
