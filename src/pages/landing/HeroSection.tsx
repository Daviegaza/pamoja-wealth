import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Sparkles, Shield, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { getMockDatabase } from "@/mock";
import { formatCurrency } from "@/lib/utils";

const { users } = getMockDatabase();

function CountUp({ end, duration = 2, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || started.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / (duration * 1000), 1);
          setCount(Math.floor(p * end));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-60 -right-60 w-[800px] h-[800px] rounded-full bg-brand-500/[0.04] dark:bg-brand-500/[0.03] blur-3xl animate-float" />
        <div className="absolute -bottom-60 -left-60 w-[700px] h-[700px] rounded-full bg-accent-400/[0.04] dark:bg-accent-400/[0.02] blur-3xl animate-float" style={{ animationDelay: "-2.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-brand-100/30 dark:bg-brand-500/[0.02] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 sm:pt-24 lg:pt-36 pb-16 lg:pb-24 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-brand-200/60 dark:border-brand-500/20 bg-brand-50/80 dark:bg-brand-500/[0.06] backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-brand-700 dark:text-brand-300"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
          </span>
          <Sparkles className="h-3.5 w-3.5" /> Trusted by 200+ Chamas Across East Africa
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 text-4xl sm:text-5xl lg:text-7xl font-black tracking-tightest text-gray-900 dark:text-white max-w-6xl mx-auto leading-[1.04]"
        >
          Your Chama,{" "}
          <span className="bg-gradient-to-r from-brand-600 via-brand-400 to-emerald-400 dark:from-brand-400 dark:via-brand-300 dark:to-emerald-300 bg-clip-text text-transparent">
            Supercharged
          </span>
          .
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
        >
          The all-in-one platform that brings your savings group into the modern age.
          Track contributions, manage loans, grow investments, and run meetings —
          all from one <span className="font-semibold text-gray-700 dark:text-gray-200">beautiful, secure</span> place.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link to="/register">
            <Button size="xl" variant="premium" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Start Free — It Takes 2 Minutes
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button size="xl" variant="outline" leftIcon={<Play className="h-5 w-5" />}>
              See How It Works
            </Button>
          </a>
        </motion.div>

        {/* Live Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto"
        >
          {[
            { icon: Users, value: 1000, suffix: "+", label: "Active Members" },
            { icon: TrendingUp, value: 2400000000, suffix: "", label: "KES Managed", format: true },
            { icon: Shield, value: 9995, suffix: "%", label: "Platform Uptime" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/[0.06] text-brand-600 dark:text-brand-400 mb-2">
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {stat.format ? formatCurrency(stat.value).replace("Ksh\xa0", "") : <><CountUp end={stat.value} suffix={stat.suffix} /></>}
              </p>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Social Proof Avatars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 flex items-center justify-center gap-4 flex-wrap"
        >
          <div className="flex -space-x-3">
            {users.slice(0, 6).map((u) => (
              <Avatar key={u.id} src={u.avatarUrl} name={u.fullName} size="sm" ring="white" />
            ))}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white text-[10px] font-bold ring-2 ring-white dark:ring-neutral-950">
              +1k
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="flex gap-0.5 text-amber-400">
              {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
            </span>
            <span className="text-gray-500 dark:text-gray-400 font-medium ml-1">4.9 from 200+ chamas</span>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          className="mt-16 mx-auto max-w-5xl rounded-3xl border border-gray-200/40 dark:border-white/[0.05] bg-white dark:bg-neutral-900/40 backdrop-blur-sm shadow-soft-xl dark:shadow-[0_0_100px_-25px_rgba(34,197,94,0.12)] overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-white/[0.04] bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 mx-4 h-6 rounded-lg bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.04] flex items-center px-3">
              <span className="text-[10px] text-gray-400">app.pamojawealth.com/dashboard</span>
            </div>
          </div>
          <div className="aspect-[16/9] bg-gradient-to-br from-gray-50 via-white to-brand-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-brand-950/20 flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full max-w-3xl px-6 grid grid-cols-4 gap-3 opacity-25">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={`h-16 rounded-xl bg-gradient-to-br ${i % 3 === 0 ? "from-brand-300/60 to-brand-200/30" : i % 3 === 1 ? "from-blue-300/40 to-blue-200/20" : "from-purple-300/40 to-purple-200/20"} dark:from-white/[0.04] dark:to-white/[0.01]`} />
                ))}
              </div>
            </div>
            <div className="relative z-10 text-center">
              <Badge variant="premium" className="mb-2">Live Demo</Badge>
              <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Sign up to see your dashboard</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
