import { CreditCard, UserPlus, Vote, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  { label: "New Loan", icon: CreditCard, path: "/loans", gradient: "icon-gradient-blue" },
  { label: "Top Up Wallet", icon: Wallet, path: "/wallet", gradient: "icon-gradient-brand" },
  { label: "Invite Member", icon: UserPlus, path: "/members", gradient: "icon-gradient-purple" },
  { label: "Create Vote", icon: Vote, path: "/voting", gradient: "icon-gradient-amber" },
];

export function QuickActions() {
  return (
    <div className="card-hover p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <Link
            key={a.label}
            to={a.path}
            className="flex flex-col items-center gap-2.5 rounded-xl border border-gray-100 dark:border-white/[0.04] bg-gray-50/30 dark:bg-white/[0.01] p-4 text-center hover:border-brand-200 dark:hover:border-brand-500/[0.15] hover:bg-brand-50/30 dark:hover:bg-brand-500/[0.03] transition-all duration-200 group"
          >
            <div className={a.gradient + " flex h-10 w-10 items-center justify-center rounded-xl shadow-soft-sm group-hover:scale-105 transition-transform duration-200"}>
              <a.icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {a.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
