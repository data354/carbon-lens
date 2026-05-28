import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    BETTER_AUTH_SECRET: z.string().nonempty(),
    DATABASE_URL: z.string().nonempty(),
    DEFAULT_USER_PASSWORD: z.string().nonempty(),
    RESEND_API_KEY: z.string().nonempty(),
    DEFAULT_ADMIN_EMAIL: z.string().nonempty(),
    DEFAULT_ADMIN_NAME: z.string().nonempty(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_BETTER_AUTH_URL: z.url(),
    NEXT_PUBLIC_GEO_API_BASE_URL: z.url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_BETTER_AUTH_URL:
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    NEXT_PUBLIC_GEO_API_BASE_URL:
      process.env.NEXT_PUBLIC_GEO_API_BASE_URL,
  },
  emptyStringAsUndefined: true,
  skipValidation: Boolean(process.env.SKIP_ENV_VALIDATION),
});
