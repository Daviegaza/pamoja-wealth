import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export interface EntryDepositRule {
  amountKes: number;
  refundable: boolean;
  refundTrigger: "exit" | "tenure" | "never";
}

export function RuleSectionEntryDeposit({
  value,
  onChange,
}: {
  value: EntryDepositRule;
  onChange: (next: EntryDepositRule) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input
        label="Entry deposit (KES)"
        type="number"
        value={value.amountKes}
        onChange={(e) => onChange({ ...value, amountKes: Number(e.target.value) })}
      />
      <Select
        label="Refundable"
        value={value.refundable ? "yes" : "no"}
        onChange={(e) => onChange({ ...value, refundable: e.target.value === "yes" })}
        options={[
          { value: "yes", label: "Refundable" },
          { value: "no", label: "Non-refundable" },
        ]}
      />
      <Select
        label="Refund trigger"
        value={value.refundTrigger}
        onChange={(e) => onChange({ ...value, refundTrigger: e.target.value as EntryDepositRule["refundTrigger"] })}
        options={[
          { value: "exit", label: "On voluntary exit" },
          { value: "tenure", label: "After minimum tenure" },
          { value: "never", label: "Never (forfeit on exit)" },
        ]}
      />
    </div>
  );
}
