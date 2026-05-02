import prismaClientPkg from '@prisma/client';
import { createPrismaClient } from './lib/create-prisma-client.mjs';

const { PlayerPosition } = prismaClientPkg;

const prisma = createPrismaClient();

const testLeague = [
  {
    team: {
      name: 'Test Alpha Bears',
      city: 'Test City Alpha',
      shortName: 'TSTA',
      rating: 81,
    },
    players: [
      {
        name: 'Test Alpha One',
        age: 24,
        position: PlayerPosition.PG,
        shooting: 78,
        passing: 86,
        defense: 72,
        rebounding: 55,
        athleticism: 82,
        potential: 88,
        overall: 80,
      },
      {
        name: 'Test Alpha Two',
        age: 25,
        position: PlayerPosition.SG,
        shooting: 84,
        passing: 77,
        defense: 71,
        rebounding: 58,
        athleticism: 80,
        potential: 85,
        overall: 79,
      },
      {
        name: 'Test Alpha Three',
        age: 27,
        position: PlayerPosition.SF,
        shooting: 79,
        passing: 74,
        defense: 78,
        rebounding: 67,
        athleticism: 81,
        potential: 83,
        overall: 78,
      },
      {
        name: 'Test Alpha Four',
        age: 28,
        position: PlayerPosition.PF,
        shooting: 72,
        passing: 68,
        defense: 82,
        rebounding: 79,
        athleticism: 77,
        potential: 81,
        overall: 76,
      },
      {
        name: 'Test Alpha Five',
        age: 29,
        position: PlayerPosition.C,
        shooting: 66,
        passing: 64,
        defense: 86,
        rebounding: 84,
        athleticism: 75,
        potential: 82,
        overall: 77,
      },
    ],
  },
  {
    team: {
      name: 'Test Beta Falcons',
      city: 'Test City Beta',
      shortName: 'TSTB',
      rating: 76,
    },
    players: [
      {
        name: 'Test Beta One',
        age: 22,
        position: PlayerPosition.PG,
        shooting: 74,
        passing: 81,
        defense: 69,
        rebounding: 52,
        athleticism: 79,
        potential: 84,
        overall: 76,
      },
      {
        name: 'Test Beta Two',
        age: 23,
        position: PlayerPosition.SG,
        shooting: 80,
        passing: 73,
        defense: 68,
        rebounding: 54,
        athleticism: 78,
        potential: 82,
        overall: 75,
      },
      {
        name: 'Test Beta Three',
        age: 26,
        position: PlayerPosition.SF,
        shooting: 76,
        passing: 72,
        defense: 74,
        rebounding: 64,
        athleticism: 77,
        potential: 80,
        overall: 74,
      },
      {
        name: 'Test Beta Four',
        age: 27,
        position: PlayerPosition.PF,
        shooting: 69,
        passing: 65,
        defense: 79,
        rebounding: 75,
        athleticism: 74,
        potential: 79,
        overall: 73,
      },
      {
        name: 'Test Beta Five',
        age: 30,
        position: PlayerPosition.C,
        shooting: 63,
        passing: 60,
        defense: 83,
        rebounding: 81,
        athleticism: 72,
        potential: 78,
        overall: 74,
      },
    ],
  },
  {
    team: {
      name: 'Test Gamma Wolves',
      city: 'Test City Gamma',
      shortName: 'TSTG',
      rating: 72,
    },
    players: [
      {
        name: 'Test Gamma One',
        age: 21,
        position: PlayerPosition.PG,
        shooting: 70,
        passing: 78,
        defense: 67,
        rebounding: 49,
        athleticism: 76,
        potential: 80,
        overall: 72,
      },
      {
        name: 'Test Gamma Two',
        age: 24,
        position: PlayerPosition.SG,
        shooting: 75,
        passing: 70,
        defense: 66,
        rebounding: 51,
        athleticism: 75,
        potential: 79,
        overall: 71,
      },
      {
        name: 'Test Gamma Three',
        age: 25,
        position: PlayerPosition.SF,
        shooting: 72,
        passing: 69,
        defense: 71,
        rebounding: 60,
        athleticism: 74,
        potential: 77,
        overall: 70,
      },
      {
        name: 'Test Gamma Four',
        age: 28,
        position: PlayerPosition.PF,
        shooting: 67,
        passing: 63,
        defense: 75,
        rebounding: 70,
        athleticism: 72,
        potential: 76,
        overall: 69,
      },
      {
        name: 'Test Gamma Five',
        age: 29,
        position: PlayerPosition.C,
        shooting: 60,
        passing: 58,
        defense: 80,
        rebounding: 78,
        athleticism: 70,
        potential: 75,
        overall: 70,
      },
    ],
  },
];

const TEST_TEAM_SHORT_NAMES = testLeague.map((entry) => entry.team.shortName);

async function seedTestData() {
  const existingTeams = await prisma.team.findMany({
    where: {
      shortName: {
        in: TEST_TEAM_SHORT_NAMES,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingTeams.length > 0) {
    await prisma.player.deleteMany({
      where: {
        teamId: {
          in: existingTeams.map((team) => team.id),
        },
      },
    });
  }

  for (const entry of testLeague) {
    const team = await prisma.team.upsert({
      where: {
        shortName: entry.team.shortName,
      },
      update: {
        name: entry.team.name,
        city: entry.team.city,
        rating: entry.team.rating,
      },
      create: entry.team,
    });

    await prisma.player.deleteMany({
      where: {
        teamId: team.id,
      },
    });

    await prisma.player.createMany({
      data: entry.players.map((player) => ({
        ...player,
        teamId: team.id,
      })),
    });
  }

  const seededTeams = await prisma.team.count({
    where: {
      shortName: {
        in: TEST_TEAM_SHORT_NAMES,
      },
    },
  });

  const seededPlayers = await prisma.player.count({
    where: {
      team: {
        shortName: {
          in: TEST_TEAM_SHORT_NAMES,
        },
      },
    },
  });

  console.log(`Seeded ${seededTeams} test teams and ${seededPlayers} test players.`);
}

seedTestData()
  .catch((error) => {
    console.error('Prisma test seed failed.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
