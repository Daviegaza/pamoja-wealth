/**
 * Offline / queue banner.
 *
 * - Shows a red bar while offline (network:offline event).
 * - When back online, shows a transient green "syncing" bar for 2s, then
 *   fires the service-worker Background Sync tag `pamoja-replay` so any
 *   queued mutations flush.
 *
 * Mounted once at App root — near-zero cost when online.
 */
import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export function OfflineBanner() {
  const [online, setOnline] = useState<boolean>(typeof navigator === "undefined" ? true : navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    function goOffline() { setOnline(false); }
    function goOnline() {
      setOnline(true);
      setSyncing(true);
      navigator.serviceWorker?.ready?.then((reg) => {
        (reg as unknown as { sync?: { register: (tag: string) => Promise<void> } }).sync?.register("pamoja-replay").catch(() => { /* ignore */ });
      });
      setTimeout(() => setSyncing(false), 2000);
    }
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (online && !syncing) return null;

  return (
    <div
      className={`fixed top-0 inset-x-0 z-[200] px-4 py-2 text-center text-xs font-semibold text-white ${online ? "bg-emerald-600" : "bg-red-600"}`}
      role="status"
      aria-live="polite"
    >
      {online ? (
        <span className="inline-flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Reconnected — syncing queued actions
        </span>
      ) : (
        <span className="inline-flex items-center gap-2">
          <WifiOff className="h-3.5 w-3.5" /> Offline — your contributions will be sent when you reconnect
        </span>
      )}
    </div>
  );
}
