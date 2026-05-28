import { queryOptions } from "@tanstack/react-query";
import { getCarbonStockClasses } from "../api/carbon-classes";

export function getCarbonClassesQueryOptions() {
  return queryOptions({
    queryKey: ["carbon-classes"],
    queryFn: getCarbonStockClasses,
  });
}
