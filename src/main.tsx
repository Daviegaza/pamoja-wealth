import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@/styles/globals.css";
import "@/i18n";
import { registerPwa } from "@/lib/pwa";
import { initSentry } from "@/lib/sentry";

registerPwa();
initSentry();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
