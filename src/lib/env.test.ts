import { describe, expect, it } from "vitest";
import { resolveUseMocks } from "./env";

describe("resolveUseMocks", () => {
  it("is off when the flag is not set", () => {
    expect(resolveUseMocks({ DEV: true })).toBe(false);
    expect(resolveUseMocks({ DEV: true, VITE_USE_MOCKS: undefined })).toBe(false);
  });

  it("can never be on in a production build", () => {
    expect(resolveUseMocks({ DEV: false, VITE_USE_MOCKS: "true" })).toBe(false);
  });

  it("requires an explicit 'true' in dev", () => {
    expect(resolveUseMocks({ DEV: true, VITE_USE_MOCKS: "1" })).toBe(false);
    expect(resolveUseMocks({ DEV: true, VITE_USE_MOCKS: "true" })).toBe(true);
  });
});
