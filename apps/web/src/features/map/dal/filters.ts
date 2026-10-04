"server-only";

import { geoKyServer } from "@/lib/ky/geo-api/server";
import { GeoApiResponse } from "../types/helpers";

export async function getDatesServer() {
  const res = await geoKyServer
    .get("catalog/dates")
    .json<GeoApiResponse<{ dates: string[] }>>()
    .catch((err) => {
      console.log("❌ Error fetching dates filter", err);
      throw err;
    });

  if ("detail" in res) {
    console.log(
      "❌ Error response fetching dates filter",
      res.detail,
    );

    throw new Error("Erreur lors du chargement des dates");
  }

  return res;
}
