"use server";

import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ActionResponse } from "@/types/helpers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function deleteUploadedGeoJson(
  areaId: string,
): Promise<ActionResponse<null>> {
  const sessionRes = await auth.api.getSession({
    headers: await headers(),
  });

  if (sessionRes?.session == null) {
    redirect("/auth/login");
  }

  try {
    const area = await prisma.area.findFirst({
      where: {
        id: areaId,
        userId: sessionRes.session.userId,
      },
    });

    if (!area) {
      return {
        ok: false,
        error:
          "Zone non trouvée ou vous n'avez pas la permission de la supprimer.",
      };
    }

    await prisma.area.delete({
      where: {
        id: areaId,
      },
    });

    revalidatePath("/dashboard");

    return {
      ok: true,
      data: null,
    };
  } catch (error) {
    console.error(
      "Error deleting uploaded GeoJSON:",
      error,
    );
    return {
      ok: false,
      error:
        "Une erreur est survenue lors de la suppression de la zone personnalisée.",
    };
  }
}
