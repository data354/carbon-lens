"use server";

import {
  EditMemberSchema,
  IEditMemberInput,
} from "../schemas/edit-member";
import { auth } from "@/lib/auth/server";
import { ActionResponse } from "@/types/helpers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  isAdmin,
  isManager,
} from "@/features/auth/utils/admin";
import { revalidatePath } from "next/cache";

export async function editMemberAction(
  id: string,
  data: IEditMemberInput,
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
            user: ["update", "set-role"],
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
          "Vous ne pouvez pas modifier cet utilisateur",
      };
    }

    const parsed = EditMemberSchema.parse(data);

    const isCurrentUserManager = isManager(
      sessionRes.user.role,
    );
    const isTargetUserAdmin = isAdmin(parsed.role);

    // Managers cannot set the "admin" role
    if (isCurrentUserManager && isTargetUserAdmin) {
      return {
        ok: false,
        error:
          "Vous ne pouvez pas attribuer le rôle administrateur",
      };
    }

    await auth.api.adminUpdateUser({
      headers: await headers(),
      body: {
        userId: id,
        data: {
          name: parsed.fullName,
          role: parsed.role,
        },
      },
    });

    revalidatePath("/dashboard/users");

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    console.log(err);

    return {
      ok: false,
      error:
        "Erreur lors de la suppression de l'utilisateur",
    };
  }
}
