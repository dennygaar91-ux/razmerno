import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/base.css";
import "./styles/header.css";
import "./index.css";
import "./styles/info-pages.css";
import "./styles/constructor.css";
import "./styles/constructor3d.css";
import App from "./App";
import { AppErrorBoundary } from "./shared/components/AppErrorBoundary";
import { initYandexMetrika } from "./shared/lib/analytics";

initYandexMetrika();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>
);
