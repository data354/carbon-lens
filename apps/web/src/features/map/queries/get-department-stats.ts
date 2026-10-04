import { queryOptions } from "@tanstack/react-query";
import { getAreaStatsByDate } from "../api/areas";
import { MapArea } from "../types/areas";

export function getAreaStatsQueryOptions(
  date: string,
  area: MapArea,
  feature: GeoJSON.Feature,
) {
  return queryOptions({
    queryKey: [
      "map",
      `${area}`,
      "stats",
      { date },
      { featureId: feature.id },
    ],
    queryFn: () => getAreaStatsByDate(date, feature),
    enabled: !!date && !!area && feature.id != null,
  });
}
