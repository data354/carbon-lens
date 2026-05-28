"use server";

import {
  CreateUserSchema,
  ICreateUserInput,
} from "../schemas/create-user";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/configs/env";
import { auth } from "@/lib/auth/server";
import { ActionResponse } from "@/types/helpers";
import { isManager } from "@/features/auth/utils/admin";

export async function createNewUserAction(
  data: ICreateUserInput,
): Promise<ActionResponse> {
  const sessionRes = await auth.api.getSession({
    headers: await headers(),
  });

  if (sessionRes?.session == null) {
    redirect("/auth/login");
  }

  try {
    const permissionResponse =
      await auth.api.userHasPermission({
        body: {
          role: sessionRes.user.role as any,
          permissions: {
            user: ["create"],
          },
        },
      });

    if (permissionResponse.error) {
      throw new Error("Something went wrong");
    }

    if (!permissionResponse.success) {
      return {
        ok: false,
        error:
          "Vous n'avez pas la permission de créer un utilisateur.",
      };
    }

    const parsed = CreateUserSchema.parse(data);

    // Managers can only create users with the "manager" or "user" roles
    if (
      isManager(sessionRes.user.role) &&
      parsed.role === "admin"
    ) {
      return {
        ok: false,
        error:
          "Vous n'avez pas la permission de créer un utilisateur avec ce rôle.",
      };
    }

    await auth.api.createUser({
      headers: await headers(),
      body: {
        email: parsed.email,
        name: parsed.fullName,
        role: parsed.role as any,
        password: env.DEFAULT_USER_PASSWORD,
      },
    });

    return {
      ok: true,
      data: "Utilisateur créé avec succès.",
    };
  } catch (err) {
    console.log("Error creating the user:", err);

    return {
      ok: false,
      error:
        "Une erreur est survenue lors de la création de l'utilisateur.",
    };
  }
}
