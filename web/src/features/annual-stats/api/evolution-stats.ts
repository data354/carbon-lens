import { geoKyClient } from "@/lib/ky";
import { CarbonEvolutionStatsResponse } from "../types/dtos/stats";
import { MapArea } from "@/features/map/types/areas";

export async function getCarbonEvolutionStats(
  type: MapArea,
  name: string,
  date: string,
) {
  const res = await geoKyClient
    .get(
      `geo/${type}/${date}/${encodeURIComponent(name)}/stats`,
    )
    .json<CarbonEvolutionStatsResponse>();

  if ("detail" in res) {
    console.log(
      `Failed to fetch carbon evolution stats for ${name} (${type}) and date ${date}: ${res.detail}`,
    );

    throw new Error(
      `Failed to fetch carbon evolution stats for ${name} (${type}) and date ${date}: ${res.detail}`,
    );
  }

  return Object.entries(res.stats).reduce(
    (acc, [date, stats]) => {
      acc[date] = stats.carbon_mean;
      return acc;
    },
    {} as Record<string, number>,
  );
}
