import { CarbonClassKey } from "@/features/map/types/carbon-classes";

export type GlobalReportCarbonClassStats = Record<
  CarbonClassKey,
  {
    count: number;
    ha: number;
    squareKm: number;
    pct: number;
  }
>;

export interface GlobalReportStatsProps {
  date: string;
  carbonMean: number;
  tco2eMean: number;
  biomassMean: number;
  landArea: number;
  carbonClasses: GlobalReportCarbonClassStats;
}

export interface GlobalReportStats {
  current: GlobalReportStatsProps;
  previous: GlobalReportStatsProps | null;
}
