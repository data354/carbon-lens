import { geoKyClient } from "@/lib/ky";
import { GeoApiResponse } from "../types/helpers";

export async function getDates() {
  const res = await geoKyClient
    .get("catalog/dates")
    .json<
      GeoApiResponse<{
        dates: string[];
      }>
    >()
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
