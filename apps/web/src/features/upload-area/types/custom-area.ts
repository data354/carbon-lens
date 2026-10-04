import { WithTimestamp } from "@/types/helpers";

export interface CustomArea extends WithTimestamp {
  id: string;
  name: string;
  date: string;
  feature: GeoJSON.Feature;
}
