import { Link } from "react-router-dom";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Treasury", path: "/treasury" },
      { label: "Investments", path: "/investments" },
      { label: "AI Assistant", path: "/ai-assistant" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", path: "/about" },
      { label: "Careers", path: "/about" },
      { label: "Blog", path: "/about" },
      { label: "Press", path: "/about" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", path: "/support" },
      { label: "Community", path: "/about" },
      { label: "Guides", path: "/help" },
      { label: "API Docs", path: "/help" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", path: "/privacy" },
      { label: "Terms", path: "/terms" },
      { label: "Security", path: "/security" },
      { label: "Compliance", path: "/security" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200/60 dark:border-white/[0.05] bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl icon-gradient-brand font-bold text-sm group-hover:scale-105 transition-transform">
              P
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Pamoja Wealth</span>
          </Link>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
            Building Wealth Together — the modern platform for chamas, savings groups and investment clubs across East Africa.
          </p>
        </div>
        {FOOTER_LINKS.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{col.title}</p>
            <ul className="mt-3 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.path}
                    className="focus-ring text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100/60 dark:border-white/[0.04] py-6 text-center">
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
          &copy; {new Date().getFullYear()} Pamoja Wealth. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
