import { queryOptions } from "@tanstack/react-query";
import { getTileJson } from "../api/tile-json";

export function getTileJsonQueryOptions(date: string) {
  return queryOptions({
    queryKey: ["tile-json", { date }],
    queryFn: () => getTileJson(date),
    enabled: !!date,
  });
}
