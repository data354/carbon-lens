import { queryOptions } from "@tanstack/react-query";
import { getCarbonEvolutionStats } from "../api/evolution-stats";
import { MapArea } from "@/features/map/types/areas";

export function getCarbonEvolutionStatsQueryOptions(
  type: MapArea,
  name: string,
  date: string,
) {
  return queryOptions({
    queryKey: [
      "carbon-evolution-stats",
      { type },
      { name },
      { date },
    ],
    queryFn: () =>
      getCarbonEvolutionStats(type, name, date),
    enabled: !!type && !!name && !!date,
  });
}
