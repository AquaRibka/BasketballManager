import { createPrismaClient } from './lib/create-prisma-client.mjs';
import prismaClientPkg from '@prisma/client';

const { PlayerBodyType, PlayerDominantHand, PlayerPosition } = prismaClientPkg;

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
      ['Casper Ware', PlayerPosition.PG, 36],
      ['Melo Trimble', PlayerPosition.SG, 31],
      ['Anton Astapkovich', PlayerPosition.SF, 32],
      ['Livio Jean-Charles', PlayerPosition.PF, 32],
      ['Tonye Jekiri', PlayerPosition.C, 31],
      ['Aleksander Chadov', PlayerPosition.PF, 24],
      ['Aleksandr Gankevich', PlayerPosition.PF, 30],
      ['Antonius Cleveland', PlayerPosition.SG, 32],
      ['Daniil Klyuchenkov', PlayerPosition.SG, 22],
      ['Ivan Ukhov', PlayerPosition.SF, 30],
      ['Ivan Zaitsev', PlayerPosition.SF, 22],
      ['Luka Mitrovic', PlayerPosition.PF, 33],
      ['Nikita Drujok', PlayerPosition.SF, 18],
      ['Nikita Kurbanov', PlayerPosition.PF, 39],
      ['Samson Ruzhentsev', PlayerPosition.SF, 24],
      ['Semen Antonov', PlayerPosition.PF, 36],
      ['Vladimir Karpenko', PlayerPosition.SG, 25],
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
      ['Paris Lee', PlayerPosition.PG, 31],
      ['Xavier Munford', PlayerPosition.PG, 33],
      ['Alexey Shved', PlayerPosition.PG, 37],
      ['Dmitry Kulagin', PlayerPosition.SG, 33],
      ['Elijah Stewart', PlayerPosition.SG, 30],
      ['C.J. Bryce', PlayerPosition.SG, 29],
      ['Dyshawn Pierre', PlayerPosition.SF, 32],
      ['Andrei Lopatin', PlayerPosition.SF, 27],
      ['Ruslan Abdulbasirov', PlayerPosition.PF, 32],
      ['Marcus Bingham Jr.', PlayerPosition.PF, 25],
      ['Jalen Reynolds', PlayerPosition.C, 33],
      ['Alexander Stulenkov', PlayerPosition.PF, 33],
      ['Denis Zakharov', PlayerPosition.PG, 32],
      ['Ivan Belousov', PlayerPosition.SG, 25],
      ['Magomednabi Halilulaev', PlayerPosition.SG, 20],
      ['Mikhail Belenitskii', PlayerPosition.SG, 23],
      ['Mikhail Kulagin', PlayerPosition.SG, 31],
      ['Roman Ilyuk', PlayerPosition.PG, 20],
      ['Tyron Brewer', PlayerPosition.SG, 26],
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
    strengthOffset: 4,
    roster: [
      ['Xavier Moon', PlayerPosition.PG, 31],
      ['Aleksandr Shcherbenev', PlayerPosition.PG, 25],
      ['Vladislav Emchenko', PlayerPosition.SG, 26],
      ['Trent Frazier', PlayerPosition.SG, 27],
      ['Johnny Juzang', PlayerPosition.SG, 25],
      ['Andre Roberson', PlayerPosition.SF, 34],
      ['Sergey Karasev', PlayerPosition.SF, 32],
      ['Georgy Zhbanov', PlayerPosition.SF, 28],
      ['Dmitrii Uzinskiy', PlayerPosition.SF, 32],
      ['Pavel Zemskiy', PlayerPosition.SF, 21],
      ['Andrey Vorontsevich', PlayerPosition.PF, 38],
      ['Igor Volkhin', PlayerPosition.PF, 28],
      ['Luka Samanic', PlayerPosition.PF, 26],
      ['Alex Poythress', PlayerPosition.C, 32],
      ['Andrei Martiuk', PlayerPosition.C, 25],
      ['Ismael Bako', PlayerPosition.C, 30],
      ['Ilya Krivykh', PlayerPosition.C, 19],
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
    strengthOffset: 3,
    roster: [
      ['Patrick Miller', PlayerPosition.PG, 33],
      ['Ivan Samojlenko', PlayerPosition.PG, 22],
      ['Makar Konovalov', PlayerPosition.PG, 25],
      ['Jeremiah Martin', PlayerPosition.SG, 29],
      ['Kassius Robertson', PlayerPosition.SG, 32],
      ['Kirill Temirov', PlayerPosition.SG, 24],
      ['B.J. Johnson', PlayerPosition.SF, 30],
      ['Zakhar Vedishchev', PlayerPosition.SF, 25],
      ['Vsevolod Icshenko', PlayerPosition.SF, 21],
      ['Pavel Ryabkov', PlayerPosition.SF, 19],
      ['Alen Hadzibegovic', PlayerPosition.PF, 27],
      ['Anton Kvitkovsky', PlayerPosition.PF, 25],
      ['Danil Kasko', PlayerPosition.PF, 22],
      ['Danil Sheianov', PlayerPosition.PF, 22],
      ['Mike Moore', PlayerPosition.PF, 31],
      ['Royce Hamm Jr.', PlayerPosition.PF, 27],
      ['Vince Hunter', PlayerPosition.C, 31],
      ['Ilia Popov', PlayerPosition.C, 31],
      ['Deniz Pamuk', PlayerPosition.C, 15],
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
      ['Jalen Adams', PlayerPosition.PG, 30],
      ['Brendan Adams', PlayerPosition.SG, 26],
      ['Ivan Egorov', PlayerPosition.SG, 20],
      ['Ivan Mironov', PlayerPosition.SG, 20],
      ['Timofey Yakushin', PlayerPosition.SG, 29],
      ['Victor Sanders', PlayerPosition.SG, 31],
      ['Alexander Zakharov', PlayerPosition.SF, 32],
      ['Mikhail Stafeev', PlayerPosition.SF, 21],
      ['Lev Svinin', PlayerPosition.SF, 19],
      ['Grigorii Golovchenko', PlayerPosition.SF, 19],
      ['Mikael Hopkins', PlayerPosition.PF, 32],
      ['Stanislav Ilnitskiy', PlayerPosition.PF, 32],
      ['Alexander Shashkov', PlayerPosition.C, 26],
      ['Ievgen Minchenko', PlayerPosition.C, 31],
      ['Terrell Carter II', PlayerPosition.C, 30],
      ['Gleb Firsov', PlayerPosition.C, 21],
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
      ['Anton Kardanakhishvili', PlayerPosition.PG, 24],
      ['Timofei Gerasimov', PlayerPosition.PG, 28],
      ['Garrett Nevels', PlayerPosition.SG, 33],
      ['Kirill Pisklov', PlayerPosition.SG, 29],
      ['Ivan Pynko', PlayerPosition.SG, 25],
      ['Aleksandr Petenev', PlayerPosition.SF, 25],
      ['Hayden Dalton', PlayerPosition.SF, 29],
      ['Isaiah Reese', PlayerPosition.SF, 29],
      ['Vladimir Ivlev', PlayerPosition.PF, 36],
      ['Javonte Douglas', PlayerPosition.PF, 33],
      ['Tyrell Nelson', PlayerPosition.PF, 30],
      ['Yauheni Beliankou', PlayerPosition.PF, 30],
      ['Octavius Ellis', PlayerPosition.C, 33],
      ['Kirill Popov', PlayerPosition.C, 22],
      ['Dmitrii Khaldeev', PlayerPosition.C, 27],
      ['Igor Novikov', PlayerPosition.SG, 33],
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
      ['Viacheslav Zaitcev', PlayerPosition.PG, 36],
      ['Maxim Lichutin', PlayerPosition.PG, 25],
      ['Aleksandr Platunov', PlayerPosition.SG, 28],
      ['Artem Komolov', PlayerPosition.SG, 32],
      ['Evgeny Voronov', PlayerPosition.SG, 40],
      ['Klim Adaykin', PlayerPosition.SG, 21],
      ['Matvej Padius', PlayerPosition.SG, 19],
      ['Pavel Savkov', PlayerPosition.SG, 24],
      ['Maksim Barashkov', PlayerPosition.SF, 27],
      ['Andrey Zubkov', PlayerPosition.SF, 34],
      ['Danil Pevnev', PlayerPosition.SF, 25],
      ['Pasha Ismailov', PlayerPosition.SF, 23],
      ['Alexander Gudumak', PlayerPosition.PF, 32],
      ['Vladislav Trushkin', PlayerPosition.PF, 33],
      ['Maksim Ogarkov', PlayerPosition.PF, 20],
      ['Sergey Balashov', PlayerPosition.C, 29],
      ['Timofey Shikalov', PlayerPosition.SG, 19],
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
      ['Dominic Artis', PlayerPosition.PG, 32],
      ['Matt Coleman III', PlayerPosition.PG, 28],
      ['Egor Skuratov', PlayerPosition.PG, 20],
      ['Daniil Kasatkin', PlayerPosition.SG, 27],
      ['Nikita Evdokimov', PlayerPosition.SG, 23],
      ['Mikhail Vedishchev', PlayerPosition.SG, 21],
      ['Vladislav Perevalov', PlayerPosition.SG, 24],
      ['Alexey Sereda', PlayerPosition.SF, 20],
      ['Artem Antipov', PlayerPosition.SF, 21],
      ['Artem Schlegel', PlayerPosition.SG, 22],
      ['Dmitry Sonko', PlayerPosition.SF, 24],
      ['Danilo Tasic', PlayerPosition.PF, 32],
      ['Egor Ryzhov', PlayerPosition.PF, 21],
      ['Sergey Dolinin', PlayerPosition.PF, 26],
      ['Egor Vanin', PlayerPosition.C, 22],
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
      ['Aleksandr Khomenko', PlayerPosition.PG, 27],
      ['Isaiah Washington', PlayerPosition.PG, 27],
      ['Shane Gatling', PlayerPosition.PG, 28],
      ['Dmitriy Khvostov', PlayerPosition.SG, 36],
      ['Daniil Klyuchenkov', PlayerPosition.SG, 22],
      ['Evgenii Baburin', PlayerPosition.SG, 38],
      ['Semen Burinskiy', PlayerPosition.SG, 21],
      ['Sergey Zotkin', PlayerPosition.SG, 22],
      ['Timofey Yakushin', PlayerPosition.SG, 29],
      ['Ilya Platonov', PlayerPosition.SF, 27],
      ['Norbert Lukacs', PlayerPosition.SF, 24],
      ['Nikita Simaev', PlayerPosition.PF, 17],
      ['Hunter Dean', PlayerPosition.PF, 24],
      ['Ilya Karpenkov', PlayerPosition.C, 29],
      ['Kirill Popov', PlayerPosition.C, 22],
      ['Nikita Hakli', PlayerPosition.C, 19],
      ['Sergey Grishaev', PlayerPosition.C, 23],
      ['Zakhar Lavrenov', PlayerPosition.C, 20],
      ['Alexandr Shenderov', PlayerPosition.SG, 18],
      ['Timofey Samoylenko', PlayerPosition.SG, 16],
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
      ['Vitalius Pranauskis', PlayerPosition.PG, 23],
      ['Alex Hamilton', PlayerPosition.SG, 32],
      ['Malik Newman', PlayerPosition.SG, 29],
      ['Grigory Motovilov', PlayerPosition.SG, 28],
      ['Terrence Edwards', PlayerPosition.SG, 23],
      ['Dmitrii Iakovlev', PlayerPosition.SG, 21],
      ['Arseniy Nikulin', PlayerPosition.SG, 19],
      ['Ilya Anufriev', PlayerPosition.SG, 19],
      ['Aleksandr Evseev', PlayerPosition.SF, 24],
      ['Andrey Fedorov', PlayerPosition.SF, 22],
      ['Danil Kasko', PlayerPosition.SF, 22],
      ['Alen Hadzibegovic', PlayerPosition.PF, 27],
      ['Dusan Beslac', PlayerPosition.PF, 27],
      ['Igor Volkhin', PlayerPosition.PF, 28],
      ['Artem Klimenko', PlayerPosition.C, 32],
      ['Anton Sushchik', PlayerPosition.C, 20],
      ['Pavel Zemskiy', PlayerPosition.SG, 21],
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
      ['Aleksandr Kuznetcov', PlayerPosition.PG, 28],
      ['Artem Chevarenkov', PlayerPosition.PG, 30],
      ['Nikita Mikhailovsky', PlayerPosition.SG, 25],
      ['Dmitriy Cheburkin', PlayerPosition.SG, 28],
      ['Daniil Martynov', PlayerPosition.SG, 19],
      ['Danila Pokhodiaev', PlayerPosition.SF, 25],
      ['Gleb Sheiko', PlayerPosition.SF, 29],
      ['Danila Chikarev', PlayerPosition.SF, 24],
      ['Andrei Savrasov', PlayerPosition.PF, 25],
      ['Valery Kalinov', PlayerPosition.PF, 26],
      ['Artem Pivtsaykin', PlayerPosition.PF, 18],
      ['Georgii Marufov', PlayerPosition.PF, 19],
      ['Nikita Kosiakov', PlayerPosition.PF, 21],
      ['Dmitrii Khaldeev', PlayerPosition.C, 27],
      ['Ievgen Minchenko', PlayerPosition.C, 31],
      ['Egor Velikorodnyy', PlayerPosition.C, 19],
      ['Mikhail Kulagin', PlayerPosition.SG, 31],
    ],
  },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hashString(value) {
  return [...value].reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0);
}

function buildDateOfBirth(age, seed) {
  const hash = hashString(seed);
  const month = hash % 12;
  const day = (hash % 28) + 1;
  return new Date(Date.UTC(2026 - age, month, day));
}

function buildDominantHand(seed) {
  const hash = hashString(seed) % 10;

  if (hash === 0) {
    return PlayerDominantHand.LEFT;
  }

  if (hash === 1) {
    return PlayerDominantHand.AMBIDEXTROUS;
  }

  return PlayerDominantHand.RIGHT;
}

function buildSecondaryPositions(position) {
  switch (position) {
    case PlayerPosition.PG:
      return [PlayerPosition.SG];
    case PlayerPosition.SG:
      return [PlayerPosition.PG, PlayerPosition.SF];
    case PlayerPosition.SF:
      return [PlayerPosition.SG, PlayerPosition.PF];
    case PlayerPosition.PF:
      return [PlayerPosition.SF, PlayerPosition.C];
    case PlayerPosition.C:
      return [PlayerPosition.PF];
    default:
      return [];
  }
}

function physicalDefaults(position) {
  switch (position) {
    case PlayerPosition.PG:
      return { heightCm: 185, weightKg: 82, wingspanCm: 192, bodyType: PlayerBodyType.SLIM };
    case PlayerPosition.SG:
      return { heightCm: 191, weightKg: 88, wingspanCm: 199, bodyType: PlayerBodyType.ATHLETIC };
    case PlayerPosition.SF:
      return { heightCm: 198, weightKg: 94, wingspanCm: 206, bodyType: PlayerBodyType.ATHLETIC };
    case PlayerPosition.PF:
      return { heightCm: 205, weightKg: 104, wingspanCm: 214, bodyType: PlayerBodyType.STRONG };
    case PlayerPosition.C:
    default:
      return { heightCm: 211, weightKg: 112, wingspanCm: 221, bodyType: PlayerBodyType.HEAVY };
  }
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
  const winIndex = (team.winPct - 50) / 5;
  const strengthOffset = team.strengthOffset ?? 0;

  return team.roster.map(([name, position, age], playerIndex) => {
    const rotationPenalty =
      playerIndex < 2 ? 6 : playerIndex < 5 ? 3 : playerIndex < 8 ? 0 : playerIndex < 11 ? -4 : -8;
    const baseOverall = clamp(
      62 + offenseIndex * 0.45 + defenseIndex * 0.5 + winIndex + rotationPenalty + strengthOffset,
      48,
      86,
    );
    const variation = ((teamIndex * 7 + playerIndex * 5) % 7) - 3;
    const overall = clamp(Math.round(baseOverall + variation), 46, 89);
    const potential = clamp(overall + 2 + ((teamIndex + playerIndex) % 6), overall, 94);
    const bias = positionBias(position);

    const shooting = clamp(
      Math.round(
        overall + bias.shooting + offenseIndex * 0.7 + ((teamIndex + playerIndex) % 5) - 2,
      ),
      35,
      96,
    );
    const passing = clamp(
      Math.round(
        overall + bias.passing + offenseIndex * 0.35 + ((teamIndex * 2 + playerIndex) % 5) - 2,
      ),
      35,
      96,
    );
    const defense = clamp(
      Math.round(
        overall + bias.defense + defenseIndex * 0.75 + ((teamIndex + playerIndex * 3) % 5) - 2,
      ),
      35,
      96,
    );
    const rebounding = clamp(
      Math.round(
        overall + bias.rebounding + defenseIndex * 0.35 + ((teamIndex * 3 + playerIndex) % 5) - 2,
      ),
      35,
      96,
    );
    const athleticism = clamp(
      Math.round(
        overall + bias.athleticism + offenseIndex * 0.15 + ((teamIndex + playerIndex * 4) % 5) - 2,
      ),
      35,
      96,
    );

    return {
      name,
      age: clamp(age, 16, 40),
      dateOfBirth: buildDateOfBirth(clamp(age, 16, 40), `${team.shortName}-${name}`),
      dominantHand: buildDominantHand(`${team.shortName}-${name}`),
      position,
      secondaryPositions: buildSecondaryPositions(position),
      shooting,
      passing,
      defense,
      rebounding,
      athleticism,
      overall,
      potential,
      physicalProfile: physicalDefaults(position),
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

    for (const player of roster) {
      await prisma.player.create({
        data: {
          name: player.name,
          age: player.age,
          dateOfBirth: player.dateOfBirth,
          dominantHand: player.dominantHand,
          position: player.position,
          secondaryPositions: player.secondaryPositions,
          shooting: player.shooting,
          passing: player.passing,
          defense: player.defense,
          rebounding: player.rebounding,
          athleticism: player.athleticism,
          overall: player.overall,
          potential: player.potential,
          teamId: team.id,
          physicalProfile: {
            create: {
              ...player.physicalProfile,
              standingReachCm: player.physicalProfile.heightCm + 53,
              speed: clamp(player.athleticism + 3, 1, 100),
              acceleration: clamp(player.athleticism + 4, 1, 100),
              strength: clamp(Math.round((player.defense + player.rebounding) / 2), 1, 100),
              explosiveness: clamp(player.athleticism + 5, 1, 100),
              agility: clamp(player.athleticism + 2, 1, 100),
              balance: clamp(player.athleticism + 2, 1, 100),
              coordination: clamp(player.athleticism + 3, 1, 100),
              reaction: clamp(player.athleticism + 4, 1, 100),
              vertical: clamp(player.athleticism + 1, 1, 100),
              stamina: clamp(player.athleticism + 2, 1, 100),
              endurance: clamp(player.athleticism + 1, 1, 100),
              recovery: clamp(71 + Math.max(0, 28 - player.age), 1, 100),
              durability: clamp(68 + Math.max(0, player.age - 24), 1, 100),
            },
          },
          healthProfile: {
            create: {
              overallCondition: clamp(82 + Math.round(player.athleticism / 10), 1, 100),
              fatigue: 18,
              postInjuryCondition: 100,
              durability: clamp(72 + Math.round(player.athleticism / 8), 1, 100),
              recoveryRate: clamp(74 + Math.round(player.athleticism / 10), 1, 100),
              injuryRisk: clamp(32 + Math.round((100 - player.athleticism) / 8), 1, 100),
              fatigueBase: 20,
              matchFitness: clamp(80 + Math.round(player.athleticism / 12), 1, 100),
              painTolerance: clamp(68 + Math.round(player.athleticism / 10), 1, 100),
              medicalOutlook: 72,
            },
          },
          mentalAttributes: {
            create: {
              confidence: 72,
              selfControl: 70,
              concentration: 71,
              composure: 70,
              determination: 74,
              workEthic: 76,
              professionalism: 72,
              leadership: 66,
              aggressiveness: 64,
              competitiveness: 73,
              teamwork: 75,
              teamOrientation: 75,
              loyalty: 68,
              ego: 55,
              clutchFactor: 67,
            },
          },
          hiddenAttributes: {
            create: {
              consistency: 69,
              injuryProneness: 45,
              importantMatches: 70,
              wantsToLeave: 28,
              declineResistance: 64,
              adaptability: 71,
              discipline: 70,
              ambition: 76,
              resilience: 72,
              pressureHandling: 68,
              setbackResponse: 72,
            },
          },
          tacticalAttributes: {
            create: {
              basketballIQ: 74,
              courtVision: 73,
              defenseReading: 70,
              offenseReading: 72,
              decisionMaking: 72,
              shotSelection: 71,
              offBallMovement: 70,
              spacing: 71,
              pickAndRollOffense: 70,
              pickAndRollDefense: 69,
              helpDefense: 70,
              discipline: 74,
              helpDefenseAwareness: 70,
              offBallAwareness: 70,
              pickAndRollRead: 70,
              spacingSense: 71,
              playDiscipline: 74,
              foulDiscipline: 73,
              transitionInstincts: 71,
            },
          },
          potentialProfile: {
            create: {
              potential: player.potential,
              currentAbility: player.overall,
              growthRate: clamp(72 + Math.round((player.potential - player.overall) / 4), 1, 100),
              learningAbility: 74,
              peakWindowStart: clamp(player.age - 1, 20, 28),
              peakWindowEnd: clamp(player.age + 5, 24, 34),
              ceilingTier: clamp(Math.round((player.potential + player.overall) / 2), 1, 100),
              readiness: clamp(Math.round(player.overall * 0.7 + player.potential * 0.3), 1, 100),
            },
          },
          reputationProfile: {
            create: {
              reputation: clamp(Math.round(player.overall * 0.88), 1, 100),
              hiddenReputation: clamp(Math.round(player.overall * 0.88), 1, 100),
              leagueReputation: clamp(Math.round(player.overall * 0.86), 1, 100),
              internationalReputation: clamp(Math.round(player.overall * 0.78), 1, 100),
              starPower: clamp(Math.round(player.overall * 0.84), 1, 100),
              fanAppeal: clamp(Math.round(player.overall * 0.82), 1, 100),
              mediaHandling: clamp(66 + Math.round(player.overall / 8), 1, 100),
              mediaAppeal: clamp(Math.round(player.overall * 0.83), 1, 100),
              agentInfluence: clamp(52 + Math.round(player.overall / 10), 1, 100),
            },
          },
        },
      });
    }
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
