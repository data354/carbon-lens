import { queryOptions } from "@tanstack/react-query";
import { STALE_TIME } from "@/features/search/constants/query";
import { getAreaFeatureByName } from "../api/areas";
import { MapArea } from "../types/areas";

export function getAreaFeatureQueryOptions(
  area?: MapArea | null,
  date?: string,
  name?: string,
) {
  return queryOptions({
    queryKey: ["feature", { area }, { date }, { name }],
    queryFn: () =>
      getAreaFeatureByName(area!, date!, name!),
    enabled: !!area && !!date && !!name,
    staleTime: STALE_TIME,
  });
}
