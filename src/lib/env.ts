/**
 * Environment flags shared across the app.
 *
 * Mock data is OFF by default and can never be enabled in a production
 * build: it requires BOTH a Vite dev server (`import.meta.env.DEV`) and an
 * explicit `VITE_USE_MOCKS=true`. The production bundle always talks to the
 * real backend.
 */
export function resolveUseMocks(env: { DEV?: boolean; VITE_USE_MOCKS?: string }): boolean {
  return env.DEV === true && env.VITE_USE_MOCKS === "true";
}

export const USE_MOCKS: boolean = resolveUseMocks({
  DEV: import.meta.env.DEV,
  VITE_USE_MOCKS: import.meta.env.VITE_USE_MOCKS,
});
