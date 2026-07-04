/**
 * Sentry init — frontend.
 *
 * Dynamic import so app builds and runs without `@sentry/react` installed.
 * Only activates when VITE_SENTRY_DSN is set AND the package is present.
 *
 * Install:
 *   npm i @sentry/react
 *
 * Env:
 *   VITE_SENTRY_DSN=https://...ingest.sentry.io/...
 *   VITE_SENTRY_TRACES_RATE=0.1
 *   VITE_SENTRY_ENV=production
 */

let sentryModule: unknown = null;

export async function initSentry(): Promise<void> {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;
  try {
    // Compute the specifier so Vite's static import-analysis can't resolve it
    // at dev-server time (that's the source of "Failed to resolve import"
    // when @sentry/react is not installed). Runtime import still works when
    // the package is installed.
    const pkg = "@sentry" + "/react";
    const mod = await import(/* @vite-ignore */ pkg);
    const Sentry = mod as unknown as {
      init: (opts: Record<string, unknown>) => void;
      captureException: (err: unknown) => void;
      browserTracingIntegration?: () => unknown;
    };
    Sentry.init({
      dsn,
      environment: (import.meta.env.VITE_SENTRY_ENV as string) ?? import.meta.env.MODE,
      tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_RATE ?? 0.1),
      integrations: Sentry.browserTracingIntegration ? [Sentry.browserTracingIntegration()] : [],
    });
    sentryModule = Sentry;
    console.info("[sentry] initialised");
  } catch (err) {
    console.warn("[sentry] init failed — install @sentry/react to enable:", err);
  }
}

export function captureError(err: unknown): void {
  const s = sentryModule as { captureException?: (e: unknown) => void } | null;
  if (s?.captureException) s.captureException(err);
  else console.error("captureError (no Sentry):", err);
}
