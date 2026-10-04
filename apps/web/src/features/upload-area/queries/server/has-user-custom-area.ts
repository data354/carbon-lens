"server-only";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";

export async function hasUserCustomArea(date?: string) {
  try {
    const res = await auth.api.getSession({
      headers: await headers(),
    });

    if (!res) return false;

    const count = await prisma.area.count({
      where: { userId: res.user.id, date },
    });

    return count > 0;
  } catch (err) {
    console.error("Error checking user custom area:", err);
    return false;
  }
}
