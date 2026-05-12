import 'reflect-metadata';
import { INestApplication, NotFoundException } from '@nestjs/common';
import { MatchStatus, SeasonStatus } from '@prisma/client';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ApiExceptionFilter } from '../src/common/errors/api-exception.filter';
import { createApiValidationPipe } from '../src/common/pipes/create-api-validation-pipe';
import { PlayerRatingsSyncService } from '../src/players/player-ratings-sync.service';
import { PrismaService } from '../src/prisma/prisma.service';

type TeamRecord = ReturnType<typeof createTeamRecord>;
type PlayerRecord = ReturnType<typeof createPlayerRecord>;
type SeasonRecord = ReturnType<typeof createSeasonRecord>;
type MatchRecord = ReturnType<typeof createMatchRecord>;
type StandingRecord = ReturnType<typeof createStandingRecord>;

function createTeamRecord(overrides = {}) {
  return {
    id: 'team_1',
    name: 'Moscow Meteors',
    city: 'Moscow',
    shortName: 'MSM',
    rating: 83,
    createdAt: new Date('2026-05-01T10:00:00.000Z'),
    updatedAt: new Date('2026-05-01T10:00:00.000Z'),
    ...overrides,
  };
}

function createPlayerRecord(overrides = {}) {
  return {
    id: 'player_1',
    name: 'Alex Carter',
    age: 24,
    position: 'PG',
    shooting: 79,
    passing: 83,
    defense: 72,
    rebounding: 55,
    athleticism: 81,
    potential: 86,
    overall: 80,
    teamId: 'team_1',
    createdAt: new Date('2026-05-01T10:10:00.000Z'),
    updatedAt: new Date('2026-05-01T10:10:00.000Z'),
    ...overrides,
  };
}

function createSeasonRecord(overrides = {}) {
  return {
    id: 'season_2026',
    name: 'QA League 2026',
    year: 2026,
    status: SeasonStatus.IN_PROGRESS,
    currentRound: 1,
    startedAt: new Date('2026-10-01T18:00:00.000Z'),
    finishedAt: null,
    createdAt: new Date('2026-05-02T12:00:00.000Z'),
    updatedAt: new Date('2026-05-02T12:00:00.000Z'),
    ...overrides,
  };
}

function createMatchRecord(overrides = {}) {
  return {
    id: 'match_1',
    seasonId: 'season_2026',
    round: 1,
    date: new Date('2026-10-01T18:00:00.000Z'),
    homeTeamId: 'team_1',
    awayTeamId: 'team_2',
    status: MatchStatus.SCHEDULED,
    homeScore: null,
    awayScore: null,
    winnerTeamId: null,
    standingsUpdateRequired: false,
    playedAt: null,
    createdAt: new Date('2026-05-02T12:10:00.000Z'),
    updatedAt: new Date('2026-05-02T12:10:00.000Z'),
    ...overrides,
  };
}

function createStandingRecord(overrides = {}) {
  return {
    id: 'standing_1',
    seasonId: 'season_2026',
    teamId: 'team_1',
    position: 1,
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    pointDiff: 0,
    createdAt: new Date('2026-05-02T12:20:00.000Z'),
    updatedAt: new Date('2026-05-02T12:20:00.000Z'),
    ...overrides,
  };
}

describe('Season Flow Integration', () => {
  let app: INestApplication;
  let teams: TeamRecord[];
  let players: PlayerRecord[];
  let seasons: SeasonRecord[];
  let matches: MatchRecord[];
  let standings: StandingRecord[];
  let seasonCounter = 0;
  let matchCounter = 0;
  let standingCounter = 0;

  const attachScheduleShape = (match: MatchRecord, select?: Record<string, any>) => {
    const homeTeam = teams.find((team) => team.id === match.homeTeamId);
    const awayTeam = teams.find((team) => team.id === match.awayTeamId);

    if (!homeTeam || !awayTeam) {
      throw new Error('Match references a missing team in test fixtures');
    }

    if (!select) {
      return match;
    }

    return Object.fromEntries(
      Object.keys(select).map((key) => {
        if (key === 'homeTeam') {
          return [
            key,
            {
              id: homeTeam.id,
              name: homeTeam.name,
              shortName: homeTeam.shortName,
            },
          ];
        }

        if (key === 'awayTeam') {
          return [
            key,
            {
              id: awayTeam.id,
              name: awayTeam.name,
              shortName: awayTeam.shortName,
            },
          ];
        }

        return [key, match[key as keyof MatchRecord]];
      }),
    );
  };

  const attachSimulationShape = (match: MatchRecord, include?: Record<string, any>) => {
    const homeTeam = teams.find((team) => team.id === match.homeTeamId);
    const awayTeam = teams.find((team) => team.id === match.awayTeamId);

    if (!homeTeam || !awayTeam) {
      throw new Error('Match references a missing team in test fixtures');
    }

    if (!include?.homeTeam && !include?.awayTeam) {
      return match;
    }

    return {
      ...match,
      homeTeam: {
        id: homeTeam.id,
        name: homeTeam.name,
        shortName: homeTeam.shortName,
        rating: homeTeam.rating,
        players: include?.homeTeam?.include?.players
          ? players
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
              }))
          : undefined,
      },
      awayTeam: {
        id: awayTeam.id,
        name: awayTeam.name,
        shortName: awayTeam.shortName,
        rating: awayTeam.rating,
        players: include?.awayTeam?.include?.players
          ? players
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
              }))
          : undefined,
      },
    };
  };

  beforeAll(async () => {
    teams = [
      createTeamRecord(),
      createTeamRecord({
        id: 'team_2',
        name: 'Kazan Falcons',
        city: 'Kazan',
        shortName: 'KZF',
        rating: 79,
      }),
      createTeamRecord({
        id: 'team_3',
        name: 'Sochi Waves',
        city: 'Sochi',
        shortName: 'SCH',
        rating: 76,
      }),
    ];

    players = teams.flatMap((team, teamIndex) =>
      ['PG', 'SG', 'SF', 'PF', 'C'].map((position, playerIndex) =>
        createPlayerRecord({
          id: `player_${teamIndex + 1}_${playerIndex + 1}`,
          name: `${team.shortName} Player ${playerIndex + 1}`,
          age: 21 + playerIndex,
          position,
          shooting: 68 + playerIndex + teamIndex,
          passing: 66 + playerIndex + teamIndex,
          defense: 64 + playerIndex + teamIndex,
          rebounding: 62 + playerIndex + teamIndex,
          athleticism: 70 + playerIndex + teamIndex,
          potential: 78 + playerIndex + teamIndex,
          overall: 72 + playerIndex + teamIndex,
          teamId: team.id,
        }),
      ),
    );

    seasons = [];
    matches = [];
    standings = [];

    const prismaMock: Record<string, unknown> = {};

    prismaMock.$transaction = jest.fn(async (callback: (tx: Record<string, unknown>) => unknown) =>
      callback(prismaMock),
    );
    prismaMock.team = {
      findMany: jest.fn(({ orderBy, select } = {}) => {
        const orderedTeams = [...teams];

        if (orderBy?.[0]?.name === 'asc') {
          orderedTeams.sort((left, right) => left.name.localeCompare(right.name));
        }

        if (select?.id) {
          return orderedTeams.map((team) => ({ id: team.id }));
        }

        return orderedTeams;
      }),
    };
    prismaMock.season = {
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
      findUnique: jest.fn(({ where, select } = {}) => {
        const season = seasons.find((candidate) => candidate.id === where.id) ?? null;

        if (!season) {
          return null;
        }

        if (!select) {
          return season;
        }

        return Object.fromEntries(
          Object.keys(select).map((key) => [key, season[key as keyof SeasonRecord]]),
        );
      }),
      create: jest.fn(({ data }) => {
        seasonCounter += 1;

        const createdSeason = createSeasonRecord({
          id: `season_created_${seasonCounter}`,
          name: data.name,
          year: data.year,
          status: data.status ?? SeasonStatus.IN_PROGRESS,
        });

        seasons = [...seasons, createdSeason];
        return createdSeason;
      }),
      update: jest.fn(({ where, data }) => {
        const seasonIndex = seasons.findIndex((season) => season.id === where.id);

        if (seasonIndex === -1) {
          throw new NotFoundException('Season not found');
        }

        const updatedSeason = {
          ...seasons[seasonIndex],
          ...data,
          updatedAt: new Date('2026-05-02T12:30:00.000Z'),
        };

        seasons[seasonIndex] = updatedSeason;
        return updatedSeason;
      }),
    };
    prismaMock.match = {
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

        if (orderBy?.[0]?.round === 'asc') {
          result.sort((left, right) => {
            if ((left.round ?? 0) !== (right.round ?? 0)) {
              return (left.round ?? 0) - (right.round ?? 0);
            }

            if ((left.date?.getTime() ?? 0) !== (right.date?.getTime() ?? 0)) {
              return (left.date?.getTime() ?? 0) - (right.date?.getTime() ?? 0);
            }

            return left.createdAt.getTime() - right.createdAt.getTime();
          });
        }

        if (include?.homeTeam || include?.awayTeam) {
          return result.map((match) => attachSimulationShape(match, include));
        }

        return select ? result.map((match) => attachScheduleShape(match, select)) : result;
      }),
      create: jest.fn(({ data }) => {
        matchCounter += 1;

        const createdMatch = createMatchRecord({
          id: `match_created_${matchCounter}`,
          seasonId: data.season.connect.id,
          round: data.round,
          date: data.date,
          homeTeamId: data.homeTeam.connect.id,
          awayTeamId: data.awayTeam.connect.id,
          status: data.status,
          standingsUpdateRequired: data.standingsUpdateRequired ?? false,
        });

        matches = [...matches, createdMatch];
        return createdMatch;
      }),
      update: jest.fn(({ where, data, include }) => {
        const matchIndex = matches.findIndex((match) => match.id === where.id);

        if (matchIndex === -1) {
          throw new NotFoundException('Match not found');
        }

        const updatedMatch = {
          ...matches[matchIndex],
          ...data,
          updatedAt: new Date('2026-05-02T12:40:00.000Z'),
        };

        matches[matchIndex] = updatedMatch;

        return include ? attachSimulationShape(updatedMatch, include) : updatedMatch;
      }),
      updateMany: jest.fn(({ where, data }) => {
        const matchIndex = matches.findIndex(
          (match) => match.id === where.id && match.status === where.status,
        );

        if (matchIndex === -1) {
          return { count: 0 };
        }

        matches[matchIndex] = {
          ...matches[matchIndex],
          ...data,
          updatedAt: new Date('2026-05-02T12:35:00.000Z'),
        };

        return { count: 1 };
      }),
    };
    prismaMock.standing = {
      findMany: jest.fn(({ where, select } = {}) => {
        let result = [...standings];

        if (where?.seasonId) {
          result = result.filter((standing) => standing.seasonId === where.seasonId);
        }

        return result.map((standing) => {
          if (!select) {
            return standing;
          }

          const team = teams.find((candidate) => candidate.id === standing.teamId);

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

              return [key, standing[key as keyof StandingRecord]];
            }),
          );
        });
      }),
      findUnique: jest.fn(({ where, select }) => {
        const standing =
          standings.find(
            (candidate) =>
              candidate.seasonId === where.seasonId_teamId.seasonId &&
              candidate.teamId === where.seasonId_teamId.teamId,
          ) ?? null;

        if (!standing) {
          return null;
        }

        if (!select) {
          return standing;
        }

        return Object.fromEntries(
          Object.keys(select).map((key) => [key, standing[key as keyof StandingRecord]]),
        );
      }),
      create: jest.fn(({ data }) => {
        standingCounter += 1;

        const createdStanding = createStandingRecord({
          id: `standing_created_${standingCounter}`,
          ...data,
        });

        standings = [...standings, createdStanding];
        return createdStanding;
      }),
      upsert: jest.fn(({ where, update, create }) => {
        const standingIndex = standings.findIndex(
          (candidate) =>
            candidate.seasonId === where.seasonId_teamId.seasonId &&
            candidate.teamId === where.seasonId_teamId.teamId,
        );

        if (standingIndex === -1) {
          standingCounter += 1;

          const createdStanding = createStandingRecord({
            id: `standing_created_${standingCounter}`,
            ...create,
          });

          standings = [...standings, createdStanding];
          return createdStanding;
        }

        const updatedStanding = {
          ...standings[standingIndex],
          ...update,
          updatedAt: new Date('2026-05-02T12:45:00.000Z'),
        };

        standings[standingIndex] = updatedStanding;
        return updatedStanding;
      }),
    };
    prismaMock.careerSave = {
      findUnique: jest.fn(() => null),
      create: jest.fn(),
    };
    prismaMock.player = {
      findMany: jest.fn(({ where } = {}) => {
        if (where?.teamId) {
          return players.filter((player) => player.teamId === where.teamId);
        }

        return players;
      }),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideProvider(PlayerRatingsSyncService)
      .useValue({ onModuleInit: jest.fn() })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(createApiValidationPipe());
    app.useGlobalFilters(new ApiExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a season, generates schedule, simulates a round and returns updated standings', async () => {
    const createSeasonResponse = await request(app.getHttpServer()).post('/seasons').send({
      name: 'QA Flow Season 2026',
      year: 2026,
    });

    expect(createSeasonResponse.status).toBe(201);
    expect(createSeasonResponse.body.status).toBe('IN_PROGRESS');
    expect(createSeasonResponse.body.currentRound).toBe(1);

    const seasonId = createSeasonResponse.body.id as string;

    const scheduleResponse = await request(app.getHttpServer()).get(
      `/seasons/${seasonId}/schedule`,
    );

    expect(scheduleResponse.status).toBe(200);
    expect(scheduleResponse.body.seasonId).toBe(seasonId);
    expect(scheduleResponse.body.totalRounds).toBeGreaterThan(0);
    expect(scheduleResponse.body.totalMatches).toBeGreaterThan(0);
    expect(scheduleResponse.body.rounds[0].matches[0]).toMatchObject({
      status: 'SCHEDULED',
      homeTeam: expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        shortName: expect.any(String),
      }),
      awayTeam: expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        shortName: expect.any(String),
      }),
    });

    const simulateRoundResponse = await request(app.getHttpServer()).post(
      `/seasons/${seasonId}/current-round/simulate`,
    );

    expect(simulateRoundResponse.status).toBe(200);
    expect(simulateRoundResponse.body.seasonId).toBe(seasonId);
    expect(simulateRoundResponse.body.round).toBe(1);
    expect(simulateRoundResponse.body.status).toBe('COMPLETED');
    expect(simulateRoundResponse.body.standingsUpdated).toBe(true);
    expect(simulateRoundResponse.body.matches).toHaveLength(1);
    expect(simulateRoundResponse.body.matches[0]).toMatchObject({
      status: 'COMPLETED',
      homeScore: expect.any(Number),
      awayScore: expect.any(Number),
      playedAt: expect.any(String),
    });

    const standingsResponse = await request(app.getHttpServer()).get(
      `/seasons/${seasonId}/standings`,
    );

    expect(standingsResponse.status).toBe(200);
    expect(standingsResponse.body.seasonId).toBe(seasonId);
    expect(standingsResponse.body.seasonStatus).toBe('IN_PROGRESS');
    expect(standingsResponse.body.items).toHaveLength(teams.length);
    expect(
      standingsResponse.body.items.some(
        (item: { gamesPlayed: number; wins: number; losses: number }) =>
          item.gamesPlayed > 0 && (item.wins > 0 || item.losses > 0),
      ),
    ).toBe(true);
    expect(standingsResponse.body.items[0]).toEqual(
      expect.objectContaining({
        position: expect.any(Number),
        teamId: expect.any(String),
        teamName: expect.any(String),
        shortName: expect.any(String),
        wins: expect.any(Number),
        losses: expect.any(Number),
        pointsFor: expect.any(Number),
        pointsAgainst: expect.any(Number),
        pointDiff: expect.any(Number),
      }),
    );
  });
});
