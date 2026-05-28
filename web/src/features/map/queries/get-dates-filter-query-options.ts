import { queryOptions } from "@tanstack/react-query";
import { getDates } from "../api/filters";

export function getDatesQueryOptions() {
  return queryOptions({
    queryKey: ["map", "filters", "dates"],
    queryFn: getDates,
  });
}
