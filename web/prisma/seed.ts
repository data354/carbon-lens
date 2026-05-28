import { env } from "@/configs/env";
import { auth } from "@/lib/auth/server";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(
    async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email: env.DEFAULT_ADMIN_EMAIL },
      });

      if (!existingUser) {
        await auth.api.createUser({
          body: {
            email: env.DEFAULT_ADMIN_EMAIL,
            password: env.DEFAULT_USER_PASSWORD,
            name: env.DEFAULT_ADMIN_NAME,
            role: "admin",
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
    console.log("✅ Seeding completed successfully.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("❌ Seeding failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
