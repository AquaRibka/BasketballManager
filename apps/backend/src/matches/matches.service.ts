import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { MatchStatus, type Prisma } from '@prisma/client';
import type {
  MatchSimulationInput,
  MatchSimulationPlayerSnapshot,
  MatchSimulationTeamSnapshot,
} from '@basketball-manager/shared';
import { simulateMatch } from '@basketball-manager/simulation-engine';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { ListMatchesQueryDto } from './dto/list-matches-query.dto';

const MATCH_SIMULATION_ROSTER_SELECT = {
  id: true,
  name: true,
  position: true,
  overall: true,
  shooting: true,
  passing: true,
  defense: true,
  rebounding: true,
  athleticism: true,
} satisfies Prisma.PlayerSelect;

const MATCH_SIMULATION_RESULT_TEAM_SELECT = {
  id: true,
  name: true,
  shortName: true,
  rating: true,
} satisfies Prisma.TeamSelect;

const MATCH_RESULT_TEAM_SELECT = {
  id: true,
  name: true,
  shortName: true,
} satisfies Prisma.TeamSelect;

const MATCH_WITH_ROSTERS_INCLUDE = {
  homeTeam: {
    include: {
      players: {
        select: MATCH_SIMULATION_ROSTER_SELECT,
      },
    },
  },
  awayTeam: {
    include: {
      players: {
        select: MATCH_SIMULATION_ROSTER_SELECT,
      },
    },
  },
} satisfies Prisma.MatchInclude;

const MATCH_RESULT_SELECT = {
  seasonId: true,
  round: true,
  status: true,
  date: true,
  homeScore: true,
  awayScore: true,
  winnerTeamId: true,
  standingsUpdateRequired: true,
  playedAt: true,
  homeTeam: {
    select: MATCH_SIMULATION_RESULT_TEAM_SELECT,
  },
  awayTeam: {
    select: MATCH_SIMULATION_RESULT_TEAM_SELECT,
  },
} satisfies Prisma.MatchSelect;

const MATCH_BASE_SELECT = {
  id: true,
  seasonId: true,
  round: true,
  status: true,
  date: true,
  homeScore: true,
  awayScore: true,
  winnerTeamId: true,
  playedAt: true,
  homeTeam: {
    select: MATCH_RESULT_TEAM_SELECT,
  },
  awayTeam: {
    select: MATCH_RESULT_TEAM_SELECT,
  },
} satisfies Prisma.MatchSelect;

type MatchWithRosters = Prisma.MatchGetPayload<{
  include: typeof MATCH_WITH_ROSTERS_INCLUDE;
}>;

function toMatchSimulationPlayerSnapshot(player: {
  id: string;
  name: string;
  position: MatchSimulationPlayerSnapshot['position'];
  overall: number;
  shooting: number;
  passing: number;
  defense: number;
  rebounding: number;
  athleticism: number;
}): MatchSimulationPlayerSnapshot {
  return {
    id: player.id,
    name: player.name,
    position: player.position,
    overall: player.overall,
    shooting: player.shooting,
    passing: player.passing,
    defense: player.defense,
    rebounding: player.rebounding,
    athleticism: player.athleticism,
  };
}

function toMatchSimulationTeamSnapshot(team: {
  id: string;
  name: string;
  shortName: string;
  rating: number;
  players: Array<Parameters<typeof toMatchSimulationPlayerSnapshot>[0]>;
}): MatchSimulationTeamSnapshot {
  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    rating: team.rating,
    players: team.players.map(toMatchSimulationPlayerSnapshot),
  };
}

async function updateStandingForTeam(
  tx: any,
  input: {
    seasonId: string;
    teamId: string;
    isWinner: boolean;
    pointsFor: number;
    pointsAgainst: number;
  },
) {
  const existing = await tx.standing.findUnique({
    where: {
      seasonId_teamId: {
        seasonId: input.seasonId,
        teamId: input.teamId,
      },
    },
    select: {
      id: true,
      wins: true,
      losses: true,
      pointsFor: true,
      pointsAgainst: true,
      pointDiff: true,
    },
  });

  const nextWins = (existing?.wins ?? 0) + (input.isWinner ? 1 : 0);
  const nextLosses = (existing?.losses ?? 0) + (input.isWinner ? 0 : 1);
  const nextPointsFor = (existing?.pointsFor ?? 0) + input.pointsFor;
  const nextPointsAgainst = (existing?.pointsAgainst ?? 0) + input.pointsAgainst;
  const nextPointDiff = nextPointsFor - nextPointsAgainst;

  await tx.standing.upsert({
    where: {
      seasonId_teamId: {
        seasonId: input.seasonId,
        teamId: input.teamId,
      },
    },
    update: {
      wins: nextWins,
      losses: nextLosses,
      pointsFor: nextPointsFor,
      pointsAgainst: nextPointsAgainst,
      pointDiff: nextPointDiff,
    },
    create: {
      seasonId: input.seasonId,
      teamId: input.teamId,
      wins: nextWins,
      losses: nextLosses,
      pointsFor: nextPointsFor,
      pointsAgainst: nextPointsAgainst,
      pointDiff: nextPointDiff,
    },
  });
}

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMatches(query: ListMatchesQueryDto) {
    await this.ensureSeasonExists(query.seasonId);

    const items = await this.prisma.match.findMany({
      where: {
        seasonId: query.seasonId,
        round: query.round,
        status: query.status,
        ...(query.teamId
          ? {
              OR: [{ homeTeamId: query.teamId }, { awayTeamId: query.teamId }],
            }
          : {}),
      },
      select: MATCH_BASE_SELECT,
      orderBy: [{ round: 'asc' }, { date: 'asc' }, { createdAt: 'asc' }],
    });

    return {
      items,
      total: items.length,
    };
  }

  async getMatchById(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      select: MATCH_BASE_SELECT,
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    return match;
  }

  async createMatch(createMatchDto: CreateMatchDto) {
    await this.ensureSeasonExists(createMatchDto.seasonId);
    await this.ensureTeamExists(createMatchDto.homeTeamId);
    await this.ensureTeamExists(createMatchDto.awayTeamId);

    if (createMatchDto.homeTeamId === createMatchDto.awayTeamId) {
      throw new UnprocessableEntityException('Match teams must be different');
    }

    try {
      return await this.prisma.match.create({
        data: {
          season: {
            connect: {
              id: createMatchDto.seasonId,
            },
          },
          round: createMatchDto.round,
          date: createMatchDto.date ? new Date(createMatchDto.date) : undefined,
          homeTeam: {
            connect: {
              id: createMatchDto.homeTeamId,
            },
          },
          awayTeam: {
            connect: {
              id: createMatchDto.awayTeamId,
            },
          },
          status: MatchStatus.SCHEDULED,
          standingsUpdateRequired: false,
        },
        select: MATCH_BASE_SELECT,
      });
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async simulateMatch(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id },
        include: MATCH_WITH_ROSTERS_INCLUDE,
      });

      if (!match) {
        throw new NotFoundException('Match not found');
      }

      await this.simulateScheduledMatchInTransaction(tx, match);

      return tx.match.findUniqueOrThrow({
        where: { id },
        select: MATCH_RESULT_SELECT,
      });
    });
  }

  async simulateSeasonRound(seasonId: string, round: number) {
    await this.ensureSeasonExists(seasonId);

    return this.prisma.$transaction(async (tx) => {
      const roundMatches = await tx.match.findMany({
        where: {
          seasonId,
          round,
        },
        include: MATCH_WITH_ROSTERS_INCLUDE,
        orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
      });

      if (roundMatches.length === 0) {
        throw new NotFoundException('Round matches not found');
      }

      const scheduledMatches = roundMatches.filter((match) => match.status === MatchStatus.SCHEDULED);

      if (scheduledMatches.length === 0) {
        throw new ConflictException('Current round has already been simulated');
      }

      for (const match of scheduledMatches) {
        await this.simulateScheduledMatchInTransaction(tx, match);
      }

      const simulatedMatches = await tx.match.findMany({
        where: {
          seasonId,
          round,
        },
        select: MATCH_BASE_SELECT,
        orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
      });

      return {
        seasonId,
        round,
        status: MatchStatus.COMPLETED,
        matches: simulatedMatches,
        standingsUpdated: true,
      };
    });
  }

  private async ensureSeasonExists(id: string) {
    const season = await this.prisma.season.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!season) {
      throw new NotFoundException('Season not found');
    }
  }

  private async ensureTeamExists(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }
  }

  private handlePersistenceError(_error: unknown): never {
    throw new UnprocessableEntityException('Match data is invalid');
  }

  private async simulateScheduledMatchInTransaction(tx: any, match: MatchWithRosters) {
    if (match.status === MatchStatus.COMPLETED) {
      throw new ConflictException('Match has already been simulated');
    }

    const simulationInput: MatchSimulationInput = {
      matchId: match.id,
      seed: match.id,
      homeTeam: toMatchSimulationTeamSnapshot(match.homeTeam),
      awayTeam: toMatchSimulationTeamSnapshot(match.awayTeam),
    };
    const result = simulateMatch(simulationInput);
    const playedAt = new Date();

    if (match.seasonId) {
      await updateStandingForTeam(tx, {
        seasonId: match.seasonId,
        teamId: match.homeTeamId,
        isWinner: result.winnerTeamId === match.homeTeamId,
        pointsFor: result.homeScore,
        pointsAgainst: result.awayScore,
      });
      await updateStandingForTeam(tx, {
        seasonId: match.seasonId,
        teamId: match.awayTeamId,
        isWinner: result.winnerTeamId === match.awayTeamId,
        pointsFor: result.awayScore,
        pointsAgainst: result.homeScore,
      });
    }

    const updateResult = await tx.match.updateMany({
      where: {
        id: match.id,
        status: MatchStatus.SCHEDULED,
      },
      data: {
        status: MatchStatus.COMPLETED,
        homeScore: result.homeScore,
        awayScore: result.awayScore,
        winnerTeamId: result.winnerTeamId,
        standingsUpdateRequired: false,
        playedAt,
      },
    });

    if (updateResult.count === 0) {
      throw new ConflictException('Match has already been simulated');
    }
  }
}
