/**
 * Environment flags shared across the app.
 *
 * USE_MOCKS is the single toggle that lets the frontend run without a
 * backend. In dev it defaults to `false` so the app talks to a real backend.
 * Set `VITE_USE_MOCKS=true` to run with mock data (useful for UI development
 * or when the backend isn't available).
 */
const _mocksEnv = import.meta.env.VITE_USE_MOCKS;
export const USE_MOCKS: boolean =
  _mocksEnv === "true";
