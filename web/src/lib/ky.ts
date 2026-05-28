import { env } from "@/configs/env";
import ky from "ky";

export const geoKyClient = ky.create({
  prefixUrl: env.NEXT_PUBLIC_GEO_API_BASE_URL,
  throwHttpErrors: false,
  retry: 0,
});
