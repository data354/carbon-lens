import { geoKyClient } from "@/lib/ky";
import { GeoApiResponse } from "@/features/map/types/helpers";
import { GlobalReportStats } from "../types/stats";

interface GlobalReportStatsResponse {
  stats: {
    current: {
      carbon_mean: number;
      land_area: number;
      date: string;
    };
    previous: {
      carbon_mean: number;
      land_area: number;
      date: string;
    } | null;
  };
}

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

  return {
    current: {
      carbonMean: res.stats.current.carbon_mean,
      landArea: res.stats.current.land_area,
      date: res.stats.current.date,
    },
    previous: res.stats.previous
      ? {
          carbonMean: res.stats.previous.carbon_mean,
          landArea: res.stats.previous.land_area,
          date: res.stats.previous.date,
        }
      : null,
  } as {
    current: GlobalReportStats;
    previous: GlobalReportStats | null;
  };
}
