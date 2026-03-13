import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const testEmail = process.env.SEED_TEST_EMAIL ?? "demo@leximemo.local";
const testPassword = process.env.SEED_TEST_PASSWORD ?? "demo12345";
const testName = process.env.SEED_TEST_NAME ?? "Demo User";

async function main() {
  const passwordHash = await bcrypt.hash(testPassword, 10);

  await prisma.user.upsert({
    where: {
      email: testEmail,
    },
    update: {
      name: testName,
      passwordHash,
    },
    create: {
      email: testEmail,
      name: testName,
      passwordHash,
    },
  });

  console.log("Seed completed:");
  console.log(`- email: ${testEmail}`);
  console.log(`- password: ${testPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
