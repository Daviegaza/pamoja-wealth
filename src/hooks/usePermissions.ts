import { useAuthStore } from "@/stores/authStore";
import { useChamaStore } from "@/stores/chamaStore";
import type { Permission, Role } from "@/types";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ["view_dashboard", "manage_members", "manage_treasury", "approve_loans", "create_meetings", "manage_votes", "view_analytics", "manage_settings", "manage_billing"],
  member: ["view_dashboard"],
  treasurer: ["view_dashboard", "manage_treasury", "view_analytics"],
  secretary: ["view_dashboard", "create_meetings", "manage_votes"],
  chairperson: ["view_dashboard", "manage_members", "approve_loans", "create_meetings", "manage_votes", "view_analytics"],
  admin: ["view_dashboard", "manage_members", "manage_treasury", "approve_loans", "create_meetings", "manage_votes", "view_analytics", "manage_settings"],
  super_admin: ["view_dashboard", "manage_members", "manage_treasury", "approve_loans", "create_meetings", "manage_votes", "view_analytics", "manage_settings", "manage_billing"],
};

const ROLE_RANK: Record<Role, number> = {
  member: 0,
  secretary: 1,
  treasurer: 2,
  chairperson: 3,
  admin: 4,
  owner: 5,
  super_admin: 6,
};

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const members = useChamaStore((s) => s.members);

  // Derive permissions from the user's highest role across all chama memberships
  const permissions = ((): Permission[] => {
    if (!user) return [];

    // Find all member records for this user
    const userMemberships = members.filter((m) => m.userId === user.id);

    // If no memberships data loaded yet (race condition on first render),
    // return ALL permissions so the UI renders everything. Individual pages
    // will check permissions again once data loads and show appropriate
    // empty states instead of dead links.
    if (members.length === 0) {
      return [
        "view_dashboard", "manage_members", "manage_treasury", "approve_loans",
        "create_meetings", "manage_votes", "view_analytics", "manage_settings", "manage_billing",
      ];
    }

    // If user has memberships but no matching records, return basic permissions
    if (userMemberships.length === 0) {
      return ["view_dashboard"];
    }

    // Find the highest role across all chamas
    let highestRole: Role = "member";
    for (const m of userMemberships) {
      if (ROLE_RANK[m.role] > ROLE_RANK[highestRole]) {
        highestRole = m.role;
      }
    }

    return ROLE_PERMISSIONS[highestRole];
  })();

  // Returns the highest role for the user across all chamas
  const highestRole = ((): Role => {
    if (!user) return "member";
    const userMemberships = members.filter((m) => m.userId === user.id);
    if (userMemberships.length === 0) return "member";
    let best: Role = "member";
    for (const m of userMemberships) {
      if (ROLE_RANK[m.role] > ROLE_RANK[best]) best = m.role;
    }
    return best;
  })();

  const can = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const isAtLeast = (role: Role): boolean => {
    return ROLE_RANK[highestRole] >= ROLE_RANK[role];
  };

  return { permissions, can, highestRole, isAtLeast };
}
