import { env } from "@/configs/env";
import ky from "ky";
import { headers } from "next/headers";
import { isIP } from "node:net";

/**
 * IP of the user behind the current request: the last
 * X-Forwarded-For entry, added by the closest proxy (nginx).
 */
async function getClientIp() {
  try {
    const forwardedFor = (await headers()).get("x-forwarded-for");
    const ip = forwardedFor?.split(",").at(-1)?.trim();

    return ip && isIP(ip) ? ip : undefined;
  } catch {
    // Outside a request scope (e.g. at build time)
    return undefined;
  }
}

export const geoKyServer = ky.create({
  prefixUrl: env.GEO_API_BASE_URL,
  throwHttpErrors: false,
  retry: 0,
  hooks: {
    beforeRequest: [
      // Forward the user's IP so that the API rate limits
      // each user instead of the web server as a whole
      async (request) => {
        const clientIp = await getClientIp();

        if (clientIp) {
          request.headers.set("x-forwarded-for", clientIp);
        }
      },
    ],
  },
});
