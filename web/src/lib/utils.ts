import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function isDiff(
  a: number,
  b: number,
  tolerance = 0,
) {
  return Math.abs(a - b) > tolerance;
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

export function isString(
  value: unknown,
  options?: Partial<{
    checkEmpty: boolean;
  }>,
): value is string {
  return (
    typeof value === "string" &&
    (!options?.checkEmpty || value.trim().length > 0)
  );
}
