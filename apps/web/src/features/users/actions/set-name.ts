"use server";

import { auth } from "@/lib/auth/server";
import { ActionResponse } from "@/types/helpers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { IUpdateNameInput } from "../schemas/update-name";
import { prisma } from "@/lib/prisma";

export async function setNameAction(
  data: IUpdateNameInput,
): Promise<ActionResponse<null>> {
  const sessionRes = await auth.api.getSession({
    headers: await headers(),
  });

  if (sessionRes?.session == null) {
    redirect("/auth/login");
  }

  try {
    await prisma.$transaction(async (tx) => {
      await auth.api.updateUser({
        headers: await headers(),
        body: { name: data.fullName },
      });

      await tx.user.update({
        where: { id: sessionRes.user.id },
        data: { nameSet: true },
      });
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
