import type { Vote } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";

const statusVariant: Record<Vote["status"], "info" | "default" | "success" | "danger"> = {
  open: "info",
  closed: "default",
  passed: "success",
  rejected: "danger",
};

export function VoteCard({ vote, onVote }: { vote: Vote; onVote?: (_optionId: string) => void }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="card-hover p-5">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{vote.title}</h3>
        <Badge variant={statusVariant[vote.status]} dot={vote.status === "open"} className="capitalize">
          {vote.status}
        </Badge>
      </div>
      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{vote.description}</p>
      <div className="mt-4 space-y-3">
        {vote.options.map((opt) => {
          const pct = vote.totalVotes > 0 ? (opt.count / vote.totalVotes) * 100 : 0;
          return (
            <div key={opt.id}>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1.5">
                <span className="font-semibold">{opt.label}</span>
                <span className="font-medium text-gray-500">
                  {opt.count} votes · {Math.round(pct)}%
                </span>
              </div>
              <ProgressBar
                value={pct}
                size="md"
                colorClassName="bg-gradient-to-r from-brand-500 to-brand-400"
              />
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-gray-400 font-medium">
          Closes {formatDate(vote.closesAt)}
        </p>
        {vote.status === "open" && onVote ? (
          <Button size="sm" variant="premium" onClick={() => onVote(vote.options[0]?.id)}>
            Cast Vote
          </Button>
        ) : vote.status === "open" ? (
          <Badge variant="success" dot>Voted</Badge>
        ) : null}
      </div>
    </motion.div>
  );
}
