import {
  ac,
  admin as adminRole,
  manager,
  user,
} from "./permissions";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { MIN_PASSWORD_LENGTH } from "../../features/auth/constants";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  appName: "Carbon Lens",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
  },
  plugins: [
    admin({
      ac,
      roles: {
        admin: adminRole,
        manager,
        user,
      },
    }),
    nextCookies(),
  ],
  user: {
    additionalFields: {
      nameSet: {
        type: "boolean",
        defaultValue: false,
        returned: true,
        input: false,
      },
      firstLogin: {
        type: "boolean",
        defaultValue: true,
        returned: true,
        input: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
