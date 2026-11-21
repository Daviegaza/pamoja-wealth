import { describe, expect, it } from "vitest";
import { referenceFromSearch } from "./billing";

describe("referenceFromSearch", () => {
  it("reads our own reference param first", () => {
    expect(referenceFromSearch(new URLSearchParams("reference=PW-1&tx_ref=X"))).toBe("PW-1");
  });
  it("falls back to Flutterwave tx_ref", () => {
    expect(referenceFromSearch(new URLSearchParams("tx_ref=PW-2&transaction_id=9"))).toBe("PW-2");
  });
  it("falls back to Paystack trxref", () => {
    expect(referenceFromSearch(new URLSearchParams("trxref=PW-3"))).toBe("PW-3");
  });
  it("returns null when absent", () => {
    expect(referenceFromSearch(new URLSearchParams("chamaId=abc"))).toBeNull();
  });
});
