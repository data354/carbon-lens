import {
  STALE_TIME,
  MIN_SEARCH_LENGTH,
} from "../constants/query";
import { queryOptions } from "@tanstack/react-query";
import { searchAreas } from "../api/areas";

export function searchAreasQueryOptions(q: string) {
  const trimmedQuery = q.trim();

  return queryOptions({
    queryKey: ["search", "all-areas", { q: trimmedQuery }],
    queryFn: async (_) => searchAreas(trimmedQuery),
    enabled: trimmedQuery.length >= MIN_SEARCH_LENGTH,
    staleTime: STALE_TIME,
  });
}
