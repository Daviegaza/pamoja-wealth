import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { NON_CUSTODIAL_STATEMENT } from "@/lib/copy";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 space-y-8">
      <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">About Pamoja Wealth</h1>
      <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
        <p>
          Chamas run on trust. Too often that trust lives in one treasurer&apos;s notebook, a stack of M-Pesa messages and a
          WhatsApp group — and disagreements start when members cannot see the same numbers.
        </p>
        <p>
          Pamoja Wealth gives every chama a shared record book. Officers record contributions, loans and meetings; members confirm
          what is theirs; everyone sees the same statements; and every change is logged.
        </p>
        <p className="border-l-2 border-brand-500 pl-3 text-sm text-gray-600 dark:text-gray-400">{NON_CUSTODIAL_STATEMENT}</p>
      </div>
      <Link to="/register">
        <Button>Start free</Button>
      </Link>
    </div>
  );
}
