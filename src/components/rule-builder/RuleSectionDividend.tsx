import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export interface DividendRule {
  frequency: "monthly" | "quarterly" | "annual";
  reserveBufferPct: number;
  distributionBasis: "equal" | "shares" | "contribution";
}

export function RuleSectionDividend({
  value,
  onChange,
}: {
  value: DividendRule;
  onChange: (next: DividendRule) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Select
        label="Distribution frequency"
        value={value.frequency}
        onChange={(e) => onChange({ ...value, frequency: e.target.value as DividendRule["frequency"] })}
        options={[
          { value: "monthly", label: "Monthly" },
          { value: "quarterly", label: "Quarterly" },
          { value: "annual", label: "Annual" },
        ]}
      />
      <Input
        label="Reserve buffer (%)"
        type="number"
        min={0}
        max={50}
        value={value.reserveBufferPct}
        onChange={(e) => onChange({ ...value, reserveBufferPct: Number(e.target.value) })}
        hint="Held back for liquidity"
      />
      <Select
        label="Distribution basis"
        value={value.distributionBasis}
        onChange={(e) => onChange({ ...value, distributionBasis: e.target.value as DividendRule["distributionBasis"] })}
        options={[
          { value: "equal", label: "Equal split" },
          { value: "shares", label: "Proportional to shares" },
          { value: "contribution", label: "Proportional to total contributed" },
        ]}
      />
    </div>
  );
}
