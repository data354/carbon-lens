import { UploadedAreaStats } from "../types/uploaded-area-stats";

export type UploadedAreaStatsResponse =
  | { type: "single"; stats: UploadedAreaStats }
  | {
      type: "collection";
      features: Array<{
        name: string;
        stats: UploadedAreaStats;
        error: string | null;
      }>;
    };
