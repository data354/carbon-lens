import { queryOptions } from "@tanstack/react-query";
import { getRegionCarbonEvolutionStock } from "../api/carbon-evolution-stock";
import { getRegions } from "@/features/search/api/regions";

export function getAllRegionsCarbonEvolutionStatsQueryOptions(
  date: string,
) {
  return queryOptions({
    queryKey: ["global-report-carbon-evolution", { date }],
    queryFn: async () => {
      const regions = await getRegions(date);
      const carbonEvolutionStats = await Promise.allSettled(
        regions.map((r) =>
          getRegionCarbonEvolutionStock(r, date),
        ),
      );

      if (
        carbonEvolutionStats.some(
          (r) => r.status === "rejected",
        )
      ) {
        throw new Error(
          "Failed to fetch carbon evolution stats for some regions",
        );
      }

      return carbonEvolutionStats.flatMap((r) =>
        r.status === "fulfilled" ? [r.value] : [],
      );
    },
    enabled: !!date,
  });
}
