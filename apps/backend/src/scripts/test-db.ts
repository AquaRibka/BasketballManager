import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const prisma = app.get(PrismaService);
    const [{ databaseName }] =
      await prisma.$queryRaw<{ databaseName: string }[]>`SELECT current_database() AS "databaseName"`;

    const team = await prisma.team.upsert({
      where: { shortName: 'BMN' },
      update: {
        city: 'Moscow',
        name: 'Basketball Manager Night',
        rating: 82,
      },
      create: {
        city: 'Moscow',
        shortName: 'BMN',
        name: 'Basketball Manager Night',
        rating: 82,
      },
    });

    await prisma.player.deleteMany({
      where: {
        name: 'Alex Carter',
        teamId: team.id,
      },
    });

    const player = await prisma.player.create({
      data: {
        name: 'Alex Carter',
        age: 22,
        position: 'PG',
        shooting: 78,
        passing: 84,
        defense: 71,
        rebounding: 52,
        athleticism: 80,
        potential: 88,
        overall: 79,
        teamId: team.id,
      },
    });

    console.log('Prisma connected successfully.');
    console.log(`Database: ${databaseName}`);
    console.log(`Team: ${team.name} (${team.shortName})`);
    console.log(`Player: ${player.name} -> ${team.shortName}`);
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error('Prisma connection test failed.');
  console.error(error);
  process.exitCode = 1;
});
