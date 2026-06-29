import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

export function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-gray-200/40 dark:border-white/[0.05] bg-white/80 dark:bg-neutral-950/75 backdrop-blur-2xl shadow-soft-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl icon-gradient-brand font-bold text-sm transition-transform group-hover:scale-105">
            P
          </div>
          <span className="font-bold text-gray-900 dark:text-white">Pamoja Wealth</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="focus-ring relative px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors rounded-lg hover:bg-brand-50/50 dark:hover:bg-brand-500/[0.04]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2.5">
          <Link to="/login">
            <Button variant="ghost-brand" size="sm">Sign in</Button>
          </Link>
          <Link to="/register">
            <Button size="sm" variant="premium">Get started</Button>
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden rounded-xl p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.04] focus-ring transition-colors"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border-t border-gray-100 dark:border-white/[0.05] bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-2 px-6 py-5">
              {LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="focus-ring text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 py-2 transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <div className="h-px bg-gray-100 dark:bg-white/[0.05] my-1" />
              <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-semibold text-gray-900 dark:text-white py-2">
                Sign in
              </Link>
              <Link to="/register" onClick={() => setOpen(false)}>
                <Button size="md" className="w-full mt-1" variant="premium">Get started</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
