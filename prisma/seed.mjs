import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import prismaClientPkg from '@prisma/client';

const { PrismaClient, PlayerPosition } = prismaClientPkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

const positions = [
  PlayerPosition.PG,
  PlayerPosition.SG,
  PlayerPosition.SF,
  PlayerPosition.PF,
  PlayerPosition.C,
  PlayerPosition.SG,
  PlayerPosition.SF,
  PlayerPosition.PG,
];

const firstNames = [
  'Alex',
  'Maksim',
  'Ilya',
  'Nikita',
  'Roman',
  'Daniil',
  'Artem',
  'Kirill',
  'Andrei',
  'Sergey',
  'Pavel',
  'Egor',
];

const lastNames = [
  'Sokolov',
  'Voronov',
  'Melnikov',
  'Petrov',
  'Zaitsev',
  'Kuznetsov',
  'Antonov',
  'Lebedev',
  'Morozov',
  'Orlov',
  'Belyaev',
  'Smirnov',
];

const teamSeeds = [
  { name: 'CSKA Moscow', city: 'Moscow', shortName: 'CSKA', rating: 88 },
  { name: 'Zenit Saint Petersburg', city: 'Saint Petersburg', shortName: 'ZEN', rating: 86 },
  { name: 'UNICS Kazan', city: 'Kazan', shortName: 'UNI', rating: 85 },
  { name: 'Lokomotiv Kuban', city: 'Krasnodar', shortName: 'LOK', rating: 84 },
  { name: 'Parma Perm', city: 'Perm', shortName: 'PAR', rating: 78 },
  { name: 'Avtodor Saratov', city: 'Saratov', shortName: 'AVT', rating: 76 },
  { name: 'Nizhny Novgorod', city: 'Nizhny Novgorod', shortName: 'NNV', rating: 77 },
  { name: 'Uralmash Yekaterinburg', city: 'Yekaterinburg', shortName: 'URA', rating: 75 },
  { name: 'Enisey Krasnoyarsk', city: 'Krasnoyarsk', shortName: 'ENI', rating: 74 },
  { name: 'MBA Moscow', city: 'Moscow', shortName: 'MBA', rating: 73 },
  { name: 'Samara', city: 'Samara', shortName: 'SAM', rating: 72 },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function positionBias(position) {
  switch (position) {
    case PlayerPosition.PG:
      return { shooting: 3, passing: 8, defense: 0, rebounding: -8, athleticism: 2 };
    case PlayerPosition.SG:
      return { shooting: 8, passing: 2, defense: 1, rebounding: -4, athleticism: 3 };
    case PlayerPosition.SF:
      return { shooting: 4, passing: 1, defense: 4, rebounding: 2, athleticism: 4 };
    case PlayerPosition.PF:
      return { shooting: -1, passing: -2, defense: 6, rebounding: 7, athleticism: 2 };
    case PlayerPosition.C:
      return { shooting: -5, passing: -4, defense: 8, rebounding: 10, athleticism: 0 };
    default:
      return { shooting: 0, passing: 0, defense: 0, rebounding: 0, athleticism: 0 };
  }
}

function buildRoster(team, teamIndex) {
  return positions.map((position, playerIndex) => {
    const firstName = firstNames[(teamIndex + playerIndex) % firstNames.length];
    const lastName = lastNames[(teamIndex * 2 + playerIndex) % lastNames.length];
    const age = 20 + ((teamIndex + playerIndex * 2) % 11);
    const baseOverall = clamp(team.rating - 7 + ((playerIndex * 3 + teamIndex) % 9), 63, 90);
    const overall = playerIndex < 5 ? baseOverall + 2 : baseOverall - 2;
    const potential = clamp(overall + 3 + ((teamIndex + playerIndex) % 7), overall, 96);
    const bias = positionBias(position);

    const shooting = clamp(overall + bias.shooting + ((teamIndex + playerIndex) % 5) - 2, 45, 99);
    const passing = clamp(overall + bias.passing + ((teamIndex * 2 + playerIndex) % 5) - 2, 40, 99);
    const defense = clamp(overall + bias.defense + ((teamIndex + playerIndex * 3) % 5) - 2, 45, 99);
    const rebounding = clamp(
      overall + bias.rebounding + ((teamIndex * 3 + playerIndex) % 5) - 2,
      40,
      99,
    );
    const athleticism = clamp(
      overall + bias.athleticism + ((teamIndex + playerIndex * 4) % 5) - 2,
      45,
      99,
    );

    return {
      name: `${firstName} ${lastName}`,
      age,
      position,
      shooting,
      passing,
      defense,
      rebounding,
      athleticism,
      overall: clamp(overall, 60, 92),
      potential,
    };
  });
}

async function seed() {
  const seededTeams = [];

  for (const [teamIndex, teamSeed] of teamSeeds.entries()) {
    const team = await prisma.team.upsert({
      where: { shortName: teamSeed.shortName },
      update: {
        name: teamSeed.name,
        city: teamSeed.city,
        rating: teamSeed.rating,
      },
      create: teamSeed,
    });

    seededTeams.push(team);
    const roster = buildRoster(teamSeed, teamIndex);

    await prisma.player.deleteMany({
      where: {
        teamId: team.id,
      },
    });

    await prisma.player.createMany({
      data: roster.map((player) => ({
        ...player,
        teamId: team.id,
      })),
    });
  }

  const playerCount = await prisma.player.count({
    where: {
      teamId: {
        in: seededTeams.map((team) => team.id),
      },
    },
  });

  console.log(`Seeded ${seededTeams.length} teams and ${playerCount} players.`);
}

seed()
  .catch((error) => {
    console.error('Prisma seed failed.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
