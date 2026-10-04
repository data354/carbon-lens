import { GlobalReportCarbonClassStats } from "../types/stats";

export interface GlobalReportStatsPropsResponse {
  date: string;
  carbon_mean: number;
  tco2e_mean: number;
  biomass_mean: number;
  land_area: number;
  carbon_classes: GlobalReportCarbonClassStats;
}

export interface GlobalReportStatsResponse {
  stats: {
    current: GlobalReportStatsPropsResponse;
    previous: GlobalReportStatsPropsResponse | null;
  };
}
