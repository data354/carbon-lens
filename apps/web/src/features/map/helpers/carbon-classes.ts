import { CarbonClassResponse } from "../dto/carbon-classes";
import { CarbonClass } from "../types/carbon-classes";
import { getCarbonClassValue } from "./check-carbon-class-value";

export function toCarbonClassMapper(
  carbonClassResponse: CarbonClassResponse,
): CarbonClass {
  return {
    order: carbonClassResponse.order,
    min: getCarbonClassValue(carbonClassResponse.min),
    max: getCarbonClassValue(carbonClassResponse.max),
    color: carbonClassResponse.color,
    name: carbonClassResponse.name,
    meaning: carbonClassResponse.meaning,
    description: carbonClassResponse.description,
  };
}
