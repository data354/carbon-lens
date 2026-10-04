"use server";

import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types/helpers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function updateFirstLoginStatusAction(
  firstLogin: boolean,
): Promise<ActionResponse> {
  const sessionRes = await auth.api.getSession({
    headers: await headers(),
  });

  if (sessionRes?.session == null) {
    redirect("/auth/login");
  }

  try {
    await prisma.user.update({
      where: {
        id: sessionRes.user.id,
      },
      data: {
        firstLogin,
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
      error: "Erreur interne du serveur.",
    };
  }
}
