import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@/styles/globals.css";
import { registerPwa } from "@/lib/pwa";
import { initSentry } from "@/lib/sentry";
import { initCapacitor } from "@/lib/capacitor-init";

registerPwa();
initCapacitor();
initSentry();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
