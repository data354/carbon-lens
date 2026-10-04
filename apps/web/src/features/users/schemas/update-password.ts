import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "../../auth/constants";

export const UpdatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(
        MIN_PASSWORD_LENGTH,
        `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`,
      ),
    confirmPassword: z
      .string()
      .min(
        MIN_PASSWORD_LENGTH,
        `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`,
      ),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Les mots de passe ne correspondent pas",
      path: ["confirmPassword"],
    },
  );

export type IUpdatePasswordInput = z.infer<
  typeof UpdatePasswordSchema
>;

export const UpdateCurrentPasswordSchema =
  UpdatePasswordSchema.safeExtend({
    currentPassword: z
      .string()
      .nonempty("Le mot de passe actuel est requis"),
  });

export type IUpdateCurrentPasswordInput = z.infer<
  typeof UpdateCurrentPasswordSchema
>;
