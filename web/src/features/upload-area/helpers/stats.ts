import {
  FeaturePropsStats,
  UploadedAreaStats,
} from "../types/uploaded-area-stats";

export function toFeaturePropsStats(
  stats: UploadedAreaStats,
): FeaturePropsStats {
  return {
    carbon_mean: stats.mean,
    carbon_min: stats.min,
    carbon_max: stats.max,
    carbon_std: stats.std,
    area_ha: stats.count,
    carbon_unit: stats.unit,
  };
}
