import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export interface VotingRule {
  passThresholdPct: number;
  quorumPct: number;
  weighting: "one_member_one_vote" | "by_shares" | "by_tenure";
  ballotDurationHours: number;
}

export function RuleSectionVoting({
  value,
  onChange,
}: {
  value: VotingRule;
  onChange: (next: VotingRule) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input
        label="Pass threshold (%)"
        type="number"
        min={50}
        max={100}
        value={value.passThresholdPct}
        onChange={(e) => onChange({ ...value, passThresholdPct: Number(e.target.value) })}
      />
      <Input
        label="Quorum (%)"
        type="number"
        min={0}
        max={100}
        value={value.quorumPct}
        onChange={(e) => onChange({ ...value, quorumPct: Number(e.target.value) })}
      />
      <Select
        label="Vote weighting"
        value={value.weighting}
        onChange={(e) => onChange({ ...value, weighting: e.target.value as VotingRule["weighting"] })}
        options={[
          { value: "one_member_one_vote", label: "One member, one vote" },
          { value: "by_shares", label: "Weighted by shares" },
          { value: "by_tenure", label: "Weighted by tenure" },
        ]}
      />
      <Input
        label="Ballot open for (hours)"
        type="number"
        min={1}
        max={168}
        value={value.ballotDurationHours}
        onChange={(e) => onChange({ ...value, ballotDurationHours: Number(e.target.value) })}
      />
    </div>
  );
}
