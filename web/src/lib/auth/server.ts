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
import { sendNewUserWelcomeEmail } from "./email/send-new-user-welcome-email";
import { MIN_PASSWORD_LENGTH } from "../../features/auth/constants";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { env } from "@/configs/env";

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
  databaseHooks: {
    user: {
      create: {
        async after(user) {
          const response = await sendNewUserWelcomeEmail({
            to: user.email,
            temporaryPassword: env.DEFAULT_USER_PASSWORD,
            loginLink: `${env.NEXT_PUBLIC_APP_URL}/auth/login`,
            email: user.email,
            name: user.name,
          });

          if (response.error) {
            await auth.api.removeUser({
              headers: await headers(),
              body: {
                userId: user.id,
              },
            });
          }
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
