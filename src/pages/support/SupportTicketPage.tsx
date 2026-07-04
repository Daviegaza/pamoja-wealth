import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Ticket, Send, LifeBuoy, Check, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  createTicket, listTickets,
  type TicketDTO, type TicketCategory, type TicketPriority,
} from "@/api/support";

import { USE_MOCKS } from "@/lib/env";

const CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: "payment", label: "Payment / M-Pesa" },
  { value: "kyc", label: "KYC / verification" },
  { value: "account", label: "Account access" },
  { value: "chama", label: "Chama issue" },
  { value: "bug", label: "Bug report" },
  { value: "other", label: "Other" },
];

export default function SupportTicketPage() {
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<TicketCategory>("other");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (USE_MOCKS) {
      setTickets([
        { id: "t1", userId: "u1", subject: "M-Pesa STK not received", message: "Contributed 2000 KES but no push", category: "payment", priority: "high", status: "in_progress", createdAt: new Date(Date.now() - 3600000).toISOString() },
      ]);
      return;
    }
    listTickets().then(setTickets).catch(() => {});
  }, []);

  async function submit() {
    if (!subject.trim() || !message.trim()) return toast.error("Subject and message required");
    setSubmitting(true);
    try {
      if (USE_MOCKS) {
        const fake: TicketDTO = {
          id: `t_${Date.now()}`,
          userId: "u1",
          subject, message, category, priority,
          status: "open",
          createdAt: new Date().toISOString(),
        };
        setTickets((prev) => [fake, ...prev]);
      } else {
        const created = await createTicket({ subject, message, category, priority });
        setTickets((prev) => [created, ...prev]);
      }
      toast.success("Ticket submitted — we'll respond within 24h");
      setSubject(""); setMessage(""); setCategory("other"); setPriority("normal");
    } catch (err) {
      toast.error((err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ?? "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
          <LifeBuoy className="h-3.5 w-3.5" /> Support
        </div>
        <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">Contact support</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Response within 24 hours. Urgent M-Pesa issues escalated same day.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-neutral-900/60 p-6 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3 py-2 text-sm"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Short summary"
          className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3 py-2 text-sm"
        />
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mt-3 block">Details</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Include transaction refs, screenshots URLs, or steps to reproduce"
          className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3 py-2 text-sm"
        />
        <div className="mt-4 flex justify-end">
          <Button variant="premium" leftIcon={<Send className="h-4 w-4" />} onClick={submit} isLoading={submitting}>
            Submit ticket
          </Button>
        </div>
      </motion.div>

      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Your tickets</h3>
        <div className="space-y-2">
          {tickets.map((t) => (
            <div key={t.id} className="rounded-xl border border-gray-100 dark:border-white/[0.05] bg-white dark:bg-neutral-900/40 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {t.status === "resolved" && <Check className="h-5 w-5 text-emerald-500" />}
                    {t.status === "in_progress" && <Clock className="h-5 w-5 text-amber-500" />}
                    {t.status === "open" && <AlertCircle className="h-5 w-5 text-brand-500" />}
                    {t.status === "closed" && <Ticket className="h-5 w-5 text-gray-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.subject}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{t.message}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="default" className="text-[10px]">{t.category}</Badge>
                      <Badge variant={t.priority === "urgent" || t.priority === "high" ? "premium" : "default"} className="text-[10px]">
                        {t.priority}
                      </Badge>
                      <span className="text-[10px] text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={t.status === "resolved" ? "premium" : "default"} className="text-[10px]">{t.status.replace("_", " ")}</Badge>
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No tickets yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
