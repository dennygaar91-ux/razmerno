import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/tokens.css";
import "./styles/atoms.css";
import "./styles/constructor-layout-overrides.css";
import "./styles/constructor-viewport-polish.css";
import "./styles/constructor-fill-polish.css";
import "./styles/constructor-step-flow.css";
import "./styles/constructor-commercial-polish.css";
import "./styles/constructor-quick-fixes.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
