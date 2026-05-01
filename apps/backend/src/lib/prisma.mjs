import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import prismaClientPkg from "@prisma/client";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { PrismaClient } = prismaClientPkg;
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, "../../../../");

loadEnv({ path: path.join(repoRoot, ".env") });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });
