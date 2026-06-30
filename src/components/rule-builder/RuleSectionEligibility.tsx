import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export interface EligibilityRule {
  minAge: number;
  residency: "any" | "kenya" | "east_africa";
  kycLevel: "none" | "basic" | "full";
  requireReferral: boolean;
}

export function RuleSectionEligibility({
  value,
  onChange,
}: {
  value: EligibilityRule;
  onChange: (next: EligibilityRule) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input
        label="Minimum age"
        type="number"
        value={value.minAge}
        onChange={(e) => onChange({ ...value, minAge: Number(e.target.value) })}
      />
      <Select
        label="Residency"
        value={value.residency}
        onChange={(e) => onChange({ ...value, residency: e.target.value as EligibilityRule["residency"] })}
        options={[
          { value: "any", label: "Anywhere" },
          { value: "kenya", label: "Kenya only" },
          { value: "east_africa", label: "East Africa" },
        ]}
      />
      <Select
        label="KYC level required"
        value={value.kycLevel}
        onChange={(e) => onChange({ ...value, kycLevel: e.target.value as EligibilityRule["kycLevel"] })}
        options={[
          { value: "none", label: "None" },
          { value: "basic", label: "Basic (phone + name)" },
          { value: "full", label: "Full (ID + selfie)" },
        ]}
      />
      <Select
        label="Referral required"
        value={value.requireReferral ? "yes" : "no"}
        onChange={(e) => onChange({ ...value, requireReferral: e.target.value === "yes" })}
        options={[
          { value: "no", label: "Open to all" },
          { value: "yes", label: "Existing member must refer" },
        ]}
      />
    </div>
  );
}
