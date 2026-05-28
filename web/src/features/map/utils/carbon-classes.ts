import { CarbonClass } from "../types/carbon-classes";

export function getRangeAsText(c: CarbonClass) {
  return isFinite(c.max)
    ? `${c.min} - ${c.max}`
    : `${c.min}+`;
}
