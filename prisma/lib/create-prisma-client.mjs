import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import prismaClientPkg from '@prisma/client';

const { PrismaClient } = prismaClientPkg;

export function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured');
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  return new PrismaClient({ adapter });
}
