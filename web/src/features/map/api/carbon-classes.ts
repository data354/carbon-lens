import { geoKyClient } from "@/lib/ky";
import { GeoApiResponse } from "../types/helpers";
import { toCarbonClassMapper } from "../helpers/carbon-classes";
import { CarbonClassResponse } from "../dto/carbon-classes";

export async function getCarbonStockClasses() {
  const res = await geoKyClient
    .get("legend/carbon-classes")
    .json<GeoApiResponse<CarbonClassResponse[]>>()
    .catch((err) => {
      console.log(
        "❌ Error fetching carbon stock classes",
        err,
      );
      throw err;
    });

  if ("detail" in res) {
    console.log(
      "❌ Error response fetching carbon stock classes",
      res.detail,
    );

    throw new Error(
      "Erreur lors du chargement des classes de carbone",
    );
  }

  return res.map(toCarbonClassMapper);
}
