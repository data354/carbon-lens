import { GeoApiResponse } from "@/features/map/types/helpers";
import { UploadedAreaStatsResponse } from "../dto/uploaded-area-stats";
import { geoKyClient } from "@/lib/ky";

export async function getUploadedAreasStats(
  date: string,
  file: File,
) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await geoKyClient
    .post("tiles/stats/geometry", {
      searchParams: { date },
      timeout: false,
      body: formData,
    })
    .json<GeoApiResponse<UploadedAreaStatsResponse>>()
    .catch((err) => {
      console.log(
        "❌ Error fetching uploaded area stats",
        err,
      );

      throw err;
    });

  if ("detail" in res) {
    console.log(
      "❌ Error response fetching uploaded area stats",
      res.detail,
    );

    throw new Error(
      "Erreur lors du calcul des statistiques de la zone",
    );
  }

  return res;
}
