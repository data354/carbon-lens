import { GlobalReportStatsResponse } from "../dtos/stats";
import { GlobalReportStats } from "../types/stats";

export function toGlobalReportStats({
  stats,
}: GlobalReportStatsResponse): GlobalReportStats {
  return {
    current: {
      carbonMean: stats.current.carbon_mean,
      landArea: stats.current.land_area,
      tco2eMean: stats.current.tco2e_mean,
      biomassMean: stats.current.biomass_mean,
      carbonClasses: stats.current.carbon_classes,
      date: stats.current.date,
    },
    previous: stats.previous
      ? {
          carbonMean: stats.previous.carbon_mean,
          landArea: stats.previous.land_area,
          tco2eMean: stats.previous.tco2e_mean,
          biomassMean: stats.previous.biomass_mean,
          date: stats.previous.date,
          carbonClasses: stats.previous.carbon_classes,
        }
      : null,
  };
}
