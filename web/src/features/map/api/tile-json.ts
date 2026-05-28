import { geoKyClient } from "@/lib/ky";
import { GeoApiResponse } from "../types/helpers";
import { TitleJson } from "../types/title-json";

export async function getTileJson(date: string) {
  const res = await geoKyClient
    .get(`tiles/tilejson/${date}`)
    .json<GeoApiResponse<TitleJson>>()
    .catch((err) => {
      console.log("❌ Error fetching JSON tile:", err);
      throw err;
    });

  if ("detail" in res) {
    console.log(
      "❌ Error response fetching JSON tile:",
      res.detail,
    );

    throw Error(
      "Erreur lors du chargement des tuiles de la carte",
    );
  }

  return res;
}
