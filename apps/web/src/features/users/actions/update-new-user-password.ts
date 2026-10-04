"use server";

import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hashPassword } from "better-auth/crypto";
import { UpdatePasswordSchema } from "../schemas/update-password";
import { ActionResponse } from "@/types/helpers";
import { prisma } from "@/lib/prisma";
import { ZodError } from "zod";

export async function updateNewUserPasswordAction(
  password: string,
): Promise<ActionResponse<string>> {
  const sessionRes = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => {});

  if (sessionRes?.session == null) {
    redirect("/auth/login");
  }

  const parsedPassword =
    UpdatePasswordSchema.shape.password.safeParse(password);

  if (!parsedPassword.success) {
    return {
      ok: false,
      error: "Mot de passe invalide.",
    };
  }

  const user = await prisma.user
    .findUnique({
      where: {
        id: sessionRes.user.id,
      },
      include: {
        accounts: {
          where: {
            providerId: "credential",
          },
        },
      },
    })
    .catch(() => {});

  if (!user) redirect("/auth/login");

  try {
    await prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: {
          id: user.accounts[0].id,
        },
        data: {
          password: await hashPassword(parsedPassword.data),
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
    });

    return {
      ok: true,
      data: "Mot de passe mis à jour avec succès.",
    };
  } catch (err) {
    console.error("Error updating password:", err);

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
