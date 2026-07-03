import { Suspense, lazy, useEffect, useState } from "react";
import { trackPageView } from "./shared/lib/analytics";

const LazyHomePage = lazy(() => import("./static-pages/HomePage"));
const LazyMeasurementsPage = lazy(() => import("./static-pages/MeasurementsPage"));
const LazyMaterialsPage = lazy(() => import("./static-pages/MaterialsPage"));
const LazyAssemblyPage = lazy(() => import("./static-pages/AssemblyPage"));
const LazyConstructorPage = lazy(() => import("./static-pages/ConstructorPage"));
const LazyConstructor3DPage = lazy(() => import("./static-pages/Constructor3DPage"));
const LazyAccountPage = lazy(() => import("./static-pages/AccountPage"));

const LazyAdminOrdersPage = lazy(() =>
  import("./admin/AdminOrdersPage").then((m) => ({ default: m.AdminOrdersPage })),
);

interface LocationRoute {
  pathname: string;
  search: string;
  hash: string;
}

function readRoute(): LocationRoute {
  return {
    pathname: window.location.pathname || "/",
    search: window.location.search || "",
    hash: window.location.hash || "",
  };
}

function useBrowserRoute() {
  const [route, setRoute] = useState<LocationRoute>(() => readRoute());

  useEffect(() => {
    if (window.location.hash.startsWith("#/configurator")) {
      const hash = window.location.hash;
      const queryIndex = hash.indexOf("?");
      const query = queryIndex >= 0 ? hash.slice(queryIndex) : "";
      window.history.replaceState({}, "", `/configurator${query}`);
      setRoute(readRoute());
      return;
    }

    const onChange = () => setRoute(readRoute());
    window.addEventListener("popstate", onChange);
    window.addEventListener("hashchange", onChange);
    return () => {
      window.removeEventListener("popstate", onChange);
      window.removeEventListener("hashchange", onChange);
    };
  }, []);

  return route;
}

type StaticPageKey = "home" | "measurements" | "materials" | "assembly" | "constructor" | "constructorLegacy" | "account";

function resolveStaticPage(pathname: string): StaticPageKey {
  if (pathname === "/" || pathname === "/index.html") return "home" as const;
  if (pathname === "/account" || pathname === "/account/") return "account" as const;
  if (pathname === "/measurements" || pathname === "/measurements.html") return "measurements" as const;
  if (pathname === "/materials" || pathname === "/materials.html") return "materials" as const;
  if (pathname === "/assembly" || pathname === "/assembly.html") return "assembly" as const;
  if (pathname === "/constructor-legacy" || pathname === "/configurator-legacy") return "constructorLegacy" as const;
  if (
    pathname === "/configurator" ||
    pathname === "/constructor" ||
    pathname === "/constructor.html" ||
    pathname === "/configurator-3d" ||
    pathname === "/constructor-3d" ||
    pathname === "/constructor3d"
  ) return "constructor" as const;
  return "home" as const;
}

export default function App() {
  const route = useBrowserRoute();
  const isAdmin = route.pathname === "/admin" || route.pathname.startsWith("/admin/");

  useEffect(() => {
    const path = `${route.pathname}${route.search}${route.hash}`;
    trackPageView(path);

    if (isAdmin) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      return;
    }

    if (route.hash) {
      window.requestAnimationFrame(() => {
        const target = document.querySelector(route.hash);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [isAdmin, route.pathname, route.search, route.hash]);

  if (isAdmin) {
    return (
      <Suspense fallback={<Fallback />}>
        <LazyAdminOrdersPage routePath={route.pathname} />
      </Suspense>
    );
  }

  const staticPage = resolveStaticPage(route.pathname);
  const StaticPageComponent =
    staticPage === "measurements" ? LazyMeasurementsPage :
    staticPage === "materials" ? LazyMaterialsPage :
    staticPage === "assembly" ? LazyAssemblyPage :
    staticPage === "constructor" ? LazyConstructor3DPage :
    staticPage === "constructorLegacy" ? LazyConstructorPage :
    staticPage === "account" ? LazyAccountPage :
    LazyHomePage;

  return (
    <Suspense fallback={<Fallback />}>
      <StaticPageComponent />
    </Suspense>
  );
}


function Fallback() {
  return (
    <main className="min-h-screen bg-[#F4F4F8] text-[#2A2C41] grid place-items-center px-4">
      <div className="rounded-[32px] bg-white/70 px-6 py-5 text-center">
        <div className="text-[11px] tracking-[0.16em] uppercase text-[#73778D]">Размерно</div>
        <div className="mt-2 text-[24px] font-bold tracking-[-0.04em]">Загружаем страницу</div>
      </div>
    </main>
  );
}
