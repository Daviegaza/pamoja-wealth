import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export interface ContributionRule {
  amountKes: number;
  cadence: "weekly" | "biweekly" | "monthly";
  dueDay: number;
  graceDays: number;
}

export function RuleSectionContribution({
  value,
  onChange,
}: {
  value: ContributionRule;
  onChange: (next: ContributionRule) => void;
}) {
  const set = <K extends keyof ContributionRule>(k: K, v: ContributionRule[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input
        label="Amount (KES)"
        type="number"
        value={value.amountKes}
        onChange={(e) => set("amountKes", Number(e.target.value))}
      />
      <Select
        label="Cadence"
        value={value.cadence}
        onChange={(e) => set("cadence", e.target.value as ContributionRule["cadence"])}
        options={[
          { value: "weekly", label: "Weekly" },
          { value: "biweekly", label: "Every 2 weeks" },
          { value: "monthly", label: "Monthly" },
        ]}
      />
      <Input
        label="Due day"
        type="number"
        min={1}
        max={28}
        value={value.dueDay}
        onChange={(e) => set("dueDay", Number(e.target.value))}
        hint="Day of the cycle the contribution is due"
      />
      <Input
        label="Grace period (days)"
        type="number"
        min={0}
        max={30}
        value={value.graceDays}
        onChange={(e) => set("graceDays", Number(e.target.value))}
      />
    </div>
  );
}
