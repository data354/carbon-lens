import { roles } from "@/features/auth/constants";
import { z } from "zod";

export const CreateUserSchema = z.object({
  fullName: z
    .string()
    .nonempty("Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom est trop long (max: 100 caractères)"),
  email: z
    .email("Email invalide")
    .max(
      100,
      "L'email est trop long (max: 100 caractères)",
    ),
  role: z.enum(roles),
});

export type ICreateUserInput = z.infer<
  typeof CreateUserSchema
>;
