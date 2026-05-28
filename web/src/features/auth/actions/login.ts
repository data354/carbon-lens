"use server";

import { auth } from "@/lib/auth/server";
import { ILoginInput, LoginSchema } from "../schemas/login";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types/helpers";
import { APIError, User } from "better-auth";
import { ZodError } from "zod";

export async function loginAction(
  data: ILoginInput,
): Promise<
  ActionResponse<
    User & {
      nameSet: boolean;
      firstLogin: boolean;
    }
  >
> {
  try {
    const { email, password } = LoginSchema.parse(data);

    const authResponse = await auth.api.signInEmail({
      headers: await headers(),
      body: { email, password },
    });

    const dbUser = await prisma.user.findUnique({
      where: { id: authResponse.user.id },
    });

    return {
      ok: true,
      data: {
        ...authResponse.user,
        nameSet: dbUser?.nameSet ?? false,
        firstLogin: dbUser?.firstLogin ?? true,
      },
    };
  } catch (err) {
    if (
      err instanceof APIError &&
      err.body?.code === "INVALID_EMAIL_OR_PASSWORD"
    ) {
      return {
        ok: false,
        error: "Email ou mot de passe incorrect",
      };
    }

    if (err instanceof ZodError) {
      return {
        ok: false,
        error: "Email ou mot de passe incorrect",
      };
    }

    return {
      ok: false,
      error: "Erreur survenue lors de la connexion",
    };
  }
}
