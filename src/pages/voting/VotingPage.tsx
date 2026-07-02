import { useState, useMemo } from "react";
import { Plus, Vote as VoteIcon, X } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { VoteCard } from "@/components/cards/VoteCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/dialogs/Modal";
import { useChamaStore } from "@/stores/chamaStore";
import { usePagination } from "@/hooks/usePagination";
import {
  listVotes,
  castVote as apiCastVote,
  createVote as apiCreateVote,
  type VoteDTO,
  type VoteStatus,
  type ListVotesParams,
} from "@/api/votes";
import type { Vote } from "@/types";

type StatusFilter = VoteStatus | "all";

function toVote(dto: VoteDTO): Vote {
  return {
    id: dto.id,
    chamaId: dto.chamaId,
    title: dto.title,
    description: dto.description ?? "",
    options: dto.options,
    status: dto.status,
    createdAt: dto.createdAt,
    closesAt: dto.closesAt,
    totalVotes: dto.totalVotes,
    createdBy: dto.createdBy,
  };
}

function extractApiError(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const status = err.response?.status;
    const data = err.response?.data as { message?: string; error?: { message?: string } } | undefined;
    const message = data?.error?.message ?? data?.message;
    if (status === 403) return "You do not have permission to perform this action.";
    if (message) return message;
  }
  return fallback;
}

export default function VotingPage() {
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const chamas = useChamaStore((s) => s.chamas);
  const qc = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState<string[]>([]);

  const filters: ListVotesParams = useMemo(() => {
    const f: ListVotesParams = { page: 1, pageSize: 50 };
    if (activeChamaId) f.chamaId = activeChamaId;
    if (statusFilter !== "all") f.status = statusFilter;
    return f;
  }, [activeChamaId, statusFilter]);

  const votesQuery = useQuery({
    queryKey: ["votes", filters],
    queryFn: () => listVotes(filters),
  });

  const castMutation = useMutation({
    mutationFn: ({ voteId, optionId }: { voteId: string; optionId: string }) =>
      apiCastVote(voteId, { optionId }),
    onSuccess: (_data, vars) => {
      setVotedIds((prev) => new Set([...prev, vars.voteId]));
      toast.success("Your vote has been recorded! Thank you for participating.");
      qc.invalidateQueries({ queryKey: ["votes"] });
    },
    onError: (err) => {
      toast.error(extractApiError(err, "Failed to cast vote."));
    },
  });

  const createMutation = useMutation({
    mutationFn: apiCreateVote,
    onSuccess: () => {
      toast.success("New vote created! Members can now cast their votes.");
      setForm({ title: "", description: "" });
      setOptions([]);
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["votes"] });
    },
    onError: (err) => {
      toast.error(extractApiError(err, "You do not have permission to create a vote."));
    },
  });

  const votes: Vote[] = useMemo(
    () => (votesQuery.data?.items ?? []).map(toVote),
    [votesQuery.data],
  );

  const activeChama = activeChamaId ? chamas.find((c) => c.id === activeChamaId) : null;
  const { page, totalPages, paginated, goToPage } = usePagination(votes, 6);

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
    if (!chamaId) {
      toast.error("Select a chama before creating a vote.");
      return;
    }
    const closesAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    createMutation.mutate({
      chamaId,
      title: form.title,
      description: form.description || undefined,
      options,
      closesAt,
    });
  };

  const handleVote = (voteId: string, optionId: string) => {
    castMutation.mutate({ voteId, optionId });
  };

  const openCount = votes.filter((v) => v.status === "open").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Voting</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {votes.length.toLocaleString()} proposal{votes.length !== 1 ? "s" : ""}
            {activeChama ? ` in ${activeChama.name}` : ""} · {openCount} open for voting
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
          Create Vote
        </Button>
      </div>

      <div className="max-w-xs">
        <Select
          label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          options={[
            { label: "All statuses", value: "all" },
            { label: "Open", value: "open" },
            { label: "Closed", value: "closed" },
            { label: "Passed", value: "passed" },
            { label: "Rejected", value: "rejected" },
          ]}
        />
      </div>

      {votesQuery.isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          Loading votes...
        </div>
      ) : votesQuery.isError ? (
        <EmptyState
          icon={VoteIcon}
          title="Unable to load votes"
          description={extractApiError(votesQuery.error, "Please try again shortly.")}
          actionLabel="Retry"
          onAction={() => votesQuery.refetch()}
        />
      ) : paginated.length === 0 ? (
        <EmptyState
          icon={VoteIcon}
          title="No active votes"
          description="There are no votes to display right now."
          actionLabel="Create Vote"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {paginated.map((vote) => (
              <VoteCard
                key={vote.id}
                vote={vote}
                onVote={votedIds.has(vote.id) ? undefined : (optionId) => handleVote(vote.id, optionId)}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Vote"
        description="Create a new proposal for chama members to vote on."
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="E.g., Approve new investment"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the proposal..."
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Options
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={optionInput}
                onChange={(e) => setOptionInput(e.target.value)}
                placeholder="Add an option"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddOption())}
              />
              <Button variant="secondary" size="sm" onClick={handleAddOption} className="shrink-0">
                Add
              </Button>
            </div>
            {options.length === 0 ? (
              <p className="text-xs text-gray-400">Add at least 2 options for voting.</p>
            ) : (
              <ul className="space-y-1.5">
                {options.map((opt, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-white/[0.06] px-3 py-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span>
                      {i + 1}. {opt}
                    </span>
                    <button
                      onClick={() => handleRemoveOption(i)}
                      className="p-0.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateVote}
              disabled={!form.title || options.length < 2 || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Vote"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
