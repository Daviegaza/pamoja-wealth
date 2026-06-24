import { useLoanStore } from "@/stores/loanStore";

export function useLoans() {
  const { loans, applyForLoan } = useLoanStore();
  return { loans, applyForLoan };
}
