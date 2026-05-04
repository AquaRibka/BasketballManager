import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MatchStatus, type Prisma } from '@prisma/client';
import type {
  MatchSimulationInput,
  MatchSimulationPlayerSnapshot,
  MatchSimulationTeamSnapshot,
} from '@basketball-manager/shared';
import { simulateMatch } from '@basketball-manager/simulation-engine';
import { PrismaService } from '../prisma/prisma.service';

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

  async simulateMatch(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id },
        include: MATCH_WITH_ROSTERS_INCLUDE,
      });

      if (!match) {
        throw new NotFoundException('Match not found');
      }

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
          id,
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

      return tx.match.findUniqueOrThrow({
        where: { id },
        select: MATCH_RESULT_SELECT,
      });
    });
  }
}
