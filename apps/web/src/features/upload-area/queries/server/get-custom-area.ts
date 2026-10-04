"server-only";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";

export async function getCustomAreaFeatureCollectionByDate(
  date: string,
): Promise<GeoJSON.FeatureCollection> {
  try {
    const res = await auth.api.getSession({
      headers: await headers(),
    });

    if (!res)
      return {
        type: "FeatureCollection",
        features: [],
      };

    const areas = await prisma.area.findMany({
      where: { userId: res.user.id, date },
      select: { feature: true },
    });

    return {
      type: "FeatureCollection",
      features: areas.map(
        (a) => a.feature as unknown as GeoJSON.Feature,
      ),
    };
  } catch (err) {
    console.error(
      `Error fetching custom area feature collection for date ${date}:`,
      err,
    );
    return {
      type: "FeatureCollection",
      features: [],
    };
  }
}

export async function getAllUserCustomAreas() {
  try {
    const res = await auth.api.getSession({
      headers: await headers(),
    });

    if (!res) return [];

    const areas = await prisma.area.findMany({
      where: { userId: res.user.id },
      orderBy: { updatedAt: "desc" },
    });

    return areas.map((area) => ({
      id: area.id,
      name: area.name,
      date: area.date,
      feature: area.feature as unknown as GeoJSON.Feature,
      createdAt: area.createdAt,
      updatedAt: area.updatedAt,
    }));
  } catch (err) {
    console.error("Error fetching user custom areas:", err);
    return [];
  }
}
