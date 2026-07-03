import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());

// Stub matchMedia for jsdom.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// localStorage cleanup between tests.
Object.defineProperty(window, "localStorage", {
  writable: true,
  value: {
    store: {} as Record<string, string>,
    getItem(k: string) { return (this.store as Record<string, string>)[k] ?? null; },
    setItem(k: string, v: string) { (this.store as Record<string, string>)[k] = v; },
    removeItem(k: string) { delete (this.store as Record<string, string>)[k]; },
    clear() { (this as { store: Record<string, string> }).store = {}; },
    length: 0,
    key: () => null,
  },
});
