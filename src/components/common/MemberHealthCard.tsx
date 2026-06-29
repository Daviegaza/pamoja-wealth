import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface HealthDetail {
  label: string;
  value: string;
  score: number;
}

interface MemberHealthCardProps {
  healthScore: number;
  label: string;
  details: HealthDetail[];
}

function scoreColor(score: number): { stroke: string; bg: string; text: string; ring: string } {
  if (score >= 80)
    return {
      stroke: "#10b981",
      bg: "bg-emerald-50 dark:bg-emerald-500/[0.06]",
      text: "text-emerald-600 dark:text-emerald-400",
      ring: "ring-emerald-500/20",
    };
  if (score >= 50)
    return {
      stroke: "#f59e0b",
      bg: "bg-amber-50 dark:bg-amber-500/[0.06]",
      text: "text-amber-600 dark:text-amber-400",
      ring: "ring-amber-500/20",
    };
  return {
    stroke: "#ef4444",
    bg: "bg-red-50 dark:bg-red-500/[0.06]",
    text: "text-red-600 dark:text-red-400",
    ring: "ring-red-500/20",
  };
}

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function MemberHealthCard({ healthScore, label, details }: MemberHealthCardProps) {
  const colors = scoreColor(healthScore);
  const clampedScore = Math.min(Math.max(healthScore, 0), 100);

  const scoreMotion = useMotionValue(0);
  const animatedScore = useTransform(scoreMotion, (v) => Math.round(v));
  const dashOffset = useTransform(scoreMotion, (v) => CIRCUMFERENCE * (1 - v / 100));

  useEffect(() => {
    const controls = animate(scoreMotion, clampedScore, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [clampedScore, scoreMotion]);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="card-hover p-5 relative overflow-hidden"
    >
      {/* Gradient accent */}
      <div className="absolute top-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-transparent opacity-50" />

      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-glow-sm">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{label}</h3>
          <p className="text-[11px] text-gray-400 font-medium">Based on your activity</p>
        </div>
      </div>

      {/* Circular progress */}
      <div className="flex justify-center mb-5">
        <div className="relative h-28 w-28">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            {/* Track */}
            <circle
              cx="50" cy="50" r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-100 dark:text-white/[0.06]"
            />
            {/* Progress */}
            <motion.circle
              cx="50" cy="50" r={RADIUS}
              fill="none"
              stroke={colors.stroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              style={{ strokeDashoffset: dashOffset }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={cn("text-2xl font-black tracking-tight", colors.text)}
            >
              {animatedScore}
            </motion.span>
            <span className="text-[10px] font-medium text-gray-400 -mt-0.5">/ 100</span>
          </div>
        </div>
      </div>

      {/* Status label */}
      <div className="flex justify-center mb-4">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", colors.bg, colors.text)}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {clampedScore >= 80 ? "Excellent" : clampedScore >= 50 ? "Needs Attention" : "At Risk"}
        </span>
      </div>

      {/* Detail rows */}
      <div className="space-y-3">
        {details.map((d) => {
          const detailColors = scoreColor(d.score * 4);
          const pct = Math.min(d.score / 25, 1) * 100;
          return (
            <div key={d.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{d.label}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">{d.value}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: detailColors.stroke }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
