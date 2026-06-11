import { InfoFooter } from "./shared/InfoFooter";
import { SiteHeader } from "./shared/SiteHeader";
import { MeasurementsHero } from "./measurements/MeasurementsHero";
import { MeasurementsBasics } from "./measurements/MeasurementsBasics";
import { MeasurementsHardPlaces } from "./measurements/MeasurementsHardPlaces";
import { MeasurementsSteps } from "./measurements/MeasurementsSteps";
import { MeasurementsMistakes } from "./measurements/MeasurementsMistakes";
import { MeasurementsChecklist } from "./measurements/MeasurementsChecklist";
import { MeasurementsFinalCTA } from "./measurements/MeasurementsFinalCTA";

export default function MeasurementsPage() {
  return (
    <>
      <SiteHeader activePage="measurements" />
      <main className="rzm-info-main rzm-info-main--measurements">
        <MeasurementsHero />
        <MeasurementsBasics />
        <MeasurementsHardPlaces />
        <MeasurementsSteps />
        <MeasurementsMistakes />
        <MeasurementsChecklist />
        <MeasurementsFinalCTA />
      </main>
      <InfoFooter />
    </>
  );
}
