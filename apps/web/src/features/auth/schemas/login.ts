import { z } from "zod";
import { UpdatePasswordSchema } from "../../users/schemas/update-password";

export const LoginSchema = z.object({
  email: z.email("Adresse email invalide"),
  password: UpdatePasswordSchema.shape.password,
});

export type ILoginInput = z.infer<typeof LoginSchema>;
