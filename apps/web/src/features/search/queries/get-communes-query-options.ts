import { queryOptions } from "@tanstack/react-query";
import { getCommunes } from "../api/communes";
import { STALE_TIME } from "../constants/query";

export function getCommunesQueryOptions(date: string) {
  return queryOptions({
    queryKey: ["search", "communes", { date }],
    queryFn: () => getCommunes(date),
    staleTime: STALE_TIME,
    enabled: !!date,
  });
}
