import { z } from "zod";

export const depositSchema = z.object({
  amount: z.coerce.number().min(100, "Minimum deposit is 100"),
  method: z.enum(["mpesa", "bank", "card"]),
});
export type DepositFormValues = z.infer<typeof depositSchema>;

export const withdrawSchema = z.object({
  amount: z.coerce.number().min(100, "Minimum withdrawal is 100"),
  destination: z.string().min(5, "Destination account/number is required"),
});
export type WithdrawFormValues = z.infer<typeof withdrawSchema>;
