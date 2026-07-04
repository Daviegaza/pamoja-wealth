/**
 * Environment flags shared across the app.
 *
 * USE_MOCKS is the single toggle that lets the frontend run without a
 * backend. In dev it defaults to `true` (most contributors don't have
 * `pamoja-wealth-backend` running locally). Set `VITE_USE_MOCKS=false`
 * explicitly to talk to a real backend.
 */
const _mocksEnv = import.meta.env.VITE_USE_MOCKS;
export const USE_MOCKS: boolean =
  _mocksEnv === "true" || (_mocksEnv === undefined && import.meta.env.DEV);
