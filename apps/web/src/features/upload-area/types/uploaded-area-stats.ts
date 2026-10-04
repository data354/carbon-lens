export interface UploadedAreaStats {
  mean: number;
  min: number;
  max: number;
  std: number;
  count: number;
  unit: string;
}

export interface FeaturePropsStats {
  carbon_mean: number;
  carbon_min: number;
  carbon_max: number;
  carbon_std: number;
  area_ha: number;
  carbon_unit: string;
}
