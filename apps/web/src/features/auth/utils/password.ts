import crypto from "crypto";

const DEFAULT_PASSWORD_LENGTH = 12;

export function generateDefaultPassword(
  length = DEFAULT_PASSWORD_LENGTH,
): string {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .slice(0, length);
}
