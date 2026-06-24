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
            Ready to build wealth together?
          </h2>
          <p className="mt-5 text-brand-100/80 max-w-md mx-auto text-lg leading-relaxed">
            Join thousands of members already growing their savings, loans, and investments on Pamoja Wealth.
          </p>
          <Link to="/register" className="relative inline-block mt-9">
            <Button size="xl" variant="secondary" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Create your free account
            </Button>
          </Link>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-brand-200/60 font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            No credit card required · Free forever plan available
          </div>
        </div>
      </motion.div>
    </section>
  );
}
