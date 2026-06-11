import { InfoFooter } from "./shared/InfoFooter";
import { SiteHeader } from "./shared/SiteHeader";
import { AssemblyHero } from "./assembly/AssemblyHero";
import { AssemblyKit } from "./assembly/AssemblyKit";
import { AssemblyTimeline } from "./assembly/AssemblyTimeline";
import { AssemblySupport } from "./assembly/AssemblySupport";
import { AssemblyFinalCTA } from "./assembly/AssemblyFinalCTA";

export default function AssemblyPage() {
  return (
    <>
      <SiteHeader activePage="assembly" />
      <main className="rzm-info-main rzm-info-main--assembly">
        <AssemblyHero />
        <AssemblyKit />
        <AssemblyTimeline />
        <AssemblySupport />
        <AssemblyFinalCTA />
      </main>
      <InfoFooter />
    </>
  );
}
