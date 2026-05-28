"use server";

import { ActionResponse } from "@/types/helpers";
import {
  IUpdateCurrentPasswordInput,
  UpdateCurrentPasswordSchema,
} from "../schemas/update-password";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { ActionErrorCode } from "../constants";

export async function updateCurrentPasswordAction(
  data: IUpdateCurrentPasswordInput,
): Promise<ActionResponse<null>> {
  const sessionRes = await auth.api.getSession({
    headers: await headers(),
  });

  if (sessionRes?.session == null) {
    redirect("/auth/login");
  }

  try {
    const parsedData =
      UpdateCurrentPasswordSchema.parse(data);

    if (
      parsedData.password !== parsedData.confirmPassword
    ) {
      return {
        ok: false,
        error: "Les mots de passe ne correspondent pas",
        code: ActionErrorCode.PasswordMismatch,
      };
    }

    if (
      parsedData.currentPassword === parsedData.password
    ) {
      return {
        ok: true,
        data: null,
      };
    }

    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword: parsedData.currentPassword,
        newPassword: parsedData.password,
      },
    });

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    console.log(err);

    return {
      ok: false,
      error:
        "Erreur lors de la mise à jour du mot de passe",
    };
  }
}
