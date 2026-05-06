import 'reflect-metadata';
import { ConflictException, INestApplication, NotFoundException } from '@nestjs/common';
import { SeasonStatus } from '@prisma/client';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ApiExceptionFilter } from '../src/common/errors/api-exception.filter';
import { createApiValidationPipe } from '../src/common/pipes/create-api-validation-pipe';
import { PrismaService } from '../src/prisma/prisma.service';

const TEAM_ID = 'cmolpef3i0000f3sbsx7ulstg';
const PLAYER_ID = 'cmon3yv4y0003qfsbfdn5nihz';
const OTHER_TEAM_ID = 'cmon47b2400008csbqzi34a1a';
const MATCH_ID = 'cmolpef3i0004f3sbsx7ulstu';
const MISSING_MATCH_ID = 'cmolpef3i0005f3sbsx7ulstv';
const TEST_SEASON_ID = 'season_test_2026';
const SAVE_ID = 'csave000000000000000000001';
const MISSING_SAVE_ID = 'cmolpef3i0009f3sbsx7ulstz';

type PlayerRecord = ReturnType<typeof createPlayerRecord>;

function createTeamRecord(overrides = {}) {
  return {
    id: TEAM_ID,
    name: 'Basketball Manager Night',
    city: 'Moscow',
    shortName: 'BMN',
    rating: 82,
    createdAt: new Date('2026-05-01T15:33:17.116Z'),
    updatedAt: new Date('2026-05-01T15:33:17.116Z'),
    ...overrides,
  };
}

function createPlayerRecord(overrides = {}) {
  return {
    id: PLAYER_ID,
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
    teamId: TEAM_ID,
    createdAt: new Date('2026-05-01T15:33:17.140Z'),
    updatedAt: new Date('2026-05-01T15:33:17.140Z'),
    ...overrides,
  };
}

function createOtherTeamPlayerRecord(overrides = {}) {
  return {
    id: 'cmon4yv4y0003qfsbfdn5nih0',
    name: 'Mikhail Stone',
    age: 24,
    position: 'SG',
    shooting: 75,
    passing: 73,
    defense: 69,
    rebounding: 55,
    athleticism: 77,
    potential: 82,
    overall: 74,
    teamId: OTHER_TEAM_ID,
    createdAt: new Date('2026-05-01T15:34:17.140Z'),
    updatedAt: new Date('2026-05-01T15:34:17.140Z'),
    ...overrides,
  };
}

function createSeasonRecord(overrides = {}) {
  return {
    id: TEST_SEASON_ID,
    name: 'Test League 2026',
    year: 2026,
    status: SeasonStatus.IN_PROGRESS,
    currentRound: 1,
    startedAt: new Date('2026-05-02T12:00:00.000Z'),
    finishedAt: null,
    createdAt: new Date('2026-05-02T12:00:00.000Z'),
    updatedAt: new Date('2026-05-02T12:00:00.000Z'),
    ...overrides,
  };
}

function createCareerSaveRecord(overrides = {}) {
  return {
    id: SAVE_ID,
    saveName: 'My Career',
    selectedTeamId: TEAM_ID,
    currentSeasonId: TEST_SEASON_ID,
    currentDate: new Date('2026-05-02T12:00:00.000Z'),
    currentRound: 1,
    createdAt: new Date('2026-05-02T12:00:00.000Z'),
    updatedAt: new Date('2026-05-02T12:00:00.000Z'),
    ...overrides,
  };
}

describe('Team and Player API', () => {
  let app: INestApplication;
  let createdSeasonId: string | null = null;
  let matchCounter = 0;
  let seasonCounter = 0;
  let standings: Array<{
    id: string;
    seasonId: string;
    teamId: string;
    position?: number;
    wins: number;
    losses: number;
    pointsFor: number;
    pointsAgainst: number;
    pointDiff: number;
    createdAt: Date;
    updatedAt: Date;
  }>;

  beforeAll(async () => {
    let teamCounter = 0;
    let playerCounter = 0;
    let teams = [
      createTeamRecord(),
      createTeamRecord({ id: OTHER_TEAM_ID, name: 'Demo Wolves', shortName: 'DWV' }),
    ];
    let players = [createPlayerRecord(), createOtherTeamPlayerRecord()];
    let seasons = [createSeasonRecord()];
    let careerSaves: Array<ReturnType<typeof createCareerSaveRecord>> = [];
    standings = [
      {
        id: 'cstanding000000000000000001',
        seasonId: TEST_SEASON_ID,
        teamId: TEAM_ID,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0,
        createdAt: new Date('2026-05-02T12:00:00.000Z'),
        updatedAt: new Date('2026-05-02T12:00:00.000Z'),
      },
      {
        id: 'cstanding000000000000000002',
        seasonId: TEST_SEASON_ID,
        teamId: OTHER_TEAM_ID,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0,
        createdAt: new Date('2026-05-02T12:00:00.000Z'),
        updatedAt: new Date('2026-05-02T12:00:00.000Z'),
      },
    ];
    let matches = [
      {
        id: MATCH_ID,
        seasonId: TEST_SEASON_ID,
        round: 1,
        date: new Date('2026-10-01T18:00:00.000Z'),
        homeTeamId: TEAM_ID,
        awayTeamId: OTHER_TEAM_ID,
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null,
        winnerTeamId: null,
        standingsUpdateRequired: false,
        playedAt: null,
        createdAt: new Date('2026-05-02T12:00:00.000Z'),
        updatedAt: new Date('2026-05-02T12:00:00.000Z'),
      },
    ];

    const attachTeam = (player: PlayerRecord) => {
      const team = teams.find((candidate) => candidate.id === player.teamId);

      return {
        ...player,
        team: team
          ? {
              id: team.id,
              name: team.name,
              shortName: team.shortName,
            }
          : null,
      };
    };

    const serializeMatch = (match: (typeof matches)[number], select?: any) => {
      const homeTeam = teams.find((team) => team.id === match.homeTeamId);
      const awayTeam = teams.find((team) => team.id === match.awayTeamId);

      if (!homeTeam || !awayTeam) {
        throw new Error('Match references a missing team in test fixtures');
      }

      const includeRating = Boolean(select?.homeTeam?.select?.rating || select?.awayTeam?.select?.rating);

      return {
        ...match,
        homeTeam: includeRating
          ? {
              id: homeTeam.id,
              name: homeTeam.name,
              shortName: homeTeam.shortName,
              rating: homeTeam.rating,
            }
          : {
              id: homeTeam.id,
              name: homeTeam.name,
              shortName: homeTeam.shortName,
            },
        awayTeam: includeRating
          ? {
              id: awayTeam.id,
              name: awayTeam.name,
              shortName: awayTeam.shortName,
              rating: awayTeam.rating,
            }
          : {
              id: awayTeam.id,
              name: awayTeam.name,
              shortName: awayTeam.shortName,
            },
      };
    };

    const serializeMatchWithInclude = (match: (typeof matches)[number], include?: any) => {
      const homeTeam = teams.find((team) => team.id === match.homeTeamId);
      const awayTeam = teams.find((team) => team.id === match.awayTeamId);

      if (!homeTeam || !awayTeam) {
        throw new Error('Match references a missing team in test fixtures');
      }

      return {
        ...match,
        homeTeam: include?.homeTeam?.include?.players
          ? {
              ...homeTeam,
              players: players
                .filter((player) => player.teamId === homeTeam.id)
                .map((player) => ({
                  id: player.id,
                  name: player.name,
                  position: player.position,
                  overall: player.overall,
                  shooting: player.shooting,
                  passing: player.passing,
                  defense: player.defense,
                  rebounding: player.rebounding,
                  athleticism: player.athleticism,
                })),
            }
          : homeTeam,
        awayTeam: include?.awayTeam?.include?.players
          ? {
              ...awayTeam,
              players: players
                .filter((player) => player.teamId === awayTeam.id)
                .map((player) => ({
                  id: player.id,
                  name: player.name,
                  position: player.position,
                  overall: player.overall,
                  shooting: player.shooting,
                  passing: player.passing,
                  defense: player.defense,
                  rebounding: player.rebounding,
                  athleticism: player.athleticism,
                })),
            }
          : awayTeam,
      };
    };

    const prismaMock: any = {
      $queryRaw: jest.fn(),
      $transaction: jest.fn(async (callback: (tx: any) => unknown) => callback(prismaMock)),
      team: {
        findMany: jest.fn(({ orderBy, select } = {}) => {
          const result = [...teams];

          if (orderBy?.[0]?.name === 'asc') {
            result.sort((left, right) => left.name.localeCompare(right.name));
          }

          if (select) {
            return result.map((team) =>
              Object.fromEntries(
                Object.keys(select).map((key) => [key, team[key as keyof typeof team]]),
              ),
            );
          }

          return result;
        }),
        findUnique: jest.fn(({ where, include, select }) => {
          const team = teams.find(
            (candidate) =>
              (where.id && candidate.id === where.id) ||
              (where.shortName && candidate.shortName === where.shortName),
          );

          if (!team) {
            return null;
          }

          if (select) {
            return Object.fromEntries(
              Object.keys(select).map((key) => [key, team[key as keyof typeof team]]),
            );
          }

          if (include?.players) {
            const teamPlayers = players
              .filter((player) => player.teamId === team.id)
              .sort(
                (left, right) =>
                  right.overall - left.overall || left.name.localeCompare(right.name),
              );

            return {
              ...team,
              players: teamPlayers,
            };
          }

          return team;
        }),
        create: jest.fn(({ data }) => {
          if (teams.some((team) => team.shortName === data.shortName)) {
            const error = new Error('Unique constraint failed') as Error & { code?: string };
            error.code = 'P2002';
            throw error;
          }

          teamCounter += 1;

          const team = createTeamRecord({
            id: `cteamcreate${String(teamCounter).padStart(14, '0')}`,
            ...data,
            createdAt: new Date('2026-05-02T10:00:00.000Z'),
            updatedAt: new Date('2026-05-02T10:00:00.000Z'),
          });

          teams = [...teams, team];

          return team;
        }),
        update: jest.fn(({ where, data }) => {
          const index = teams.findIndex((team) => team.id === where.id);

          if (index === -1) {
            throw new NotFoundException('Team not found');
          }

          if (
            typeof data.shortName === 'string' &&
            teams.some((team) => team.id !== where.id && team.shortName === data.shortName)
          ) {
            const error = new Error('Unique constraint failed') as Error & { code?: string };
            error.code = 'P2002';
            throw error;
          }

          const updatedTeam = {
            ...teams[index],
            ...data,
            updatedAt: new Date('2026-05-02T10:05:00.000Z'),
          };

          teams[index] = updatedTeam;

          return updatedTeam;
        }),
      },
      player: {
        findMany: jest.fn(({ where, include, orderBy } = {}) => {
          let result = [...players];

          if (where?.teamId) {
            result = result.filter((player) => player.teamId === where.teamId);
          }

          if (orderBy?.[0]?.position === 'asc') {
            result.sort((left, right) => {
              if (left.position !== right.position) {
                return left.position.localeCompare(right.position);
              }

              if (right.overall !== left.overall) {
                return right.overall - left.overall;
              }

              return left.name.localeCompare(right.name);
            });
          } else if (orderBy?.[0]?.overall === 'desc') {
            result.sort(
              (left, right) => right.overall - left.overall || left.name.localeCompare(right.name),
            );
          }

          if (include?.team) {
            return result.map(attachTeam);
          }

          return result;
        }),
        findUnique: jest.fn(({ where, include }) => {
          const player = players.find((candidate) => candidate.id === where.id);

          if (!player) {
            return null;
          }

          if (include?.team) {
            return attachTeam(player);
          }

          return player;
        }),
        create: jest.fn(({ data, include }) => {
          if (data.team?.connect?.id && !teams.some((team) => team.id === data.team.connect.id)) {
            throw new NotFoundException('Team not found');
          }

          playerCounter += 1;

          const player = createPlayerRecord({
            id: `cplayercreate${String(playerCounter).padStart(12, '0')}`,
            ...data,
            teamId: data.team?.connect?.id ?? null,
            createdAt: new Date('2026-05-02T11:00:00.000Z'),
            updatedAt: new Date('2026-05-02T11:00:00.000Z'),
          });

          players = [...players, player];

          return include?.team ? attachTeam(player) : player;
        }),
        update: jest.fn(({ where, data, include }) => {
          const index = players.findIndex((player) => player.id === where.id);

          if (index === -1) {
            throw new NotFoundException('Player not found');
          }

          const nextTeamId =
            typeof data.team?.connect?.id === 'string'
              ? data.team.connect.id
              : players[index].teamId;

          if (nextTeamId && !teams.some((team) => team.id === nextTeamId)) {
            throw new NotFoundException('Team not found');
          }

          const nextOverall =
            typeof data.overall === 'number' ? data.overall : players[index].overall;
          const nextPotential =
            typeof data.potential === 'number' ? data.potential : players[index].potential;

          if (nextOverall > nextPotential) {
            throw new ConflictException('Invalid player state');
          }

          const updatedPlayer = {
            ...players[index],
            ...data,
            teamId: nextTeamId ?? null,
            updatedAt: new Date('2026-05-02T11:05:00.000Z'),
          };

          players[index] = updatedPlayer;

          return include?.team ? attachTeam(updatedPlayer) : updatedPlayer;
        }),
      },
      standing: {
        findMany: jest.fn(({ where, select } = {}) => {
          let result = [...standings];

          if (where?.seasonId) {
            result = result.filter((standing) => standing.seasonId === where.seasonId);
          }

          return result.map((standing) => {
            const team = teams.find((candidate) => candidate.id === standing.teamId);

            if (!select) {
              return standing;
            }

            return Object.fromEntries(
              Object.keys(select).map((key) => {
                if (key === 'team') {
                  return [
                    key,
                    team
                      ? {
                          name: team.name,
                          shortName: team.shortName,
                        }
                      : null,
                  ];
                }

                return [key, standing[key as keyof typeof standing]];
              }),
            );
          });
        }),
        findUnique: jest.fn(({ where, select }) => {
          const standing = standings.find(
            (candidate) =>
              candidate.seasonId === where.seasonId_teamId.seasonId &&
              candidate.teamId === where.seasonId_teamId.teamId,
          );

          if (!standing) {
            return null;
          }

          if (select) {
            return Object.fromEntries(
              Object.keys(select).map((key) => [key, standing[key as keyof typeof standing]]),
            );
          }

          return standing;
        }),
        upsert: jest.fn(({ where, update, create }) => {
          const index = standings.findIndex(
            (candidate) =>
              candidate.seasonId === where.seasonId_teamId.seasonId &&
              candidate.teamId === where.seasonId_teamId.teamId,
          );

          if (index === -1) {
            const createdStanding = {
              id: `cstandingcreate${String(standings.length + 1).padStart(10, '0')}`,
              ...create,
              createdAt: new Date('2026-05-02T12:05:00.000Z'),
              updatedAt: new Date('2026-05-02T12:05:00.000Z'),
            };

            standings = [...standings, createdStanding];
            return createdStanding;
          }

          const updatedStanding = {
            ...standings[index],
            ...update,
            updatedAt: new Date('2026-05-02T12:05:00.000Z'),
          };

          standings[index] = updatedStanding;
          return updatedStanding;
        }),
        create: jest.fn(({ data }) => {
          const createdStanding = {
            id: `cstandingcreate${String(standings.length + 1).padStart(10, '0')}`,
            ...data,
            createdAt: new Date('2026-05-03T08:10:00.000Z'),
            updatedAt: new Date('2026-05-03T08:10:00.000Z'),
          };

          standings = [...standings, createdStanding];
          return createdStanding;
        }),
        deleteMany: jest.fn(({ where }) => {
          const deletedCount = standings.filter((standing) => standing.seasonId === where.seasonId).length;
          standings = standings.filter((standing) => standing.seasonId !== where.seasonId);
          return { count: deletedCount };
        }),
      },
      season: {
        findFirst: jest.fn(({ where, orderBy } = {}) => {
          let result = [...seasons];

          if (where?.status) {
            result = result.filter((season) => season.status === where.status);
          }

          if (orderBy?.[0]?.createdAt === 'desc') {
            result.sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
          }

          return result[0] ?? null;
        }),
        findUnique: jest.fn(({ where }) => {
          return seasons.find((season) => season.id === where.id) ?? null;
        }),
        create: jest.fn(({ data }) => {
          seasonCounter += 1;

          const createdSeason = createSeasonRecord({
            id: data.id ?? `cseasoncreate${String(seasonCounter).padStart(11, '0')}`,
            name: data.name,
            year: data.year,
            status: data.status ?? SeasonStatus.IN_PROGRESS,
            currentRound: data.currentRound ?? 1,
            startedAt: new Date('2026-05-03T08:00:00.000Z'),
            finishedAt: data.finishedAt ?? null,
            createdAt: new Date('2026-05-03T08:00:00.000Z'),
            updatedAt: new Date('2026-05-03T08:00:00.000Z'),
          });

          seasons = [...seasons, createdSeason];

          return createdSeason;
        }),
        update: jest.fn(({ where, data }) => {
          const index = seasons.findIndex((season) => season.id === where.id);

          if (index === -1) {
            throw new NotFoundException('Season not found');
          }

          const updatedSeason = {
            ...seasons[index],
            ...data,
            updatedAt: new Date('2026-05-03T08:05:00.000Z'),
          };

          seasons[index] = updatedSeason;
          return updatedSeason;
        }),
        delete: jest.fn(({ where }) => {
          const index = seasons.findIndex((season) => season.id === where.id);

          if (index === -1) {
            throw new NotFoundException('Season not found');
          }

          const [deletedSeason] = seasons.splice(index, 1);
          return deletedSeason;
        }),
      },
      careerSave: {
        findMany: jest.fn(({ where, select } = {}) => {
          let result = [...careerSaves];

          if (where?.currentSeasonId) {
            result = result.filter((save) => save.currentSeasonId === where.currentSeasonId);
          }

          if (!select) {
            return result;
          }

          return result.map((save) =>
            Object.fromEntries(
              Object.keys(select).map((key) => [key, save[key as keyof typeof save]]),
            ),
          );
        }),
        findUnique: jest.fn(({ where, include }) => {
          const save = careerSaves.find((candidate) => candidate.id === where.id);

          if (!save) {
            return null;
          }

          if (include?.selectedTeam || include?.currentSeason) {
            const selectedTeam = teams.find((team) => team.id === save.selectedTeamId);
            const currentSeason = seasons.find((season) => season.id === save.currentSeasonId);

            return {
              ...save,
              selectedTeam: selectedTeam ?? null,
              currentSeason: currentSeason ?? null,
            };
          }

          return save;
        }),
        create: jest.fn(({ data }) => {
          const createdSave = createCareerSaveRecord({
            id: `csavecreate${String(careerSaves.length + 1).padStart(14, '0')}`,
            saveName: data.saveName,
            selectedTeamId: data.selectedTeam.connect.id,
            currentSeasonId: data.currentSeason.connect.id,
            currentDate: data.currentDate,
            currentRound: data.currentRound,
            createdAt: new Date('2026-05-03T10:00:00.000Z'),
            updatedAt: new Date('2026-05-03T10:00:00.000Z'),
          });

          careerSaves = [...careerSaves, createdSave];
          return createdSave;
        }),
        delete: jest.fn(({ where }) => {
          const index = careerSaves.findIndex((save) => save.id === where.id);

          if (index === -1) {
            throw new NotFoundException('Save not found');
          }

          const [deletedSave] = careerSaves.splice(index, 1);
          return deletedSave;
        }),
      },
      match: {
        findMany: jest.fn(({ where, select, include, orderBy } = {}) => {
          let result = [...matches];

          if (where?.seasonId) {
            result = result.filter((match) => match.seasonId === where.seasonId);
          }

          if (typeof where?.round === 'number') {
            result = result.filter((match) => match.round === where.round);
          }

          if (where?.status) {
            result = result.filter((match) => match.status === where.status);
          }

          if (where?.OR) {
            result = result.filter((match) =>
              where.OR.some(
                (candidate: any) =>
                  match.homeTeamId === candidate.homeTeamId || match.awayTeamId === candidate.awayTeamId,
              ),
            );
          }

          if (orderBy?.[0]?.round === 'asc') {
            result.sort((left, right) => {
              const leftRound = left.round ?? Number.MAX_SAFE_INTEGER;
              const rightRound = right.round ?? Number.MAX_SAFE_INTEGER;

              if (leftRound !== rightRound) {
                return leftRound - rightRound;
              }

              const leftDate = left.date?.getTime() ?? Number.MAX_SAFE_INTEGER;
              const rightDate = right.date?.getTime() ?? Number.MAX_SAFE_INTEGER;

              if (leftDate !== rightDate) {
                return leftDate - rightDate;
              }

              return left.createdAt.getTime() - right.createdAt.getTime();
            });
          }

          if (include?.homeTeam || include?.awayTeam) {
            return result.map((match) => serializeMatchWithInclude(match, include));
          }

          return select ? result.map((match) => serializeMatch(match, select)) : result;
        }),
        findUnique: jest.fn(({ where, include, select }) => {
          const match = matches.find((candidate) => candidate.id === where.id);

          if (!match) {
            return null;
          }

          if (include?.homeTeam || include?.awayTeam) {
            const homeTeam = teams.find((team) => team.id === match.homeTeamId);
            const awayTeam = teams.find((team) => team.id === match.awayTeamId);

            if (!homeTeam || !awayTeam) {
              throw new Error('Match references a missing team in test fixtures');
            }

            return {
              ...match,
              homeTeam: include?.homeTeam?.include?.players
                ? {
                    ...homeTeam,
                    players: players
                      .filter((player) => player.teamId === homeTeam.id)
                      .map((player) => ({
                        id: player.id,
                        name: player.name,
                        position: player.position,
                        overall: player.overall,
                        shooting: player.shooting,
                        passing: player.passing,
                        defense: player.defense,
                        rebounding: player.rebounding,
                        athleticism: player.athleticism,
                      })),
                  }
                : homeTeam,
              awayTeam: include?.awayTeam?.include?.players
                ? {
                    ...awayTeam,
                    players: players
                      .filter((player) => player.teamId === awayTeam.id)
                      .map((player) => ({
                        id: player.id,
                        name: player.name,
                        position: player.position,
                        overall: player.overall,
                        shooting: player.shooting,
                        passing: player.passing,
                        defense: player.defense,
                        rebounding: player.rebounding,
                        athleticism: player.athleticism,
                      })),
                  }
                : awayTeam,
            };
          }

          if (select) {
            return serializeMatch(match, select);
          }

          return match;
        }),
        create: jest.fn(({ data, select }) => {
          matchCounter += 1;

          const createdMatch = {
            id: `cmatchcreate${String(matchCounter).padStart(13, '0')}`,
            seasonId: data.season?.connect?.id ?? null,
            round: data.round ?? null,
            date: data.date ?? null,
            homeTeamId: data.homeTeam.connect.id,
            awayTeamId: data.awayTeam.connect.id,
            status: data.status,
            homeScore: null,
            awayScore: null,
            winnerTeamId: null,
            standingsUpdateRequired: data.standingsUpdateRequired ?? false,
            playedAt: null,
            createdAt: new Date('2026-05-03T09:00:00.000Z'),
            updatedAt: new Date('2026-05-03T09:00:00.000Z'),
          };

          matches = [...matches, createdMatch];

          return select ? serializeMatch(createdMatch, select) : createdMatch;
        }),
        update: jest.fn(({ where, data, include }) => {
          const index = matches.findIndex((match) => match.id === where.id);

          if (index === -1) {
            throw new NotFoundException('Match not found');
          }

          const updatedMatch = {
            ...matches[index],
            ...data,
            updatedAt: new Date('2026-05-02T12:05:00.000Z'),
          };

          matches[index] = updatedMatch;

          if (include?.homeTeam || include?.awayTeam) {
            const homeTeam = teams.find((team) => team.id === updatedMatch.homeTeamId);
            const awayTeam = teams.find((team) => team.id === updatedMatch.awayTeamId);

            return {
              ...updatedMatch,
              homeTeam: homeTeam
                ? {
                    id: homeTeam.id,
                    name: homeTeam.name,
                    shortName: homeTeam.shortName,
                    rating: homeTeam.rating,
                  }
                : null,
              awayTeam: awayTeam
                ? {
                    id: awayTeam.id,
                    name: awayTeam.name,
                    shortName: awayTeam.shortName,
                    rating: awayTeam.rating,
                  }
                : null,
            };
          }

          return updatedMatch;
        }),
        updateMany: jest.fn(({ where, data }) => {
          const index = matches.findIndex(
            (match) => match.id === where.id && match.status === where.status,
          );

          if (index === -1) {
            return { count: 0 };
          }

          matches[index] = {
            ...matches[index],
            ...data,
            updatedAt: new Date('2026-05-02T12:05:00.000Z'),
          };

          return { count: 1 };
        }),
        deleteMany: jest.fn(({ where }) => {
          const deletedCount = matches.filter((match) => match.seasonId === where.seasonId).length;
          matches = matches.filter((match) => match.seasonId !== where.seasonId);
          return { count: deletedCount };
        }),
        findUniqueOrThrow: jest.fn(({ where, select }) => {
          const match = matches.find((candidate) => candidate.id === where.id);

          if (!match) {
            throw new NotFoundException('Match not found');
          }

          return serializeMatch(match, select);
        }),
      },
    };

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(createApiValidationPipe());
    app.useGlobalFilters(new ApiExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a team successfully', async () => {
    const response = await request(app.getHttpServer()).post('/teams').send({
      name: 'QA Lions',
      city: 'Kazan',
      shortName: 'qal',
      rating: 77,
    });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('QA Lions');
    expect(response.body.city).toBe('Kazan');
    expect(response.body.shortName).toBe('QAL');
    expect(response.body.rating).toBe(77);
    expect(response.body.id).toMatch(/^c/);
  });

  it('returns a team by id with roster', async () => {
    const response = await request(app.getHttpServer()).get(`/teams/${TEAM_ID}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(TEAM_ID);
    expect(response.body.name).toBe('Basketball Manager Night');
    expect(response.body.players).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: PLAYER_ID,
          name: 'Alex Carter',
        }),
      ]),
    );
  });

  it('creates a player successfully', async () => {
    const response = await request(app.getHttpServer()).post('/players').send({
      name: 'QA Guard',
      age: 23,
      position: 'PG',
      shooting: 81,
      passing: 85,
      defense: 74,
      rebounding: 51,
      athleticism: 83,
      potential: 88,
      overall: 82,
      teamId: TEAM_ID,
    });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('QA Guard');
    expect(response.body.teamId).toBe(TEAM_ID);
    expect(response.body.team).toEqual(
      expect.objectContaining({
        id: TEAM_ID,
        shortName: 'BMN',
      }),
    );

    const teamResponse = await request(app.getHttpServer()).get(`/teams/${TEAM_ID}`);

    expect(teamResponse.status).toBe(200);
    expect(teamResponse.body.rating).toBe(81);
  });

  it('lowers team rating when weak bench players are added', async () => {
    const response = await request(app.getHttpServer()).post('/players').send({
      name: 'QA Prospect',
      age: 18,
      position: 'SG',
      shooting: 48,
      passing: 46,
      defense: 45,
      rebounding: 41,
      athleticism: 50,
      potential: 72,
      overall: 44,
      teamId: TEAM_ID,
    });

    expect(response.status).toBe(201);

    const teamResponse = await request(app.getHttpServer()).get(`/teams/${TEAM_ID}`);

    expect(teamResponse.status).toBe(200);
    expect(teamResponse.body.rating).toBe(68);
  });

  it('returns a player by id', async () => {
    const response = await request(app.getHttpServer()).get(`/players/${PLAYER_ID}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(PLAYER_ID);
    expect(response.body.name).toBe('Alex Carter');
    expect(response.body.team).toEqual(
      expect.objectContaining({
        id: TEAM_ID,
        shortName: 'BMN',
      }),
    );
  });

  it('recalculates team ratings when a player moves to another team', async () => {
    const response = await request(app.getHttpServer()).patch(`/players/${PLAYER_ID}`).send({
      overall: 86,
      teamId: OTHER_TEAM_ID,
    });

    expect(response.status).toBe(200);
    expect(response.body.teamId).toBe(OTHER_TEAM_ID);

    const previousTeamResponse = await request(app.getHttpServer()).get(`/teams/${TEAM_ID}`);
    const nextTeamResponse = await request(app.getHttpServer()).get(`/teams/${OTHER_TEAM_ID}`);

    expect(previousTeamResponse.status).toBe(200);
    expect(previousTeamResponse.body.rating).toBe(63);
    expect(nextTeamResponse.status).toBe(200);
    expect(nextTeamResponse.body.rating).toBe(80);
  });

  it('returns matches filtered by season', async () => {
    const response = await request(app.getHttpServer()).get('/matches').query({
      seasonId: TEST_SEASON_ID,
    });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.items).toEqual([
      expect.objectContaining({
        id: MATCH_ID,
        seasonId: TEST_SEASON_ID,
        round: 1,
        status: 'SCHEDULED',
      }),
    ]);
  });

  it('returns a single match by id', async () => {
    const response = await request(app.getHttpServer()).get(`/matches/${MATCH_ID}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(MATCH_ID);
    expect(response.body.seasonId).toBe(TEST_SEASON_ID);
    expect(response.body.homeTeam).toEqual(
      expect.objectContaining({
        id: TEAM_ID,
        shortName: 'BMN',
      }),
    );
    expect(response.body.awayTeam).toEqual(
      expect.objectContaining({
        id: OTHER_TEAM_ID,
        shortName: 'DWV',
      }),
    );
  });

  it('creates a match successfully', async () => {
    const response = await request(app.getHttpServer()).post('/matches').send({
      seasonId: TEST_SEASON_ID,
      round: 2,
      date: '2026-10-08T19:00:00.000Z',
      homeTeamId: OTHER_TEAM_ID,
      awayTeamId: TEAM_ID,
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toMatch(/^cmatchcreate/);
    expect(response.body.seasonId).toBe(TEST_SEASON_ID);
    expect(response.body.round).toBe(2);
    expect(response.body.status).toBe('SCHEDULED');
    expect(response.body.date).toBe('2026-10-08T19:00:00.000Z');
    expect(response.body.homeTeam.id).toBe(OTHER_TEAM_ID);
    expect(response.body.awayTeam.id).toBe(TEAM_ID);
  });

  it('filters matches by season and round', async () => {
    const response = await request(app.getHttpServer()).get('/matches').query({
      seasonId: TEST_SEASON_ID,
      round: 2,
    });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.items).toEqual([
      expect.objectContaining({
        seasonId: TEST_SEASON_ID,
        round: 2,
        homeTeam: expect.objectContaining({
          id: OTHER_TEAM_ID,
        }),
      }),
    ]);
  });

  it('simulates a match successfully', async () => {
    const response = await request(app.getHttpServer()).post(`/matches/${MATCH_ID}/simulate`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(MATCH_ID);
    expect(response.body.seasonId).toBe('season_test_2026');
    expect(response.body.round).toBe(1);
    expect(response.body.status).toBe('COMPLETED');
    expect(response.body.homeTeam.id).toBe(TEAM_ID);
    expect(response.body.awayTeam.id).toBe(OTHER_TEAM_ID);
    expect(typeof response.body.homeScore).toBe('number');
    expect(typeof response.body.awayScore).toBe('number');
    expect(response.body.homeScore).not.toBe(response.body.awayScore);
    expect([TEAM_ID, OTHER_TEAM_ID]).toContain(response.body.winnerTeamId);
    expect(response.body.standingsUpdateRequired).toBe(false);
    expect(typeof response.body.playedAt).toBe('string');

    const persistedMatchResponse = await request(app.getHttpServer()).get(`/matches/${MATCH_ID}`);

    expect(persistedMatchResponse.status).toBe(200);
    expect(persistedMatchResponse.body).toEqual(
      expect.objectContaining({
        id: MATCH_ID,
        seasonId: response.body.seasonId,
        round: response.body.round,
        status: 'COMPLETED',
        homeScore: response.body.homeScore,
        awayScore: response.body.awayScore,
        winnerTeamId: response.body.winnerTeamId,
        playedAt: response.body.playedAt,
      }),
    );

    const homeStanding = standings.find(
      (standing) => standing.seasonId === TEST_SEASON_ID && standing.teamId === TEAM_ID,
    );
    const awayStanding = standings.find(
      (standing) => standing.seasonId === TEST_SEASON_ID && standing.teamId === OTHER_TEAM_ID,
    );

    expect(homeStanding).toBeDefined();
    expect(awayStanding).toBeDefined();
    expect(homeStanding!.pointsFor).toBe(response.body.homeScore);
    expect(homeStanding!.pointsAgainst).toBe(response.body.awayScore);
    expect(homeStanding!.pointDiff).toBe(response.body.homeScore - response.body.awayScore);
    expect(awayStanding!.pointsFor).toBe(response.body.awayScore);
    expect(awayStanding!.pointsAgainst).toBe(response.body.homeScore);
    expect(awayStanding!.pointDiff).toBe(response.body.awayScore - response.body.homeScore);

    if (response.body.winnerTeamId === TEAM_ID) {
      expect(homeStanding!.wins).toBe(1);
      expect(homeStanding!.losses).toBe(0);
      expect(awayStanding!.wins).toBe(0);
      expect(awayStanding!.losses).toBe(1);
    } else {
      expect(homeStanding!.wins).toBe(0);
      expect(homeStanding!.losses).toBe(1);
      expect(awayStanding!.wins).toBe(1);
      expect(awayStanding!.losses).toBe(0);
    }
  });

  it('returns the current season', async () => {
    const response = await request(app.getHttpServer()).get('/seasons/current');

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(TEST_SEASON_ID);
    expect(response.body.name).toBe('Test League 2026');
    expect(response.body.status).toBe('IN_PROGRESS');
    expect(response.body.currentRound).toBe(1);
    expect(response.body.finishedAt).toBeNull();
  });

  it('prevents creating a new current season when one already exists', async () => {
    const response = await request(app.getHttpServer()).post('/seasons').send({
      name: 'Second League 2027',
      year: 2027,
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Current season already exists');
  });

  it('rejects completing a season before all matches are finished', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/seasons/${TEST_SEASON_ID}/status`)
      .send({
        status: 'COMPLETED',
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Cannot complete season before all matches are completed');
  });

  it('keeps the season current after a rejected completion attempt', async () => {
    const response = await request(app.getHttpServer()).get('/seasons/current');

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(TEST_SEASON_ID);
    expect(response.body.status).toBe('IN_PROGRESS');
  });

  it('creates a season when there is no current season', async () => {
    const scheduledMatchesResponse = await request(app.getHttpServer()).get('/matches').query({
      seasonId: TEST_SEASON_ID,
      status: 'SCHEDULED',
    });

    expect(scheduledMatchesResponse.status).toBe(200);

    for (const match of scheduledMatchesResponse.body.items) {
      const simulateMatchResponse = await request(app.getHttpServer()).post(
        `/matches/${match.id}/simulate`,
      );

      expect(simulateMatchResponse.status).toBe(200);
    }

    const completeSeasonResponse = await request(app.getHttpServer())
      .patch(`/seasons/${TEST_SEASON_ID}/status`)
      .send({
      status: 'COMPLETED',
    });

    expect(completeSeasonResponse.status).toBe(200);
    expect(completeSeasonResponse.body.status).toBe('COMPLETED');

    const response = await request(app.getHttpServer()).post('/seasons').send({
      name: 'Fresh League 2027',
      year: 2027,
    });

    expect(response.status).toBe(201);
    createdSeasonId = response.body.id;
    expect(response.body.name).toBe('Fresh League 2027');
    expect(response.body.year).toBe(2027);
    expect(response.body.status).toBe('IN_PROGRESS');
    expect(response.body.currentRound).toBe(1);
    expect(response.body.finishedAt).toBeNull();
  });

  it('rejects reversing a completed season back to in-progress', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/seasons/${TEST_SEASON_ID}/status`)
      .send({
        status: 'IN_PROGRESS',
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Season status transition is not allowed');
  });

  it('returns initial standings for all teams after season creation', async () => {
    const response = await request(app.getHttpServer()).get(`/seasons/${createdSeasonId}/standings`);

    expect(response.status).toBe(200);
    expect(response.body.seasonId).toBe(createdSeasonId);
    expect(response.body.updatedAt).not.toBeNull();
    expect(response.body.items).toHaveLength(3);
    expect(response.body.items.every((item: { wins: number; losses: number; pointDiff: number }) => {
      return item.wins === 0 && item.losses === 0 && item.pointDiff === 0;
    })).toBe(true);
  });

  it('returns a generated season schedule grouped by rounds right after season creation', async () => {
    const response = await request(app.getHttpServer()).get(`/seasons/${createdSeasonId}/schedule`);

    expect(response.status).toBe(200);
    expect(response.body.seasonId).toBe(createdSeasonId);
    expect(response.body.totalRounds).toBe(12);
    expect(response.body.totalMatches).toBe(12);
    expect(response.body.rounds).toHaveLength(12);
    expect(response.body.rounds[0]).toEqual(
      expect.objectContaining({
        round: 1,
        status: 'SCHEDULED',
      }),
    );
    expect(response.body.rounds[0].matches).toHaveLength(1);
    expect(response.body.rounds[0].matches[0]).toEqual(
      expect.objectContaining({
        seasonId: createdSeasonId,
        round: 1,
        status: 'SCHEDULED',
      }),
    );

    const pairCounts = new Map<string, { total: number; homeByTeam: Record<string, number> }>();

    for (const round of response.body.rounds) {
      const teamsInRound = new Set<string>();

      for (const match of round.matches) {
        expect(match.homeTeam.id).not.toBe(match.awayTeam.id);
        expect(teamsInRound.has(match.homeTeam.id)).toBe(false);
        expect(teamsInRound.has(match.awayTeam.id)).toBe(false);

        teamsInRound.add(match.homeTeam.id);
        teamsInRound.add(match.awayTeam.id);

        const pairKey = [match.homeTeam.id, match.awayTeam.id].sort().join(':');
        const existing = pairCounts.get(pairKey) ?? {
          total: 0,
          homeByTeam: {},
        };

        existing.total += 1;
        existing.homeByTeam[match.homeTeam.id] = (existing.homeByTeam[match.homeTeam.id] ?? 0) + 1;
        pairCounts.set(pairKey, existing);
      }
    }

    expect(pairCounts.size).toBe(3);

    for (const pairStats of pairCounts.values()) {
      expect(pairStats.total).toBe(4);
      expect(Object.values(pairStats.homeByTeam).sort((left, right) => left - right)).toEqual([2, 2]);
    }
  });

  it('returns an existing season schedule grouped by rounds', async () => {
    const response = await request(app.getHttpServer()).get(`/seasons/${createdSeasonId}/schedule`);

    expect(response.status).toBe(200);
    expect(response.body.seasonId).toBe(createdSeasonId);
    expect(response.body.totalRounds).toBe(12);
    expect(response.body.totalMatches).toBe(12);
    expect(response.body.rounds).toHaveLength(12);
    expect(response.body.rounds.map((round: { round: number }) => round.round)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
  });

  it('rejects duplicate schedule generation for the same season', async () => {
    const response = await request(app.getHttpServer()).post(
      `/seasons/${createdSeasonId}/schedule`,
    );

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Schedule already exists for this season');
  });

  it('does not allow moving to the next round before current round matches are completed', async () => {
    const response = await request(app.getHttpServer()).post(
      `/seasons/${createdSeasonId}/next-round`,
    );

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Current round is not completed');
  });

  it('simulates all unfinished matches in the current round and updates standings', async () => {
    const response = await request(app.getHttpServer()).post(
      `/seasons/${createdSeasonId}/current-round/simulate`,
    );

    expect(response.status).toBe(200);
    expect(response.body.seasonId).toBe(createdSeasonId);
    expect(response.body.round).toBe(1);
    expect(response.body.status).toBe('COMPLETED');
    expect(response.body.standingsUpdated).toBe(true);
    expect(response.body.seasonStatus).toBe('IN_PROGRESS');
    expect(response.body.finishedAt).toBeNull();
    expect(response.body.matches.every((match: { status: string }) => match.status === 'COMPLETED')).toBe(true);
    expect(
      response.body.matches.every(
        (match: { homeScore: number | null; awayScore: number | null; playedAt: string | null }) =>
          typeof match.homeScore === 'number' &&
          typeof match.awayScore === 'number' &&
          typeof match.playedAt === 'string',
      ),
    ).toBe(true);

    const standingsResponse = await request(app.getHttpServer()).get(
      `/seasons/${createdSeasonId}/standings`,
    );

    expect(standingsResponse.status).toBe(200);
    expect(
      standingsResponse.body.items.some(
        (item: { wins: number; losses: number; gamesPlayed: number }) => item.gamesPlayed > 0,
      ),
    ).toBe(true);
  });

  it('rejects simulating the current round when all its matches are already completed', async () => {
    const response = await request(app.getHttpServer()).post(
      `/seasons/${createdSeasonId}/current-round/simulate`,
    );

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Current round has already been simulated');
  });

  it('advances rounds only after completion and automatically completes the season after the last round', async () => {
    const scheduleResponse = await request(app.getHttpServer()).get(
      `/seasons/${createdSeasonId}/schedule`,
    );

    expect(scheduleResponse.status).toBe(200);

    for (const round of scheduleResponse.body.rounds.slice(0, -2)) {
      const nextRoundResponse = await request(app.getHttpServer()).post(
        `/seasons/${createdSeasonId}/next-round`,
      );

      expect(nextRoundResponse.status).toBe(200);
      expect(nextRoundResponse.body.seasonId).toBe(createdSeasonId);
      expect(nextRoundResponse.body.previousRound).toBe(round.round);
      expect(nextRoundResponse.body.currentRound).toBe(round.round + 1);
      expect(nextRoundResponse.body.seasonStatus).toBe('IN_PROGRESS');

      const simulateRoundResponse = await request(app.getHttpServer()).post(
        `/seasons/${createdSeasonId}/current-round/simulate`,
      );

      expect(simulateRoundResponse.status).toBe(200);
      expect(simulateRoundResponse.body.round).toBe(round.round + 1);
      expect(simulateRoundResponse.body.status).toBe('COMPLETED');
    }

    const finalAdvanceResponse = await request(app.getHttpServer()).post(
      `/seasons/${createdSeasonId}/next-round`,
    );

    expect(finalAdvanceResponse.status).toBe(200);
    expect(finalAdvanceResponse.body.currentRound).toBe(scheduleResponse.body.totalRounds);
    expect(finalAdvanceResponse.body.seasonStatus).toBe('IN_PROGRESS');

    const finalSimulateResponse = await request(app.getHttpServer()).post(
      `/seasons/${createdSeasonId}/current-round/simulate`,
    );

    expect(finalSimulateResponse.status).toBe(200);
    expect(finalSimulateResponse.body.round).toBe(scheduleResponse.body.totalRounds);
    expect(finalSimulateResponse.body.status).toBe('COMPLETED');
    expect(finalSimulateResponse.body.currentRound).toBe(scheduleResponse.body.totalRounds);
    expect(finalSimulateResponse.body.seasonStatus).toBe('COMPLETED');
    expect(typeof finalSimulateResponse.body.finishedAt).toBe('string');

    const standingsResponse = await request(app.getHttpServer()).get(
      `/seasons/${createdSeasonId}/standings`,
    );

    expect(standingsResponse.status).toBe(200);
    expect(standingsResponse.body.seasonStatus).toBe('COMPLETED');
    expect(standingsResponse.body.isFinal).toBe(true);
    expect(standingsResponse.body.champion).toEqual(
      expect.objectContaining({
        teamId: standingsResponse.body.items[0].teamId,
        teamName: standingsResponse.body.items[0].teamName,
        shortName: standingsResponse.body.items[0].shortName,
      }),
    );

    const nextRoundAfterCompletionResponse = await request(app.getHttpServer()).post(
      `/seasons/${createdSeasonId}/next-round`,
    );

    expect(nextRoundAfterCompletionResponse.status).toBe(409);
    expect(nextRoundAfterCompletionResponse.body.message).toBe('Season is already completed');

    const resetCompletedSeasonResponse = await request(app.getHttpServer())
      .patch(`/seasons/${createdSeasonId}/status`)
      .send({
        status: 'IN_PROGRESS',
      });

    expect(resetCompletedSeasonResponse.status).toBe(409);
    expect(resetCompletedSeasonResponse.body.message).toBe('Season status transition is not allowed');
  });

  it('locks completed seasons from new match creation', async () => {
    const response = await request(app.getHttpServer()).post('/matches').send({
      seasonId: createdSeasonId,
      round: 13,
      homeTeamId: TEAM_ID,
      awayTeamId: OTHER_TEAM_ID,
      date: '2026-12-01T18:00:00.000Z',
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Season is already completed');
  });

  it('quick-simulates all remaining season matches and returns the champion', async () => {
    const createSeasonResponse = await request(app.getHttpServer()).post('/seasons').send({
      name: 'Fast Finish League 2029',
      year: 2029,
    });

    expect(createSeasonResponse.status).toBe(201);

    const quickSimSeasonId = createSeasonResponse.body.id;
    const response = await request(app.getHttpServer()).post(`/seasons/${quickSimSeasonId}/simulate`);

    expect(response.status).toBe(200);
    expect(response.body.seasonId).toBe(quickSimSeasonId);
    expect(response.body.startedFromRound).toBe(1);
    expect(response.body.completedAtRound).toBe(12);
    expect(response.body.simulatedMatches).toBe(12);
    expect(response.body.simulatedRoundCount).toBe(12);
    expect(response.body.simulatedRounds).toHaveLength(12);
    expect(response.body.simulatedRounds[0]).toEqual({
      round: 1,
      matchesSimulated: 1,
    });
    expect(response.body.simulatedRounds[response.body.simulatedRounds.length - 1]).toEqual({
      round: 12,
      matchesSimulated: 1,
    });
    expect(response.body.seasonStatus).toBe('COMPLETED');
    expect(typeof response.body.finishedAt).toBe('string');
    expect(response.body.champion).toEqual(
      expect.objectContaining({
        teamId: expect.any(String),
        teamName: expect.any(String),
        shortName: expect.any(String),
      }),
    );

    const standingsResponse = await request(app.getHttpServer()).get(
      `/seasons/${quickSimSeasonId}/standings`,
    );

    expect(standingsResponse.status).toBe(200);
    expect(standingsResponse.body.seasonStatus).toBe('COMPLETED');
    expect(standingsResponse.body.isFinal).toBe(true);
    expect(standingsResponse.body.champion).toEqual(response.body.champion);
    expect(
      standingsResponse.body.items.every(
        (item: { gamesPlayed: number }) => item.gamesPlayed === 8,
      ),
    ).toBe(true);

    const repeatResponse = await request(app.getHttpServer()).post(
      `/seasons/${quickSimSeasonId}/simulate`,
    );

    expect(repeatResponse.status).toBe(409);
    expect(repeatResponse.body.message).toBe('Season is already completed');
  });

  it('returns sorted standings for a season', async () => {
    const response = await request(app.getHttpServer()).get(`/seasons/${TEST_SEASON_ID}/standings`);

    expect(response.status).toBe(200);
    expect(response.body.seasonId).toBe(TEST_SEASON_ID);
    expect(response.body.seasonStatus).toBe('COMPLETED');
    expect(response.body.isFinal).toBe(true);
    expect(response.body.champion).toEqual(
      expect.objectContaining({
        teamId: response.body.items[0].teamId,
        teamName: response.body.items[0].teamName,
        shortName: response.body.items[0].shortName,
      }),
    );
    expect(response.body.items).toHaveLength(2);
    expect(response.body.items[0]).toEqual(
      expect.objectContaining({
        position: 1,
        pointDiff: expect.any(Number),
        gamesPlayed: expect.any(Number),
        winPercentage: expect.any(Number),
      }),
    );
    expect(response.body.items[1]).toEqual(
      expect.objectContaining({
        position: 2,
        gamesPlayed: expect.any(Number),
        winPercentage: expect.any(Number),
      }),
    );
    expect(response.body.items[0].wins).toBeGreaterThanOrEqual(response.body.items[1].wins);
    expect(
      [TEAM_ID, OTHER_TEAM_ID].includes(response.body.items[0].teamId) &&
        [TEAM_ID, OTHER_TEAM_ID].includes(response.body.items[1].teamId),
    ).toBe(true);
  });

  it('uses wins, point diff, points for, and team name as stable standings tie-breakers', async () => {
    const createSeasonResponse = await request(app.getHttpServer()).post('/seasons').send({
      name: 'Tie Break League 2028',
      year: 2028,
    });

    expect(createSeasonResponse.status).toBe(201);

    const tieBreakSeasonId = createSeasonResponse.body.id;

    standings = standings.map((standing) =>
      standing.seasonId !== tieBreakSeasonId
        ? standing
        : {
            ...standing,
            wins: 3,
            losses: 2,
            pointsFor: 250,
            pointsAgainst: 240,
            pointDiff: 10,
            updatedAt: new Date('2026-05-03T10:00:00.000Z'),
          },
    );

    const response = await request(app.getHttpServer()).get(`/seasons/${tieBreakSeasonId}/standings`);

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(3);
    expect(response.body.champion).toBeNull();
    expect(response.body.items.map((item: { teamName: string }) => item.teamName)).toEqual([
      'Basketball Manager Night',
      'Demo Wolves',
      'QA Lions',
    ]);
    expect(response.body.items.map((item: { position: number }) => item.position)).toEqual([1, 2, 3]);
  });

  it('returns updated standings data after match simulation', async () => {
    const response = await request(app.getHttpServer()).get(`/seasons/${TEST_SEASON_ID}/standings`);

    expect(response.status).toBe(200);
    expect(response.body.updatedAt).not.toBeNull();
    expect(response.body.items.every((item: { pointsFor: number; pointsAgainst: number }) => {
      return Number.isInteger(item.pointsFor) && Number.isInteger(item.pointsAgainst);
    })).toBe(true);
  });

  it('creates a new career save with season, schedule and standings', async () => {
    const response = await request(app.getHttpServer()).post('/saves').send({
      name: 'Dynasty Run',
      teamId: TEAM_ID,
    });

    expect(response.status).toBe(201);
    expect(response.body.save).toEqual(
      expect.objectContaining({
        name: 'Dynasty Run',
        teamId: TEAM_ID,
        teamName: 'Basketball Manager Night',
        currentRound: 1,
        status: 'ACTIVE',
      }),
    );
    expect(response.body.season).toEqual(
      expect.objectContaining({
        currentRound: 1,
        status: SeasonStatus.IN_PROGRESS,
        teamCount: 3,
      }),
    );
    expect(response.body.schedule.totalMatches).toBeGreaterThan(0);
    expect(response.body.schedule.rounds.length).toBeGreaterThan(0);
    expect(response.body.standings.items).toHaveLength(3);
    expect(response.body.standings.items[0]).toEqual(
      expect.objectContaining({
        position: 1,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0,
      }),
    );
  });

  it('returns a career save with current season, schedule and standings', async () => {
    const createResponse = await request(app.getHttpServer()).post('/saves').send({
      name: 'Loadable Career',
      teamId: TEAM_ID,
    });

    expect(createResponse.status).toBe(201);

    const saveId = createResponse.body.save.id;
    const response = await request(app.getHttpServer()).get(`/saves/${saveId}`);

    expect(response.status).toBe(200);
    expect(response.body.save).toEqual(
      expect.objectContaining({
        id: saveId,
        name: 'Loadable Career',
        teamId: TEAM_ID,
        teamName: 'Basketball Manager Night',
        status: 'ACTIVE',
      }),
    );
    expect(response.body.season).toEqual(
      expect.objectContaining({
        id: createResponse.body.season.id,
        currentRound: 1,
        totalRounds: createResponse.body.schedule.totalRounds,
      }),
    );
    expect(response.body.schedule.totalMatches).toBeGreaterThan(0);
    expect(response.body.standings.items).toHaveLength(response.body.season.teamCount);
  });

  it('deletes a career save and cleans up the linked season data', async () => {
    const createResponse = await request(app.getHttpServer()).post('/saves').send({
      name: 'Disposable Career',
      teamId: TEAM_ID,
    });

    expect(createResponse.status).toBe(201);

    const saveId = createResponse.body.save.id;
    const seasonId = createResponse.body.season.id;

    const deleteResponse = await request(app.getHttpServer()).delete(`/saves/${saveId}`);

    expect(deleteResponse.status).toBe(204);

    const getSaveResponse = await request(app.getHttpServer()).get(`/saves/${saveId}`);
    const getSeasonStandingsResponse = await request(app.getHttpServer()).get(
      `/seasons/${seasonId}/standings`,
    );

    expect(getSaveResponse.status).toBe(404);
    expect(getSeasonStandingsResponse.status).toBe(404);
  });

  it('returns not found when creating a career save for a missing team', async () => {
    const response = await request(app.getHttpServer()).post('/saves').send({
      name: 'Ghost Career',
      teamId: 'cmolpef3i0001f3sbsx7ulsth',
    });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('NOT_FOUND');
    expect(response.body.message).toBe('Team not found');
  });

  it('returns not found when requesting a missing career save', async () => {
    const response = await request(app.getHttpServer()).get(`/saves/${MISSING_SAVE_ID}`);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('NOT_FOUND');
    expect(response.body.message).toBe('Save not found');
    expect(response.body.path).toBe(`/saves/${MISSING_SAVE_ID}`);
  });

  it('rejects blank team names', async () => {
    const response = await request(app.getHttpServer()).post('/teams').send({
      name: '   ',
      city: 'Moscow',
      shortName: 'DYN',
      rating: 80,
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.message).toBe('Request validation failed');
    expect(response.body.path).toBe('/teams');
    expect(response.body.details.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'name',
          messages: expect.arrayContaining(['name should not be empty']),
        }),
      ]),
    );
  });

  it('rejects invalid team ids', async () => {
    const response = await request(app.getHttpServer()).get('/teams/not-a-cuid');

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.message).toBe('Request validation failed');
    expect(response.body.details.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'id',
          messages: expect.arrayContaining(['id must be a valid cuid']),
        }),
      ]),
    );
    expect(response.body.path).toBe('/teams/not-a-cuid');
  });

  it('rejects invalid roster ids', async () => {
    const response = await request(app.getHttpServer()).get('/teams/not-a-cuid/players');

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.details.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'id',
          messages: expect.arrayContaining(['id must be a valid cuid']),
        }),
      ]),
    );
    expect(response.body.path).toBe('/teams/not-a-cuid/players');
  });

  it('rejects invalid player positions', async () => {
    const response = await request(app.getHttpServer()).post('/players').send({
      name: 'Test Player',
      age: 22,
      position: 'QB',
      shooting: 80,
      passing: 80,
      defense: 80,
      rebounding: 80,
      athleticism: 80,
      potential: 85,
      overall: 82,
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.details.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'position',
          messages: expect.arrayContaining([
            'position must be one of the following values: PG, SG, SF, PF, C',
          ]),
        }),
      ]),
    );
  });

  it('returns unified shape for team not found errors', async () => {
    const response = await request(app.getHttpServer()).get('/teams/cmolpef3i0001f3sbsx7ulsth');

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('NOT_FOUND');
    expect(response.body.message).toBe('Team not found');
    expect(response.body.details).toBeNull();
  });

  it('returns unified shape for player not found errors', async () => {
    const response = await request(app.getHttpServer()).get('/players/cmolpef3i0002f3sbsx7ulsti');

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('NOT_FOUND');
    expect(response.body.message).toBe('Player not found');
    expect(response.body.details).toBeNull();
    expect(response.body.path).toBe('/players/cmolpef3i0002f3sbsx7ulsti');
  });

  it('returns unified shape for match not found errors', async () => {
    const response = await request(app.getHttpServer()).post(
      `/matches/${MISSING_MATCH_ID}/simulate`,
    );

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('NOT_FOUND');
    expect(response.body.message).toBe('Match not found');
    expect(response.body.details).toBeNull();
    expect(response.body.path).toBe(`/matches/${MISSING_MATCH_ID}/simulate`);
  });

  it('prevents duplicate match simulation', async () => {
    const response = await request(app.getHttpServer()).post(`/matches/${MATCH_ID}/simulate`);

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('CONFLICT');
    expect(response.body.message).toBe('Match has already been simulated');
    expect(response.body.details).toBeNull();
    expect(response.body.path).toBe(`/matches/${MATCH_ID}/simulate`);
  });

  it('rejects player attributes outside the allowed range', async () => {
    const response = await request(app.getHttpServer()).patch(`/players/${PLAYER_ID}`).send({
      shooting: 101,
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.details.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'shooting',
          messages: expect.arrayContaining(['shooting must not be greater than 100']),
        }),
      ]),
    );
  });

  it('rejects invalid team ids inside player payloads', async () => {
    const response = await request(app.getHttpServer()).post('/players').send({
      name: 'Test Player',
      age: 22,
      position: 'PG',
      shooting: 80,
      passing: 80,
      defense: 80,
      rebounding: 80,
      athleticism: 80,
      potential: 85,
      overall: 82,
      teamId: 'invalid-team-id',
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.details.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'teamId',
          messages: expect.arrayContaining(['teamId must be a valid cuid']),
        }),
      ]),
    );
  });
});
