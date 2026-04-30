import { prisma } from "./lib/prisma.mjs";

async function main() {
  const [{ database_name }] =
    await prisma.$queryRaw`SELECT current_database() AS database_name`;
  const teamCount = await prisma.team.count();

  console.log("Prisma connected successfully.");
  console.log(`Database: ${database_name}`);
  console.log(`Team rows: ${teamCount}`);
}

main()
  .catch((error) => {
    console.error("Prisma connection test failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
