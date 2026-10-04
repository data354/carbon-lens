import { geoKyServer } from "@/lib/ky/geo-api/server";
import { GeoApiResponse } from "../types/helpers";
import { WatercoursesResponse } from "../types/watercourses";

export async function getWatercoursesTileServer() {
  const res = await geoKyServer
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
