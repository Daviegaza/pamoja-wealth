import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

const RESEND_SECONDS = 30;

export default function OTPVerificationPage() {
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const focusInput = useCallback((idx: number) => {
    inputRefs.current[idx]?.focus();
  }, []);

  const handleChange = (idx: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    const next = [...code];
    next[idx] = digit;
    setCode(next);
    if (idx < 5) focusInput(idx + 1);
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...code];
      if (next[idx]) {
        next[idx] = "";
        setCode(next);
      } else if (idx > 0) {
        next[idx - 1] = "";
        setCode(next);
        focusInput(idx - 1);
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      focusInput(idx - 1);
    } else if (e.key === "ArrowRight" && idx < 5) {
      focusInput(idx + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...code];
    for (let i = 0; i < pasted.length; i++) {
      if (i < 6) next[i] = pasted[i];
    }
    setCode(next);
    const focusIdx = Math.min(pasted.length, 5);
    focusInput(focusIdx);
  };

  const isComplete = code.every((d) => d !== "");

  const handleVerify = async () => {
    if (!isComplete) {
      toast.error("Please enter the complete 6-digit code.");
      return;
    }
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsVerifying(false);
    toast.success("Code verified successfully.");
    navigate("/login");
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(RESEND_SECONDS);
    toast.success("A new code has been sent to your phone and email.");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verify your identity</h1>
      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">Enter the 6-digit code sent to your phone or email.</p>
      <div className="mt-8 flex justify-between gap-2" onPaste={handlePaste}>
        {code.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label={`Digit ${idx + 1}`}
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onFocus={(e) => e.target.select()}
            className="h-14 w-12 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-center text-lg font-semibold focus-ring"
          />
        ))}
      </div>
      <Button onClick={handleVerify} className="w-full mt-8" isLoading={isVerifying}>
        Verify code
      </Button>
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {countdown > 0 ? (
          <>
            Resend code in <span className="font-semibold text-gray-700 dark:text-gray-300">{countdown}s</span>
          </>
        ) : (
          <>
            Did not receive a code?{" "}
            <button onClick={handleResend} className="font-medium text-brand-600 hover:text-brand-700">
              Resend
            </button>
          </>
        )}
      </p>
    </div>
  );
}
