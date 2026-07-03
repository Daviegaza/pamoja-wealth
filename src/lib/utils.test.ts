import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatPercent, formatRelativeTime } from "./utils";

describe("cn", () => {
  it("merges tailwind classes with the last one winning", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
  it("drops falsy values", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });
});

describe("formatCurrency", () => {
  it("formats KES with grouping", () => {
    expect(formatCurrency(1234567)).toMatch(/1,234,567/);
  });
  it("handles zero + negative", () => {
    expect(formatCurrency(0)).toMatch(/0/);
    expect(formatCurrency(-100)).toMatch(/100/);
  });
});

describe("formatPercent", () => {
  it("appends %", () => {
    expect(formatPercent(12.5)).toContain("%");
  });
});

describe("formatRelativeTime", () => {
  it("returns a string for recent timestamps", () => {
    expect(typeof formatRelativeTime(new Date().toISOString())).toBe("string");
  });
});
