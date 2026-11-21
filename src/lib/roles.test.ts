import { describe, expect, it } from "vitest";
import { isChair, isMoneyOfficer, isOfficer, isSecretarial, normalizeRole, roleLabel } from "./roles";

describe("normalizeRole", () => {
  it("maps legacy owner/admin to chairperson", () => {
    expect(normalizeRole("owner")).toBe("chairperson");
    expect(normalizeRole("admin")).toBe("chairperson");
  });

  it("treats unknown or missing roles as member", () => {
    expect(normalizeRole(undefined)).toBe("member");
    expect(normalizeRole(null)).toBe("member");
    expect(normalizeRole("super_admin")).toBe("member");
  });
});

describe("role capabilities (UI hints only)", () => {
  it("only chairperson and treasurer can record money", () => {
    expect(isMoneyOfficer("chairperson")).toBe(true);
    expect(isMoneyOfficer("treasurer")).toBe(true);
    expect(isMoneyOfficer("secretary")).toBe(false);
    expect(isMoneyOfficer("member")).toBe(false);
  });

  it("secretary manages meetings but is not a chair", () => {
    expect(isSecretarial("secretary")).toBe(true);
    expect(isSecretarial("treasurer")).toBe(false);
    expect(isChair("secretary")).toBe(false);
  });

  it("officers are everyone except plain members", () => {
    expect(isOfficer("secretary")).toBe(true);
    expect(isOfficer("member")).toBe(false);
  });

  it("labels roles for display", () => {
    expect(roleLabel("owner")).toBe("Chairperson");
    expect(roleLabel("treasurer")).toBe("Treasurer");
  });
});
