import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { createChamaSchema, type CreateChamaFormValues } from "@/schemas/chama.schema";
import { createChama } from "@/api/chama";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import {
  Smartphone, Building2, QrCode, Landmark, CreditCard,
  ShieldCheck, Lock, Fingerprint, Banknote, Globe,
} from "lucide-react";

const PAYMENT_SECURITY_FEATURES = [
  { icon: Lock, label: "AES-256 encrypted" },
  { icon: ShieldCheck, label: "PCI DSS compliant" },
  { icon: Fingerprint, label: "Fraud detection" },
];

export function CreateChamaForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [chamaType, setChamaType] = useState<"chama" | "fundraiser" | "pot">("chama");
  const [selectedPayments, setSelectedPayments] = useState<string[]>(["mpesa"]);

  const togglePayment = (method: string) => {
    setSelectedPayments((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<CreateChamaFormValues>({
    resolver: zodResolver(createChamaSchema),
    defaultValues: { type: "chama", privacy: "public", monthlyContribution: 1000 },
  });

  const onSubmit = async (values: CreateChamaFormValues) => {
    try {
      const payload = {
        name: values.name,
        description: values.description,
        category: values.category,
        type: values.type,
        privacy: values.privacy,
        monthlyContribution: values.monthlyContribution,
        location: values.location,
        paymentMethods: selectedPayments,
        paybillAccountNumber: values.paybillNumber || values.tillNumber || values.mpesaPhone || values.bankAccount || undefined,
        mpesaPhone: values.mpesaPhone || undefined,
        bankName: values.bankName || undefined,
        bankAccount: values.bankAccount || undefined,
        bankBranch: values.bankBranch || undefined,
        ...(values.type === "fundraiser" && values.targetAmount ? { targetAmount: values.targetAmount } : {}),
        ...(values.type === "fundraiser" && values.deadline ? { deadline: values.deadline } : {}),
      };
      const result = await createChama(payload as any);
      const created = (result as any)?.chama ?? result;
      const newId = created?.id;
      await qc.invalidateQueries({ queryKey: ["chamas", "mine"] });
      toast.success(`"${values.name}" was created successfully!`);
      if (selectedPayments.length > 0) {
        toast.success(`${selectedPayments.length} payment method${selectedPayments.length > 1 ? "s" : ""} configured!`, {
          description: "Members can start contributing immediately.",
          duration: 5000,
        });
      }
      if (values.type === "fundraiser") {
        toast.success("Fundraiser created! Share it to start receiving donations.", { duration: 6000 });
      }
      if (newId) navigate(`/chamas/${newId}`);
      else navigate("/chamas");
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Could not create chama");
    }
  };

  const isFundraiser = chamaType === "fundraiser";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ── Type selector ── */}
      <div>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
          What are you creating?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "chama" as const, label: "Chama", desc: "Savings group", icon: Building2 },
            { value: "fundraiser" as const, label: "Fundraiser", desc: "Harambee", icon: Globe },
            { value: "pot" as const, label: "Pot", desc: "Money pool", icon: Banknote },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setChamaType(opt.value);
                setValue("type", opt.value);
                if (opt.value === "fundraiser") setSelectedPayments(["mpesa"]);
              }}
              className={`rounded-xl border-2 p-3 text-center transition-all ${
                chamaType === opt.value
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-500/[0.08] shadow-sm"
                  : "border-gray-200 dark:border-white/[0.08] hover:border-brand-300"
              }`}
            >
              <opt.icon className={`h-5 w-5 mx-auto mb-1 ${chamaType === opt.value ? "text-brand-600 dark:text-brand-400" : "text-gray-400"}`} />
              <p className="text-sm font-bold text-gray-900 dark:text-white">{opt.label}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Basic info ── */}
      <Input label="Name" placeholder={isFundraiser ? "Mama Asha Cancer Treatment Appeal" : "Umoja Savings Group"} error={errors.name?.message} {...register("name")} />
      <Input label="Description" placeholder="What is this about?" error={errors.description?.message} {...register("description")} />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Category"
          options={[
            { label: "Savings", value: "savings" },
            { label: "Investment", value: "investment" },
            { label: "Welfare", value: "welfare" },
            { label: "Mixed", value: "mixed" },
          ]}
          error={errors.category?.message}
          {...register("category")}
        />
        <Select
          label="Privacy"
          options={[
            { label: "Public — anyone can find", value: "public" },
            { label: "Private — hidden", value: "private" },
            { label: "Invite Only", value: "invite_only" },
          ]}
          {...register("privacy")}
        />
      </div>

      <Input
        label={isFundraiser ? "Suggested donation (KES)" : "Monthly contribution (KES)"}
        type="number" placeholder={isFundraiser ? "500" : "1000"}
        error={errors.monthlyContribution?.message} {...register("monthlyContribution")}
        hint={isFundraiser ? "Suggested amount per donation" : "Required contribution per member each month"} />

      {/* ── Fundraiser-specific ── */}
      {isFundraiser && (
        <div className="rounded-xl border-2 border-amber-200 dark:border-amber-500/20 bg-gradient-to-br from-amber-50/70 to-orange-50/50 dark:from-amber-500/[0.06] dark:to-orange-500/[0.03] p-5 space-y-3">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Fundraiser Setup
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Target amount (KES)" type="number" placeholder="500,000"
              error={errors.targetAmount?.message} {...register("targetAmount")} />
            <Input label="Deadline" type="date"
              error={errors.deadline?.message} {...register("deadline")}
              hint="Final day for donations" />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          PAYMENT METHODS — Always visible, always prominent
          ══════════════════════════════════════════════════════════════════ */}
      <div className="border-t-2 border-gray-100 dark:border-white/[0.06] pt-5">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            💰 Payment Methods
          </h3>
          <span className="rounded-full bg-red-100 dark:bg-red-500/[0.15] px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
            REQUIRED
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Choose how members will send money. At least one method is required.
        </p>

        {/* Payment method selector cards */}
        {isFundraiser ? (
          <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/[0.04] p-4 mb-5 text-center">
            <Smartphone className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">M-Pesa STK Push</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Fundraisers use M-Pesa STK Push — donors pay instantly with their phone number. No bank, no card, no Paybill needed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              {
                id: "mpesa",
                label: "M-Pesa",
                icon: Smartphone,
                desc: "STK Push",
                color: "emerald",
                checked: selectedPayments.includes("mpesa"),
              },
              {
                id: "bank",
                label: "Bank Transfer",
                icon: Landmark,
                desc: "Direct deposit",
                color: "blue",
                checked: selectedPayments.includes("bank"),
              },
              {
                id: "card",
                label: "Card Payment",
                icon: CreditCard,
                desc: "Visa / Mastercard",
                color: "purple",
                checked: selectedPayments.includes("card"),
              },
            ].map((pm) => (
              <button
                key={pm.id}
                type="button"
                onClick={() => togglePayment(pm.id)}
                className={`rounded-xl border-2 p-4 text-center transition-all ${
                  pm.checked
                    ? `border-${pm.color}-500 bg-${pm.color}-50 dark:bg-${pm.color}-500/[0.08] shadow-sm`
                    : "border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/[0.15] opacity-70 hover:opacity-100"
                }`}
              >
                <pm.icon className={`h-6 w-6 mx-auto mb-1.5 ${
                  pm.checked ? `text-${pm.color}-600 dark:text-${pm.color}-400` : "text-gray-400"
                }`} />
                <p className="text-sm font-bold text-gray-900 dark:text-white">{pm.label}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{pm.desc}</p>
                {pm.checked && (
                  <span className={`inline-block mt-2 rounded-full bg-${pm.color}-500 px-2 py-0.5 text-[9px] font-bold text-white`}>
                    Enabled
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── M-Pesa fields ── */}
        {selectedPayments.includes("mpesa") && (
          <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-500/[0.04] dark:to-green-500/[0.02] p-5 space-y-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
                  {isFundraiser ? "M-Pesa STK Push — Donors pay instantly" : "M-Pesa STK Push — Members pay instantly"}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {isFundraiser
                    ? "Donors enter their phone number → M-Pesa pop-up → enter PIN → paid. No Paybill, no Till, no Pochi needed."
                    : "Members enter their phone number → M-Pesa pop-up → enter PIN → paid. No Paybill, no Till needed."}
                </p>
              </div>
            </div>

            {/* PRIMARY: Phone number for STK Push — this is all that's needed */}
            <div className="rounded-lg bg-white dark:bg-white/[0.04] border-2 border-emerald-300 dark:border-emerald-500/40 p-4">
              <p className="text-xs font-bold text-gray-900 dark:text-white mb-2">
                📱 {isFundraiser ? "Your M-Pesa phone number" : "Admin M-Pesa phone number"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {isFundraiser
                  ? "This is the number donations will be sent to. Donors pay via STK Push — M-Pesa pops up on THEIR phone, they enter THEIR PIN, and the money lands in YOUR M-Pesa. That's it. No Paybill. No Till. No Pochi setup. Just a phone number."
                  : "STK Push sends a pop-up to members' phones. They enter their PIN and the money moves instantly. Members use their own number — this admin number is for testing."}
              </p>
              <Input
                label={isFundraiser ? "M-Pesa phone number to receive donations" : "Admin M-Pesa phone number"}
                placeholder="+254 712 345 678"
                error={errors.mpesaPhone?.message}
                {...register("mpesaPhone")}
                hint={isFundraiser
                  ? "Donations go straight to this M-Pesa number via STK Push"
                  : "Members use their own number when contributing"} />
            </div>

            {/* Paybill/Till — collapsed by default for fundraisers since STK Push is all you need */}
            {!isFundraiser && (
              <>
                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-white/[0.06]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white dark:bg-neutral-950 px-3 text-[10px] text-gray-400 font-medium uppercase tracking-wider">Optional: Paybill or Till</span>
                  </div>
                </div>

                <Input
                  label="Paybill Business Number (optional)"
                  placeholder="e.g. 247247"
                  {...register("paybillNumber")}
                  hint="Safaricom Paybill number for your chama" />

                <Input
                  label="Till Number (optional)"
                  placeholder="e.g. 5123456"
                  {...register("tillNumber")}
                  hint="Lipa Na M-Pesa Till number" />
              </>
            )}

            <div className="rounded-lg bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] p-3 flex items-start gap-3">
              <QrCode className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <strong className="text-gray-900 dark:text-white">How it works:</strong>{" "}
                {isFundraiser
                  ? "You share the fundraiser link. Donors open it, enter their phone number, tap Donate. M-Pesa pops up on their phone asking for their PIN. They enter it. Money moves instantly from their M-Pesa to yours. Every donation is recorded in the transparent ledger."
                  : "Member opens the chama, taps Contribute, enters amount. M-Pesa pops up on their phone. They enter PIN. Money moves from their M-Pesa to the chama. Recorded in the transparent double-entry ledger."}
                {" "}QR code for quick access is auto-generated.
              </div>
            </div>
          </div>
        )}

        {/* ── Bank fields ── */}
        {selectedPayments.includes("bank") && (
          <div className="rounded-xl border-2 border-blue-200 dark:border-blue-500/20 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-500/[0.04] dark:to-indigo-500/[0.02] p-5 space-y-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-800 dark:text-blue-400">Bank Transfer Setup</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Members deposit directly to the chama bank account</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Bank Name" placeholder="e.g. Equity Bank"
                error={errors.bankName?.message} {...register("bankName")} />
              <Input label="Branch" placeholder="e.g. Nairobi CBD"
                error={errors.bankBranch?.message} {...register("bankBranch")} />
            </div>
            <Input label="Account Number" placeholder="e.g. 1234567890"
              error={errors.bankAccount?.message} {...register("bankAccount")}
              hint="The chama's dedicated bank account number" />
          </div>
        )}

        {/* ── Card fields ── */}
        {selectedPayments.includes("card") && (
          <div className="rounded-xl border-2 border-purple-200 dark:border-purple-500/20 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-500/[0.04] dark:to-violet-500/[0.02] p-5 space-y-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500 text-white">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-purple-800 dark:text-purple-400">Card Payments</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Accept Visa, Mastercard, and mobile money cards</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💳 Card payments are processed via <strong>Flutterwave</strong> or <strong>Stripe</strong>.
              You'll be redirected to complete card setup after creating this group.
            </p>
          </div>
        )}

        {/* ── Security badges ── */}
        <div className="rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Security & Compliance</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_SECURITY_FEATURES.map((feat) => (
              <div key={feat.label} className="flex items-center gap-1.5 rounded-lg bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.04] px-2.5 py-2">
                <feat.icon className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{feat.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">
            All payment data is encrypted with AES-256-GCM. We never store raw card numbers or M-Pesa PINs.
            Our platform is PCI DSS Level 1 compliant. All transactions are recorded in an immutable,
            hash-chained audit ledger — tamper-proof and fully transparent.
          </p>
        </div>

        {selectedPayments.length === 0 && (
          <p className="mt-2 text-xs text-red-500 font-medium">
            ⚠️ Select at least one payment method so members can contribute.
          </p>
        )}
      </div>

      {/* ── Location ── */}
      <Input label="Location" placeholder="Nairobi, Kenya" error={errors.location?.message} {...register("location")} />

      {/* ── Submit ── */}
      <Button
        type="submit"
        className="w-full"
        isLoading={isSubmitting}
        disabled={selectedPayments.length === 0}
        variant="premium"
        size="lg"
      >
        {isSubmitting
          ? "Creating..."
          : isFundraiser
            ? "🚀 Create Fundraiser"
            : chamaType === "pot"
              ? "💰 Create Pot"
              : "✅ Create Chama"}
      </Button>

      <p className="text-center text-[11px] text-gray-400 dark:text-gray-500">
        You can change payment methods and settings anytime after creation.
      </p>
    </form>
  );
}
