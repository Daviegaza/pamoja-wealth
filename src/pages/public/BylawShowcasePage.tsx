import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles, Wand2, ArrowRight, Check, Coins, Clock, Vote,
  ShieldCheck, LogOut, PieChart, Languages, Play,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const EXAMPLE_BYLAWS = `Wanachama wanachangia KES 2,000 kila mwezi mnamo tarehe 5.
Ukichelewa siku 3 unalipa faini ya KES 200.
Ukikosa michango 3 kwa mwaka, unaondolewa na unapoteza amana ya KES 5,000.
Kura zinahitaji akidi ya 60% na wingi wa 66% ili kupita.
Mkopo unahitaji dhamana kutoka kwa wanachama 2, na 5% ya riba kwa mwezi.
Mgao unagawanywa mwishoni mwa mwaka kulingana na hisa.`;

const COMPILED_RULES = [
  { icon: Coins, key: "Contribution", en: "KES 2,000 monthly, due 5th", sw: "KES 2,000 kila mwezi, tarehe 5" },
  { icon: Clock, key: "Late fee", en: "KES 200 after 3 days grace", sw: "KES 200 baada ya siku 3" },
  { icon: LogOut, key: "Exit / Removal", en: "3 missed contributions in 12 months → removed, entry bond forfeit", sw: "Michango 3 iliyokoswa kwa miezi 12 → kuondolewa, amana inapotea" },
  { icon: Vote, key: "Voting", en: "60% quorum, 66% pass threshold", sw: "Akidi 60%, kupitisha 66%" },
  { icon: ShieldCheck, key: "Loans", en: "2 guarantors required, 5% monthly interest", sw: "Wadhamini 2, riba 5% kwa mwezi" },
  { icon: PieChart, key: "Dividends", en: "Distributed annually by share ownership", sw: "Yanagawanywa kila mwaka kwa hisa" },
];

function useTypedText(text: string, speedMs = 22, startDelay = 400) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  const idxRef = useRef(0);

  useEffect(() => {
    setOut("");
    setDone(false);
    idxRef.current = 0;
    const startTimer = window.setTimeout(() => {
      const tick = window.setInterval(() => {
        idxRef.current += 1;
        setOut(text.slice(0, idxRef.current));
        if (idxRef.current >= text.length) {
          window.clearInterval(tick);
          setDone(true);
        }
      }, speedMs);
    }, startDelay);
    return () => { window.clearTimeout(startTimer); };
  }, [text, speedMs, startDelay]);

  return { text: out, done };
}

export default function BylawShowcasePage() {
  const [phase, setPhase] = useState<"typing" | "compiling" | "reveal">("typing");
  const [customText, setCustomText] = useState("");
  const [lang, setLang] = useState<"en" | "sw">("en");
  const { text: typed, done: typedDone } = useTypedText(EXAMPLE_BYLAWS);

  useEffect(() => {
    if (!typedDone) return;
    const t1 = window.setTimeout(() => setPhase("compiling"), 500);
    const t2 = window.setTimeout(() => setPhase("reveal"), 2400);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [typedDone]);

  const revealedRules = useMemo(() => (phase === "reveal" ? COMPILED_RULES : []), [phase]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-brand-50/40 to-white dark:from-neutral-950 dark:via-brand-950/20 dark:to-neutral-950">
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-16">
        <div className="text-center">
          <Badge variant="premium" className="mb-4">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> World-first Bylaw Compiler
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
            Your chama's constitution, <br />
            <span className="bg-gradient-to-r from-brand-600 via-brand-400 to-emerald-400 bg-clip-text text-transparent">
              running as code.
            </span>
          </h1>
          <p className="mt-5 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Watch below: real bylaws in plain Swahili → enforceable rules the platform
            auto-runs on M-Pesa. No more treasurer disputes. No more spreadsheet drama.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* LEFT — typed source */}
          <div className="rounded-3xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-neutral-900/60 backdrop-blur-sm shadow-soft-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/[0.04] bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <Wand2 className="h-4 w-4 text-brand-500" />
                Your bylaws
              </div>
              <Badge variant="default">Swahili + English</Badge>
            </div>
            <pre className="p-5 text-sm leading-relaxed text-gray-900 dark:text-gray-100 font-mono whitespace-pre-wrap min-h-[280px]">
              {typed}
              {!typedDone && <span className="inline-block w-2 h-5 align-middle bg-brand-500 animate-pulse ml-0.5" />}
            </pre>
          </div>

          {/* RIGHT — compiled rules */}
          <div className="rounded-3xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-neutral-900/60 backdrop-blur-sm shadow-soft-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/[0.04] bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Enforceable rules
              </div>
              <button
                onClick={() => setLang(lang === "en" ? "sw" : "en")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                <Languages className="h-3.5 w-3.5" />
                {lang === "en" ? "SW" : "EN"}
              </button>
            </div>
            <div className="p-5 min-h-[280px]">
              <AnimatePresence mode="wait">
                {phase === "typing" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500 text-sm"
                  >
                    <div className="h-8 w-8 rounded-full border-2 border-dashed border-gray-300 dark:border-white/10 animate-pulse" />
                    <p className="mt-3">Waiting for bylaws…</p>
                  </motion.div>
                )}
                {phase === "compiling" && (
                  <motion.div
                    key="compiling"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16"
                  >
                    <div className="relative h-14 w-14">
                      <div className="absolute inset-0 rounded-full border-4 border-brand-500/20" />
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-brand-500" />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Compiling rules with Claude…
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      hashing · version 1 · signing
                    </p>
                  </motion.div>
                )}
                {phase === "reveal" && (
                  <motion.ul
                    key="reveal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2.5"
                  >
                    {revealedRules.map((r, i) => (
                      <motion.li
                        key={r.key}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.09 }}
                        className="flex items-start gap-3 rounded-xl border border-gray-100 dark:border-white/[0.05] bg-gray-50/60 dark:bg-white/[0.02] p-3"
                      >
                        <div className="mt-0.5 h-8 w-8 rounded-lg bg-brand-50 dark:bg-brand-500/[0.08] flex items-center justify-center text-brand-600 dark:text-brand-400">
                          <r.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.key}</p>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {lang === "en" ? r.en : r.sw}
                          </p>
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Try your own */}
        <div className="mt-16 rounded-3xl border border-brand-200/60 dark:border-brand-500/20 bg-gradient-to-br from-brand-50/50 via-white to-emerald-50/40 dark:from-brand-500/[0.04] dark:via-neutral-900/40 dark:to-emerald-500/[0.03] p-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Now try your own bylaws
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Paste your chama's rules. Sign up in one click to run them live on M-Pesa.
            </p>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={7}
              placeholder="e.g. We contribute KES 1500 every month. Miss 2 in a row and you pay a 500 KES fine. Votes need 60% quorum..."
              className="mt-5 w-full rounded-xl border border-gray-300 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 focus:outline-none font-mono leading-relaxed"
            />
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to={`/register?seed=${encodeURIComponent(customText.slice(0, 800))}`}>
                <Button size="xl" variant="premium" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Run these bylaws live
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="xl" variant="outline" leftIcon={<Play className="h-5 w-5" />}>
                  See pricing
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              Free for groups up to 15 members. M-Pesa built-in.
            </p>
          </div>
        </div>

        {/* Why it matters */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Sparkles,
              title: "Speak your rules",
              body: "Swahili, English, Sheng. Claude parses intent and outputs a signed JSON constitution.",
            },
            {
              icon: ShieldCheck,
              title: "Tamper-proof",
              body: "Every version is hash-chained. Members sign. Rule changes are audit-ready by design.",
            },
            {
              icon: Coins,
              title: "Auto-enforced",
              body: "Contributions collect on M-Pesa. Fines auto-debit. Payouts wait for quorum. Zero treasurer discretion.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-gray-100 dark:border-white/[0.05] bg-white dark:bg-neutral-900/40 p-6">
              <div className="h-10 w-10 rounded-xl bg-brand-50 dark:bg-brand-500/[0.08] flex items-center justify-center text-brand-600 dark:text-brand-400">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
