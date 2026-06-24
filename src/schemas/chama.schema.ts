import { z } from "zod";

export const createChamaSchema = z.object({
  name: z.string().min(3, "Chama name is required"),
  description: z.string().min(10, "Please provide a short description"),
  category: z.enum(["savings", "investment", "welfare", "mixed"]),
  monthlyContribution: z.coerce.number().min(100, "Minimum contribution is 100"),
  location: z.string().min(2, "Location is required"),
});
export type CreateChamaFormValues = z.infer<typeof createChamaSchema>;

export const joinChamaSchema = z.object({
  inviteCode: z.string().min(4, "Enter a valid invite code"),
});
export type JoinChamaFormValues = z.infer<typeof joinChamaSchema>;
