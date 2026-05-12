import { createPrismaClient } from './lib/create-prisma-client.mjs';
import prismaClientPkg from '@prisma/client';

const { PlayerBodyType, PlayerDominantHand, PlayerPosition } = prismaClientPkg;

const prisma = createPrismaClient();

const CURRENT_SEASON_ID = 'vtb-2025-26';

function getCurrentSeasonLabel(referenceDate = new Date()) {
  const year = referenceDate.getUTCFullYear();
  const month = referenceDate.getUTCMonth() + 1;
  const startYear = month >= 7 ? year : year - 1;
  const endYearShort = String((startYear + 1) % 100).padStart(2, '0');

  return `${startYear}/${endYearShort}`;
}

const teamSeeds = [
  {
    name: 'CSKA Moscow',
    city: 'Moscow',
    shortName: 'CSKA',
    rating: 84,
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
    rating: 83,
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
    rating: 82,
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
    rating: 81,
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
    rating: 78,
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
    rating: 77,
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
    rating: 76,
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
    rating: 75,
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
    rating: 74,
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
    rating: 73,
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

const playerProfiles = {
  'Melo Trimble': {
    overall: 88,
    potential: 88,
    role: 'Primary creator',
    attributes: { shooting: 90, passing: 86, defense: 81, rebounding: 68, athleticism: 84 },
    seasonStats: {
      gamesPlayed: 36,
      gamesStarted: 34,
      minutesPerGame: 29.8,
      pointsPerGame: 19.0,
      reboundsPerGame: 3.1,
      assistsPerGame: 4.3,
      stealsPerGame: 2.0,
      blocksPerGame: 0.1,
      turnoversPerGame: 2.4,
      foulsPerGame: 2.2,
      fgPct: 51.0,
      threePct: 38.0,
      ftPct: 93.0,
      efficiencyRating: 25.8,
    },
    awards: [
      ['2025/26', 'MVP_OF_MONTH', 'MVP of November 2025/26'],
      ['2025/26', 'MVP_OF_MONTH', 'MVP of January 2025/26'],
      ['2025', 'SUPERCUP_MVP', 'VTB United League SuperCup MVP'],
      ['2024/25', 'PLAYOFFS_MVP', 'VTB United League Playoffs MVP'],
      ['2023/24', 'PLAYOFFS_MVP', 'VTB United League Playoffs MVP'],
    ],
    careerAchievements: ['2025 VTB champion', 'Two-time Playoffs MVP', 'SuperCup 2025 MVP'],
    social: { platform: 'INSTAGRAM', followersCount: 620000, followerGrowthWeekly: 12400 },
  },
  'Marcus Bingham Jr.': {
    overall: 87,
    potential: 88,
    role: 'Two-way frontcourt star',
    attributes: { shooting: 78, passing: 70, defense: 89, rebounding: 88, athleticism: 85 },
    seasonStats: {
      gamesPlayed: 37,
      gamesStarted: 33,
      minutesPerGame: 27.4,
      pointsPerGame: 16.4,
      reboundsPerGame: 7.3,
      assistsPerGame: 1.5,
      stealsPerGame: 0.8,
      blocksPerGame: 1.1,
      turnoversPerGame: 1.8,
      foulsPerGame: 2.7,
      fgPct: 58.0,
      threePct: 34.0,
      ftPct: 75.0,
      efficiencyRating: 20.7,
    },
    awards: [['2025/26', 'MVP_OF_MONTH', 'MVP of October 2025/26']],
    careerAchievements: ['2025/26 October MVP', 'EuroCup winner before joining UNICS'],
    social: { platform: 'INSTAGRAM', followersCount: 410000, followerGrowthWeekly: 9800 },
  },
  'Patrick Miller': {
    overall: 86,
    potential: 86,
    role: 'Lead guard',
    attributes: { shooting: 84, passing: 88, defense: 78, rebounding: 72, athleticism: 84 },
    seasonStats: {
      gamesPlayed: 39,
      gamesStarted: 37,
      minutesPerGame: 30.6,
      pointsPerGame: 15.8,
      reboundsPerGame: 4.0,
      assistsPerGame: 7.3,
      stealsPerGame: 1.2,
      blocksPerGame: 0.2,
      turnoversPerGame: 2.8,
      foulsPerGame: 2.4,
      fgPct: 47.0,
      threePct: 35.0,
      ftPct: 82.0,
      efficiencyRating: 25.0,
    },
    awards: [['2025/26', 'MVP_OF_MONTH', 'MVP of March 2025/26']],
    careerAchievements: ['2025/26 March MVP'],
    social: { platform: 'INSTAGRAM', followersCount: 350000, followerGrowthWeekly: 7600 },
  },
  'Trent Frazier': {
    overall: 86,
    potential: 86,
    role: 'Two-way guard',
    attributes: { shooting: 86, passing: 84, defense: 82, rebounding: 66, athleticism: 84 },
    seasonStats: {
      gamesPlayed: 38,
      gamesStarted: 35,
      minutesPerGame: 29.2,
      pointsPerGame: 15.4,
      reboundsPerGame: 3.0,
      assistsPerGame: 5.8,
      stealsPerGame: 1.6,
      blocksPerGame: 0.2,
      turnoversPerGame: 2.3,
      foulsPerGame: 2.1,
      fgPct: 46.0,
      threePct: 39.0,
      ftPct: 84.0,
      efficiencyRating: 22.6,
    },
    awards: [['2025/26', 'MVP_OF_MONTH', 'MVP of February 2025/26']],
    careerAchievements: ['2025/26 February MVP'],
    social: { platform: 'INSTAGRAM', followersCount: 330000, followerGrowthWeekly: 7100 },
  },
  'Terrell Carter II': {
    overall: 85,
    potential: 85,
    role: 'Interior hub',
    attributes: { shooting: 75, passing: 74, defense: 84, rebounding: 86, athleticism: 79 },
    seasonStats: {
      gamesPlayed: 38,
      gamesStarted: 34,
      minutesPerGame: 28.5,
      pointsPerGame: 14.0,
      reboundsPerGame: 7.0,
      assistsPerGame: 2.5,
      stealsPerGame: 0.8,
      blocksPerGame: 0.7,
      turnoversPerGame: 1.9,
      foulsPerGame: 2.8,
      fgPct: 55.0,
      threePct: 28.0,
      ftPct: 73.0,
      efficiencyRating: 19.3,
    },
    awards: [['2025/26', 'MVP_OF_MONTH', 'MVP of December 2025/26']],
    careerAchievements: ['2025/26 December MVP'],
    social: { platform: 'INSTAGRAM', followersCount: 270000, followerGrowthWeekly: 6200 },
  },
  'Anton Kardanakhishvili': {
    overall: 84,
    potential: 86,
    role: 'Breakout lead guard',
    attributes: { shooting: 82, passing: 85, defense: 77, rebounding: 64, athleticism: 83 },
    seasonStats: {
      gamesPlayed: 39,
      gamesStarted: 35,
      minutesPerGame: 29.0,
      pointsPerGame: 15.2,
      reboundsPerGame: 3.2,
      assistsPerGame: 5.4,
      stealsPerGame: 1.1,
      blocksPerGame: 0.2,
      turnoversPerGame: 2.6,
      foulsPerGame: 2.3,
      fgPct: 45.0,
      threePct: 36.0,
      ftPct: 80.0,
      efficiencyRating: 21.5,
    },
    awards: [['2025/26', 'MVP_OF_MONTH', 'MVP of April 2025/26']],
    careerAchievements: ['2025/26 April MVP'],
    social: { platform: 'TELEGRAM', followersCount: 210000, followerGrowthWeekly: 5600 },
  },
  'Nikita Mikhailovsky': {
    overall: 84,
    potential: 86,
    role: 'High-usage scorer',
    attributes: { shooting: 87, passing: 75, defense: 72, rebounding: 70, athleticism: 81 },
    seasonStats: {
      gamesPlayed: 26,
      gamesStarted: 25,
      minutesPerGame: 31.2,
      pointsPerGame: 20.5,
      reboundsPerGame: 4.5,
      assistsPerGame: 2.8,
      stealsPerGame: 0.9,
      blocksPerGame: 0.3,
      turnoversPerGame: 2.7,
      foulsPerGame: 2.5,
      fgPct: 49.0,
      threePct: 25.9,
      ftPct: 80.0,
      efficiencyRating: 18.8,
    },
    awards: [
      ['2025/26', 'SCORING_LEADER', 'Regular season scoring leader'],
      ['2020/21', 'YOUNG_PLAYER_OF_YEAR', 'VTB United League Young Player of the Year'],
      ['2018/19', 'YOUNG_PLAYER_OF_YEAR', 'VTB United League Young Player of the Year'],
    ],
    careerAchievements: [
      '2025/26 regular season scoring leader',
      'Two-time Young Player of the Year',
    ],
    social: { platform: 'VK', followersCount: 240000, followerGrowthWeekly: 5900 },
  },
  'Casper Ware': {
    overall: 84,
    potential: 84,
    role: 'Veteran shot creator',
    attributes: { shooting: 86, passing: 82, defense: 74, rebounding: 60, athleticism: 78 },
    seasonStats: {
      gamesPlayed: 36,
      gamesStarted: 18,
      minutesPerGame: 23.0,
      pointsPerGame: 10.5,
      reboundsPerGame: 1.8,
      assistsPerGame: 3.1,
      stealsPerGame: 0.8,
      blocksPerGame: 0.1,
      turnoversPerGame: 1.7,
      foulsPerGame: 1.9,
      fgPct: 45.0,
      threePct: 37.0,
      ftPct: 86.0,
      efficiencyRating: 10.5,
    },
    awards: [['2024/25', 'ALL_STAR', 'VTB United League All-Star']],
    careerAchievements: ['VTB champion', 'Multiple-time All-Star'],
    social: { platform: 'INSTAGRAM', followersCount: 390000, followerGrowthWeekly: 4300 },
  },
  'Paris Lee': {
    overall: 84,
    potential: 84,
    role: 'Pressure guard',
    attributes: { shooting: 81, passing: 86, defense: 84, rebounding: 62, athleticism: 83 },
    seasonStats: {
      gamesPlayed: 39,
      gamesStarted: 36,
      minutesPerGame: 28.4,
      pointsPerGame: 13.0,
      reboundsPerGame: 2.7,
      assistsPerGame: 6.1,
      stealsPerGame: 1.7,
      blocksPerGame: 0.1,
      turnoversPerGame: 2.4,
      foulsPerGame: 2.2,
      fgPct: 45.0,
      threePct: 36.0,
      ftPct: 81.0,
      efficiencyRating: 18.4,
    },
    careerAchievements: ['EuroLeague steals leader profile before UNICS move'],
  },
  'Jalen Reynolds': {
    overall: 84,
    potential: 84,
    role: 'Paint scorer',
    attributes: { shooting: 76, passing: 69, defense: 84, rebounding: 86, athleticism: 80 },
    seasonStats: {
      gamesPlayed: 37,
      gamesStarted: 16,
      minutesPerGame: 23.8,
      pointsPerGame: 12.8,
      reboundsPerGame: 6.4,
      assistsPerGame: 1.6,
      stealsPerGame: 0.6,
      blocksPerGame: 0.8,
      turnoversPerGame: 1.8,
      foulsPerGame: 2.6,
      fgPct: 56.0,
      threePct: 20.0,
      ftPct: 72.0,
      efficiencyRating: 17.8,
    },
    awards: [['2024/25', 'ALL_STAR', 'VTB United League All-Star']],
    careerAchievements: ['All-Star', 'Defensive Player of the Year nominee'],
  },
};

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

function overallWeights(position) {
  switch (position) {
    case PlayerPosition.PG:
      return { shooting: 0.3, passing: 0.3, defense: 0.15, rebounding: 0.05, athleticism: 0.2 };
    case PlayerPosition.SG:
      return { shooting: 0.32, passing: 0.22, defense: 0.16, rebounding: 0.08, athleticism: 0.22 };
    case PlayerPosition.SF:
      return { shooting: 0.24, passing: 0.18, defense: 0.22, rebounding: 0.14, athleticism: 0.22 };
    case PlayerPosition.PF:
      return { shooting: 0.16, passing: 0.12, defense: 0.28, rebounding: 0.24, athleticism: 0.2 };
    case PlayerPosition.C:
    default:
      return { shooting: 0.1, passing: 0.1, defense: 0.3, rebounding: 0.3, athleticism: 0.2 };
  }
}

function calculateOverallFromCore(position, attributes) {
  const weights = overallWeights(position);

  return Math.round(
    attributes.shooting * weights.shooting +
      attributes.passing * weights.passing +
      attributes.defense * weights.defense +
      attributes.rebounding * weights.rebounding +
      attributes.athleticism * weights.athleticism,
  );
}

function alignCoreAttributesToOverall(position, attributes, targetOverall) {
  const next = { ...attributes };
  const priorityByPosition = {
    [PlayerPosition.PG]: ['passing', 'shooting', 'athleticism', 'defense', 'rebounding'],
    [PlayerPosition.SG]: ['shooting', 'athleticism', 'passing', 'defense', 'rebounding'],
    [PlayerPosition.SF]: ['defense', 'athleticism', 'shooting', 'passing', 'rebounding'],
    [PlayerPosition.PF]: ['rebounding', 'defense', 'athleticism', 'shooting', 'passing'],
    [PlayerPosition.C]: ['rebounding', 'defense', 'athleticism', 'passing', 'shooting'],
  };
  const priority = priorityByPosition[position] ?? priorityByPosition[PlayerPosition.SF];

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const currentOverall = calculateOverallFromCore(position, next);
    const delta = targetOverall - currentOverall;

    if (delta === 0) {
      break;
    }

    const step = delta > 0 ? 1 : -1;
    const magnitude = Math.min(4, Math.abs(delta));

    for (const key of priority) {
      next[key] = clamp(next[key] + step * magnitude, 35, 96);
    }
  }

  return next;
}

function buildRoster(team, teamIndex) {
  const offenseIndex = team.targetFor - 80;
  const defenseIndex = 82 - team.targetAgainst;
  const winIndex = (team.winPct - 50) / 10;
  const strengthOffset = team.strengthOffset ?? 0;
  const teamBalance = clamp(
    (team.rating - 78) * 0.9 +
      offenseIndex * 0.18 +
      defenseIndex * 0.18 +
      winIndex +
      strengthOffset,
    -5,
    5,
  );

  return team.roster.map(([name, position, age], playerIndex) => {
    const profile = playerProfiles[name] ?? {};
    const rotationPenalty =
      playerIndex < 1
        ? 5
        : playerIndex < 3
          ? 3
          : playerIndex < 5
            ? 1
            : playerIndex < 8
              ? -1
              : playerIndex < 11
                ? -3
                : -5;
    const baseOverall = clamp(73 + teamBalance + rotationPenalty, 62, 86);
    const variation = ((teamIndex * 7 + playerIndex * 5) % 5) - 2;
    const overall = clamp(profile.overall ?? Math.round(baseOverall + variation), 58, 88);
    const potential = clamp(
      profile.potential ?? overall + 2 + ((teamIndex + playerIndex) % 5),
      overall,
      90,
    );
    const bias = positionBias(position);

    const rawShooting =
      profile.attributes?.shooting ??
      clamp(
        Math.round(
          overall + bias.shooting + offenseIndex * 0.7 + ((teamIndex + playerIndex) % 5) - 2,
        ),
        35,
        96,
      );
    const rawPassing =
      profile.attributes?.passing ??
      clamp(
        Math.round(
          overall + bias.passing + offenseIndex * 0.35 + ((teamIndex * 2 + playerIndex) % 5) - 2,
        ),
        35,
        96,
      );
    const rawDefense =
      profile.attributes?.defense ??
      clamp(
        Math.round(
          overall + bias.defense + defenseIndex * 0.75 + ((teamIndex + playerIndex * 3) % 5) - 2,
        ),
        35,
        96,
      );
    const rawRebounding =
      profile.attributes?.rebounding ??
      clamp(
        Math.round(
          overall + bias.rebounding + defenseIndex * 0.35 + ((teamIndex * 3 + playerIndex) % 5) - 2,
        ),
        35,
        96,
      );
    const rawAthleticism =
      profile.attributes?.athleticism ??
      clamp(
        Math.round(
          overall +
            bias.athleticism +
            offenseIndex * 0.15 +
            ((teamIndex + playerIndex * 4) % 5) -
            2,
        ),
        35,
        96,
      );
    const alignedAttributes = alignCoreAttributesToOverall(
      position,
      {
        shooting: rawShooting,
        passing: rawPassing,
        defense: rawDefense,
        rebounding: rawRebounding,
        athleticism: rawAthleticism,
      },
      overall,
    );

    return {
      name,
      age: clamp(age, 16, 40),
      dateOfBirth: buildDateOfBirth(clamp(age, 16, 40), `${team.shortName}-${name}`),
      dominantHand: buildDominantHand(`${team.shortName}-${name}`),
      position,
      secondaryPositions: buildSecondaryPositions(position),
      shooting: alignedAttributes.shooting,
      passing: alignedAttributes.passing,
      defense: alignedAttributes.defense,
      rebounding: alignedAttributes.rebounding,
      athleticism: alignedAttributes.athleticism,
      overall,
      potential,
      role: profile.role ?? (playerIndex < 5 ? 'Rotation' : playerIndex < 10 ? 'Bench' : 'Depth'),
      careerAchievements: profile.careerAchievements ?? [],
      awards: profile.awards ?? [],
      social: profile.social ?? {},
      seasonStats: profile.seasonStats ?? null,
      physicalProfile: physicalDefaults(position),
    };
  });
}

function buildSeasonStatLine(player, playerIndex) {
  if (player.seasonStats) {
    return {
      seasonLabel: getCurrentSeasonLabel(),
      league: 'VTB United League',
      ...player.seasonStats,
    };
  }

  const roleFactor = Math.max(0.55, 1.08 - playerIndex * 0.06);
  const gamesPlayed = clamp(Math.round(18 + player.overall * 0.22 + roleFactor * 8), 12, 44);
  const gamesStarted = clamp(
    Math.round(Math.max(0, gamesPlayed * (playerIndex < 5 ? 0.72 : playerIndex < 9 ? 0.34 : 0.08))),
    0,
    gamesPlayed,
  );
  const minutesPerGame = Number(
    clamp(
      Math.round((10 + player.overall * 0.22 + roleFactor * 6 + player.athleticism * 0.05) * 10) /
        10,
      8,
      34,
    ).toFixed(1),
  );
  const pointsPerGame = Number(
    clamp(
      Math.round((player.shooting * 0.11 + player.overall * 0.045 + roleFactor * 3.8) * 10) / 10,
      2,
      26,
    ).toFixed(1),
  );
  const reboundsPerGame = Number(
    clamp(Math.round((player.rebounding * 0.075 + roleFactor * 1.7) * 10) / 10, 1, 13).toFixed(1),
  );
  const assistsPerGame = Number(
    clamp(Math.round((player.passing * 0.065 + roleFactor * 1.5) * 10) / 10, 0.5, 10).toFixed(1),
  );
  const stealsPerGame = Number(
    clamp(Math.round((player.defense * 0.012 + roleFactor * 0.28) * 10) / 10, 0.2, 2.8).toFixed(1),
  );
  const blocksPerGame = Number(
    clamp(
      Math.round(
        ((player.position === PlayerPosition.C || player.position === PlayerPosition.PF
          ? 0.65
          : 0.18) +
          player.defense * 0.006) *
          10,
      ) / 10,
      0.1,
      2.7,
    ).toFixed(1),
  );
  const turnoversPerGame = Number(
    clamp(Math.round((player.passing * 0.018 + roleFactor * 0.8) * 10) / 10, 0.5, 4.8).toFixed(1),
  );
  const foulsPerGame = Number(
    clamp(
      Math.round((1.2 + player.defense * 0.012 + playerIndex * 0.04) * 10) / 10,
      1,
      4.8,
    ).toFixed(1),
  );
  const fgPct = Number(
    clamp(Math.round(38 + player.shooting * 0.16 + roleFactor * 4), 36, 64).toFixed(1),
  );
  const threePct = Number(
    clamp(Math.round(26 + player.shooting * 0.13 + roleFactor * 3), 24, 49).toFixed(1),
  );
  const ftPct = Number(
    clamp(Math.round(58 + player.shooting * 0.24 + roleFactor * 3), 55, 94).toFixed(1),
  );
  const efficiencyRating = Number(
    clamp(
      Math.round(
        (pointsPerGame +
          reboundsPerGame * 1.2 +
          assistsPerGame * 1.4 +
          stealsPerGame * 2 +
          blocksPerGame * 2 -
          turnoversPerGame) *
          10,
      ) / 10,
      4,
      34,
    ).toFixed(1),
  );

  return {
    seasonLabel: getCurrentSeasonLabel(),
    league: 'VTB United League',
    gamesPlayed,
    gamesStarted,
    minutesPerGame,
    pointsPerGame,
    reboundsPerGame,
    assistsPerGame,
    stealsPerGame,
    blocksPerGame,
    turnoversPerGame,
    foulsPerGame,
    fgPct,
    threePct,
    ftPct,
    efficiencyRating,
  };
}

function buildPlayerSlug(playerName) {
  return playerName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 24);
}

function buildTechnicalAttributes(player) {
  const guardSkill = player.position === PlayerPosition.PG || player.position === PlayerPosition.SG;
  const wingSkill = player.position === PlayerPosition.SF;
  const bigSkill = player.position === PlayerPosition.PF || player.position === PlayerPosition.C;

  return {
    shooting: player.shooting,
    passing: player.passing,
    defense: player.defense,
    rebounding: player.rebounding,
    ballHandling: clamp(player.passing + (guardSkill ? 5 : bigSkill ? -5 : 0), 1, 100),
    dribbling: clamp(player.passing + (guardSkill ? 4 : bigSkill ? -6 : 1), 1, 100),
    midRangeShot: clamp(player.shooting + (bigSkill ? -1 : 2), 1, 100),
    threePointShot: clamp(player.shooting + (guardSkill || wingSkill ? 3 : -8), 1, 100),
    freeThrow: clamp(player.shooting + 4, 1, 100),
    rimFinishing: clamp(
      Math.round((player.shooting + player.athleticism) / 2) + (bigSkill ? 5 : 0),
      1,
      100,
    ),
    dunking: clamp(player.athleticism + (bigSkill ? 8 : wingSkill ? 3 : -6), 1, 100),
    postMoves: clamp(player.shooting + (bigSkill ? 7 : wingSkill ? -2 : -10), 1, 100),
    perimeterDefense: clamp(player.defense + (bigSkill ? -5 : 3), 1, 100),
    interiorDefense: clamp(player.defense + (bigSkill ? 6 : guardSkill ? -8 : 0), 1, 100),
    offensiveRebound: clamp(player.rebounding + (bigSkill ? 4 : -3), 1, 100),
    defensiveRebound: clamp(player.rebounding + (bigSkill ? 5 : -1), 1, 100),
  };
}

function buildPhysicalProfile(player) {
  const ageWear = Math.max(0, player.age - 31);

  return {
    ...player.physicalProfile,
    standingReachCm: player.physicalProfile.heightCm + 53,
    speed: clamp(player.athleticism + 3 - ageWear, 1, 100),
    acceleration: clamp(player.athleticism + 4 - ageWear, 1, 100),
    strength: clamp(Math.round((player.defense + player.rebounding) / 2), 1, 100),
    explosiveness: clamp(player.athleticism + 5 - ageWear, 1, 100),
    agility: clamp(player.athleticism + 2 - ageWear, 1, 100),
    balance: clamp(player.athleticism + 2, 1, 100),
    coordination: clamp(player.athleticism + 3, 1, 100),
    reaction: clamp(player.athleticism + 4, 1, 100),
    vertical: clamp(player.athleticism + 1 - ageWear, 1, 100),
    stamina: clamp(player.athleticism + 2 - Math.round(ageWear / 2), 1, 100),
    endurance: clamp(player.athleticism + 1 - Math.round(ageWear / 2), 1, 100),
    recovery: clamp(71 + Math.max(0, 28 - player.age) - Math.max(0, player.age - 34), 1, 100),
    durability: clamp(74 + Math.round(player.overall / 10) - ageWear, 1, 100),
  };
}

function buildHealthProfile(player) {
  const ageRisk = Math.max(0, player.age - 32);

  return {
    overallCondition: clamp(80 + Math.round(player.athleticism / 12) - ageRisk, 1, 100),
    fatigue: clamp(17 + Math.max(0, 30 - player.age), 1, 100),
    postInjuryCondition: clamp(96 - ageRisk, 1, 100),
    durability: clamp(70 + Math.round(player.athleticism / 9) - ageRisk, 1, 100),
    recoveryRate: clamp(74 + Math.round(player.athleticism / 11) - ageRisk, 1, 100),
    injuryRisk: clamp(28 + Math.round((100 - player.athleticism) / 7) + ageRisk, 1, 100),
    fatigueBase: clamp(18 + ageRisk, 1, 100),
    matchFitness: clamp(80 + Math.round(player.athleticism / 13) - ageRisk, 1, 100),
    painTolerance: clamp(66 + Math.round(player.defense / 10), 1, 100),
    medicalOutlook: clamp(
      72 + Math.round((player.potential - player.overall) / 2) - ageRisk,
      1,
      100,
    ),
  };
}

function buildMentalAttributes(player, playerIndex) {
  const starterBonus = playerIndex < 5 ? 4 : playerIndex < 9 ? 1 : -2;
  const veteranBonus = player.age >= 31 ? 5 : player.age <= 22 ? -2 : 1;
  const starBonus = player.overall >= 84 ? 5 : player.overall >= 78 ? 2 : 0;

  return {
    confidence: clamp(player.overall + starterBonus + starBonus, 1, 100),
    selfControl: clamp(67 + veteranBonus + Math.round(player.defense / 12), 1, 100),
    concentration: clamp(66 + veteranBonus + Math.round(player.overall / 8), 1, 100),
    composure: clamp(65 + veteranBonus + starBonus + Math.round(player.overall / 10), 1, 100),
    determination: clamp(70 + starBonus + Math.round(player.athleticism / 12), 1, 100),
    workEthic: clamp(72 + Math.round(player.potential - player.overall) + starterBonus, 1, 100),
    professionalism: clamp(68 + veteranBonus + Math.round(player.overall / 10), 1, 100),
    leadership: clamp(55 + veteranBonus * 2 + starBonus + Math.round(player.passing / 10), 1, 100),
    aggressiveness: clamp(58 + Math.round(player.defense / 8), 1, 100),
    competitiveness: clamp(70 + starterBonus + starBonus, 1, 100),
    teamwork: clamp(68 + Math.round(player.passing / 9), 1, 100),
    teamOrientation: clamp(69 + Math.round(player.passing / 10), 1, 100),
    loyalty: clamp(62 + veteranBonus + (player.overall >= 85 ? -3 : 2), 1, 100),
    ego: clamp(45 + starBonus * 2 + Math.round(player.shooting / 12), 1, 100),
    clutchFactor: clamp(
      62 + starBonus * 2 + starterBonus + Math.round(player.shooting / 12),
      1,
      100,
    ),
  };
}

function buildHiddenAttributes(player, playerIndex) {
  const rotationBonus = playerIndex < 5 ? 4 : playerIndex < 10 ? 1 : -3;
  const prospectBonus = player.age <= 23 ? 5 : 0;

  return {
    consistency: clamp(64 + rotationBonus + Math.round(player.overall / 8), 1, 100),
    injuryProneness: clamp(
      38 + Math.max(0, player.age - 31) + Math.round((100 - player.athleticism) / 12),
      1,
      100,
    ),
    importantMatches: clamp(63 + rotationBonus + Math.round(player.overall / 7), 1, 100),
    wantsToLeave: clamp(22 + (player.overall >= 84 ? 8 : 0) - rotationBonus, 1, 100),
    declineResistance: clamp(
      60 + Math.round(player.overall / 9) - Math.max(0, player.age - 33),
      1,
      100,
    ),
    adaptability: clamp(66 + Math.round(player.passing / 12) + prospectBonus, 1, 100),
    discipline: clamp(66 + Math.round(player.defense / 12), 1, 100),
    ambition: clamp(70 + prospectBonus + Math.round(player.potential - player.overall), 1, 100),
    resilience: clamp(68 + rotationBonus + Math.round(player.defense / 12), 1, 100),
    pressureHandling: clamp(63 + rotationBonus + Math.round(player.overall / 8), 1, 100),
    setbackResponse: clamp(66 + prospectBonus + Math.round(player.overall / 10), 1, 100),
  };
}

function buildTacticalAttributes(player) {
  const guardSkill = player.position === PlayerPosition.PG || player.position === PlayerPosition.SG;
  const bigSkill = player.position === PlayerPosition.PF || player.position === PlayerPosition.C;

  return {
    basketballIQ: clamp(
      64 + Math.round(player.overall / 6) + Math.round(player.passing / 15),
      1,
      100,
    ),
    courtVision: clamp(player.passing + (guardSkill ? 5 : bigSkill ? -4 : 1), 1, 100),
    defenseReading: clamp(player.defense + Math.round(player.overall / 18), 1, 100),
    offenseReading: clamp(Math.round((player.shooting + player.passing) / 2) + 2, 1, 100),
    decisionMaking: clamp(Math.round((player.passing + player.overall) / 2), 1, 100),
    shotSelection: clamp(Math.round((player.shooting + player.overall) / 2), 1, 100),
    offBallMovement: clamp(player.shooting + (guardSkill ? 2 : 0), 1, 100),
    spacing: clamp(player.shooting + (bigSkill ? -5 : 3), 1, 100),
    pickAndRollOffense: clamp(player.passing + (guardSkill ? 4 : bigSkill ? 1 : 0), 1, 100),
    pickAndRollDefense: clamp(player.defense + (bigSkill ? 3 : 0), 1, 100),
    helpDefense: clamp(player.defense + (bigSkill ? 4 : 1), 1, 100),
    discipline: clamp(68 + Math.round(player.defense / 11), 1, 100),
    helpDefenseAwareness: clamp(player.defense + (bigSkill ? 5 : 1), 1, 100),
    offBallAwareness: clamp(Math.round((player.shooting + player.defense) / 2), 1, 100),
    pickAndRollRead: clamp(
      Math.round((player.passing + player.defense) / 2) + (guardSkill ? 4 : 0),
      1,
      100,
    ),
    spacingSense: clamp(player.shooting + (bigSkill ? -4 : 3), 1, 100),
    playDiscipline: clamp(69 + Math.round(player.passing / 12), 1, 100),
    foulDiscipline: clamp(69 + Math.round(player.defense / 12), 1, 100),
    transitionInstincts: clamp(Math.round((player.athleticism + player.passing) / 2), 1, 100),
  };
}

function buildPotentialProfile(player) {
  return {
    potential: player.potential,
    potentialAbility: player.potential,
    currentAbility: player.overall,
    growthRate: clamp(68 + Math.round((player.potential - player.overall) * 2), 1, 100),
    developmentFocus:
      player.position === PlayerPosition.C
        ? 'REBOUNDING'
        : player.position === PlayerPosition.PG
          ? 'PLAYMAKING'
          : player.shooting >= player.defense
            ? 'SCORING'
            : 'DEFENSE',
    peakStartAge: clamp(player.age - 1, 20, 28),
    peakEndAge: clamp(player.age + 5, 24, 34),
    declineStartAge: clamp(player.age + 8, 27, 37),
    learningAbility: clamp(
      70 + Math.round(player.potential - player.overall) + (player.age <= 23 ? 6 : 0),
      1,
      100,
    ),
    peakWindowStart: clamp(player.age - 1, 20, 28),
    peakWindowEnd: clamp(player.age + 5, 24, 34),
    ceilingTier: clamp(Math.round((player.potential + player.overall) / 2), 1, 100),
    readiness: clamp(Math.round(player.overall * 0.72 + player.potential * 0.28), 1, 100),
  };
}

function buildReputationProfile(player) {
  const awardBonus = Math.min(8, player.awards.length * 2);

  return {
    reputation: clamp(Math.round(player.overall * 0.88) + awardBonus, 1, 100),
    hiddenReputation: clamp(Math.round(player.overall * 0.88) + awardBonus, 1, 100),
    leagueReputation: clamp(Math.round(player.overall * 0.87) + awardBonus, 1, 100),
    internationalReputation: clamp(
      Math.round(player.overall * 0.78) + Math.round(awardBonus / 2),
      1,
      100,
    ),
    starPower: clamp(Math.round(player.overall * 0.84) + awardBonus, 1, 100),
    fanAppeal: clamp(Math.round(player.overall * 0.82) + awardBonus, 1, 100),
    mediaHandling: clamp(66 + Math.round(player.overall / 8), 1, 100),
    mediaAppeal: clamp(Math.round(player.overall * 0.83) + awardBonus, 1, 100),
    agentInfluence: clamp(
      52 + Math.round(player.overall / 10) + Math.round(awardBonus / 2),
      1,
      100,
    ),
  };
}

function buildSocialProfile(player) {
  const followersCount =
    player.social.followersCount ??
    Math.max(
      1200,
      Math.round(player.overall * player.overall * 38 + Math.max(0, player.overall - 70) * 4200),
    );

  return {
    platform:
      player.social.platform ??
      (player.overall >= 85 ? 'INSTAGRAM' : player.overall >= 78 ? 'TELEGRAM' : 'VK'),
    nickname: `@${buildPlayerSlug(player.name) || 'player_profile'}`,
    followersCount,
    followerGrowthWeekly: player.social.followerGrowthWeekly ?? Math.round(followersCount * 0.018),
    engagementRate: clamp(
      Number((2.4 + Math.max(0, player.overall - 60) * 0.09).toFixed(1)),
      0,
      100,
    ),
    audienceSentiment:
      player.overall >= 82 ? 'SUPPORTIVE' : player.overall >= 72 ? 'POSITIVE' : 'MIXED',
    mediaStatus:
      player.overall >= 88
        ? 'ICON'
        : player.overall >= 84
          ? 'LEAGUE_STAR'
          : player.overall >= 76
            ? 'NATIONAL_NAME'
            : player.overall >= 68
              ? 'LOCAL_BUZZ'
              : 'LOW_PROFILE',
    hypeScore: clamp(
      Math.round(player.overall * 0.88) + Math.min(10, player.awards.length * 2),
      1,
      100,
    ),
    controversyScore: clamp(Math.round(18 + Math.max(0, 78 - player.overall) * 0.45), 1, 100),
    marketabilityScore: clamp(
      Math.round(player.overall * 0.84) + Math.min(10, player.awards.length * 2),
      1,
      100,
    ),
    lastUpdatedAt: new Date(),
  };
}

function buildCareerHistoryEntries(player, season, team) {
  const previousRole =
    player.overall >= 84 ? 'Team leader' : player.overall >= 77 ? 'Rotation' : 'Development';

  return [
    {
      season: { connect: { id: season.id } },
      team: { connect: { id: team.id } },
      seasonLabel: getCurrentSeasonLabel(),
      league: 'VTB United League',
      role: player.role,
      jerseyNumber: null,
      status: 'ACTIVE',
      transferDate: new Date('2025-09-01T00:00:00.000Z'),
      transferReason: 'Current season roster assignment',
      achievements: player.careerAchievements,
    },
    {
      team: { connect: { id: team.id } },
      seasonLabel: '2024/25',
      league: 'VTB United League',
      role: previousRole,
      jerseyNumber: null,
      status: 'FORMER',
      transferDate: new Date('2024-09-01T00:00:00.000Z'),
      transferReason: 'Previous season record',
      achievements: player.awards
        .filter(([seasonLabel]) => seasonLabel === '2024/25' || seasonLabel === '2023/24')
        .map(([, , description]) => description),
    },
  ];
}

function buildAwardEntries(player, season, team) {
  return player.awards.map(([seasonLabel, awardType, description]) => ({
    ...(seasonLabel === getCurrentSeasonLabel() ? { season: { connect: { id: season.id } } } : {}),
    team: { connect: { id: team.id } },
    seasonLabel,
    awardType,
    league: 'VTB United League',
    description,
  }));
}

async function seed() {
  const seededTeams = [];
  const currentSeasonLabel = getCurrentSeasonLabel();
  const currentSeason = await prisma.season.upsert({
    where: { id: CURRENT_SEASON_ID },
    update: {
      name: `VTB United League ${currentSeasonLabel}`,
      year: Number(currentSeasonLabel.slice(0, 4)),
      status: 'IN_PROGRESS',
    },
    create: {
      id: CURRENT_SEASON_ID,
      name: `VTB United League ${currentSeasonLabel}`,
      year: Number(currentSeasonLabel.slice(0, 4)),
      status: 'IN_PROGRESS',
      currentRound: 1,
    },
  });
  const oldSeededPlayers = await prisma.player.findMany({
    select: { id: true },
  });

  if (oldSeededPlayers.length > 0) {
    await prisma.player.deleteMany({
      where: {
        id: {
          in: oldSeededPlayers.map((player) => player.id),
        },
      },
    });
  }

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

    for (const [playerIndex, player] of roster.entries()) {
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
          technicalAttributes: {
            create: buildTechnicalAttributes(player),
          },
          physicalProfile: {
            create: buildPhysicalProfile(player),
          },
          healthProfile: {
            create: buildHealthProfile(player),
          },
          mentalAttributes: {
            create: buildMentalAttributes(player, playerIndex),
          },
          hiddenAttributes: {
            create: buildHiddenAttributes(player, playerIndex),
          },
          tacticalAttributes: {
            create: buildTacticalAttributes(player),
          },
          potentialProfile: {
            create: buildPotentialProfile(player),
          },
          reputationProfile: {
            create: buildReputationProfile(player),
          },
          socialProfile: {
            create: buildSocialProfile(player),
          },
          careerHistory: {
            create: buildCareerHistoryEntries(player, currentSeason, team),
          },
          awards: {
            create: buildAwardEntries(player, currentSeason, team),
          },
          seasonStats: {
            create: {
              ...buildSeasonStatLine(player, playerIndex),
              season: { connect: { id: currentSeason.id } },
              team: { connect: { id: team.id } },
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
