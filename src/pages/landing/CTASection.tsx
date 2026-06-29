import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-emerald-900 px-8 py-20 text-center text-white shadow-glow-xl"
      >
        {/* Decorative orbs */}
        <div className="absolute -top-32 -right-20 h-[400px] w-[400px] rounded-full bg-brand-400/[0.08] blur-3xl animate-float" />
        <div className="absolute -bottom-24 -left-24 h-[350px] w-[350px] rounded-full bg-accent-400/[0.06] blur-3xl animate-float" style={{ animationDelay: "-1.5s" }} />

        <div className="relative">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold max-w-2xl mx-auto tracking-tight leading-[1.1]">
            Ready to modernize your chama?
          </h2>
          <p className="mt-5 text-brand-100/80 max-w-lg mx-auto text-lg leading-relaxed">
            Join 200+ chamas already using Pamoja Wealth. Available on web, with mobile apps coming soon.
          </p>
          <Link to="/register" className="relative inline-block mt-9">
            <Button size="xl" variant="secondary" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Create your free account
            </Button>
          </Link>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-brand-200/60 font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            No credit card required &middot; Free forever plan available
          </div>

          {/* App store badges */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              disabled
              className="inline-flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/60 backdrop-blur-sm opacity-60 cursor-not-allowed"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 16.434c-.651.902-1.434 2.018-2.508 2.018-1.074 0-1.413-.654-2.627-.654-1.214 0-1.589.654-2.627.654-1.074 0-1.857-1.117-2.508-2.018C5.676 14.655 4.96 12.28 5.959 10.64c.654-1.074 1.826-1.735 3.091-1.735 1.214 0 1.976.654 2.948.654.972 0 1.734-.654 2.948-.654 1.265 0 2.437.661 3.091 1.735.999 1.639.315 4.015-1.514 5.794M14.525 5.314A2.63 2.63 0 0015.9 3.615c.11-.48.165-.978.137-1.474a2.71 2.71 0 00-1.944.984 2.63 2.63 0 00-.69 1.553c-.033.5.071.996.296 1.446a2.71 2.71 0 001.826-1.81" />
              </svg>
              Google Play &mdash; Coming Soon
            </button>
            <button
              disabled
              className="inline-flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/60 backdrop-blur-sm opacity-60 cursor-not-allowed"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              App Store &mdash; Coming Soon
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
