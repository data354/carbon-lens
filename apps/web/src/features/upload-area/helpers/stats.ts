import {
  FeaturePropsStats,
  UploadedAreaStats,
} from "../types/uploaded-area-stats";

const AREA_PER_PIXEL = 0.01; // in hectares

export function toFeaturePropsStats(
  stats: UploadedAreaStats,
): FeaturePropsStats {
  return {
    carbon_mean: stats.mean,
    carbon_min: stats.min,
    carbon_max: stats.max,
    carbon_std: stats.std,
    area_ha: stats.count * AREA_PER_PIXEL,
    carbon_unit: stats.unit,
  };
}
