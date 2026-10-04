"use server";

import { Role } from "@/features/auth/types";
import { isManager } from "@/features/auth/utils/admin";
import { auth } from "@/lib/auth/server";
import { ActionResponse } from "@/types/helpers";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function changeMemberRoleAction(
  userId: string,
  role: Role,
): Promise<ActionResponse<null>> {
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
            user: ["set-role"],
          },
        },
      });

    if (permissionResponse.error) {
      throw new Error("Something went wrong");
    }

    if (!permissionResponse.success) {
      return {
        ok: false,
        error: "Vous ne pouvez pas effectuer cette action.",
      };
    }

    // Managers cannot assign the "admin" role
    if (
      isManager(sessionRes.user.role) &&
      role === "admin"
    ) {
      return {
        ok: false,
        error:
          "Vous n'avez pas la permission d'assigner ce rôle.",
      };
    }

    await auth.api.setRole({
      headers: await headers(),
      body: { userId, role },
    });

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    console.log("Error changing member role:", err);

    return {
      ok: false,
      error: "Erreur lors de la mise à jour du rôle.",
    };
  }
}
