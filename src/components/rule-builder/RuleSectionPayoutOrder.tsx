import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

export interface PayoutOrderRule {
  strategy: "rotation" | "lottery" | "by_need" | "merit_score";
  cycleMonths: number;
  allowSwap: boolean;
}

export function RuleSectionPayoutOrder({
  value,
  onChange,
}: {
  value: PayoutOrderRule;
  onChange: (next: PayoutOrderRule) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Select
        label="Payout strategy"
        value={value.strategy}
        onChange={(e) => onChange({ ...value, strategy: e.target.value as PayoutOrderRule["strategy"] })}
        options={[
          { value: "rotation", label: "Fixed rotation (merry-go-round)" },
          { value: "lottery", label: "Random lottery" },
          { value: "by_need", label: "By documented need" },
          { value: "merit_score", label: "Highest merit score" },
        ]}
      />
      <Input
        label="Cycle length (months)"
        type="number"
        min={1}
        max={24}
        value={value.cycleMonths}
        onChange={(e) => onChange({ ...value, cycleMonths: Number(e.target.value) })}
      />
      <Select
        label="Allow members to swap positions?"
        value={value.allowSwap ? "yes" : "no"}
        onChange={(e) => onChange({ ...value, allowSwap: e.target.value === "yes" })}
        options={[
          { value: "no", label: "No swapping" },
          { value: "yes", label: "Allow mutual swaps" },
        ]}
      />
    </div>
  );
}
