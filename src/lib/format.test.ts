import { describe, expect, it } from "vitest";
import { formatDay, formatKes, isValidMpesaReceipt, normalizeMpesaReceipt, statusVariant, todayIso } from "./format";

describe("formatKes", () => {
  it("formats whole shillings without decimals", () => {
    expect(formatKes(12500)).toBe("KES 12,500");
  });
  it("keeps cents when present", () => {
    expect(formatKes(99.5)).toBe("KES 99.50");
  });
  it("treats missing or invalid values as zero", () => {
    expect(formatKes(undefined)).toBe("KES 0");
    expect(formatKes(Number.NaN)).toBe("KES 0");
  });
});

describe("M-Pesa receipt codes", () => {
  it("normalises spacing and case", () => {
    expect(normalizeMpesaReceipt(" sab1 c2d3e4 ")).toBe("SAB1C2D3E4");
  });
  it("accepts 10 alphanumeric characters only", () => {
    expect(isValidMpesaReceipt("SAB1C2D3E4")).toBe(true);
    expect(isValidMpesaReceipt("SAB1C2")).toBe(false);
    expect(isValidMpesaReceipt("SAB1C2D3E4X")).toBe(false);
    expect(isValidMpesaReceipt("SAB1C2D3E!")).toBe(false);
  });
});

describe("dates", () => {
  it("todayIso returns local YYYY-MM-DD", () => {
    expect(todayIso(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
  it("formatDay handles empty and invalid input", () => {
    expect(formatDay(null)).toBe("—");
    expect(formatDay("not-a-date")).toBe("—");
    expect(formatDay("2026-03-01")).toMatch(/2026/);
  });
});

describe("statusVariant", () => {
  it("maps record statuses to badge variants", () => {
    expect(statusVariant("confirmed")).toBe("success");
    expect(statusVariant("disputed")).toBe("warning");
    expect(statusVariant("defaulted")).toBe("danger");
    expect(statusVariant("something-new")).toBe("default");
  });
});
