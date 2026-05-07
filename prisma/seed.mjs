import { createPrismaClient } from './lib/create-prisma-client.mjs';
import prismaClientPkg from '@prisma/client';

const { PlayerPosition } = prismaClientPkg;

const prisma = createPrismaClient();

const teamSeeds = [
  {
    name: 'CSKA Moscow',
    city: 'Moscow',
    shortName: 'CSKA',
    rating: 95,
    targetFor: 93.1,
    targetAgainst: 74.3,
    winPct: 92.5,
    roster: [
      ['Casper Ware', PlayerPosition.PG, 35],
      ['Melo Trimble', PlayerPosition.PG, 31],
      ['Aleksa Avramovic', PlayerPosition.SG, 31],
      ['Ivan Ukhov', PlayerPosition.SG, 30],
      ['Anton Astapkovich', PlayerPosition.SF, 31],
      ["Amath M'Baye", PlayerPosition.PF, 36],
      ['Livio Jean-Charles', PlayerPosition.PF, 32],
      ['Tonye Jekiri', PlayerPosition.C, 31],
      ['Semen Antonov', PlayerPosition.PF, 36],
      ['Vladislav Goldin', PlayerPosition.C, 25],
    ],
  },
  {
    name: 'UNICS Kazan',
    city: 'Kazan',
    shortName: 'UNI',
    rating: 90,
    targetFor: 86.8,
    targetAgainst: 74.0,
    winPct: 82.5,
    roster: [
      ['Nenad Dimitrijevic', PlayerPosition.PG, 28],
      ['Marcos Knight', PlayerPosition.SG, 36],
      ['Dmitry Kulagin', PlayerPosition.SG, 33],
      ['Georgy Zhbanov', PlayerPosition.SF, 28],
      ['Andrey Lopatin', PlayerPosition.SF, 28],
      ['Louis Labeyrie', PlayerPosition.PF, 34],
      ['Jalen Reynolds', PlayerPosition.C, 33],
      ['Ismael Bako', PlayerPosition.C, 31],
      ['DeVaughn Akoon-Purcell', PlayerPosition.SF, 33],
      ['Vyacheslav Zaytsev', PlayerPosition.PG, 37],
    ],
  },
  {
    name: 'Zenit Saint Petersburg',
    city: 'Saint Petersburg',
    shortName: 'ZEN',
    rating: 87,
    targetFor: 87.5,
    targetAgainst: 75.8,
    winPct: 70.0,
    roster: [
      ['Xavier Moon', PlayerPosition.PG, 31],
      ['Trent Frazier', PlayerPosition.SG, 28],
      ['Denis Zakharov', PlayerPosition.SG, 32],
      ['Sergey Karasev', PlayerPosition.SF, 32],
      ['Dwayne Bacon', PlayerPosition.SF, 31],
      ['Andrey Zubkov', PlayerPosition.PF, 34],
      ['Omari Spellman', PlayerPosition.PF, 29],
      ['Vince Hunter', PlayerPosition.C, 31],
      ['Alex Poythress', PlayerPosition.C, 32],
      ['Egor Ryzhov', PlayerPosition.SF, 25],
    ],
  },
  {
    name: 'Lokomotiv Kuban',
    city: 'Krasnodar',
    shortName: 'LOK',
    rating: 85,
    targetFor: 86.1,
    targetAgainst: 80.2,
    winPct: 67.5,
    roster: [
      ['Vladislav Emchenko', PlayerPosition.PG, 26],
      ['Aleksandr Shcherbenev', PlayerPosition.PG, 25],
      ['Patrick Miller', PlayerPosition.SG, 34],
      ['Antonius Cleveland', PlayerPosition.SF, 32],
      ['Zakhar Vedischev', PlayerPosition.SG, 25],
      ['Okaro White', PlayerPosition.PF, 34],
      ['Andrey Martyuk', PlayerPosition.PF, 26],
      ['Kirill Elatontsev', PlayerPosition.C, 24],
      ['Dmitry Uzinsky', PlayerPosition.SF, 32],
      ['Mikhail Kulagin', PlayerPosition.SG, 31],
    ],
  },
  {
    name: 'Betsiti Parma Perm',
    city: 'Perm',
    shortName: 'PAR',
    rating: 79,
    targetFor: 82.1,
    targetAgainst: 78.4,
    winPct: 55.0,
    roster: [
      ['Isaiah Reese', PlayerPosition.PG, 29],
      ['Aleksandr Platunov', PlayerPosition.SG, 29],
      ['Evgeny Voronov', PlayerPosition.SG, 39],
      ['C.J. Bryce', PlayerPosition.SF, 29],
      ['B.J. Johnson', PlayerPosition.SF, 31],
      ['Danila Pokhodiaev', PlayerPosition.PF, 24],
      ['Ruslan Abdulbasirov', PlayerPosition.PF, 32],
      ['Richard Solomon', PlayerPosition.C, 34],
      ['Ivan Lazarev', PlayerPosition.C, 35],
      ['Sergey Chernov', PlayerPosition.PG, 25],
    ],
  },
  {
    name: 'Uralmash Yekaterinburg',
    city: 'Yekaterinburg',
    shortName: 'URA',
    rating: 76,
    targetFor: 79.7,
    targetAgainst: 78.0,
    winPct: 47.5,
    roster: [
      ['Stanley Whittaker', PlayerPosition.PG, 32],
      ['Garrett Nevels', PlayerPosition.SG, 33],
      ['Jeremiah Martin', PlayerPosition.PG, 30],
      ['Egor Bestuzhev', PlayerPosition.SG, 25],
      ['Javonte Douglas', PlayerPosition.SF, 33],
      ['Tyrell Nelson', PlayerPosition.PF, 30],
      ['Octavius Ellis', PlayerPosition.C, 33],
      ['Artem Komolov', PlayerPosition.SF, 31],
      ['Igor Novikov', PlayerPosition.PF, 25],
      ['Pavel Antipov', PlayerPosition.PF, 35],
    ],
  },
  {
    name: 'MBA-MAI Moscow',
    city: 'Moscow',
    shortName: 'MBA',
    rating: 75,
    targetFor: 80.3,
    targetAgainst: 82.2,
    winPct: 45.0,
    roster: [
      ['Andrey Sopin', PlayerPosition.PG, 28],
      ['Makar Konovalov', PlayerPosition.PG, 25],
      ['Daniil Kasatkin', PlayerPosition.SG, 26],
      ['Timofey Yakushin', PlayerPosition.SG, 28],
      ['Vladislav Trushkin', PlayerPosition.SF, 33],
      ['Aleksandr Khomenko', PlayerPosition.SF, 25],
      ['Maksim Barashkov', PlayerPosition.PF, 28],
      ['Dmitry Nezvankin', PlayerPosition.C, 31],
      ['Ivan Belikov', PlayerPosition.PF, 29],
      ['Pavel Afanasiev', PlayerPosition.C, 28],
    ],
  },
  {
    name: 'Enisey Krasnoyarsk',
    city: 'Krasnoyarsk',
    shortName: 'ENI',
    rating: 72,
    targetFor: 78.2,
    targetAgainst: 82.2,
    winPct: 37.5,
    roster: [
      ['Timofey Gerasimov', PlayerPosition.PG, 28],
      ['Angelo Warner', PlayerPosition.PG, 34],
      ['Jeremiah Hill', PlayerPosition.SG, 30],
      ['Mikhail Kulagin', PlayerPosition.SG, 31],
      ['Sergey Mitusov', PlayerPosition.SF, 29],
      ['Andrey Koshcheev', PlayerPosition.PF, 39],
      ['Aleksandr Zakharov', PlayerPosition.SF, 32],
      ['Kirill Popov', PlayerPosition.C, 27],
      ['Aleksandr Gankevich', PlayerPosition.PF, 30],
      ['Ivan Viktorov', PlayerPosition.C, 28],
    ],
  },
  {
    name: 'Pari Nizhny Novgorod',
    city: 'Nizhny Novgorod',
    shortName: 'NNV',
    rating: 68,
    targetFor: 76.1,
    targetAgainst: 87.9,
    winPct: 30.0,
    roster: [
      ['Ivan Strebkov', PlayerPosition.PG, 34],
      ['Zach Nutall', PlayerPosition.SG, 27],
      ['Evgeny Baburin', PlayerPosition.SG, 38],
      ['Nikita Mikhailovsky', PlayerPosition.SF, 25],
      ['Andrey Vorontsevich', PlayerPosition.PF, 39],
      ['Aleksandr Gankevich', PlayerPosition.PF, 30],
      ['Vladislav Sergeev', PlayerPosition.C, 24],
      ['Ilya Platonov', PlayerPosition.SF, 26],
      ['Ivan Paunic', PlayerPosition.SG, 39],
      ['Mikhail Belenitsky', PlayerPosition.SF, 23],
    ],
  },
  {
    name: 'Avtodor Saratov',
    city: 'Saratov',
    shortName: 'AVT',
    rating: 62,
    targetFor: 71.5,
    targetAgainst: 85.8,
    winPct: 17.5,
    roster: [
      ['Bryant Crawford', PlayerPosition.PG, 29],
      ['Malik Newman', PlayerPosition.SG, 29],
      ['Rayshaun Hammonds', PlayerPosition.PF, 28],
      ['Dusan Beslac', PlayerPosition.PF, 28],
      ['Artem Klimenko', PlayerPosition.C, 32],
      ['Kirill Pisklov', PlayerPosition.SG, 29],
      ['Evgeny Kolesnikov', PlayerPosition.SF, 39],
      ['Vladimir Pichkurov', PlayerPosition.SF, 35],
      ['Roman Manuilov', PlayerPosition.SG, 27],
      ['Evgeny Minchenko', PlayerPosition.C, 31],
    ],
  },
  {
    name: 'Samara',
    city: 'Samara',
    shortName: 'SAM',
    rating: 55,
    targetFor: 71.8,
    targetAgainst: 94.3,
    winPct: 5.0,
    roster: [
      ['Anton Kardanakhishvili', PlayerPosition.PG, 23],
      ['Hayden Dalton', PlayerPosition.PF, 30],
      ['Ilya Popov', PlayerPosition.C, 29],
      ['James Ennis', PlayerPosition.SF, 35],
      ['Maksim Salash', PlayerPosition.C, 30],
      ['Daniil Aksenov', PlayerPosition.SG, 30],
      ['Maksim Dybovskiy', PlayerPosition.SG, 38],
      ['Gleb Sheiko', PlayerPosition.SF, 28],
      ['Roman Balashov', PlayerPosition.PF, 24],
      ['Nikita Ivanov', PlayerPosition.PG, 24],
    ],
  },
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
  const offenseIndex = team.targetFor - 80;
  const defenseIndex = 82 - team.targetAgainst;
  const winIndex = (team.winPct - 50) / 12;

  return team.roster.map(([name, position, age], playerIndex) => {
    const rotationPenalty = playerIndex < 5 ? 0 : playerIndex < 8 ? -3 : -7;
    const baseOverall = clamp(
      team.rating - 9 + offenseIndex * 0.22 + defenseIndex * 0.28 + winIndex + rotationPenalty,
      50,
      94,
    );
    const variation = ((teamIndex * 7 + playerIndex * 5) % 7) - 3;
    const overall = clamp(Math.round(baseOverall + variation), 48, 96);
    const potential = clamp(overall + 2 + ((teamIndex + playerIndex) % 6), overall, 98);
    const bias = positionBias(position);

    const shooting = clamp(
      Math.round(
        overall + bias.shooting + offenseIndex * 0.7 + ((teamIndex + playerIndex) % 5) - 2,
      ),
      38,
      99,
    );
    const passing = clamp(
      Math.round(
        overall + bias.passing + offenseIndex * 0.35 + ((teamIndex * 2 + playerIndex) % 5) - 2,
      ),
      38,
      99,
    );
    const defense = clamp(
      Math.round(
        overall + bias.defense + defenseIndex * 0.75 + ((teamIndex + playerIndex * 3) % 5) - 2,
      ),
      38,
      99,
    );
    const rebounding = clamp(
      Math.round(
        overall + bias.rebounding + defenseIndex * 0.35 + ((teamIndex * 3 + playerIndex) % 5) - 2,
      ),
      38,
      99,
    );
    const athleticism = clamp(
      Math.round(
        overall + bias.athleticism + offenseIndex * 0.15 + ((teamIndex + playerIndex * 4) % 5) - 2,
      ),
      38,
      99,
    );

    return {
      name,
      age,
      position,
      shooting,
      passing,
      defense,
      rebounding,
      athleticism,
      overall,
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
      create: {
        name: teamSeed.name,
        city: teamSeed.city,
        shortName: teamSeed.shortName,
        rating: teamSeed.rating,
      },
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
