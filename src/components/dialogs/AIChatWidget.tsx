import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AIChatMessage } from "@/types";
import { cn } from "@/lib/utils";
import { chat, type AIMessage } from "@/api/ai";

const SUGGESTED_PROMPTS = [
  "How is my chama performing?",
  "Should I take out a loan?",
  "Summarize my investments",
  "My contribution streak?",
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
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || sending) return;
    const userMsg: AIChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    const history: AIMessage[] = nextMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await chat({ messages: history });
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: "assistant",
          content: res.message.content,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      const anyErr = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      const backendMsg = anyErr?.response?.data?.error?.message;
      const fallback = "AI is currently unavailable. Please try again later.";
      toast.error(backendMsg || fallback);
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: "assistant",
          content: fallback,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[600px] flex-col card-base overflow-hidden">
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
        {sending && (
          <div className="flex gap-3" aria-label="AI is typing">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700 dark:from-brand-500/15 dark:to-brand-400/10 dark:text-brand-400">
              <Bot className="h-4 w-4" />
            </div>
            <div className="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-gray-100 dark:bg-white/[0.04] text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 dark:border-white/[0.04] p-4 bg-gray-50/50 dark:bg-white/[0.01]">
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              disabled={sending}
              className="whitespace-nowrap rounded-full border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-brand-300 dark:hover:border-brand-500/30 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/[0.04] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
            disabled={sending}
            className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] px-4 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 focus:outline-none disabled:opacity-60"
          />
          <button
            onClick={() => send(input)}
            disabled={sending || !input.trim()}
            aria-label="Send message"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:from-brand-700 hover:to-brand-600 shadow-glow-sm hover:shadow-glow-md transition-all duration-200 focus-ring disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
