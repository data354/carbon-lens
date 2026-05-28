"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { UploadGeoJsonSchema } from "../validations/upload";
import { getUploadedAreasStats } from "../api/stats";
import { ActionResponse } from "@/types/helpers";
import { appendStatsToGeoJson } from "../lib/stats";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function uploadGeoJson(
  formData: FormData,
): Promise<ActionResponse<null>> {
  const sessionRes = await auth.api.getSession({
    headers: await headers(),
  });

  if (sessionRes?.session == null) {
    redirect("/auth/login");
  }

  try {
    const rawData = {
      name: formData.get("name"),
      date: formData.get("date"),
      file: formData.get("file"),
    };

    const parsedData =
      await UploadGeoJsonSchema.safeParseAsync(rawData);

    if (!parsedData.success) {
      return {
        ok: false,
        error: parsedData.error.message,
      };
    }

    const statsRes = await getUploadedAreasStats(
      parsedData.data.date,
      parsedData.data.file,
    );

    if (statsRes.type === "collection") {
      // Skip this for now, as we don't have a clear way
      // to handle GeoJSON with more than one feature
      return {
        ok: false,
        error:
          "Le fichier GeoJSON doit contenir une seule entité géographique.",
      };
    }

    const enrichedGeoJson = await appendStatsToGeoJson(
      parsedData.data.file,
      parsedData.data.name,
      statsRes.stats,
    );

    await prisma.area.create({
      data: {
        id: enrichedGeoJson.id as string,
        name: parsedData.data.name,
        date: parsedData.data.date,
        userId: sessionRes.user.id,
        feature:
          enrichedGeoJson as unknown as Prisma.JsonObject,
      },
    });

    revalidatePath("/dashboard");

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    console.error("❌ Error uploading GeoJSON", err);
    return {
      ok: false,
      error: "Erreur lors de l'upload du fichier GeoJSON.",
    };
  }
}
