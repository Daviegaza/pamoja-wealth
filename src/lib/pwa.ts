/**
 * PWA bootstrap: register service worker, request notification permission,
 * subscribe to push, expose install-prompt event.
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
  window.addEventListener("online", () => {
    navigator.serviceWorker?.ready?.then((reg) => {
      // TypeScript doesn't have sync in lib.dom.d.ts by default.
      (reg as unknown as { sync?: { register: (tag: string) => Promise<void> } }).sync?.register("pamoja-replay");
    });
  });

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

export async function subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  const reg = await navigator.serviceWorker.ready;
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return null;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
  });
  await fetch("/api/v1/push/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("pamoja_token") ?? ""}`,
    },
    body: JSON.stringify({ token: JSON.stringify(sub) }),
  });
  return sub;
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
}
