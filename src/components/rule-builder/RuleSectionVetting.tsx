import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export interface VettingRule {
  mode: "auto" | "admin_review" | "member_vote";
  approverQuorumPct: number;
  reviewWindowDays: number;
}

export function RuleSectionVetting({
  value,
  onChange,
}: {
  value: VettingRule;
  onChange: (next: VettingRule) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Select
        label="Vetting mode"
        value={value.mode}
        onChange={(e) => onChange({ ...value, mode: e.target.value as VettingRule["mode"] })}
        options={[
          { value: "auto", label: "Auto-approve" },
          { value: "admin_review", label: "Admin review" },
          { value: "member_vote", label: "Member vote" },
        ]}
      />
      <Input
        label="Approval quorum (%)"
        type="number"
        min={0}
        max={100}
        value={value.approverQuorumPct}
        onChange={(e) => onChange({ ...value, approverQuorumPct: Number(e.target.value) })}
      />
      <Input
        label="Review window (days)"
        type="number"
        min={1}
        max={30}
        value={value.reviewWindowDays}
        onChange={(e) => onChange({ ...value, reviewWindowDays: Number(e.target.value) })}
      />
    </div>
  );
}
