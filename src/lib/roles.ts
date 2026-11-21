/**
 * Chama role helpers. The server is the authority on every permission — these
 * helpers only decide which buttons to show.
 */
export type ChamaRole = "chairperson" | "treasurer" | "secretary" | "member";

const LEGACY_CHAIR = new Set(["owner", "admin"]);

export function normalizeRole(role: string | null | undefined): ChamaRole {
  if (!role) return "member";
  if (LEGACY_CHAIR.has(role)) return "chairperson";
  if (role === "chairperson" || role === "treasurer" || role === "secretary") return role;
  return "member";
}

export function isOfficer(role: string | null | undefined): boolean {
  return normalizeRole(role) !== "member";
}

/** Chairperson or treasurer — may record and void money records. */
export function isMoneyOfficer(role: string | null | undefined): boolean {
  const r = normalizeRole(role);
  return r === "chairperson" || r === "treasurer";
}

export function isChair(role: string | null | undefined): boolean {
  return normalizeRole(role) === "chairperson";
}

/** Chairperson or secretary — may manage meetings, minutes and invites. */
export function isSecretarial(role: string | null | undefined): boolean {
  const r = normalizeRole(role);
  return r === "chairperson" || r === "secretary";
}

export const ROLE_LABELS: Record<ChamaRole, string> = {
  chairperson: "Chairperson",
  treasurer: "Treasurer",
  secretary: "Secretary",
  member: "Member",
};

export function roleLabel(role: string | null | undefined): string {
  return ROLE_LABELS[normalizeRole(role)];
}
