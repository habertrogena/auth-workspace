import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    age: z.number().int().min(1, "Age must be between 1 and 150").max(150).optional(),
    nationalID: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^\d+$/.test(v), "National ID must be a number"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
