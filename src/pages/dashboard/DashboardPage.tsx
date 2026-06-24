import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, easeOut } from "framer-motion";
import {
  Calendar, CreditCard, TrendingUp, Wallet, Building2,
  Shield, Activity, Vote,
  ArrowDownToLine, Send,
} from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/cards/StatCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { ContributionGrowthChart } from "@/components/charts/ContributionGrowthChart";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { AIInsightCard } from "@/components/common/AIInsightCard";
import { MiniCalendar } from "@/components/common/MiniCalendar";
import { ActivityTimeline } from "@/components/common/ActivityTimeline";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/dialogs/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useMeetings } from "@/hooks/useMeetings";
import { useLoans } from "@/hooks/useLoans";
import { useAuth } from "@/hooks/useAuth";
import { useChamaStore } from "@/stores/chamaStore";
import { useWalletStore } from "@/stores/walletStore";
import { useMeetingStore } from "@/stores/meetingStore";
import { getMockDatabase } from "@/mock";
import { formatCurrency } from "@/lib/utils";

const db = getMockDatabase();

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
};

export default function DashboardPage() {
  const analytics = useAnalytics();
  const meetings = useMeetings();
  const { loans, applyForLoan } = useLoans();
  const { user } = useAuth();
  const chamas = useChamaStore((s) => s.chamas);
  const { votes, castVote } = useMeetingStore();
  const { wallet, deposit } = useWalletStore();

  // Action modals
  const [contributeOpen, setContributeOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);
  const [voteOpen, setVoteOpen] = useState(false);
  const [contributeAmount, setContributeAmount] = useState("5000");
  const [contributeMethod, setContributeMethod] = useState("mpesa");
  const [loanAmount, setLoanAmount] = useState("50000");
  const [loanPurpose, setLoanPurpose] = useState("Business expansion");
  const [selectedVoteId, setSelectedVoteId] = useState("");

  const myChamas = chamas.filter((c) =>
    db.members.some((m) => m.userId === user?.id && m.chamaId === c.id)
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingMeetings = meetings
    .filter((m) => m.status === "scheduled" && new Date(m.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const myLoans = loans.filter((l) => l.borrowerId === user?.id).slice(0, 3);
  const openVotes = votes.filter((v) => v.status === "open").slice(0, 5);
  const recentActivity = db.activity.slice(0, 5);

  const role = user?.role ?? "member";
  const isOwner = role === "owner";

  // Real action handlers
  const handleContribute = () => {
    const amount = parseInt(contributeAmount);
    if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return; }
    deposit(amount, contributeMethod);
    toast.success(`Contribution of ${formatCurrency(amount)} via ${contributeMethod === "mpesa" ? "M-Pesa" : "Bank"} received!`);
    setContributeOpen(false);
    setContributeAmount("5000");
  };

  const handleApplyLoan = () => {
    const amount = parseInt(loanAmount);
    if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return; }
    applyForLoan({
      chamaId: myChamas[0]?.id ?? "cha_1",
      borrowerId: user?.id ?? "usr_1",
      borrowerName: user?.fullName ?? "Member",
      borrowerAvatar: user?.avatarUrl ?? "",
      amount,
      interestRate: 12,
      termMonths: 6,
      purpose: loanPurpose,
      appliedDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 180 * 86400000).toISOString(),
      guarantors: [],
    });
    toast.success(`Loan application for ${formatCurrency(amount)} submitted! Pending approval.`);
    setLoanOpen(false);
    setLoanAmount("50000");
  };

  const handleVote = (voteId: string) => {
    setSelectedVoteId(voteId);
    setVoteOpen(true);
  };

  const handleCastVote = (optionId: string) => {
    castVote(selectedVoteId, optionId);
    toast.success("Your vote has been recorded!");
    setVoteOpen(false);
    setSelectedVoteId("");
  };

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="visible">
      {/* Welcome + Action Bar */}
      <motion.div variants={fadeUp}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.fullName.split(" ")[0]}
              <motion.span className="inline-block ml-1" animate={{ rotate: [0, 14, -8, 14, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}>👋</motion.span>
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge variant="brand" className="capitalize">{role.replace("_", " ")}</Badge>
              <span className="text-xs text-gray-400">·</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString("en-KE", { weekday: "long", month: "long", day: "numeric" })}</p>
              <span className="text-gray-300 dark:text-gray-700">·</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />All systems normal
              </span>
            </div>
          </div>
          {isOwner && (
            <Link to="/owner"><Button variant="premium" size="sm" leftIcon={<Shield className="h-3.5 w-3.5" />}>Owner Center</Button></Link>
          )}
        </div>

        {/* ACTION BAR - Real working buttons */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="premium" leftIcon={<ArrowDownToLine className="h-3.5 w-3.5" />} onClick={() => setContributeOpen(true)}>
            Make Contribution
          </Button>
          <Button size="sm" variant="outline" leftIcon={<CreditCard className="h-3.5 w-3.5" />} onClick={() => setLoanOpen(true)}>
            Apply for Loan
          </Button>
          {openVotes.length > 0 && (
            <Button size="sm" variant="outline" leftIcon={<Vote className="h-3.5 w-3.5" />} onClick={() => handleVote(openVotes[0].id)}>
              Cast Vote ({openVotes.length} open)
            </Button>
          )}
          <Link to="/wallet">
            <Button size="sm" variant="ghost-brand" leftIcon={<Wallet className="h-3.5 w-3.5" />}>Wallet</Button>
          </Link>
          <Link to="/meetings">
            <Button size="sm" variant="ghost-brand" leftIcon={<Calendar className="h-3.5 w-3.5" />}>Meetings</Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/wallet"><StatCard label="My Balance" value={formatCurrency(wallet.balance)} change={5.3} icon={Wallet} /></Link>
        <Link to="/chamas"><StatCard label="My Chamas" value={myChamas.length.toString()} icon={Building2} iconColor="icon-gradient-blue" /></Link>
        <Link to="/loans"><StatCard label="Active Loans" value={formatCurrency(myLoans.reduce((s, l) => s + (l.status === "active" ? l.amount - l.amountRepaid : 0), 0))} icon={CreditCard} iconColor="icon-gradient-purple" /></Link>
        <Link to="/investments"><StatCard label="Investments" value={formatCurrency(320_000)} change={8.2} icon={TrendingUp} iconColor="icon-gradient-emerald" /></Link>
      </motion.div>

      {/* Charts + Sidebar */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartCard title="Contribution Growth" subtitle="Last 12 months"><ContributionGrowthChart data={analytics.contributionGrowth} /></ChartCard>
          <ChartCard title="Cash Flow"><CashFlowChart data={analytics.cashFlow} /></ChartCard>
        </div>
        <div className="space-y-6">
          <AIInsightCard insights={[
            "Your contributions are 8.4% above the platform average.",
            isOwner ? "3 security alerts need your attention." : "3 loan repayments due within 7 days.",
            `You have ${openVotes.length} open vote${openVotes.length !== 1 ? "s" : ""} to participate in.`,
          ]} />

          {/* My Chamas quick list */}
          <div className="card-hover p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Building2 className="h-4 w-4 text-brand-500" /> My Chamas</h3>
              <Link to="/chamas" className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {myChamas.slice(0, 4).map((c) => (
                <Link key={c.id} to={`/chamas/${c.id}`} className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.name}</span>
                  <Badge variant={c.status === "active" ? "success" : "default"} className="text-[10px] capitalize">{c.status}</Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MiniCalendar highlightDates={upcomingMeetings.map((m) => m.date)} />
        <div className="card-hover p-5">
          <Link to="/meetings" className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 hover:text-brand-600"><Calendar className="h-4 w-4 text-brand-500" /> Upcoming Meetings</Link>
          <div className="space-y-3 mt-4">
            {upcomingMeetings.length > 0 ? upcomingMeetings.map((m) => (
              <Link to="/meetings" key={m.id} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-white/[0.04] p-3 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
                <div className="min-w-0"><p className="text-sm font-medium truncate">{m.title}</p><p className="text-xs text-gray-400 mt-0.5">{m.location}</p></div>
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 ml-3 shrink-0 bg-brand-50 dark:bg-brand-500/[0.06] rounded-lg px-2 py-1">{new Date(m.date).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</span>
              </Link>
            )) : <p className="text-sm text-gray-400 text-center py-6">No upcoming meetings</p>}
          </div>
        </div>
        <div className="card-hover p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-brand-500" /> Recent Activity</h3>
          <ActivityTimeline items={recentActivity} />
        </div>
      </motion.div>

      {/* ===== CONTRIBUTE MODAL ===== */}
      <Modal isOpen={contributeOpen} onClose={() => setContributeOpen(false)} title="Make a Contribution" description="Contribute to your chama via M-Pesa, bank, or card.">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "mpesa", label: "M-Pesa", icon: "📱" },
              { value: "bank", label: "Bank", icon: "🏦" },
              { value: "card", label: "Card", icon: "💳" },
            ].map((m) => (
              <button key={m.value} onClick={() => setContributeMethod(m.value)}
                className={`card-hover p-3 text-center transition-all ${contributeMethod === m.value ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/[0.06] ring-2 ring-brand-500/20" : ""}`}>
                <span className="text-xl">{m.icon}</span>
                <p className="text-xs font-semibold mt-1 text-gray-900 dark:text-white">{m.label}</p>
              </button>
            ))}
          </div>
          <Input label="Amount (KES)" type="number" value={contributeAmount} onChange={(e) => setContributeAmount(e.target.value)} placeholder="Enter amount" />
          {contributeMethod === "mpesa" && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.04] p-3 text-xs text-emerald-700 dark:text-emerald-400">
              <strong>Lipa na M-Pesa:</strong> Paybill 247247, Account: Your Chama ID. Contributions are auto-detected.
            </div>
          )}
          <Button className="w-full" variant="premium" size="lg" onClick={handleContribute} leftIcon={<Send className="h-4 w-4" />}>
            Contribute {contributeAmount ? formatCurrency(parseInt(contributeAmount)) : ""}
          </Button>
        </div>
      </Modal>

      {/* ===== LOAN APPLICATION MODAL ===== */}
      <Modal isOpen={loanOpen} onClose={() => setLoanOpen(false)} title="Apply for a Loan" description="Submit your loan application for member review.">
        <div className="space-y-4">
          <Input label="Amount (KES)" type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} placeholder="How much do you need?" />
          <Select label="Purpose" value={loanPurpose} onChange={(e) => setLoanPurpose(e.target.value)}
            options={["Business expansion", "School fees", "Medical emergency", "Home renovation", "Land purchase", "Vehicle purchase", "Wedding expenses", "Agricultural investment"].map((p) => ({ label: p, value: p }))}
          />
          <div className="rounded-xl bg-gray-50 dark:bg-white/[0.02] p-3 text-xs text-gray-500">
            <strong>Terms:</strong> 12% interest · 6 months · Requires 2 guarantors · Approval within 48 hours
          </div>
          <Button className="w-full" variant="premium" size="lg" onClick={handleApplyLoan} leftIcon={<Send className="h-4 w-4" />}>
            Submit Application
          </Button>
        </div>
      </Modal>

      {/* ===== VOTE MODAL ===== */}
      <Modal isOpen={voteOpen} onClose={() => setVoteOpen(false)} title="Cast Your Vote" description={votes.find((v) => v.id === selectedVoteId)?.description}>
        <div className="space-y-3">
          {votes.find((v) => v.id === selectedVoteId)?.options.map((opt) => (
            <button key={opt.id} onClick={() => handleCastVote(opt.id)}
              className="w-full card-hover p-4 text-left hover:border-brand-300 dark:hover:border-brand-500/30 transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">{opt.label}</span>
                <span className="text-xs text-gray-400">{opt.count} votes</span>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </motion.div>
  );
}
