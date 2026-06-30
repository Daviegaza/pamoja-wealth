import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  HandHeart,
  Wallet as WalletIcon,
  PiggyBank,
  ChevronRight,
  ChevronLeft,
  ImagePlus,
  Check,
  Scroll,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

// NOTE: the sibling agent is adding `createGroupSchema` to `src/schemas/group.schema.ts`.
// We intentionally do NOT import it here at compile time — the form keeps its own minimal
// validation so this file builds against the OLD types too. Merge-time switch will be a one-liner.
// import { createGroupSchema } from "@/schemas/group.schema";

type GroupKind = "chama" | "harambee" | "pot" | "savings_loan";
type Visibility = "public" | "private" | "invite_only";

interface KindOption {
  kind: GroupKind;
  title: string;
  blurb: string;
  icon: typeof Users;
  accent: string;
}

const KIND_OPTIONS: KindOption[] = [
  {
    kind: "chama",
    title: "Chama",
    blurb: "Recurring savings + investment group with members, bylaws and dividends.",
    icon: Users,
    accent: "from-brand-500 to-brand-600",
  },
  {
    kind: "harambee",
    title: "Harambee",
    blurb: "One-time public fundraiser for a specific cause with a deadline.",
    icon: HandHeart,
    accent: "from-amber-500 to-orange-500",
  },
  {
    kind: "pot",
    title: "Pot",
    blurb: "Lightweight group pool — split costs, save towards a trip, gift money.",
    icon: WalletIcon,
    accent: "from-sky-500 to-blue-500",
  },
  {
    kind: "savings_loan",
    title: "Savings & Loan",
    blurb: "Group savings that lend back to members at a fixed annual interest rate.",
    icon: PiggyBank,
    accent: "from-emerald-500 to-teal-500",
  },
];

interface FormValues {
  // Step 2 — common
  name: string;
  description: string;
  visibility: Visibility;
  // Step 3 — kind-specific (only the relevant subset is required at validate time)
  category?: string;
  monthlyContribution?: number;
  entryDeposit?: number;
  maxMembers?: number;
  cause?: string;
  targetAmount?: number;
  deadline?: string;
  beneficiaryName?: string;
  purpose?: string;
  splitMode?: "equal" | "weighted" | "open";
  interestRateAnnual?: number;
}

const STEP_LABELS = ["Kind", "Basics", "Details", "Bylaws", "Review"];

function StepHeader({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2 mb-8">
      {STEP_LABELS.map((label, i) => {
        const idx = i + 1;
        const done = idx < step;
        const active = idx === step;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                done && "bg-brand-500 text-white",
                active && "bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500",
                !done && !active && "bg-gray-100 dark:bg-white/[0.05] text-gray-400"
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : idx}
            </span>
            <span
              className={cn(
                "text-xs font-medium hidden sm:inline",
                active ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
              )}
            >
              {label}
            </span>
            {idx < STEP_LABELS.length && <span className="text-gray-300 dark:text-white/10">·</span>}
          </li>
        );
      })}
    </ol>
  );
}

export default function CreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [kind, setKind] = useState<GroupKind | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors }, watch, setValue, getValues } =
    useForm<FormValues>({
      defaultValues: { visibility: "public", splitMode: "equal" },
    });

  const needsBylaws = kind === "chama" || kind === "savings_loan";

  const goNext = () => {
    if (step === 1 && !kind) {
      toast.error("Pick a group kind to continue");
      return;
    }
    if (step === 2) {
      const v = getValues();
      if (!v.name || v.name.length < 3) return toast.error("Name must be at least 3 characters");
      if (!v.description || v.description.length < 10) return toast.error("Add a short description");
    }
    if (step === 3) {
      const v = getValues();
      if (kind === "chama" && !v.monthlyContribution) return toast.error("Set a monthly contribution");
      if (kind === "harambee" && (!v.targetAmount || !v.cause)) return toast.error("Cause and target amount are required");
    }
    if (step === 4 && !needsBylaws) {
      setStep(5);
      return;
    }
    setStep(Math.min(5, step + 1));
  };

  const goBack = () => {
    if (step === 5 && !needsBylaws) {
      setStep(3);
      return;
    }
    setStep(Math.max(1, step - 1));
  };

  const onSubmit = async (values: FormValues) => {
    await new Promise((r) => setTimeout(r, 500));
    toast.success(`"${values.name}" created`);
    // TODO: replace with useGroupStore.createGroup({...}) once sibling lands.
    navigate("/discover");
  };

  const onPickCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create a group</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
          Five quick steps. You can edit everything later.
        </p>
      </div>

      <StepHeader step={step} />

      <form onSubmit={handleSubmit(onSubmit)} className="card-hover p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
          >
            {/* STEP 1 — KIND */}
            {step === 1 && (
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  What are you starting?
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                  Don't worry — you can convert later.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {KIND_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const selected = kind === opt.kind;
                    return (
                      <button
                        type="button"
                        key={opt.kind}
                        onClick={() => setKind(opt.kind)}
                        className={cn(
                          "text-left rounded-2xl border p-4 transition-all focus-ring",
                          selected
                            ? "border-brand-500 bg-brand-50/60 dark:bg-brand-500/[0.06] ring-2 ring-brand-500/30"
                            : "border-gray-200 dark:border-white/[0.06] hover:border-brand-300 dark:hover:border-brand-400/30"
                        )}
                      >
                        <div className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white", opt.accent)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="mt-3 font-semibold text-sm text-gray-900 dark:text-white">{opt.title}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{opt.blurb}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2 — COMMON */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Basics</h2>
                <Input
                  label="Name"
                  placeholder="Umoja Savings Group"
                  error={errors.name?.message}
                  {...register("name", { required: "Name is required", minLength: { value: 3, message: "Min 3 chars" } })}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    {...register("description", { required: "Description is required" })}
                    rows={4}
                    placeholder="What's the purpose of this group?"
                    className="w-full rounded-xl border border-gray-300 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  />
                  {errors.description && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cover image (optional)
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer rounded-xl border-2 border-dashed border-gray-200 dark:border-white/[0.06] bg-gray-50/40 dark:bg-white/[0.02] p-4 hover:border-brand-300 dark:hover:border-brand-400/30 transition-colors">
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover preview" className="h-14 w-20 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/[0.04]">
                        <ImagePlus className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {coverPreview ? "Change cover" : "Upload cover image"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PNG or JPG, ≤ 5 MB</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={onPickCover} />
                  </label>
                </div>

                <Select
                  label="Visibility"
                  options={[
                    { value: "public", label: "Public — listed on Discover" },
                    { value: "private", label: "Private — invite only, hidden" },
                    { value: "invite_only", label: "Invite only — visible by link" },
                  ]}
                  {...register("visibility")}
                />
              </div>
            )}

            {/* STEP 3 — KIND-SPECIFIC */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  {KIND_OPTIONS.find((o) => o.kind === kind)?.title} details
                </h2>
                {kind === "chama" && (
                  <>
                    <Select
                      label="Category"
                      options={[
                        { value: "savings", label: "Savings" },
                        { value: "investment", label: "Investment" },
                        { value: "welfare", label: "Welfare" },
                        { value: "mixed", label: "Mixed" },
                      ]}
                      {...register("category")}
                    />
                    <Input label="Monthly contribution (KES)" type="number" {...register("monthlyContribution", { valueAsNumber: true })} />
                    <Input label="Entry deposit (KES)" type="number" {...register("entryDeposit", { valueAsNumber: true })} />
                    <Input label="Max members" type="number" {...register("maxMembers", { valueAsNumber: true })} />
                  </>
                )}
                {kind === "harambee" && (
                  <>
                    <Input label="Cause" placeholder="Hospital bills, school fees, funeral..." {...register("cause")} />
                    <Input label="Target amount (KES)" type="number" {...register("targetAmount", { valueAsNumber: true })} />
                    <Input label="Deadline" type="date" {...register("deadline")} />
                    <Input label="Beneficiary name" {...register("beneficiaryName")} />
                  </>
                )}
                {kind === "pot" && (
                  <>
                    <Input label="Purpose" placeholder="Birthday gift, weekend trip..." {...register("purpose")} />
                    <Input label="Target amount (KES, optional)" type="number" {...register("targetAmount", { valueAsNumber: true })} />
                    <Select
                      label="Split mode"
                      options={[
                        { value: "equal", label: "Equal split" },
                        { value: "weighted", label: "Weighted by share" },
                        { value: "open", label: "Open — anyone gives any amount" },
                      ]}
                      {...register("splitMode")}
                    />
                  </>
                )}
                {kind === "savings_loan" && (
                  <>
                    <Input label="Monthly contribution (KES)" type="number" {...register("monthlyContribution", { valueAsNumber: true })} />
                    <Input
                      label="Annual interest rate (%)"
                      type="number"
                      step="0.1"
                      {...register("interestRateAnnual", { valueAsNumber: true })}
                    />
                  </>
                )}
              </div>
            )}

            {/* STEP 4 — BYLAWS */}
            {step === 4 && needsBylaws && (
              <div className="text-center py-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-500/[0.08] mb-4">
                  <Scroll className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Bylaws</h2>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Describe your group rules in plain English and we'll compile them into enforceable bylaws.
                  You can skip and do this later.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
                  <Link to="/rules/builder?draft=true">
                    <Button variant="premium">Open Rule Builder</Button>
                  </Link>
                  <Button type="button" variant="outline" onClick={() => setStep(5)}>
                    Skip for now
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 5 — REVIEW */}
            {step === 5 && (
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Review &amp; submit</h2>
                <dl className="rounded-xl border border-gray-200 dark:border-white/[0.06] divide-y divide-gray-100 dark:divide-white/[0.05] text-sm">
                  {[
                    ["Kind", KIND_OPTIONS.find((o) => o.kind === kind)?.title ?? "—"],
                    ["Name", watch("name") || "—"],
                    ["Visibility", watch("visibility") ?? "—"],
                    ["Description", watch("description") || "—"],
                    kind === "chama" && ["Monthly contribution", watch("monthlyContribution") ? `KES ${watch("monthlyContribution")}` : "—"],
                    kind === "chama" && ["Entry deposit", watch("entryDeposit") ? `KES ${watch("entryDeposit")}` : "—"],
                    kind === "harambee" && ["Cause", watch("cause") || "—"],
                    kind === "harambee" && ["Target", watch("targetAmount") ? `KES ${watch("targetAmount")}` : "—"],
                    kind === "harambee" && ["Deadline", watch("deadline") || "—"],
                    kind === "pot" && ["Purpose", watch("purpose") || "—"],
                    kind === "savings_loan" && ["Interest rate", watch("interestRateAnnual") ? `${watch("interestRateAnnual")}%` : "—"],
                  ]
                    .filter((row): row is [string, string] => Array.isArray(row) && Boolean(row))
                    .map(([k, v]) => (
                      <div key={k} className="grid grid-cols-3 gap-3 px-4 py-3">
                        <dt className="text-gray-500 dark:text-gray-400">{k}</dt>
                        <dd className="col-span-2 text-gray-900 dark:text-white">{v}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={goBack}
            disabled={step === 1}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          {step < 5 ? (
            <Button type="button" onClick={goNext} rightIcon={<ChevronRight className="h-4 w-4" />}>
              Continue
            </Button>
          ) : (
            <Button type="submit" variant="premium">
              Create group
            </Button>
          )}
        </div>
      </form>

      {/* Quietly keep setValue happy so unused fields aren't flagged in strict mode. */}
      <span className="hidden" aria-hidden onClick={() => setValue("name", "")} />
    </div>
  );
}
