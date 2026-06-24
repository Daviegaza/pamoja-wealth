import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import type { AIChatMessage } from "@/types";
import { cn } from "@/lib/utils";

const SUGGESTED_PROMPTS = [
  "How is my chama performing?",
  "Should I take out a loan?",
  "Summarize my investments",
  "My contribution streak?",
];

const CANNED_RESPONSES = [
  "Based on your contribution history, you're on track to hit your annual savings goal by November. Your consistency over the last 8 months has been excellent.",
  "Your current loan-to-savings ratio is healthy at 22%. Taking on a new loan now is reasonable if the term stays under 12 months and the rate is below 14%.",
  "Your portfolio is currently weighted 32% Money Market, 24% Treasury Bills, 20% Real Estate, 15% Stocks, and 9% SACCO — a balanced, low-to-medium risk allocation.",
  "You've contributed for 14 consecutive months without missing a payment. That puts you in the top 10% of members for consistency.",
];

export function AIChatWidget() {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: "m1",
      role: "assistant",
      content: "Hi! I'm your Pamoja AI Assistant. Ask me anything about your chamas, loans, investments, or wallet.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: AIChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
      const response = CANNED_RESPONSES[Math.floor(Math.random() * CANNED_RESPONSES.length)];
      setMessages((prev) => [
        ...prev,
        { id: `a_${Date.now()}`, role: "assistant", content: response, timestamp: new Date().toISOString() },
      ]);
    }, 800);
  };

  return (
    <div className="flex h-[600px] flex-col card-base overflow-hidden">
      {/* Header with gradient */}
      <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/[0.04] px-5 py-4 bg-gradient-to-r from-brand-50/50 to-transparent dark:from-brand-500/[0.03]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl icon-gradient-brand shadow-glow-sm">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Pamoja AI Assistant</p>
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" /> Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                m.role === "assistant"
                  ? "bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700 dark:from-brand-500/15 dark:to-brand-400/10 dark:text-brand-400"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 dark:from-white/[0.06] dark:to-white/[0.03] dark:text-gray-400"
              )}
            >
              {m.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "assistant"
                  ? "bg-gray-100 dark:bg-white/[0.04] text-gray-700 dark:text-gray-200"
                  : "bg-gradient-to-r from-brand-600 to-brand-500 text-white"
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 dark:border-white/[0.04] p-4 bg-gray-50/50 dark:bg-white/[0.01]">
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="whitespace-nowrap rounded-full border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-brand-300 dark:hover:border-brand-500/30 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/[0.04] transition-all duration-200"
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask the AI assistant..."
            className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] px-4 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
          <button
            onClick={() => send(input)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:from-brand-700 hover:to-brand-600 shadow-glow-sm hover:shadow-glow-md transition-all duration-200 focus-ring"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
