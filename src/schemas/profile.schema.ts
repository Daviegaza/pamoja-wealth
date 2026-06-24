import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(10, "Enter a valid phone number"),
  location: z.string().min(2, "Location is required"),
  bio: z.string().max(280, "Bio must be under 280 characters").optional(),
});
export type ProfileFormValues = z.infer<typeof profileSchema>;
