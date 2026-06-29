import {
  CarbonClass,
  CarbonClassKey,
} from "../types/carbon-classes";

export const CARBON_CLASSES: Record<
  CarbonClassKey,
  Pick<CarbonClass, "name" | "meaning">
> = {
  hdf: {
    name: "HDF",
    meaning: "High Density Forest",
  },
  mdf: {
    name: "MDF",
    meaning: "Medium Density Forest",
  },
  ldf: {
    name: "LDF",
    meaning: "Low Density Forest",
  },
  yrf: {
    name: "YRF",
    meaning: "Young Regenerating Forest",
  },
  s: {
    name: "S",
    meaning: "Scrub",
  },
  ol: {
    name: "OL",
    meaning: "Open Land",
  },
};
