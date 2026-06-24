import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-400">
      <Link to="/dashboard" className="hover:text-brand-600"><Home className="h-3.5 w-3.5" /></Link>
      {segments.map((seg, idx) => (
        <span key={idx} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="capitalize text-gray-600 dark:text-gray-300">{seg.replace(/-/g, " ")}</span>
        </span>
      ))}
    </nav>
  );
}
