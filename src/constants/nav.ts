import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Building2, Bell, Settings, UserCircle, Receipt, HandCoins, Calendar,
  Target, Users, FileText, ScrollText, CreditCard, Home,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  /** Match the path exactly when deciding the active state. */
  end?: boolean;
}

export const PRIMARY_NAV: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "My chamas", path: "/chamas", icon: Building2, end: true },
];

export const SECONDARY_NAV: NavItem[] = [
  { label: "Notifications", path: "/notifications", icon: Bell },
  { label: "Profile", path: "/profile", icon: UserCircle },
  { label: "Settings", path: "/settings", icon: Settings },
];

/** Sections of a single chama's workspace, relative to /chamas/:chamaId. */
export const CHAMA_SECTIONS: { label: string; segment: string; icon: LucideIcon }[] = [
  { label: "Overview", segment: "", icon: Home },
  { label: "Contributions", segment: "contributions", icon: Receipt },
  { label: "Loan register", segment: "loans", icon: HandCoins },
  { label: "Meetings", segment: "meetings", icon: Calendar },
  { label: "Goals", segment: "goals", icon: Target },
  { label: "Members", segment: "members", icon: Users },
  { label: "Statements", segment: "statements", icon: FileText },
  { label: "Audit log", segment: "audit", icon: ScrollText },
  { label: "Billing", segment: "billing", icon: CreditCard },
];

export function chamaNav(chamaId: string): NavItem[] {
  return CHAMA_SECTIONS.map((s) => ({
    label: s.label,
    icon: s.icon,
    path: s.segment ? `/chamas/${chamaId}/${s.segment}` : `/chamas/${chamaId}`,
    end: s.segment === "",
  }));
}
