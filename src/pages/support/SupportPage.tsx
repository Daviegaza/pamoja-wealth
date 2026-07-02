import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LifeBuoy, Mail, MessageSquare, Phone, ExternalLink, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { motion } from "framer-motion";
import { api } from "@/api/axios";

export default function SupportPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const CHANNELS = [
    { icon: MessageSquare, title: "Live Chat", desc: "Chat with our AI assistant in real time", action: "Start chat", gradient: "icon-gradient-brand", onClick: () => navigate("/ai-assistant") },
    { icon: Mail, title: "Email Support", desc: "support@pamojawealth.app", extra: "Replies within 24 hours", action: "Send email", gradient: "icon-gradient-blue", href: "mailto:support@pamojawealth.app" },
    { icon: Phone, title: "Phone Support", desc: "+254 700 000 000", extra: "Mon–Fri, 8am–6pm EAT", action: "Call now", gradient: "icon-gradient-emerald", href: "tel:+254700000000" },
  ];

  async function handleSubmitTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/support/tickets", { subject: subject.trim(), description: description.trim() });
      toast.success("Support ticket submitted successfully.");
      setSubmitted(true);
      setSubject("");
      setDescription("");
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(msg || "Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">We're here to help with anything related to your chama or account.</p>
      </div>

      {/* Contact Channels */}
      <div className="grid sm:grid-cols-3 gap-4">
        {CHANNELS.map((c, idx) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="card-hover p-5 text-center group"
          >
            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${c.gradient} shadow-soft-sm`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 font-semibold text-sm text-gray-900 dark:text-white">{c.title}</p>
            <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">{c.desc}</p>
            {c.extra && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{c.extra}</p>}
            {c.href ? (
              <a href={c.href} className="block mt-4">
                <Button size="sm" variant="outline" className="w-full group-hover:border-brand-300 dark:group-hover:border-brand-500/30 transition-colors" rightIcon={<ArrowUpRight className="h-3 w-3" />}>
                  {c.action}
                </Button>
              </a>
            ) : (
              <Button size="sm" variant="outline" className="mt-4 w-full group-hover:border-brand-300 dark:group-hover:border-brand-500/30 transition-colors" onClick={c.onClick}>
                {c.action}
              </Button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Ticket Form */}
      <Tabs
        items={[
          {
            value: "ticket",
            label: "Submit a ticket",
            content: submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-hover p-10 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl icon-gradient-brand shadow-glow-sm">
                  <LifeBuoy className="h-7 w-7" />
                </div>
                <p className="mt-5 font-bold text-lg text-gray-900 dark:text-white">Ticket submitted</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-xs mx-auto">
                  Our support team will get back to you within 24 hours.
                </p>
                <Button variant="outline" size="sm" className="mt-5" onClick={() => setSubmitted(false)}>
                  Submit another
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="card-hover p-6 space-y-4">
                <Input label="Subject" placeholder="Briefly describe your issue" required value={subject} onChange={(e) => setSubject(e.target.value)} />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    placeholder="Provide as much detail as possible"
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3.5 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 focus:outline-none resize-none"
                  />
                </div>
                <Button type="submit" className="w-full" variant="premium" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit ticket"}
                </Button>
              </form>
            ),
          },
          {
            value: "help",
            label: "Help Center",
            content: (
              <div className="card-hover p-8 text-center">
                <ExternalLink className="h-8 w-8 text-brand-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-900 dark:text-white">Knowledge Base</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-md mx-auto">
                  Browse our help center for guides on contributions, loans, meetings, and account management.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/help")}>
                  Open Help Center
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
