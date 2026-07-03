import { lazy, type ComponentType } from "react";

const RELOAD_KEY = "pw-chunk-reload";

function isChunkLoadError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Loading chunk") ||
    msg.includes("Loading CSS chunk") ||
    msg.includes("Importing a module script failed") ||
    msg.includes("error loading dynamically imported module")
  );
}

export function lazyWithRetry<T extends ComponentType<Record<string, unknown>>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      if (!isChunkLoadError(err)) throw err;

      await new Promise((r) => setTimeout(r, 500));
      try {
        return await factory();
      } catch (err2) {
        // Don't hard-reload — show a message to the user instead
        console.error("Chunk failed to load after retry:", err2);
        throw err2;
      }
    }
  });
}

if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    sessionStorage.removeItem(RELOAD_KEY);
  });
}
