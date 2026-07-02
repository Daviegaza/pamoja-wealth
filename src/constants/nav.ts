import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Users, Wallet, CreditCard, TrendingUp, Calendar, Vote, FileText,
  BarChart3, Bot, Bell, Settings, Building2, ArrowLeftRight, UserCircle, LifeBuoy,
  MessageSquare,
} from "lucide-react";
import type { Permission } from "@/types";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  permission?: Permission;
  badge?: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "My Chamas", path: "/chamas", icon: Building2 },
  { label: "Members", path: "/members", icon: Users, permission: "manage_members" },
  { label: "Treasury", path: "/treasury", icon: Wallet, permission: "manage_treasury" },
  { label: "Loans", path: "/loans", icon: CreditCard },
  { label: "Investments", path: "/investments", icon: TrendingUp },
  { label: "Wallet", path: "/wallet", icon: Wallet },
  { label: "Transactions", path: "/transactions", icon: ArrowLeftRight },
  { label: "Meetings", path: "/meetings", icon: Calendar },
  { label: "Voting", path: "/voting", icon: Vote },
  { label: "Documents", path: "/documents", icon: FileText },
  { label: "Analytics", path: "/analytics", icon: BarChart3, permission: "view_analytics" },
  { label: "My Network", path: "/network", icon: Users },
  { label: "Messages", path: "/messages", icon: MessageSquare },
  { label: "AI Assistant", path: "/ai-assistant", icon: Bot },
];

export const SECONDARY_NAV: NavItem[] = [
  { label: "Notifications", path: "/notifications", icon: Bell },
  { label: "Profile", path: "/profile", icon: UserCircle },
  { label: "Settings", path: "/settings", icon: Settings },
  { label: "Billing", path: "/billing", icon: CreditCard },
  { label: "Support", path: "/support", icon: LifeBuoy },
];
