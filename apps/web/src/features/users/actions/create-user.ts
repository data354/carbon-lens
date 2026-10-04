"use server";

import {
  CreateUserSchema,
  ICreateUserInput,
} from "../schemas/create-user";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ActionResponse } from "@/types/helpers";
import { generateDefaultPassword } from "@/features/auth/utils/password";
import { sendNewUserWelcomeEmail } from "@/lib/auth/email/send-new-user-welcome-email";
import { isManager } from "@/features/auth/utils/admin";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

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

    await prisma.$transaction(
      async (tx) => {
        const defaultPassword = generateDefaultPassword();

        const { user: newUser } = await auth.api.createUser(
          {
            headers: await headers(),
            body: {
              email: parsed.email,
              name: parsed.fullName,
              role: parsed.role,
              password: defaultPassword,
            },
          },
        );

        const response = await sendNewUserWelcomeEmail({
          to: newUser.email,
          temporaryPassword: defaultPassword,
          email: newUser.email,
        });

        if (response.error) {
          throw new Error("Failed to send welcome email");
        }

        await tx.user.update({
          where: {
            id: newUser.id,
          },
          data: {
            firstLogin: true,
            nameSet: false,
          },
        });
      },
      {
        timeout: 10_000,
      },
    );

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
