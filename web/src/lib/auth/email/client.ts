import { env } from "@/configs/env";
import { Resend } from "resend";

export const resend = new Resend(
  env.RESEND_API_KEY || "resend_api_key_not_set",
);
