import { SiteHeader } from "./shared/SiteHeader";
import { HomeFAQ } from "./home/HomeFAQ";
import { HomeFinalCTA } from "./home/HomeFinalCTA";
import { HomeFooter } from "./home/HomeFooter";
import { HomeHero } from "./home/HomeHero";
import { HomeHow } from "./home/HomeHow";
import { HomeKit } from "./home/HomeKit";
import { HomeMaterialsSlider } from "./home/HomeMaterialsSlider";
import { HomeMeasurementsTeaser } from "./home/HomeMeasurementsTeaser";
import { HomeProducts } from "./home/HomeProducts";

export default function HomePage() {
  return (
    <>
      <SiteHeader activePage="home" />
      <main className="rzm-home-main">
        <HomeHero />
        <HomeHow />
        <HomeKit />
        <HomeProducts />
        <HomeMaterialsSlider />
        <HomeMeasurementsTeaser />
        <HomeFAQ />
        <HomeFinalCTA />
      </main>
      <HomeFooter />
    </>
  );
}
