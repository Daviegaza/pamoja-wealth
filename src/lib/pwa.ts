/**
 * PWA bootstrap: register service worker and expose the install-prompt event.
 *
 * Call registerPwa() from src/main.tsx after React mounts.
 */
export function registerPwa(): void {
  if (typeof window === "undefined") return;
  // Dev-mode SW hijacks Vite HMR + navigation → login redirects break with
  // "Failed to convert value to 'Response'". Register only in prod. In dev
  // actively UNREGISTER any stale SW left over from a previous prod build.
  const isProd = import.meta.env.PROD;
  if ("serviceWorker" in navigator) {
    if (isProd) {
      navigator.serviceWorker.register("/service-worker.js").catch(() => {
        // Silent — SW is progressive enhancement.
      });
    } else {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const r of regs) r.unregister();
      }).catch(() => {});
    }
  }
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    (window as unknown as { __pamojaInstallPrompt?: Event }).__pamojaInstallPrompt = e;
  });
}

export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  const e = (window as unknown as { __pamojaInstallPrompt?: { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> } }).__pamojaInstallPrompt;
  if (!e) return "unavailable";
  await e.prompt();
  const choice = await e.userChoice;
  return choice.outcome;
}
