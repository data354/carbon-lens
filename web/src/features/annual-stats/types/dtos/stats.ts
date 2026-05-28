export interface CarbonEvolutionStatsResponse {
  stats: Record<string, { carbon_mean: number }>;
  [key: string]: unknown;
}
