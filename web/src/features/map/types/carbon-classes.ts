export type CarbonClassKey =
  | "hdf"
  | "mdf"
  | "ldf"
  | "yrf"
  | "s"
  | "ol";

export interface CarbonClass {
  order: number;
  min: number;
  max: number;
  color: string;
  name: string;
  meaning: string;
  description: string;
}
