import { isNumber, isString } from "@/lib/utils";

/**
 * Convert carbon class min & max values to numbers
 * since they can have values like "Infinity"
 */
export function getCarbonClassValue(
  val: string | number,
): number {
  if (isNumber(val)) {
    return val;
  }

  if (
    !isString(val, {
      checkEmpty: true,
    })
  ) {
    console.warn(
      `⚠️ Carbon class value should be a string if not a number: ${val}`,
    );

    return 0;
  }

  if (isNaN(Number(val))) {
    console.warn(
      `⚠️ Carbon class value should be either a number or a string representing a number like "10" or "Infinity" but received: "${val}"`,
    );
    console.warn("Defaulting to 0");

    return 0;
  }

  return Number(val);
}
