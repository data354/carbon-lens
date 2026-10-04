import { queryOptions } from "@tanstack/react-query";
import { getProtectedAreas } from "../api/protected-areas";
import { STALE_TIME } from "../constants/query";

export function getProtectedAreasQueryOptions(
  date: string,
) {
  return queryOptions({
    queryKey: ["search", "protected-areas", { date }],
    queryFn: () => getProtectedAreas(date),
    staleTime: STALE_TIME,
    enabled: !!date,
  });
}
