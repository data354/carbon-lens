"use server";

import {
  isAdmin,
  isManager,
} from "@/features/auth/utils/admin";
import {
  DeleteMemberSchema,
  IDeleteMemberInput,
} from "../schemas/delete-member";
import { auth } from "@/lib/auth/server";
import { ActionResponse } from "@/types/helpers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function deleteMemberAction({
  id,
  role,
}: IDeleteMemberInput): Promise<ActionResponse<null>> {
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
            user: ["delete"],
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
          "Vous ne pouvez pas supprimer cet utilisateur.",
      };
    }

    const parsed = DeleteMemberSchema.parse({
      id,
      role,
    });

    const isCurrentUser = sessionRes.user.id === parsed.id;

    if (isCurrentUser) {
      return {
        ok: false,
        error:
          "Vous ne pouvez pas supprimer votre propre compte.",
      };
    }

    const isCurrentUserManager = isManager(
      sessionRes.user.role,
    );
    const isTargetUserAdmin = isAdmin(parsed.role);

    if (isCurrentUserManager && isTargetUserAdmin) {
      return {
        ok: false,
        error:
          "Vous ne pouvez pas supprimer un administrateur.",
      };
    }

    await auth.api.removeUser({
      headers: await headers(),
      body: { userId: parsed.id },
    });

    await auth.api.revokeUserSessions({
      headers: await headers(),
      body: { userId: parsed.id },
    });

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    console.log("Error deleting the user:", err);

    return {
      ok: false,
      error:
        "Erreur lors de la suppression de l'utilisateur.",
    };
  }
}
