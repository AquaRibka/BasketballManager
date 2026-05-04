import 'reflect-metadata';
import { ConflictException, INestApplication, NotFoundException } from '@nestjs/common';
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

type TeamRecord = ReturnType<typeof createTeamRecord>;
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

describe('Team and Player API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    let teamCounter = 0;
    let playerCounter = 0;
    let teams = [
      createTeamRecord(),
      createTeamRecord({ id: OTHER_TEAM_ID, name: 'Demo Wolves', shortName: 'DWV' }),
    ];
    let players = [createPlayerRecord(), createOtherTeamPlayerRecord()];
    let matches = [
      {
        id: MATCH_ID,
        seasonId: 'season_test_2026',
        round: 1,
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

    let prismaMock: any;

    prismaMock = {
      $queryRaw: jest.fn(),
      $transaction: jest.fn(async (callback: (tx: any) => unknown) => callback(prismaMock)),
      team: {
        findMany: jest.fn(({ orderBy, select } = {}) => {
          let result = [...teams];

          if (orderBy?.[0]?.name === 'asc') {
            result.sort((left, right) => left.name.localeCompare(right.name));
          }

          if (select?.id) {
            return result.map((team) => ({ id: team.id }));
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

          if (select?.id) {
            return { id: team.id };
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
      match: {
        findUnique: jest.fn(({ where, include }) => {
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

          return match;
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
        findUniqueOrThrow: jest.fn(({ where, select }) => {
          const match = matches.find((candidate) => candidate.id === where.id);

          if (!match) {
            throw new NotFoundException('Match not found');
          }

          const homeTeam = teams.find((team) => team.id === match.homeTeamId);
          const awayTeam = teams.find((team) => team.id === match.awayTeamId);

          if (!homeTeam || !awayTeam) {
            throw new Error('Match references a missing team in test fixtures');
          }

          return {
            ...match,
            homeTeam: select?.homeTeam?.select
              ? {
                  id: homeTeam.id,
                  name: homeTeam.name,
                  shortName: homeTeam.shortName,
                  rating: homeTeam.rating,
                }
              : homeTeam,
            awayTeam: select?.awayTeam?.select
              ? {
                  id: awayTeam.id,
                  name: awayTeam.name,
                  shortName: awayTeam.shortName,
                  rating: awayTeam.rating,
                }
              : awayTeam,
          };
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

  it('simulates a match successfully', async () => {
    const response = await request(app.getHttpServer()).post(`/matches/${MATCH_ID}/simulate`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(MATCH_ID);
    expect(response.body.seasonId).toBe('season_test_2026');
    expect(response.body.round).toBe(1);
    expect(response.body.status).toBe('COMPLETED');
    expect(response.body.homeTeam.id).toBe(TEAM_ID);
    expect(response.body.awayTeam.id).toBe(OTHER_TEAM_ID);
    expect(response.body.homeScore).not.toBe(response.body.awayScore);
    expect([TEAM_ID, OTHER_TEAM_ID]).toContain(response.body.winnerTeamId);
    expect(response.body.standingsUpdateRequired).toBe(true);
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
  });

  it('prevents duplicate match simulation', async () => {
    const response = await request(app.getHttpServer()).post(`/matches/${MATCH_ID}/simulate`);

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('CONFLICT');
    expect(response.body.message).toBe('Match has already been simulated');
    expect(response.body.details).toBeNull();
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
