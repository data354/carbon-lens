import { geoKyServer } from "@/lib/ky/geo-api/server";
import { GeoApiResponse } from "../types/helpers";
import { TitleJson } from "../types/title-json";

export async function getTileJsonServer(date: string) {
  const res = await geoKyServer
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
