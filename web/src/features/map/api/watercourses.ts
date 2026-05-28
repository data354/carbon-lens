import { geoKyClient } from "@/lib/ky";
import { GeoApiResponse } from "../types/helpers";
import { WatercoursesResponse } from "../types/watercourses";

export async function getWatercoursesTile() {
  const res = await geoKyClient
    .get("tiles/watercourses")
    .json<GeoApiResponse<WatercoursesResponse>>()
    .catch((err) => {
      console.log("❌ Error fetching watercourses:", err);
      throw err;
    });

  if ("detail" in res) {
    console.log(
      "❌ Error response fetching watercourses:",
      res.detail,
    );

    throw Error(
      "Erreur lors du chargement des données de cours d'eau",
    );
  }

  return res;
}
