import { queryOptions } from "@tanstack/react-query";
import { getGlobalReportStats } from "../api/stats";

export function getGlobalReportStatsQueryOptions(
  date: string,
) {
  return queryOptions({
    queryKey: ["global-report-stats", { date }],
    queryFn: () => getGlobalReportStats(date),
    enabled: !!date,
  });
}
