import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, Users, Sparkles } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Users, text: "Trusted by 1,000+ active members" },
  { icon: TrendingUp, text: "KES 2.4B+ in collective wealth managed" },
  { icon: ShieldCheck, text: "Bank-grade security & encryption" },
  { icon: Sparkles, text: "AI-powered financial insights" },
];

export function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-neutral-950">
      {/* Left: Auth form */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 relative">
        <Link to="/" className="flex items-center gap-2.5 mb-10 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl icon-gradient-brand font-bold text-sm transition-transform group-hover:scale-105">
            P
          </div>
          <span className="font-bold text-gray-900 dark:text-white">Pamoja Wealth</span>
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm mx-auto"
        >
          <Outlet />
        </motion.div>
      </div>

      {/* Right: Hero panel */}
      <div className="hidden lg:flex relative flex-col justify-center bg-gradient-to-br from-brand-700 via-brand-800 to-emerald-950 px-16 text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-32 -right-20 h-[500px] w-[500px] rounded-full bg-brand-400/10 blur-3xl animate-float" />
        <div className="absolute -bottom-20 -left-32 h-[400px] w-[400px] rounded-full bg-accent-400/[0.08] blur-3xl animate-float" style={{ animationDelay: "-2s" }} />
        <div className="absolute top-1/4 left-8 h-24 w-24 rounded-full border border-white/[0.04]" />
        <div className="absolute bottom-1/4 right-16 h-16 w-16 rounded-full border border-white/[0.04]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative">
          <h2 className="text-3xl lg:text-4xl font-bold leading-tight max-w-md tracking-tight">
            Building Wealth Together, one chama at a time.
          </h2>
          <p className="mt-4 text-brand-100/90 max-w-md text-lg leading-relaxed">
            Manage contributions, loans, investments and meetings — all from a single trusted platform.
          </p>

          <div className="mt-10 space-y-4">
            {TRUST_ITEMS.map((item) => (
              <div key={item.text} className="flex items-center gap-3 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] backdrop-blur-sm transition-colors group-hover:bg-white/[0.14]">
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-brand-50/90">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
