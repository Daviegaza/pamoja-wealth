import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Plus, Trash2, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useGoalStore, type Goal } from "@/stores/goalStore";
import { formatCurrency } from "@/lib/utils";

export default function GoalsPage() {
  const { goals, sync, addGoal, updateGoal, deleteGoal, isLoading } = useGoalStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState<number | "">("");
  const [date, setDate] = useState("");
  const [contributeFor, setContributeFor] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState<number | "">("");

  useEffect(() => { sync().catch(() => {}); }, [sync]);

  async function handleAdd() {
    if (!name || !target || !date) return toast.error("Fill all fields");
    try {
      await addGoal({ name, targetAmount: Number(target), targetDate: new Date(date).toISOString() });
      toast.success(`Goal '${name}' created`);
      setName(""); setTarget(""); setDate(""); setShowForm(false);
    } catch (err) {
      toast.error((err as Error).message ?? "Could not create goal");
    }
  }

  async function handleContribute() {
    if (!contributeFor || !contributeAmount) return;
    try {
      await updateGoal(contributeFor, Number(contributeAmount));
      toast.success("Contribution recorded");
      setContributeFor(null); setContributeAmount("");
    } catch (err) {
      toast.error((err as Error).message ?? "Could not contribute");
    }
  }

  async function handleDelete(g: Goal) {
    if (!confirm(`Delete goal '${g.name}'?`)) return;
    try {
      await deleteGoal(g.id);
      toast.success("Goal deleted");
    } catch (err) {
      toast.error((err as Error).message ?? "Could not delete");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <Target className="h-3.5 w-3.5" /> Savings goals
          </div>
          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">Your goals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track personal savings alongside chama contributions.
          </p>
        </div>
        <Button variant="premium" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(!showForm)}>
          New goal
        </Button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-neutral-900/60 p-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Emergency fund"
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Target (KES)</label>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="500000"
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Target date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="premium" onClick={handleAdd}>Create goal</Button>
          </div>
        </motion.div>
      )}

      {isLoading && goals.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading…</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
          const daysLeft = Math.max(0, Math.ceil((new Date(g.targetDate).getTime() - Date.now()) / 86400000));
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-neutral-900/60 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{g.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3" /> {daysLeft} days left
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(g)}
                  className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  aria-label="Delete goal"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-white/[0.05] overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-500 to-emerald-400"
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 24 }}
                />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(g.currentAmount)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">of {formatCurrency(g.targetAmount)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <Badge variant={pct >= 100 ? "premium" : "default"}>{pct}%</Badge>
                <button
                  onClick={() => setContributeFor(g.id)}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
                >
                  <TrendingUp className="h-3.5 w-3.5" /> Contribute
                </button>
              </div>

              {contributeFor === g.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.05]">
                  <input
                    type="number"
                    value={contributeAmount}
                    onChange={(e) => setContributeAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Amount KES"
                    className="w-full rounded-lg border border-gray-300 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3 py-2 text-sm"
                  />
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="premium" onClick={handleContribute}>Add</Button>
                    <Button size="sm" variant="outline" onClick={() => { setContributeFor(null); setContributeAmount(""); }}>Cancel</Button>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
        {goals.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-16 text-gray-400 dark:text-gray-500">
            <Target className="mx-auto h-10 w-10" />
            <p className="mt-2 text-sm">No goals yet. Create your first.</p>
          </div>
        )}
      </div>
    </div>
  );
}
