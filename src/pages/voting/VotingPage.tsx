import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { VoteCard } from "@/components/cards/VoteCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/common/Pagination";
import { useVotes } from "@/hooks/useVotes";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";

export default function VotingPage() {
  const { votes, castVote } = useVotes();
  const { value, setValue, results } = useFilter(votes, "status");
  const { page, totalPages, paginated, goToPage } = usePagination(results, 6);

  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const handleVote = (voteId: string, optionId: string) => {
    castVote(voteId, optionId);
    setVotedIds(new Set([...votedIds, voteId]));
    toast.success("✅ Your vote has been recorded! Thank you for participating.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Voting</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{votes.length.toLocaleString()} proposals · {votes.filter(v => v.status === "open").length} open for voting</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => toast.success("New vote created! Members can now cast their votes.")}>Create Vote</Button>
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
        {paginated.map((vote) => (
          <VoteCard key={vote.id} vote={vote} onVote={votedIds.has(vote.id) ? undefined : (optionId) => handleVote(vote.id, optionId)} />
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </div>
  );
}
