"use server";

import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UpdatePasswordSchema } from "../schemas/update-password";
import { ActionResponse } from "@/types/helpers";
import { env } from "@/configs/env";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";

export async function updateNewUserPasswordAction(
  password: string,
): Promise<ActionResponse<string>> {
  const sessionRes = await auth.api.getSession({
    headers: await headers(),
  });

  if (sessionRes?.session == null) {
    redirect("/auth/login");
  }

  try {
    const parsedPassword =
      UpdatePasswordSchema.shape.password.parse(password);

    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword: env.DEFAULT_USER_PASSWORD,
        newPassword: parsedPassword,
      },
    });

    await prisma.user.update({
      where: {
        id: sessionRes.user.id,
      },
      data: {
        firstLogin: false,
      },
    });

    return {
      ok: true,
      data: "Mot de passe mis à jour avec succès.",
    };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        ok: false,
        error: "Mot de passe invalide.",
      };
    }

    return {
      ok: false,
      error:
        "Erreur lors de la mise à jour du mot de passe.",
    };
  }
}
