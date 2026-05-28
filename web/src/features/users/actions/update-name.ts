"use server";

import { auth } from "@/lib/auth/server";
import { ActionResponse } from "@/types/helpers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { IUpdateNameInput } from "../schemas/update-name";

export async function updateNameAction(
  data: IUpdateNameInput,
): Promise<ActionResponse<null>> {
  const sessionRes = await auth.api.getSession({
    headers: await headers(),
  });

  if (sessionRes?.session == null) {
    redirect("/auth/login");
  }

  try {
    await auth.api.updateUser({
      headers: await headers(),
      body: { name: data.fullName },
    });

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    console.log(err);

    return {
      ok: false,
      error: "Erreur lors de la mise à jour du nom",
    };
  }
}
