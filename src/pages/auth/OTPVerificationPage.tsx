import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

export default function OTPVerificationPage() {
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, value: string) => {
    if (value && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleVerify = async () => {
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Code verified successfully.");
    navigate("/login");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verify your identity</h1>
      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">Enter the 6-digit code sent to your phone or email.</p>
      <div className="mt-8 flex justify-between gap-2">
        {Array.from({ length: 6 }).map((_, idx) => (
          <input
            key={idx}
            ref={(el) => { inputRefs.current[idx] = el; }}
            maxLength={1}
            onChange={(e) => handleChange(idx, e.target.value)}
            className="h-14 w-12 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-center text-lg font-semibold focus-ring"
          />
        ))}
      </div>
      <Button onClick={handleVerify} className="w-full mt-8">Verify code</Button>
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Did not receive a code? <button className="font-medium text-brand-600 hover:text-brand-700">Resend</button>
      </p>
    </div>
  );
}
