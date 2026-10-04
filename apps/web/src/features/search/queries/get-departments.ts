import { queryOptions } from "@tanstack/react-query";
import { getDepartments } from "../api/departments";
import { STALE_TIME } from "../constants/query";

export function getDepartmentsQueryOptions(date: string) {
  return queryOptions({
    queryKey: ["search", "departments", { date }],
    queryFn: () => getDepartments(date),
    staleTime: STALE_TIME,
    enabled: !!date,
  });
}
