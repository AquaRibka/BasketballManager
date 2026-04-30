import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import prismaClientPkg from "@prisma/client";

const { PrismaClient } = prismaClientPkg;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });
