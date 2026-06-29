import { z } from "zod";

export const loanApplicationSchema = z.object({
  amount: z.coerce.number().min(1000, "Minimum loan amount is 1,000"),
  termMonths: z.coerce.number().min(1).max(60),
  purpose: z.string().min(5, "Please describe the loan purpose"),
  guarantorEmail: z
    .string()
    .email("Enter a valid guarantor email")
    .optional()
    .or(z.literal("")),
});
export type LoanApplicationFormValues = z.infer<typeof loanApplicationSchema>;
