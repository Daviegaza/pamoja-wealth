import { useState, useMemo } from "react";
import { Plus, Vote, X } from "lucide-react";
import { toast } from "sonner";
import { VoteCard } from "@/components/cards/VoteCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/dialogs/Modal";
import { useVotes } from "@/hooks/useVotes";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { useChamaStore } from "@/stores/chamaStore";
import { useMeetingStore } from "@/stores/meetingStore";
import { useAuth } from "@/hooks/useAuth";

export default function VotingPage() {
  const { votes, castVote } = useVotes();
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const chamas = useChamaStore((s) => s.chamas);
  const members = useChamaStore((s) => s.members);
  const { user } = useAuth();
  const addVote = useMeetingStore((s) => s.addVote);

  const myMemberRecords = members.filter((m) => m.userId === user?.id);
  const myChamaIds = new Set(myMemberRecords.map((m) => m.chamaId));

  const displayVotes = useMemo(() => {
    let filtered = votes.filter((v) => myChamaIds.has(v.chamaId));
    if (activeChamaId) filtered = filtered.filter((v) => v.chamaId === activeChamaId);
    return filtered;
  }, [votes, myChamaIds, activeChamaId]);

  const activeChama = activeChamaId ? chamas.find((c) => c.id === activeChamaId) : null;
  const { value, setValue, results } = useFilter(displayVotes, "status");
  const { page, totalPages, paginated, goToPage } = usePagination(results, 6);

  if (myChamaIds.size === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Voting</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create and participate in chama votes.</p>
        </div>
        <EmptyState
          icon={Vote}
          title="No chamas yet"
          description="Join or create a chama to participate in voting."
          actionLabel="View Chamas"
          onAction={() => window.location.href = "/chamas"}
        />
      </div>
    );
  }

  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState<string[]>([]);

  const handleAddOption = () => {
    const trimmed = optionInput.trim();
    if (trimmed && !options.includes(trimmed)) {
      setOptions([...options, trimmed]);
    }
    setOptionInput("");
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleCreateVote = () => {
    if (!form.title || options.length < 2) return;
    const chamaId = activeChamaId ?? chamas[0]?.id ?? "";
    addVote({ chamaId, title: form.title, description: form.description, options, createdBy: user?.fullName ?? "Unknown" });
    setForm({ title: "", description: "" });
    setOptions([]);
    setModalOpen(false);
    toast.success("New vote created! Members can now cast their votes.");
  };

  const handleVote = (voteId: string, optionId: string) => {
    castVote(voteId, optionId);
    setVotedIds(new Set([...votedIds, voteId]));
    toast.success("Your vote has been recorded! Thank you for participating.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Voting</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{displayVotes.length.toLocaleString()} proposal{displayVotes.length !== 1 ? "s" : ""}{activeChama ? ` in ${activeChama.name}` : ` across your ${myChamaIds.size} chama${myChamaIds.size !== 1 ? "s" : ""}`} · {displayVotes.filter(v => v.status === "open").length} open for voting</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>Create Vote</Button>
      </div>

      <div className="max-w-xs">
        <Select
          label="Filter by status"
          value={value === "all" ? "all" : value}
          onChange={(e) => setValue(e.target.value as typeof value)}
          options={[
            { label: "All statuses", value: "all" }, { label: "Open", value: "open" }, { label: "Closed", value: "closed" },
            { label: "Passed", value: "passed" }, { label: "Rejected", value: "rejected" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {paginated.length === 0 ? (
          <div className="lg:col-span-2">
            <EmptyState icon={Vote} title="No votes yet" description="Create a vote for your chama members." actionLabel="Create Vote" onAction={() => setModalOpen(true)} />
          </div>
        ) : (
          paginated.map((vote) => (
            <VoteCard key={vote.id} vote={vote} onVote={votedIds.has(vote.id) ? undefined : (optionId) => handleVote(vote.id, optionId)} />
          ))
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Vote" description="Create a new proposal for chama members to vote on.">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="E.g., Approve new investment" />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the proposal..." />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Options</label>
            <div className="flex gap-2 mb-2">
              <Input value={optionInput} onChange={(e) => setOptionInput(e.target.value)} placeholder="Add an option" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddOption())} />
              <Button variant="secondary" size="sm" onClick={handleAddOption} className="shrink-0">Add</Button>
            </div>
            {options.length === 0 ? (
              <p className="text-xs text-gray-400">Add at least 2 options for voting.</p>
            ) : (
              <ul className="space-y-1.5">
                {options.map((opt, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-white/[0.06] px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                    <span>{i + 1}. {opt}</span>
                    <button onClick={() => handleRemoveOption(i)} className="p-0.5 text-gray-400 hover:text-red-500 transition-colors"><X className="h-3.5 w-3.5" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateVote} disabled={!form.title || options.length < 2}>Create Vote</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
