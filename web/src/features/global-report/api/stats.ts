import { geoKyClient } from "@/lib/ky";
import { GeoApiResponse } from "@/features/map/types/helpers";
import { GlobalReportStatsResponse } from "../dtos/stats";
import { toGlobalReportStats } from "../helpers/stats";

export async function getGlobalReportStats(date: string) {
  const res = await geoKyClient
    .get(`tiles/national-stats/${date}`)
    .json<GeoApiResponse<GlobalReportStatsResponse>>();

  if ("detail" in res) {
    console.log(
      `❌ Error response fetching global report stats:`,
      res.detail,
    );

    throw Error(
      `Erreur lors du chargement des statistiques du rapport global`,
    );
  }

  return toGlobalReportStats(res);
}
