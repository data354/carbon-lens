import { env } from "@/configs/env";
import ky from "ky";

export const geoKyServer = ky.create({
  prefixUrl: env.GEO_API_BASE_URL,
  throwHttpErrors: false,
  retry: 0,
});
