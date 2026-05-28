import { geoKyClient } from "@/lib/ky";

interface CarbonEvolutionStockResponse {
  stats: Record<string, { carbon_mean: number }>;
  region: string;
}

export async function getRegionCarbonEvolutionStock(
  regionName: string,
  date: string,
) {
  const res = await geoKyClient
    .get(
      `geo/regions/${date}/${encodeURIComponent(regionName)}/stats`,
    )
    .json<CarbonEvolutionStockResponse>();

  if ("detail" in res) {
    console.log(
      `❌ Error response fetching carbon evolution stock for region ${regionName}:`,
      res.detail,
    );

    throw Error(
      `Erreur lors du chargement de l'évolution du stock de carbone pour la région ${regionName}`,
    );
  }

  return Object.entries(res.stats).reduce(
    (acc, [date, stats]) => {
      return {
        ...acc,
        region: res.region,
        stats: {
          ...acc.stats,
          [date]: stats.carbon_mean,
        },
      };
    },
    {} as {
      region: string;
      stats: Record<string, number>;
    },
  );
}
