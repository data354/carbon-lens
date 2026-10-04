import { env } from "@/configs/env";
import { auth } from "@/lib/auth/server";
import { PrismaClient } from "../src/generated/prisma";
import { generateDefaultPassword } from "@/features/auth/utils/password";
import { sendNewUserWelcomeEmail } from "@/lib/auth/email/send-new-user-welcome-email";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(
    async (tx) => {
      const defaultPassword = generateDefaultPassword();

      const existingUser = await tx.user.findUnique({
        where: { email: env.DEFAULT_ADMIN_EMAIL },
      });

      if (!existingUser) {
        const { user: newUser } = await auth.api.createUser(
          {
            body: {
              email: env.DEFAULT_ADMIN_EMAIL,
              password: defaultPassword,
              name: env.DEFAULT_ADMIN_NAME,
              role: "admin",
            },
          },
        );

        const response = await sendNewUserWelcomeEmail({
          to: newUser.email,
          temporaryPassword: defaultPassword,
          email: newUser.email,
        });

        if (response.error) {
          throw new Error("Failed to send welcome email");
        }

        await tx.user.update({
          where: {
            id: newUser.id,
          },
          data: {
            firstLogin: true,
            nameSet: false,
          },
        });
      }
    },
    {
      timeout: 15_000,
    },
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("❌ Seeding failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
