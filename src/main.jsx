import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/tokens.css";
import "./styles/atoms.css";
import "./styles/constructor-layout-overrides.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
