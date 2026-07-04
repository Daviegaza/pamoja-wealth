import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  IdCard, Camera, MapPin, ShieldCheck, Check, ChevronRight, ChevronLeft,
  Upload, Loader2, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  getKycStatus, uploadKycDocument, screenPep,
  type KycStatusDTO, type KycDocumentType,
} from "@/api/kyc";

import { USE_MOCKS } from "@/lib/env";

type StepId = "welcome" | "id" | "selfie" | "address" | "pep" | "done";
const STEP_ORDER: StepId[] = ["welcome", "id", "selfie", "address", "pep", "done"];

interface UploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  uploaded: boolean;
}

function emptyUpload(): UploadState {
  return { file: null, preview: null, uploading: false, uploaded: false };
}

export default function KycWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<StepId>("welcome");
  const [status, setStatus] = useState<KycStatusDTO | null>(null);
  const [idUpload, setIdUpload] = useState<UploadState>(emptyUpload());
  const [selfieUpload, setSelfieUpload] = useState<UploadState>(emptyUpload());
  const [addressUpload, setAddressUpload] = useState<UploadState>(emptyUpload());
  const [screening, setScreening] = useState(false);
  const [screenResult, setScreenResult] = useState<{ pepMatch: boolean; sanctionsMatch: boolean } | null>(null);

  const stepIndex = STEP_ORDER.indexOf(step);
  const progressPct = (stepIndex / (STEP_ORDER.length - 1)) * 100;

  useEffect(() => {
    if (USE_MOCKS) return;
    getKycStatus().then(setStatus).catch(() => { /* new user, no status yet */ });
  }, []);

  const canProceed = useMemo(() => {
    switch (step) {
      case "welcome": return true;
      case "id": return idUpload.uploaded;
      case "selfie": return selfieUpload.uploaded;
      case "address": return addressUpload.uploaded;
      case "pep": return !!screenResult && !screenResult.sanctionsMatch;
      case "done": return true;
    }
  }, [step, idUpload, selfieUpload, addressUpload, screenResult]);

  const go = (dir: 1 | -1) => {
    const nextIdx = Math.max(0, Math.min(STEP_ORDER.length - 1, stepIndex + dir));
    setStep(STEP_ORDER[nextIdx]);
  };

  async function handleUpload(
    docType: KycDocumentType,
    upload: UploadState,
    setUpload: (u: UploadState) => void,
  ) {
    if (!upload.file) return;
    setUpload({ ...upload, uploading: true });
    try {
      if (!USE_MOCKS) {
        await uploadKycDocument(upload.file, docType);
      } else {
        await new Promise((r) => setTimeout(r, 900));
      }
      setUpload({ ...upload, uploading: false, uploaded: true });
      toast.success(`${docType.replace("_", " ")} uploaded`);
    } catch (err) {
      setUpload({ ...upload, uploading: false });
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? "Upload failed";
      toast.error(msg);
    }
  }

  async function runScreening() {
    setScreening(true);
    try {
      if (USE_MOCKS) {
        await new Promise((r) => setTimeout(r, 1400));
        setScreenResult({ pepMatch: false, sanctionsMatch: false });
      } else {
        const r = await screenPep();
        setScreenResult({ pepMatch: r.pepMatch, sanctionsMatch: r.sanctionsMatch });
      }
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? "Screening failed";
      toast.error(msg);
    } finally {
      setScreening(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="premium">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Identity verification
          </Badge>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            Step {stepIndex + 1} / {STEP_ORDER.length}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.05] overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-500 to-emerald-400"
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-neutral-900/60 backdrop-blur-sm shadow-soft-xl p-8"
        >
          {step === "welcome" && (
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-brand-50 dark:bg-brand-500/[0.08] flex items-center justify-center text-brand-600 dark:text-brand-400">
                <Sparkles className="h-8 w-8" />
              </div>
              <h1 className="mt-5 text-3xl font-bold text-gray-900 dark:text-white">
                Verify to unlock full features
              </h1>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Kenya DPA + CBK require ID verification before you move real money.
                Takes 3 minutes. Then contribute, withdraw, or launch a chama.
              </p>
              <ul className="mt-6 space-y-2 max-w-sm mx-auto text-left">
                {[
                  "Government-issued ID",
                  "Live selfie for face-match",
                  "Proof of address (optional for Tier-2)",
                  "PEP + sanctions screening",
                ].map((line) => (
                  <li key={line} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" /> {line}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === "id" && (
            <UploadStep
              icon={IdCard}
              title="Upload your ID"
              body="National ID, passport, or driver's licence. JPG, PNG, HEIC or PDF up to 10 MB."
              upload={idUpload}
              onSelect={(file, preview) => setIdUpload({ ...emptyUpload(), file, preview })}
              onUpload={() => handleUpload("national_id", idUpload, setIdUpload)}
            />
          )}

          {step === "selfie" && (
            <UploadStep
              icon={Camera}
              title="Take a selfie"
              body="Hold your face in good light. We match your live selfie against the ID photo."
              upload={selfieUpload}
              onSelect={(file, preview) => setSelfieUpload({ ...emptyUpload(), file, preview })}
              onUpload={() => handleUpload("selfie", selfieUpload, setSelfieUpload)}
              captureFacingUser
            />
          )}

          {step === "address" && (
            <UploadStep
              icon={MapPin}
              title="Proof of address"
              body="Utility bill, bank statement, or lease from the last 3 months. Speeds up Tier-2 limits."
              upload={addressUpload}
              onSelect={(file, preview) => setAddressUpload({ ...emptyUpload(), file, preview })}
              onUpload={() => handleUpload("proof_of_address", addressUpload, setAddressUpload)}
            />
          )}

          {step === "pep" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-brand-50 dark:bg-brand-500/[0.08] flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">PEP + sanctions check</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    We screen against OFAC, UN, EU, and Kenya lists. Required for KES ≥ 100k flows.
                  </p>
                </div>
              </div>
              {!screenResult && (
                <Button size="lg" variant="premium" onClick={runScreening} isLoading={screening} className="w-full">
                  {screening ? "Screening…" : "Run screening"}
                </Button>
              )}
              {screenResult && (
                <div className="rounded-xl border border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02] p-4 space-y-2">
                  <ScreenLine label="Sanctions match" bad={screenResult.sanctionsMatch} />
                  <ScreenLine label="Politically Exposed Person (PEP)" bad={screenResult.pepMatch} warn />
                  {screenResult.sanctionsMatch && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      Sanctions hit — contact support to escalate. You cannot proceed.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-emerald-50 dark:bg-emerald-500/[0.1] flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Check className="h-10 w-10" />
              </div>
              <h1 className="mt-5 text-3xl font-bold text-gray-900 dark:text-white">You're verified</h1>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Your KYC review usually clears within 15 minutes. Meanwhile you can contribute up to Tier-1 limits (KES 25k / day).
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" variant="premium" onClick={() => navigate("/dashboard")}>
                  Go to dashboard
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/chamas/create")}>
                  Create a chama
                </Button>
              </div>
              {status && (
                <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 font-mono">
                  KYC tier {status.tier} · daily limit KES {status.dailyLimitKes?.toLocaleString?.() ?? "25,000"}
                </p>
              )}
            </div>
          )}
        </motion.section>
      </AnimatePresence>

      {/* Nav */}
      {step !== "done" && (
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            leftIcon={<ChevronLeft className="h-4 w-4" />}
            onClick={() => go(-1)}
            disabled={stepIndex === 0}
          >
            Back
          </Button>
          <Button
            variant="premium"
            rightIcon={<ChevronRight className="h-4 w-4" />}
            onClick={() => go(1)}
            disabled={!canProceed}
          >
            {step === "pep" ? "Finish" : "Continue"}
          </Button>
        </div>
      )}
    </div>
  );
}

function ScreenLine({ label, bad, warn }: { label: string; bad: boolean; warn?: boolean }) {
  const color = bad
    ? (warn ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")
    : "text-emerald-600 dark:text-emerald-400";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      <span className={`font-semibold ${color}`}>{bad ? (warn ? "Flagged for review" : "Match") : "Clear"}</span>
    </div>
  );
}

interface UploadStepProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  upload: UploadState;
  onSelect: (file: File, preview: string | null) => void;
  onUpload: () => void;
  captureFacingUser?: boolean;
}

function UploadStep({ icon: Icon, title, body, upload, onSelect, onUpload, captureFacingUser }: UploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10 MB)");
      return;
    }
    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    onSelect(file, preview);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-brand-50 dark:bg-brand-500/[0.08] flex items-center justify-center text-brand-600 dark:text-brand-400">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{body}</p>
        </div>
      </div>
      <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-white/[0.08] p-6 text-center">
        {upload.preview ? (
          <img src={upload.preview} alt="preview" className="mx-auto max-h-64 rounded-lg" />
        ) : (
          <div className="py-8 text-gray-400 dark:text-gray-500">
            <Upload className="mx-auto h-10 w-10" />
            <p className="mt-2 text-sm">Choose a file or drop here</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/heic,application/pdf"
          capture={captureFacingUser ? "user" : undefined}
          onChange={pickFile}
        />
        <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            {upload.file ? "Choose different" : "Choose file"}
          </Button>
          <Button
            variant="premium"
            onClick={onUpload}
            disabled={!upload.file || upload.uploaded}
            isLoading={upload.uploading}
            leftIcon={upload.uploaded ? <Check className="h-4 w-4" /> : upload.uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          >
            {upload.uploaded ? "Uploaded" : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}
