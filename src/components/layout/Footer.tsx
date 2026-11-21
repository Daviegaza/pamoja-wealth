import { Link } from "react-router-dom";
import { NON_CUSTODIAL_STATEMENT } from "@/lib/copy";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "How it works", path: "/#how-it-works" },
      { label: "Pricing", path: "/pricing" },
      { label: "Help", path: "/help" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", path: "/about" },
      { label: "Security", path: "/security" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", path: "/privacy" },
      { label: "Terms", path: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200/60 dark:border-white/[0.05] bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl icon-gradient-brand font-bold text-sm">P</div>
            <span className="font-bold text-gray-900 dark:text-white">Pamoja Wealth</span>
          </Link>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">{NON_CUSTODIAL_STATEMENT}</p>
        </div>
        {FOOTER_LINKS.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{col.title}</p>
            <ul className="mt-3 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.path} className="focus-ring text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100/60 dark:border-white/[0.04] py-6 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">&copy; {new Date().getFullYear()} Pamoja Wealth.</p>
      </div>
    </footer>
  );
}
