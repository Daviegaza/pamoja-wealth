import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export interface ExitRule {
  noticePeriodDays: number;
  missedContributionsTrigger: number;
  rollingWindowMonths: number;
  forfeitEntryBond: boolean;
  prorateRefund: boolean;
}

export function RuleSectionExit({
  value,
  onChange,
}: {
  value: ExitRule;
  onChange: (next: ExitRule) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input
        label="Notice period (days)"
        type="number"
        min={0}
        max={90}
        value={value.noticePeriodDays}
        onChange={(e) => onChange({ ...value, noticePeriodDays: Number(e.target.value) })}
      />
      <Input
        label="Auto-exit after N missed"
        type="number"
        min={0}
        max={24}
        value={value.missedContributionsTrigger}
        onChange={(e) => onChange({ ...value, missedContributionsTrigger: Number(e.target.value) })}
      />
      <Input
        label="Rolling window (months)"
        type="number"
        min={1}
        max={36}
        value={value.rollingWindowMonths}
        onChange={(e) => onChange({ ...value, rollingWindowMonths: Number(e.target.value) })}
      />
      <Select
        label="Forfeit entry bond?"
        value={value.forfeitEntryBond ? "yes" : "no"}
        onChange={(e) => onChange({ ...value, forfeitEntryBond: e.target.value === "yes" })}
        options={[
          { value: "no", label: "Return entry bond" },
          { value: "yes", label: "Forfeit entry bond" },
        ]}
      />
      <Select
        label="Refund pro-rated by tenure?"
        value={value.prorateRefund ? "yes" : "no"}
        onChange={(e) => onChange({ ...value, prorateRefund: e.target.value === "yes" })}
        options={[
          { value: "yes", label: "Yes — pro-rate by tenure" },
          { value: "no", label: "No — flat refund" },
        ]}
      />
    </div>
  );
}
