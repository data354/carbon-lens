import { queryOptions } from "@tanstack/react-query";
import { getRegions } from "../api/regions";
import { STALE_TIME } from "../constants/query";

export function getRegionsQueryOptions(date: string) {
  return queryOptions({
    queryKey: ["search", "regions", { date }],
    queryFn: () => getRegions(date),
    staleTime: STALE_TIME,
    enabled: !!date,
  });
}
